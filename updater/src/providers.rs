//! `--mode resolve-providers`: decides api.assets.price_provider from what the
//! APIs actually serve. Alpaca first (daily IEX bars in the last 30 days),
//! else Yahoo Finance (daily bars in the last 30 days), else NULL.
//!
//! Only definitive answers change a row: a symbol Alpaca rejects or returns no
//! bars for, a symbol Yahoo reports as unknown or without data. Network
//! errors, rate limits and 5xx leave the stored value untouched, so a flaky
//! API never flips an asset between providers.

use std::{collections::HashMap, pin::pin, time::Duration};

use sqlx::PgPool;
use tokio_stream::StreamExt;

use crate::{
    alpaca::{self, AlpacaClient, AlpacaRequest},
    uploader::{Asset, PriceProvider},
    yf,
};

/// Days of daily bars a provider must have for the asset.
const LOOKBACK_DAYS: i64 = 30;
/// Symbols per Alpaca request; a rejected batch is retried symbol by symbol.
const ALPACA_CHUNK: usize = 50;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Check {
    Found,
    Missing,
    /// transient failure, no conclusion
    Unknown(String),
}

/// The provider an asset should use, `None` if neither has it. `Err` when a
/// check was inconclusive (keep the stored value).
pub fn decide(alpaca: &Check, yahoo: Option<&Check>) -> Result<Option<PriceProvider>, String> {
    match (alpaca, yahoo) {
        (Check::Found, _) => Ok(Some(PriceProvider::Alpaca)),
        (Check::Unknown(e), _) => Err(format!("alpaca: {e}")),
        (Check::Missing, Some(Check::Found)) => Ok(Some(PriceProvider::Yahoo)),
        (Check::Missing, Some(Check::Missing)) => Ok(None),
        (Check::Missing, Some(Check::Unknown(e))) => Err(format!("yahoo: {e}")),
        (Check::Missing, None) => Err("yahoo: not checked".into()),
    }
}

fn lookback_start(now: time::OffsetDateTime) -> time::OffsetDateTime {
    time::OffsetDateTime::new_utc(
        now.date() - time::Duration::days(LOOKBACK_DAYS),
        time::Time::MIDNIGHT,
    )
}

/// Client errors (bad/unknown symbol) are an answer; 429, 5xx and network
/// errors are not.
fn is_definitive_rejection(e: &anyhow::Error) -> bool {
    e.downcast_ref::<reqwest::Error>()
        .and_then(reqwest::Error::status)
        .is_some_and(|s| s.is_client_error() && s != reqwest::StatusCode::TOO_MANY_REQUESTS)
}

async fn alpaca_bars(
    client: &AlpacaClient,
    symbols: &[String],
    now: time::OffsetDateTime,
) -> anyhow::Result<HashMap<String, usize>> {
    let mut counts: HashMap<String, usize> = HashMap::new();
    let mut page_token = None;
    loop {
        let response = client
            .fetch_bars(AlpacaRequest {
                symbols: symbols.to_vec(),
                // same feed / currency / adjustment as the daily run
                query: alpaca::QueryParams {
                    timeframe: alpaca::Timeframe::Day,
                    start: Some(alpaca::DateTime::DateTime(lookback_start(now))),
                    currency: Some(alpaca::Currency::EUR),
                    adjustment: Some(alpaca::Adjustment::All),
                    feed: Some(alpaca::Feed::Iex),
                    limit: Some(10_000),
                    page_token,
                    ..Default::default()
                },
            })
            .await?;
        for (symbol, bars) in response.bars {
            *counts.entry(symbol).or_default() += bars.len();
        }
        match response.next_page_token {
            Some(token) => page_token = Some(token),
            None => return Ok(counts),
        }
    }
}

