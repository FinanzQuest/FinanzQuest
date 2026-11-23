//! iShares holdings files: every position with weight, sector and location.
//! UCITS funds: blackrock.com/uk "…ajax?fileType=csv"; US funds:
//! ishares.com/us/products/<id>/x/latest-holdings.csv. Both have a few
//! "key,value" lines, then a header row starting with "Ticker", then one row
//! per position, then a disclaimer.

use super::{Error, FundDetails, Holding, complete, countries, parse, top};
use std::collections::BTreeMap;

/// Plain HTTPS client for the issuers' public files and pages.
pub fn client() -> Result<reqwest::Client, reqwest::Error> {
    reqwest::Client::builder()
        .user_agent(concat!("FinanzQuest-updater/", env!("CARGO_PKG_VERSION")))
        .timeout(std::time::Duration::from_secs(60))
        .build()
}

pub async fn fetch(http: &reqwest::Client, url: &str) -> Result<FundDetails, Error> {
    let response = http.get(url).send().await?;
    match response.status() {
        s if s == reqwest::StatusCode::TOO_MANY_REQUESTS => return Err(Error::RateLimited),
        s if s == reqwest::StatusCode::NOT_FOUND => return Err(Error::NotFound),
        s if !s.is_success() => return Err(Error::Status(s)),
        _ => {}
    }
    parse(&response.text().await?)
}

/// Asset classes that are no holding of their own (cash, collateral,
/// derivatives): they count towards 'ZZ', not towards the holdings.
fn is_cash_like(asset_class: &str) -> bool {
    let c = asset_class.to_ascii_lowercase();
    c.contains("cash")
        || c.contains("money market")
        || c == "fx"
        || c.contains("futures")
        || c.contains("derivative")
        || c.contains("swap")
}

pub fn parse(text: &str) -> Result<FundDetails, Error> {
    let text = text.trim_start_matches('\u{feff}');
    let mut reader = csv::ReaderBuilder::new()
        .has_headers(false)
        .flexible(true)
        .from_reader(text.as_bytes());

    let mut details = FundDetails::default();
    let mut header: Option<Vec<String>> = None;
    let mut rows = Vec::new();
    for record in reader.records() {
        let Ok(record) = record else { continue };
        let first = record.get(0).unwrap_or("").trim();
        match &header {
            None => match first {
                "Fund Holdings as of" => details.as_of = record.get(1).and_then(parse::date),
                "Inception Date" => details.inception = record.get(1).and_then(parse::date),
                // equity files start with Ticker, bond files with Name
                _ if record.iter().any(|f| f.trim() == "Name")
                    && record
                        .iter()
                        .any(|f| matches!(f.trim(), "Weight (%)" | "Market Weight")) =>
                {
                    header = Some(record.iter().map(|f| f.trim().to_string()).collect())
                }
                _ => {}
            },
            Some(h) => {
                // the table ends at the first short row (blank line, disclaimer)
                if record.len() < h.len() {
                    break;
                }
                rows.push(record);
            }
        }
    }
    let header = header.ok_or_else(|| Error::Format("no holdings header row".into()))?;
    let col = |names: &[&str]| header.iter().position(|h| names.contains(&h.as_str()));
    let name_col = col(&["Name"]).ok_or_else(|| Error::Format("no Name column".into()))?;
    let weight_col = col(&["Weight (%)", "Market Weight"])
        .ok_or_else(|| Error::Format("no weight column".into()))?;
    let (ticker_col, sector_col, class_col, value_col, location_col) = (
        col(&["Ticker"]),
        col(&["Sector"]),
        col(&["Asset Class"]),
        col(&["Market Value"]),
        col(&["Location"]),
    );

    fn get(r: &csv::StringRecord, c: Option<usize>) -> Option<&str> {
        c.and_then(|c| r.get(c))
            .map(str::trim)
            .filter(|v| !v.is_empty() && *v != "-")
    }
    // bond funds hold many lines of one issuer ("TREASURY NOTE"): one entry each
    let mut holdings: Vec<Holding> = Vec::new();
    let mut by_country: BTreeMap<&'static str, f64> = BTreeMap::new();
    let mut fund_size = 0.0;
    let mut count = 0;
    for r in &rows {
        let Some(weight) = get(r, Some(weight_col)).and_then(parse::percent) else {
            continue;
        };
        fund_size += get(r, value_col).and_then(parse::number).unwrap_or(0.0);
        let cash = get(r, class_col).is_some_and(is_cash_like);
        let country = if cash {
            None
        } else {
            get(r, location_col).and_then(countries::code)
        };
        *by_country.entry(country.unwrap_or("ZZ")).or_default() += weight;
        if cash {
            continue;
        }
        count += 1;
        let name = get(r, Some(name_col)).unwrap_or("?");
        match holdings
            .iter_mut()
            .find(|h| h.name.eq_ignore_ascii_case(name))
        {
            Some(h) => h.weight += weight,
            None => holdings.push(Holding {
                name: name.to_string(),
                ticker: get(r, ticker_col).map(str::to_string),
                weight,
                sector: get(r, sector_col).map(str::to_string),
                country,
            }),
        }
    }
    if holdings.is_empty() {
        return Err(Error::Format("holdings table is empty".into()));
    }
    details.fund_size = (fund_size > 0.0).then_some(fund_size);
    details.holdings_count = Some(count);
    details.holdings = top(holdings);
    details.countries = complete(by_country);
    Ok(details)
}

