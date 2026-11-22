//! `--mode details`: fund facts, top holdings and country weights
//! (api.funds, api.fund_holdings, api.fund_countries) and company figures of
//! stocks (api.asset_details). Where each asset's details come from is
//! api.assets.details_provider, independent of its price provider.

pub mod countries;
mod html;
pub mod ishares;
mod parse;
pub mod vanguard;
pub mod yahoo;

use sqlx::PgPool;
use std::{collections::BTreeMap, time::Duration};

/// How many holdings are stored per fund (api.fund_holdings).
const TOP_HOLDINGS: usize = 15;

#[derive(Debug, Clone, PartialEq)]
pub struct Holding {
    pub name: String,
    pub ticker: Option<String>,
    /// fraction of the fund
    pub weight: f64,
    pub sector: Option<String>,
    pub country: Option<&'static str>,
}

/// What a provider reports about one fund. `None`/empty: not reported, the
/// stored value is kept (holdings and countries are replaced only when the
/// provider reports some).
#[derive(Debug, Default, Clone, PartialEq)]
pub struct FundDetails {
    pub as_of: Option<time::Date>,
    /// in the fund currency
    pub fund_size: Option<f64>,
    pub holdings_count: Option<i32>,
    /// fraction (0.002 = 0.20 %); only fills a NULL api.funds.ter
    pub ter: Option<f64>,
    /// only fills a NULL api.funds.inception
    pub inception: Option<time::Date>,
    /// largest first, at most TOP_HOLDINGS
    pub holdings: Vec<Holding>,
    /// ISO code ('ZZ' = other/cash/unknown) -> fraction, summing to ~1
    pub countries: BTreeMap<&'static str, f64>,
}

/// Company figures of a stock (api.asset_details).
#[derive(Debug, Default, Clone, PartialEq)]
pub struct StockDetails {
    pub sector: Option<String>,
    pub industry: Option<String>,
    pub country: Option<&'static str>,
    pub employees: Option<i32>,
    pub website: Option<String>,
    pub currency: Option<String>,
    pub market_cap: Option<f64>,
    pub pe_ratio: Option<f64>,
    pub price_to_book: Option<f64>,
    pub dividend_yield: Option<f64>,
    pub payout_ratio: Option<f64>,
    pub revenue: Option<f64>,
    pub revenue_currency: Option<String>,
    pub profit_margin: Option<f64>,
    pub revenue_growth: Option<f64>,
    pub beta: Option<f64>,
}

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("request failed: {0}")]
    Request(#[from] reqwest::Error),
    #[error("HTTP {0}")]
    Status(reqwest::StatusCode),
    #[error("rate limited")]
    RateLimited,
    #[error("not found")]
    NotFound,
    #[error("unexpected response: {0}")]
    Format(String),
}

/// Sorts holdings by weight, keeps the largest TOP_HOLDINGS.
fn top(mut holdings: Vec<Holding>) -> Vec<Holding> {
    holdings.sort_by(|a, b| b.weight.total_cmp(&a.weight));
    holdings.truncate(TOP_HOLDINGS);
    holdings
}

