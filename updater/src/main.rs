use clap::Parser;
use std::{pin::pin, time::Duration};
use time::macros::date;
use tokio_stream::StreamExt;

mod alpaca;
mod priceframe;
use alpaca::AlpacaClient;

mod details;
mod providers;
mod yf;

use crate::{
    alpaca::Feed,
    uploader::{Asset, PriceProvider, Target, Uploader, symbol_list},
};
mod uploader;

#[derive(clap::ValueEnum, Copy, Clone, Debug, PartialEq, Eq)]
enum Mode {
    /// Daily candles since the last update into api.asset_prices
    Daily,
    /// Intraday bars into api.asset_prices_intraday (see `intraday_window`),
    /// rolled up into today's partial daily candle afterwards
    Intraday,
    /// Sets api.assets.price_provider from what the APIs serve: Alpaca if it
    /// has daily bars for the symbol, else Yahoo Finance, else NULL. Checks
    /// assets without a provider, or all with --recheck-all.
    ResolveProviders,
    /// Fund facts, top holdings and country weights (api.funds,
    /// api.fund_holdings, api.fund_countries) and stock figures
    /// (api.asset_details), each from its api.assets.details_provider.
    /// Resolves the details provider of stocks on the way (Yahoo has the
    /// figures -> 'yahoo').
    Details,
}

/// Intraday fetch window, ending at `now`. Normally from 00:00 UTC of the
/// previous day, so a missed run heals itself. If the newest bar in the
/// database (`latest_bar`) is older, the window starts at that bar's day, and
/// without any bars it starts `backfill_days` back — never further, since
/// older bars fall out of the 30-day retention anyway.
fn intraday_window(
    now: time::OffsetDateTime,
    latest_bar: Option<time::OffsetDateTime>,
    backfill_days: u16,
) -> (time::OffsetDateTime, time::OffsetDateTime) {
    let midnight = |date| time::OffsetDateTime::new_utc(date, time::Time::MIDNIGHT);
    let now = now.to_offset(time::UtcOffset::UTC);
    let yesterday = midnight(now.date().previous_day().expect("date out of range"));
    let limit = midnight(now.date() - time::Duration::days(backfill_days.into()));
    let start = match latest_bar {
        None => limit,
        Some(bar) => midnight(bar.to_offset(time::UtcOffset::UTC).date()).min(yesterday),
    };
    (start.max(limit), now)
}

/// Every setting can come from its environment variable (preferred for the
/// secrets: command-line arguments are visible in the process list).
#[derive(clap::Parser, Debug)]
struct Args {
    #[arg(short, long, env = "DB_URL", hide_env_values = true)]
    db_url: String,

    #[arg(long, env = "YF_TIMEOUT", default_value_t = 1_000)]
    yf_timeout: usize,
    #[arg(long, env = "ALPACA_TIMEOUT", default_value_t = 1_000)]
    alpaca_timeout: usize,
    #[arg(long, env = "ALPACA_SECRET_KEY", hide_env_values = true)]
    alpaca_secret_key: String,
    #[arg(long, env = "ALPACA_KEY_ID", hide_env_values = true)]
    alpaca_key_id: String,
    #[arg(long, env = "BATCH_SIZE", default_value_t = 10_000)]
    batch_size: usize,
    #[arg(long, env = "FETCH_CHUNK_SIZE", default_value_t = 10)]
    fetch_chunk_size: usize,
    #[arg(long, value_enum, default_value_t = Mode::Daily)]
    mode: Mode,
    /// Bar size in minutes for --mode intraday
    #[arg(long, default_value_t = 15)]
    interval_minutes: u8,
    /// --mode intraday: how far back to fetch when the database has no recent
    /// bars (first start, or after downtime). Matches the 30-day retention.
    #[arg(long, default_value_t = 30)]
    backfill_days: u16,
    /// --mode resolve-providers: re-check every asset, not only those without
    /// a provider
    #[arg(long)]
    recheck_all: bool,
    /// --mode details: pause between two requests in milliseconds
    #[arg(long, env = "DETAILS_DELAY_MS", default_value_t = 1_500)]
    details_delay_ms: u64,
    /// --mode details: refresh a stock's figures when older than this
    #[arg(long, default_value_t = 7)]
    details_max_age_days: i32,
    /// --mode details: at most this many stocks per run (Yahoo rate limits)
    #[arg(long, default_value_t = 400)]
    details_stock_limit: i64,
    /// --mode details: refresh funds even if updated in the last 20 hours
    #[arg(long)]
    force: bool,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let Args {
        db_url,
        alpaca_secret_key,
        alpaca_key_id,
        yf_timeout,
        alpaca_timeout,
        batch_size,
        fetch_chunk_size,
        mode,
        interval_minutes,
        backfill_days,
        recheck_all,
        details_delay_ms,
        details_max_age_days,
        details_stock_limit,
        force,
    } = Args::parse();

