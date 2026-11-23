//! Yahoo Finance quoteSummary: company figures of stocks, and top holdings
//! plus TER / fund size for funds without an issuer source. Needs a session
//! cookie and the matching "crumb" (fetched once per run, renewed on 401).
//! Yahoo rate-limits per IP: on HTTP 429 the client waits and retries twice,
//! then reports RateLimited and the caller stops the run.

use super::{Error, FundDetails, Holding, StockDetails, countries, top};
use reqwest::StatusCode;
use serde_json::Value;
use std::time::Duration;

const ROOT: &str = "https://query2.finance.yahoo.com";
const STOCK_MODULES: &str = "assetProfile,summaryDetail,defaultKeyStatistics,financialData,price";
const FUND_MODULES: &str = "topHoldings,fundProfile,defaultKeyStatistics,summaryDetail";
/// Waits after a 429 before retrying.
const BACKOFF: [Duration; 2] = [Duration::from_secs(20), Duration::from_secs(60)];

pub struct Client {
    http: reqwest::Client,
    crumb: Option<String>,
}

impl Client {
    pub fn new() -> Result<Self, reqwest::Error> {
        let http = reqwest::Client::builder()
            // Yahoo answers non-browser user agents with 429
            .user_agent(
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            )
            .cookie_store(true)
            .timeout(Duration::from_secs(30))
            .build()?;
        Ok(Self { http, crumb: None })
    }

    async fn crumb(&mut self) -> Result<String, Error> {
        if let Some(c) = &self.crumb {
            return Ok(c.clone());
        }
        // sets the session cookie (the response itself is a 404)
        let _ = self.http.get("https://fc.yahoo.com/").send().await;
        let response = self
            .http
            .get(format!("{ROOT}/v1/test/getcrumb"))
            .send()
            .await?;
        if response.status() == StatusCode::TOO_MANY_REQUESTS {
            return Err(Error::RateLimited);
        }
        let crumb = response.text().await?.trim().to_string();
        if crumb.is_empty() || crumb.contains(' ') || crumb.len() > 32 {
            return Err(Error::Format(format!("no crumb: {crumb:.60}")));
        }
        self.crumb = Some(crumb.clone());
        Ok(crumb)
    }

    /// The first quoteSummary result, or NotFound.
    async fn summary(&mut self, symbol: &str, modules: &str) -> Result<Value, Error> {
        let mut renewed = false;
        let mut backoff = BACKOFF.iter();
        loop {
            let crumb = match self.crumb().await {
                Err(Error::RateLimited) => match backoff.next() {
                    Some(wait) => {
                        tokio::time::sleep(*wait).await;
                        continue;
                    }
                    None => return Err(Error::RateLimited),
                },
                other => other?,
            };
            let response = self
                .http
                .get(format!("{ROOT}/v10/finance/quoteSummary/{symbol}"))
                .query(&[("modules", modules), ("crumb", crumb.as_str())])
                .send()
                .await?;
            match response.status() {
                StatusCode::TOO_MANY_REQUESTS => match backoff.next() {
                    Some(wait) => tokio::time::sleep(*wait).await,
                    None => return Err(Error::RateLimited),
                },
                StatusCode::UNAUTHORIZED if !renewed => {
                    // crumb expired: fetch a new one once
                    self.crumb = None;
                    renewed = true;
                }
                StatusCode::NOT_FOUND => return Err(Error::NotFound),
                s if !s.is_success() => return Err(Error::Status(s)),
                _ => {
                    let body: Value = response.json().await?;
                    return body
                        .pointer("/quoteSummary/result/0")
                        .filter(|r| r.is_object())
                        .cloned()
                        .ok_or(Error::NotFound);
                }
            }
        }
    }

    pub async fn stock(&mut self, symbol: &str) -> Result<StockDetails, Error> {
        let result = self.summary(symbol, STOCK_MODULES).await?;
        parse_stock(&result).ok_or(Error::NotFound)
    }

    pub async fn fund(&mut self, symbol: &str) -> Result<FundDetails, Error> {
        let result = self.summary(symbol, FUND_MODULES).await?;
        let details = parse_fund(&result);
        if details.holdings.is_empty() && details.ter.is_none() && details.fund_size.is_none() {
            return Err(Error::NotFound);
        }
        Ok(details)
    }
}

/// `{"raw": 1.5, "fmt": "1.50"}` or a plain number -> f64.
fn num(v: &Value, path: &str) -> Option<f64> {
    let v = v.pointer(path)?;
    v.get("raw").unwrap_or(v).as_f64().filter(|n| n.is_finite())
}

fn string(v: &Value, path: &str) -> Option<String> {
    v.pointer(path)
        .and_then(Value::as_str)
        .map(str::trim)
        .filter(|s| !s.is_empty())
        .map(str::to_string)
}

