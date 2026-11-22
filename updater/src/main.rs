use clap::Parser;
use std::{pin::pin, time::Duration};
use time::macros::date;
use tokio_stream::StreamExt;

mod alpaca;
mod priceframe;
use alpaca::AlpacaClient;

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

#[derive(clap::Parser, Debug)]
struct Args {
    #[arg(short, long)]
    db_url: String,

    #[arg(long, default_value_t = 1_000)]
    yf_timeout: usize,
    #[arg(long, default_value_t = 1_000)]
    alpaca_timeout: usize,
    #[arg(long)]
    alpaca_secret_key: String,
    #[arg(long)]
    alpaca_key_id: String,
    #[arg(long, default_value_t = 10_000)]
    batch_size: usize,
    #[arg(long, default_value_t = 10)]
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

    print!("Fetching assets from database: ");
    let (yf_assets, al_assets) = uploader::fetch_assets(&pool)
        .await?
        .into_iter()
        .partition::<Vec<Asset>, _>(|asset| asset.price_provider == PriceProvider::Yahoo);
    println!("DONE");

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