/// Adds the part the provider does not list to 'ZZ', so the weights sum to 1
/// (providers list the largest countries, or round).
fn complete(mut countries: BTreeMap<&'static str, f64>) -> BTreeMap<&'static str, f64> {
    countries.retain(|_, w| *w > 0.0);
    let total: f64 = countries.values().sum();
    if total > 0.0 && total < 0.999 {
        *countries.entry("ZZ").or_default() += 1.0 - total;
    }
    if total > 1.0 {
        // rounding or leverage: scale down so shares stay comparable
        countries.values_mut().for_each(|w| *w /= total);
    }
    countries
}

pub struct Options {
    /// pause between requests to one host
    pub delay: Duration,
    /// refresh a stock's figures when older than this
    pub max_age_days: i32,
    /// at most this many stocks per run (spreads the Yahoo requests)
    pub stock_limit: i64,
    /// refresh funds even when updated within the last 20 hours
    pub force: bool,
}

#[derive(sqlx::FromRow)]
struct FundRow {
    id: i64,
    name: String,
    provider: String,
    details_source: Option<String>,
    symbol: String,
}

#[derive(sqlx::FromRow)]
struct StockRow {
    id: i64,
    symbol: String,
    details_provider: Option<String>,
}

pub async fn run(pool: &PgPool, opts: &Options) -> anyhow::Result<()> {
    let http = ishares::client()?;
    let mut yahoo = yahoo::Client::new()?;

    // --- funds -------------------------------------------------------------
    let funds: Vec<FundRow> = sqlx::query_as(
        "SELECT DISTINCT ON (f.id) f.id, f.name, a.details_provider::text AS provider,
                f.details_source,
                a.symbol
         FROM api.funds f
         JOIN api.assets a ON a.fund_id = f.id
         WHERE a.details_provider IS NOT NULL
           AND ($1 OR f.details_updated_at IS NULL OR f.details_updated_at < now() - interval '20 hours')
         -- a listing Yahoo has prices for is the best symbol to ask it about
         ORDER BY f.id, (a.price_provider = 'yahoo') DESC NULLS LAST, a.symbol",
    )
    .bind(opts.force)
    .fetch_all(pool)
    .await?;
    println!("Fund details: {} funds to refresh.", funds.len());

    let (mut ok, mut failed) = (0, 0);
    for fund in &funds {
        let result = match (fund.provider.as_str(), fund.details_source.as_deref()) {
            ("ishares", Some(url)) => ishares::fetch(&http, url).await,
            ("vanguard", Some(url)) => vanguard::fetch(&http, url).await,
            ("yahoo", _) => yahoo.fund(&fund.symbol).await,
            (provider, None) => Err(Error::Format(format!("{provider}: fund has no details_source"))),
            (provider, _) => Err(Error::Format(format!("unknown provider {provider}"))),
        };
        match result {
            Ok(details) => {
                store_fund(pool, fund.id, &details).await?;
                println!(
                    "{} ({}): {} holdings, {} countries",
                    fund.name,
                    fund.provider,
                    details.holdings.len(),
                    details.countries.len()
                );
                ok += 1;
            }
            Err(Error::RateLimited) => {
                eprintln!("{} ({}): rate limited, stopping funds", fund.name, fund.provider);
                failed += 1;
                break;
            }
            Err(e) => {
                eprintln!("{} ({}): {e}", fund.name, fund.provider);
                failed += 1;
            }
        }
        tokio::time::sleep(opts.delay).await;
    }
    println!("Funds: {ok} updated, {failed} failed.");

    // --- stocks ------------------------------------------------------------
    // details_provider NULL with a price provider: not resolved yet. Asking
    // Yahoo for the figures resolves it (found -> 'yahoo').
    let stocks: Vec<StockRow> = sqlx::query_as(
        "SELECT a.id, a.symbol, a.details_provider::text AS details_provider
         FROM api.assets a
         LEFT JOIN api.asset_details d ON d.asset_id = a.id
         WHERE a.asset_type = 'stock' AND a.fund_id IS NULL
           AND (a.details_provider = 'yahoo'
                OR (a.details_provider IS NULL AND a.price_provider IS NOT NULL))
           AND (d.updated_at IS NULL OR d.updated_at < now() - make_interval(days => $1))
         ORDER BY d.updated_at NULLS FIRST, a.id
         LIMIT $2",
    )
    .bind(opts.max_age_days)
    .bind(opts.stock_limit)
    .fetch_all(pool)
    .await?;
    println!("Stock details: {} stocks to refresh (Yahoo Finance).", stocks.len());

    let (mut ok, mut missing, mut failed) = (0, 0, 0);
    for stock in &stocks {
        match yahoo.stock(&stock.symbol).await {
            Ok(details) => {
                store_stock(pool, stock.id, &details).await?;
                ok += 1;
            }
            Err(Error::NotFound) => {
                if stock.details_provider.is_some() {
                    eprintln!("{}: no longer found on Yahoo Finance", stock.symbol);
                }
                missing += 1;
            }
            Err(Error::RateLimited) => {
                eprintln!("{}: rate limited, stopping (the next run continues)", stock.symbol);
                failed += 1;
                break;
            }
            Err(e) => {
                eprintln!("{}: {e}", stock.symbol);
                failed += 1;
            }
        }
        tokio::time::sleep(opts.delay).await;
    }
    println!("Stocks: {ok} updated, {missing} not on Yahoo Finance, {failed} failed.");
    Ok(())
}

async fn store_fund(pool: &PgPool, fund_id: i64, d: &FundDetails) -> Result<(), sqlx::Error> {
    let mut tx = pool.begin().await?;
    sqlx::query(
        "UPDATE api.funds SET
           fund_size = coalesce($2, fund_size),
           holdings_count = coalesce($3, holdings_count),
           ter = coalesce(ter, $4),
           inception = coalesce(inception, $5),
           details_as_of = coalesce($6, current_date),
           details_updated_at = now()
         WHERE id = $1",
    )
    .bind(fund_id)
    .bind(d.fund_size)
    .bind(d.holdings_count)
    .bind(d.ter)
    .bind(d.inception)
    .bind(d.as_of)
    .execute(&mut *tx)
    .await?;

    if !d.holdings.is_empty() {
        sqlx::query("DELETE FROM api.fund_holdings WHERE fund_id = $1")
            .bind(fund_id)
            .execute(&mut *tx)
            .await?;
        let positions: Vec<i16> = (1..=d.holdings.len() as i16).collect();
        let names: Vec<&str> = d.holdings.iter().map(|h| h.name.as_str()).collect();
        let tickers: Vec<Option<&str>> = d.holdings.iter().map(|h| h.ticker.as_deref()).collect();
        let weights: Vec<f64> = d.holdings.iter().map(|h| h.weight.clamp(0.0, 1.0)).collect();
        let sectors: Vec<Option<&str>> = d.holdings.iter().map(|h| h.sector.as_deref()).collect();
        let countries: Vec<Option<&str>> = d.holdings.iter().map(|h| h.country).collect();
        sqlx::query(
            "INSERT INTO api.fund_holdings (fund_id, position, name, ticker, weight, sector, country)
             SELECT $1, * FROM UNNEST($2::smallint[], $3::text[], $4::text[], $5::float8[], $6::text[], $7::text[])",
        )
        .bind(fund_id)
        .bind(positions)
        .bind(names)
        .bind(tickers)
        .bind(weights)
        .bind(sectors)
        .bind(countries)
        .execute(&mut *tx)
        .await?;
    }

    if !d.countries.is_empty() {
        sqlx::query("DELETE FROM api.fund_countries WHERE fund_id = $1")
            .bind(fund_id)
            .execute(&mut *tx)
            .await?;
        let codes: Vec<&str> = d.countries.keys().copied().collect();
        let weights: Vec<f64> = d.countries.values().map(|w| w.clamp(0.0, 1.0)).collect();
        sqlx::query(
            "INSERT INTO api.fund_countries (fund_id, country, weight)
             SELECT $1, * FROM UNNEST($2::text[], $3::float8[])",
        )
        .bind(fund_id)
        .bind(codes)
        .bind(weights)
        .execute(&mut *tx)
        .await?;
    }
    tx.commit().await
}

async fn store_stock(pool: &PgPool, asset_id: i64, d: &StockDetails) -> Result<(), sqlx::Error> {
    let mut tx = pool.begin().await?;
    sqlx::query(
        "INSERT INTO api.asset_details (asset_id, sector, industry, country, employees, website,
           currency, market_cap, pe_ratio, price_to_book, dividend_yield, payout_ratio, revenue,
           revenue_currency, profit_margin, revenue_growth, beta, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, now())
         ON CONFLICT (asset_id) DO UPDATE SET
           sector = EXCLUDED.sector, industry = EXCLUDED.industry, country = EXCLUDED.country,
           employees = EXCLUDED.employees, website = EXCLUDED.website, currency = EXCLUDED.currency,
           market_cap = EXCLUDED.market_cap, pe_ratio = EXCLUDED.pe_ratio,
           price_to_book = EXCLUDED.price_to_book, dividend_yield = EXCLUDED.dividend_yield,
           payout_ratio = EXCLUDED.payout_ratio, revenue = EXCLUDED.revenue,
           revenue_currency = EXCLUDED.revenue_currency, profit_margin = EXCLUDED.profit_margin,
           revenue_growth = EXCLUDED.revenue_growth, beta = EXCLUDED.beta, updated_at = now()",
    )
    .bind(asset_id)
    .bind(&d.sector)
    .bind(&d.industry)
    .bind(d.country)
    .bind(d.employees)
    .bind(&d.website)
    .bind(&d.currency)
    .bind(d.market_cap)
    .bind(d.pe_ratio)
    .bind(d.price_to_book)
    .bind(d.dividend_yield)
    .bind(d.payout_ratio)
    .bind(d.revenue)
    .bind(&d.revenue_currency)
    .bind(d.profit_margin)
    .bind(d.revenue_growth)
    .bind(d.beta)
    .execute(&mut *tx)
    .await?;
    sqlx::query(
        "UPDATE api.assets SET details_provider = 'yahoo'
         WHERE id = $1 AND details_provider IS DISTINCT FROM 'yahoo'",
    )
    .bind(asset_id)
    .execute(&mut *tx)
    .await?;
    tx.commit().await
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn complete_books_the_rest_as_other() {
        let c = complete(BTreeMap::from([("US", 0.6), ("JP", 0.3)]));
        assert!((c["ZZ"] - 0.1).abs() < 1e-9);
        let c = complete(BTreeMap::from([("US", 0.8), ("JP", 0.4)]));
        assert!((c.values().sum::<f64>() - 1.0).abs() < 1e-9);
    }
}