#[cfg(test)]
mod tests {
    use super::*;
    use time::macros::date;

    const UCITS: &str = "\u{feff}Fund Holdings as of,\"20/Nov/2026\"\n \nTicker,Name,Sector,Asset Class,Market Value,Weight (%),Notional Value,Shares,Price,Location,Exchange,Market Currency\n\
\"AAPL\",\"APPLE\",\"Information Technology\",\"Equity\",\"6,000.00\",\"60.00\",\"6,000.00\",\"1.00\",\"1.00\",\"United States\",\"NASDAQ\",\"USD\"\n\
\"7203\",\"TOYOTA MOTOR CORP\",\"Consumer Discretionary\",\"Equity\",\"3,000.00\",\"30.00\",\"3,000.00\",\"1.00\",\"1.00\",\"Japan\",\"Tokyo Stock Exchange\",\"JPY\"\n\
\"USD\",\"USD CASH\",\"Cash and/or Derivatives\",\"Cash\",\"1,000.00\",\"10.00\",\"1,000.00\",\"1.00\",\"1.00\",\"United States\",\"-\",\"USD\"\n\
\u{a0}\n\"The content contained herein is owned or licensed by BlackRock\"\n";

    #[test]
    fn parses_ucits_file() {
        let d = parse(UCITS).unwrap();
        assert_eq!(d.as_of, Some(date!(2026 - 11 - 20)));
        assert_eq!(d.holdings_count, Some(2));
        assert_eq!(d.fund_size, Some(10_000.0));
        assert_eq!(d.holdings[0].name, "APPLE");
        assert_eq!(d.holdings[0].country, Some("US"));
        assert!((d.holdings[1].weight - 0.30).abs() < 1e-9);
        // cash is not a US holding
        assert!((d.countries["US"] - 0.60).abs() < 1e-9);
        assert!((d.countries["JP"] - 0.30).abs() < 1e-9);
        assert!((d.countries["ZZ"] - 0.10).abs() < 1e-9);
    }

    const US: &str = "iShares Core S&P 500 ETF\nFund Holdings as of,\"Nov 20, 2026\"\nInception Date,\"May 15, 2000\"\nShares Outstanding,\"1,160,150,000.00\"\nStock,\"-\"\n\n\
Ticker,Name,Type,Sector,Asset Class,Market Value,Notional Value,Quantity,Price,Location,Exchange,Currency,FX Rate,Market Currency,Accrual Date,Market Weight,Notional Weight\n\
\"AAPL\",\"APPLE\",\"EQUITY\",\"Information Technology\",\"Equity\",\"67,270,952,735.84\",\"67,270,952,735.84\",\"196,377,139.00\",\"342.56\",\"United States\",\"NASDAQ\",\"USD\",\"1.00\",\"USD\",\"-\",\"8.38\",\"8.37\"\n\
\"MSFT\",\"MICROSOFT\",\"EQUITY\",\"Information Technology\",\"Equity\",\"48,411,731,542.80\",\"48,411,731,542.80\",\"99,916,890.00\",\"484.52\",\"United States\",\"NASDAQ\",\"USD\",\"1.00\",\"USD\",\"-\",\"6.03\",\"6.03\"\n\
\n\"The content contained herein\"\n";

    #[test]
    fn parses_us_file() {
        let d = parse(US).unwrap();
        assert_eq!(d.as_of, Some(date!(2026 - 11 - 20)));
        assert_eq!(d.inception, Some(date!(2000 - 05 - 15)));
        assert_eq!(d.holdings.len(), 2);
        assert!((d.holdings[0].weight - 0.0838).abs() < 1e-9);
        assert_eq!(d.holdings[1].ticker.as_deref(), Some("MSFT"));
    }

    const BONDS: &str = "iShares Core U.S. Aggregate Bond ETF\nFund Holdings as of,\"Nov 20, 2026\"\n\n\
Name,Sector,Asset Class,Market Value,Weight (%),Notional Value,Par Value,CUSIP,ISIN,SEDOL,Location\n\
\"BLACKROCK CASH CL INST SL AGENCY\",\"Cash and/or Derivatives\",\"Money Market\",\"3.00\",\"3.00\",\"3\",\"3\",\"1\",\"X\",\"X\",\"United States\"\n\
\"TREASURY NOTE\",\"Treasury\",\"Fixed Income\",\"0.40\",\"0.40\",\"1\",\"1\",\"1\",\"X\",\"X\",\"United States\"\n\
\"TREASURY NOTE\",\"Treasury\",\"Fixed Income\",\"0.35\",\"0.35\",\"1\",\"1\",\"1\",\"X\",\"X\",\"United States\"\n\
\"FNMA 30YR\",\"MBS\",\"Fixed Income\",\"0.50\",\"0.50\",\"1\",\"1\",\"1\",\"X\",\"X\",\"United States\"\n";

    #[test]
    fn parses_bond_file_and_merges_issuers() {
        let d = parse(BONDS).unwrap();
        assert_eq!(d.holdings_count, Some(3));
        assert_eq!(d.holdings.len(), 2);
        assert_eq!(d.holdings[0].name, "TREASURY NOTE");
        assert!((d.holdings[0].weight - 0.0075).abs() < 1e-9);
        assert_eq!(d.holdings[0].ticker, None);
    }

    #[test]
    fn rejects_an_html_page() {
        assert!(parse("<!doctype html><html></html>").is_err());
    }
}