    let now = time::OffsetDateTime::now_utc();

    let yf_timeout = Duration::from_millis(yf_timeout as u64);
    let al_timeout = Duration::from_millis(alpaca_timeout as u64);

    let client = AlpacaClient::new(alpaca_key_id, alpaca_secret_key);

    print!("Establishing database connection: ");

    let pool = sqlx::postgres::PgPoolOptions::new()
        .max_connections(4)
        .connect(db_url.as_str())
        .await?;

    println!("DONE");

    if mode == Mode::Details {
        let opts = details::Options {
            delay: Duration::from_millis(details_delay_ms),
            max_age_days: details_max_age_days,
            stock_limit: details_stock_limit,
            force,
        };
        return details::run(&pool, &opts).await;
    }

    print!("Fetching assets from database: ");
    let assets = uploader::fetch_assets(&pool).await?;
    println!("DONE");

    if mode == Mode::ResolveProviders {
        let assets = assets
            .into_iter()
            .filter(|asset| recheck_all || asset.price_provider.is_none())
            .collect();
        return resolve_providers(&pool, &client, assets, now, al_timeout).await;
    }

    let (mut yf_assets, mut al_assets) = (Vec::new(), Vec::new());
    let mut skipped = 0;
    for asset in assets {
        match asset.price_provider {
            Some(PriceProvider::Yahoo) => yf_assets.push(asset),
            Some(PriceProvider::Alpaca) => al_assets.push(asset),
            None => skipped += 1,
        }
    }
    if skipped > 0 {
        println!("Skipping {skipped} assets without a price provider.");
    }

    let al_symbols = symbol_list(&al_assets);
    let (yf_requests, yf_config, al_query, target) = match mode {
        Mode::Daily => (
            yf_assets.into_iter().map(Into::into).collect(),
            yf::FetchConfig::default(),
            alpaca::QueryParams {
                timeframe: alpaca::Timeframe::Day,
                asof: Some(now.date()),
                start: Some(alpaca::DateTime::Date(date!(2020 - 01 - 01))),
                currency: Some(alpaca::Currency::EUR),
                adjustment: Some(alpaca::Adjustment::All),
                feed: Some(Feed::Iex),
                ..Default::default()
            },
            Target::Daily,
        ),
        Mode::Intraday => {
            let latest = uploader::latest_intraday_bar(&pool).await?;
            let window = intraday_window(now, latest, backfill_days);
            println!(
                "Intraday window: {} .. {} (newest bar in the database: {})",
                window.0,
                window.1,
                latest.map_or_else(|| "none".into(), |t| t.to_string())
            );
            (
                yf_assets
                    .into_iter()
                    .map(|asset| yf::FetchRequest::for_window(asset, window))
                    .collect(),
                yf::FetchConfig {
                    interval: format!("{interval_minutes}m"),
                    ..Default::default()
                },
                alpaca::QueryParams {
                    timeframe: alpaca::Timeframe::Minutes(interval_minutes),
                    start: Some(alpaca::DateTime::DateTime(window.0)),
                    currency: Some(alpaca::Currency::EUR),
                    // Same adjustment as the daily bars: rollup_intraday writes
                    // these into api.asset_prices, so they must be on the same
                    // (split/dividend adjusted) scale as the daily history.
                    adjustment: Some(alpaca::Adjustment::All),
                    feed: Some(Feed::Iex),
                    ..Default::default()
                },
                Target::Intraday,
            )
        }
        Mode::ResolveProviders | Mode::Details => unreachable!("returned above"),
    };
    let uploader = Uploader::new(pool.clone(), batch_size, target).await?;

    print!("Fetching price data from alpaca: ");
    let mut stream = pin!(client.stream_bars_chunked(al_symbols, al_query, fetch_chunk_size));

    while let Some(page) = stream.next().await {
        match page {
            Err(e) => {
                eprintln!("{e}");
                continue;
            }
            Ok(bars) => {
                let symbols: Vec<String> = bars.keys().cloned().collect();
                println!("Fetched data for {:?}.", symbols.join(","));
                uploader.send_bars(bars).await;
            }
        };
        tokio::time::sleep(al_timeout).await;
    }

    println!("DONE");
    let mut stream = pin!(yf::stream_prices(yf_requests, yf_config));
    while let Some(page) = stream.next().await {
        match page.data {
            Err(e) => {
                eprintln!("{e}");
                continue;
            }
            Ok(bars) => uploader.send_frame(bars).await,
        };
        tokio::time::sleep(yf_timeout).await;
    }
    uploader.finish().await?;