pub async fn check_alpaca(
    client: &AlpacaClient,
    symbols: &[String],
    now: time::OffsetDateTime,
    delay: Duration,
) -> HashMap<String, Check> {
    let mut result = HashMap::new();
    for chunk in symbols.chunks(ALPACA_CHUNK) {
        match alpaca_bars(client, chunk, now).await {
            Ok(counts) => {
                for symbol in chunk {
                    let found = counts.get(symbol).is_some_and(|n| *n > 0);
                    result.insert(
                        symbol.clone(),
                        if found { Check::Found } else { Check::Missing },
                    );
                }
            }
            // one invalid symbol rejects the whole batch: ask one by one
            Err(e) if is_definitive_rejection(&e) && chunk.len() > 1 => {
                for symbol in chunk {
                    tokio::time::sleep(delay).await;
                    let check = match alpaca_bars(client, std::slice::from_ref(symbol), now).await {
                        Ok(counts) if counts.get(symbol).is_some_and(|n| *n > 0) => Check::Found,
                        Ok(_) => Check::Missing,
                        Err(e) if is_definitive_rejection(&e) => Check::Missing,
                        Err(e) => Check::Unknown(e.to_string()),
                    };
                    result.insert(symbol.clone(), check);
                }
            }
            Err(e) if is_definitive_rejection(&e) => {
                result.insert(chunk[0].clone(), Check::Missing);
            }
            Err(e) => {
                for symbol in chunk {
                    result.insert(symbol.clone(), Check::Unknown(e.to_string()));
                }
            }
        }
        tokio::time::sleep(delay).await;
    }
    result
}

pub async fn check_yahoo(assets: Vec<Asset>, now: time::OffsetDateTime) -> HashMap<String, Check> {
    let window = (lookback_start(now), now);
    let requests = assets
        .into_iter()
        .map(|asset| yf::FetchRequest::for_window(asset, window))
        .collect();
    let mut result = HashMap::new();
    let mut stream = pin!(yf::stream_prices(requests, yf::FetchConfig::default()));
    while let Some(page) = stream.next().await {
        let check = match page.data {
            Ok(frame) if frame.is_empty() => Check::Missing,
            Ok(_) => Check::Found,
            // unknown symbol, or still no data after all retries
            Err(e) if e.is_fatal() || matches!(e, yf::Error::EmptyResponse) => Check::Missing,
            Err(e) => Check::Unknown(e.to_string()),
        };
        result.insert(page.symbol, check);
    }
    result
}

/// Writes the decided providers (NULL = neither API has the asset).
pub async fn store(
    pool: &PgPool,
    decided: &[(i64, Option<PriceProvider>)],
) -> Result<u64, sqlx::Error> {
    let ids: Vec<i64> = decided.iter().map(|(id, _)| *id).collect();
    let providers: Vec<Option<String>> = decided
        .iter()
        .map(|(_, p)| p.map(|p| p.as_str().to_string()))
        .collect();
    let result = sqlx::query(
        "UPDATE api.assets a SET price_provider = d.provider::text::PriceProvider
         FROM UNNEST($1::bigint[], $2::text[]) AS d(id, provider)
         WHERE a.id = d.id AND a.price_provider IS DISTINCT FROM d.provider::text::PriceProvider",
    )
    .bind(ids)
    .bind(providers)
    .execute(pool)
    .await?;
    Ok(result.rows_affected())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn alpaca_wins() {
        assert_eq!(decide(&Check::Found, None), Ok(Some(PriceProvider::Alpaca)));
        assert_eq!(
            decide(&Check::Found, Some(&Check::Found)),
            Ok(Some(PriceProvider::Alpaca))
        );
    }

    #[test]
    fn falls_back_to_yahoo_then_null() {
        assert_eq!(
            decide(&Check::Missing, Some(&Check::Found)),
            Ok(Some(PriceProvider::Yahoo))
        );
        assert_eq!(decide(&Check::Missing, Some(&Check::Missing)), Ok(None));
    }

    #[test]
    fn transient_failures_decide_nothing() {
        assert!(decide(&Check::Unknown("timeout".into()), None).is_err());
        assert!(decide(&Check::Missing, Some(&Check::Unknown("429".into()))).is_err());
    }

    #[test]
    fn lookback_starts_at_midnight() {
        use time::macros::datetime;
        assert_eq!(
            lookback_start(datetime!(2026-11-22 14:00 UTC)),
            datetime!(2026-10-23 00:00 UTC)
        );
    }
}