/// `None` when Yahoo knows the symbol but has no company figures for it.
pub fn parse_stock(r: &Value) -> Option<StockDetails> {
    let d = StockDetails {
        sector: string(r, "/assetProfile/sector"),
        industry: string(r, "/assetProfile/industry"),
        country: string(r, "/assetProfile/country").and_then(|c| countries::code(&c)),
        employees: num(r, "/assetProfile/fullTimeEmployees").map(|n| n as i32),
        website: string(r, "/assetProfile/website"),
        currency: string(r, "/summaryDetail/currency").or_else(|| string(r, "/price/currency")),
        market_cap: num(r, "/summaryDetail/marketCap").or_else(|| num(r, "/price/marketCap")),
        pe_ratio: num(r, "/summaryDetail/trailingPE"),
        price_to_book: num(r, "/defaultKeyStatistics/priceToBook"),
        dividend_yield: num(r, "/summaryDetail/dividendYield"),
        payout_ratio: num(r, "/summaryDetail/payoutRatio"),
        revenue: num(r, "/financialData/totalRevenue"),
        revenue_currency: string(r, "/financialData/financialCurrency"),
        profit_margin: num(r, "/financialData/profitMargins"),
        revenue_growth: num(r, "/financialData/revenueGrowth"),
        beta: num(r, "/summaryDetail/beta").or_else(|| num(r, "/defaultKeyStatistics/beta")),
    };
    (d.sector.is_some() || d.market_cap.is_some()).then_some(d)
}

pub fn parse_fund(r: &Value) -> FundDetails {
    let holdings = r
        .pointer("/topHoldings/holdings")
        .and_then(Value::as_array)
        .map(|list| {
            list.iter()
                .filter_map(|h| {
                    Some(Holding {
                        name: string(h, "/holdingName")?,
                        ticker: string(h, "/symbol"),
                        weight: num(h, "/holdingPercent")?,
                        sector: None,
                        country: None,
                    })
                })
                .collect()
        })
        .unwrap_or_default();
    FundDetails {
        as_of: None,
        fund_size: num(r, "/defaultKeyStatistics/totalAssets")
            .or_else(|| num(r, "/summaryDetail/totalAssets")),
        holdings_count: None,
        ter: num(
            r,
            "/fundProfile/feesExpensesInvestment/annualReportExpenseRatio",
        )
        .or_else(|| num(r, "/defaultKeyStatistics/annualReportExpenseRatio")),
        inception: num(r, "/defaultKeyStatistics/fundInceptionDate")
            .and_then(|t| time::OffsetDateTime::from_unix_timestamp(t as i64).ok())
            .map(|t| t.date()),
        holdings: top(holdings),
        countries: Default::default(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn parses_stock() {
        let r = json!({
            "assetProfile": {"sector": "Technology", "industry": "Consumer Electronics",
                             "country": "United States", "fullTimeEmployees": 164000,
                             "website": "https://www.apple.com"},
            "summaryDetail": {"marketCap": {"raw": 3.4e12, "fmt": "3.4T"}, "trailingPE": {"raw": 35.2},
                              "dividendYield": {"raw": 0.0044}, "payoutRatio": {"raw": 0.15},
                              "beta": {"raw": 1.2}, "currency": "USD"},
            "defaultKeyStatistics": {"priceToBook": {"raw": 50.1}},
            "financialData": {"totalRevenue": {"raw": 3.9e11}, "profitMargins": {"raw": 0.24},
                              "revenueGrowth": {"raw": 0.06}, "financialCurrency": "USD"}
        });
        let d = parse_stock(&r).unwrap();
        assert_eq!(d.country, Some("US"));
        assert_eq!(d.employees, Some(164000));
        assert_eq!(d.market_cap, Some(3.4e12));
        assert_eq!(d.dividend_yield, Some(0.0044));
        assert_eq!(d.revenue_currency.as_deref(), Some("USD"));
        // Yahoo knows the symbol but has nothing: not a stock with figures
        assert!(parse_stock(&json!({"assetProfile": {}, "summaryDetail": {}})).is_none());
    }

    #[test]
    fn parses_fund() {
        let r = json!({
            "topHoldings": {"holdings": [
                {"symbol": "MSFT", "holdingName": "Microsoft Corp", "holdingPercent": {"raw": 0.05}},
                {"symbol": "AAPL", "holdingName": "Apple Inc", "holdingPercent": {"raw": 0.06}}
            ]},
            "fundProfile": {"feesExpensesInvestment": {"annualReportExpenseRatio": {"raw": 0.0003}}},
            "defaultKeyStatistics": {"totalAssets": {"raw": 1.9e12}, "fundInceptionDate": {"raw": 990662400}}
        });
        let d = parse_fund(&r);
        assert_eq!(d.holdings[0].name, "Apple Inc");
        assert_eq!(d.ter, Some(0.0003));
        assert_eq!(d.inception, Some(time::macros::date!(2001 - 05 - 24)));
    }
}
