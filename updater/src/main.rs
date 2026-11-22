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
    uploader::{Asset, Target, Uploader, symbol_list},
};
mod uploader;

#[derive(clap::ValueEnum, Copy, Clone, Debug, PartialEq, Eq)]
enum Mode {
    /// Daily candles since the last update into api.asset_prices
    Daily,
    /// Intraday bars of yesterday and today into api.asset_prices_intraday,
    /// rolled up into today's partial daily candle afterwards
    Intraday,
}

/// Intraday fetch window: from 00:00 UTC of the previous day (so a missed run
/// heals itself) until `now`.
fn intraday_window(now: time::OffsetDateTime) -> (time::OffsetDateTime, time::OffsetDateTime) {
    let now = now.to_offset(time::UtcOffset::UTC);
    let start_day = now.date().previous_day().expect("date out of range");
    (
        time::OffsetDateTime::new_utc(start_day, time::Time::MIDNIGHT),
        now,
    )
}

#[derive(clap::Parser, Debug)]
struct Args {
    #[arg(short, long)]
    db_url: String,

    #[arg(short, long, default_value_t = 1_000)]
    yf_timeout: usize,
    #[arg(short, long, default_value_t = 1_000)]
    alpaca_timeout: usize,
    #[arg(short, long)]
    alpaca_secret_key: String,
    #[arg(short, long)]
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
    } = Args::parse();

    let now = time::OffsetDateTime::now_utc();
    let window = intraday_window(now);

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
        .partition::<Vec<Asset>, _>(|asset| asset.is_yfinance());
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
        Mode::Intraday => (
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
        ),
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
        let written = uploader::rollup_intraday(&pool, window.0.date()).await?;
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
    fn window_starts_at_midnight_utc_of_previous_day() {
        let now = datetime!(2026-11-22 14:37:12 UTC);
        assert_eq!(intraday_window(now), (datetime!(2026-11-21 00:00 UTC), now));
    }

    #[test]
    fn window_normalises_offset_to_utc() {
        // 00:30 in Berlin is still the previous day in UTC.
        let now = datetime!(2026-11-22 00:30 +1);
        let (start, end) = intraday_window(now);
        assert_eq!(start, datetime!(2026-11-20 00:00 UTC));
        assert_eq!(end, now);
    }

    #[test]
    fn window_crosses_month_boundary() {
        let (start, _) = intraday_window(datetime!(2026-12-01 07:00 UTC));
        assert_eq!(start, datetime!(2026-11-30 00:00 UTC));
    }
}