    if mode == Mode::Intraday {
        // Only today's (still open) candle: closed days keep the provider's
        // official daily bar written by the nightly run, also after a backfill.
        let written = uploader::rollup_intraday(&pool, now.date()).await?;
        println!("Rolled intraday bars up into {written} daily rows.");
    }

    // Depot values need no refresh here: api.latest_prices is updated by a
    // trigger on api.asset_prices, and the database's hourly job
    // (depots.refresh_depot_values) closes the previous days.

    Ok(())
}

async fn resolve_providers(
    pool: &sqlx::PgPool,
    client: &AlpacaClient,
    assets: Vec<Asset>,
    now: time::OffsetDateTime,
    alpaca_delay: Duration,
) -> anyhow::Result<()> {
    use providers::{Check, decide};

    println!("Resolving price providers for {} assets.", assets.len());
    let alpaca = providers::check_alpaca(client, &symbol_list(&assets), now, alpaca_delay).await;
    let not_on_alpaca: Vec<Asset> = assets
        .iter()
        .filter(|asset| alpaca.get(&asset.symbol) == Some(&Check::Missing))
        .cloned()
        .collect();
    println!(
        "Alpaca: {} found, {} missing; checking those on Yahoo Finance.",
        alpaca.values().filter(|c| **c == Check::Found).count(),
        not_on_alpaca.len()
    );
    let yahoo = providers::check_yahoo(not_on_alpaca, now).await;

    let mut decided = Vec::new();
    let mut counts: std::collections::BTreeMap<&str, usize> = Default::default();
    for asset in &assets {
        let missing = Check::Unknown("not checked".into());
        let result = decide(
            alpaca.get(&asset.symbol).unwrap_or(&missing),
            yahoo.get(&asset.symbol),
        );
        match result {
            Ok(provider) => {
                *counts
                    .entry(provider.map_or("none", PriceProvider::as_str))
                    .or_default() += 1;
                if provider != asset.price_provider {
                    println!(
                        "{}: {} -> {}",
                        asset.symbol,
                        asset.price_provider.map_or("none", PriceProvider::as_str),
                        provider.map_or("none", PriceProvider::as_str)
                    );
                }
                decided.push((asset.id, provider));
            }
            Err(reason) => {
                *counts.entry("unchanged (inconclusive)").or_default() += 1;
                eprintln!("{}: kept, inconclusive ({reason})", asset.symbol);
            }
        }
    }
    let changed = providers::store(pool, &decided).await?;
    println!("Result: {counts:?}; {changed} rows changed.");
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use time::macros::datetime;

    #[test]
    fn cli_definition_is_valid() {
        use clap::CommandFactory;
        Args::command().debug_assert();
    }

    #[test]
    fn window_starts_at_midnight_utc_of_previous_day() {
        let now = datetime!(2026-11-22 14:37:12 UTC);
        let latest = Some(datetime!(2026-11-22 14:30 UTC));
        assert_eq!(
            intraday_window(now, latest, 30),
            (datetime!(2026-11-21 00:00 UTC), now)
        );
    }

    #[test]
    fn window_normalises_offset_to_utc() {
        // 00:30 in Berlin is still the previous day in UTC.
        let now = datetime!(2026-11-22 00:30 +1);
        let (start, end) = intraday_window(now, Some(now), 30);
        assert_eq!(start, datetime!(2026-11-20 00:00 UTC));
        assert_eq!(end, now);
    }

    #[test]
    fn window_crosses_month_boundary() {
        let now = datetime!(2026-12-01 07:00 UTC);
        let (start, _) = intraday_window(now, Some(now), 30);
        assert_eq!(start, datetime!(2026-11-30 00:00 UTC));
    }

    #[test]
    fn empty_database_backfills_the_full_range() {
        let now = datetime!(2026-11-22 09:00 UTC);
        let (start, _) = intraday_window(now, None, 30);
        assert_eq!(start, datetime!(2026-10-23 00:00 UTC));
    }

    #[test]
    fn gap_is_refetched_from_the_newest_bars_day() {
        // updater was down since Tuesday afternoon
        let now = datetime!(2026-11-22 09:00 UTC);
        let latest = Some(datetime!(2026-11-17 15:45 UTC));
        let (start, _) = intraday_window(now, latest, 30);
        assert_eq!(start, datetime!(2026-11-17 00:00 UTC));
    }

    #[test]
    fn long_gap_is_capped_at_the_backfill_range() {
        let now = datetime!(2026-11-22 09:00 UTC);
        let latest = Some(datetime!(2026-08-01 15:45 UTC));
        let (start, _) = intraday_window(now, latest, 30);
        assert_eq!(start, datetime!(2026-10-23 00:00 UTC));
    }
}
