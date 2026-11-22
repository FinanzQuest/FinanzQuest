use crate::{alpaca, priceframe::PriceFrame};
use sqlx::PgPool;
use std::collections::HashMap;
use tokio::sync::mpsc;

// Message types for the channel
pub enum UploaderMsg {
    Bars(HashMap<String, Vec<alpaca::Bar>>),
    Frame(PriceFrame),
    Flush,
}

/// Table the uploader writes into.
#[derive(Copy, Clone, Debug, PartialEq, Eq)]
pub enum Target {
    /// `api.asset_prices` (daily candles, `tstamp date`)
    Daily,
    /// `api.asset_prices_intraday` (bars keyed by start time, `tstamp timestamptz`)
    Intraday,
}

pub struct Uploader {
    tx: mpsc::Sender<UploaderMsg>,
    handle: tokio::task::JoinHandle<Result<(), sqlx::Error>>,
}

// Flat row ready for UNNEST insert

impl Uploader {
    pub async fn new(pool: PgPool, batch_size: usize, target: Target) -> Result<Self, sqlx::Error> {
        let (tx, rx) = mpsc::channel::<UploaderMsg>(64);

        let handle = tokio::spawn(upload_task(pool, rx, batch_size, target));

        Ok(Self { tx, handle })
    }

    pub async fn send_bars(&self, bars: HashMap<String, Vec<alpaca::Bar>>) {
        if let Err(e) = self.tx.send(UploaderMsg::Bars(bars)).await {
            eprintln!("Uploader channel closed: {e}");
        }
    }
    pub async fn send_frame(&self, frame: PriceFrame) {
        if let Err(e) = self.tx.send(UploaderMsg::Frame(frame)).await {
            eprintln!("Uploader channel closed: {e}");
        }
    }

    /// Flush remaining rows and wait for the task to finish
    pub async fn finish(self) -> anyhow::Result<()> {
        let _ = self.tx.send(UploaderMsg::Flush).await;
        drop(self.tx); // close channel so task exits loop
        Ok(self.handle.await??)
    }
}

pub fn is_symbol_yfinance(symbol: impl AsRef<str>) -> bool {
    symbol.as_ref().contains(&['.', '-'])
}

#[derive(Clone)]
pub struct Asset {
    pub symbol: String,
    pub id: i64,
    pub last_updated: Option<time::Date>,
    pub asset_type: String,
}

impl Asset {
    pub fn is_yfinance(&self) -> bool {
        is_symbol_yfinance(&self.symbol) || self.asset_type == "fund"
    }
}

pub async fn fetch_assets(pool: &PgPool) -> Result<Vec<Asset>, sqlx::Error> {
    sqlx::query_as!(
        Asset,
        r#"SELECT id, symbol, last_updated, asset_type::TEXT as "asset_type!" FROM api.assets;"#
    )
    .fetch_all(pool)
    .await
}

/// Rolls the intraday bars of every UTC day >= `from` up into daily candles
/// in api.asset_prices. Returns the number of daily rows written.
pub async fn rollup_intraday(pool: &PgPool, from: time::Date) -> Result<i32, sqlx::Error> {
    let written = sqlx::query_scalar!(r#"SELECT api.rollup_intraday($1::date) AS "written!""#, from)
        .fetch_one(pool)
        .await?;
    Ok(written)
}

pub fn symbol_list(assets: &[Asset]) -> Vec<String> {
    assets.iter().map(|asset| asset.symbol.clone()).collect()
}

async fn upload_task(
    pool: PgPool,
    mut rx: mpsc::Receiver<UploaderMsg>,
    batch_size: usize,
    target: Target,
) -> Result<(), sqlx::Error> {
    let mut batch = PriceFrame::with_capacity(batch_size);

    while let Some(msg) = rx.recv().await {
        match msg {
            UploaderMsg::Bars(pages) => {
                let mut frame = PriceFrame::from(pages);
                batch.extend(&mut frame);
            }
            UploaderMsg::Frame(mut frame) => {
                batch.extend(&mut frame);
            }
            UploaderMsg::Flush => {
                if !batch.is_empty() {
                    insert_batch(&pool, &batch, target).await?;
                    batch.clear();
                }
                continue; // ensure we do not drain double - theoretically uneccessary
            }
        }

        if batch.length >= batch_size {
            insert_batch(&pool, &batch, target).await?;
            batch.clear();
        }
    }

    // drain any remainder when channel closes
    if !batch.is_empty() {
        insert_batch(&pool, &batch, target).await?;
    }

    Ok(())
}

async fn insert_batch(
    pool: &PgPool,
    PriceFrame {
        symbol,
        open,
        close,
        high,
        low,
        volume,
        tstamp,
        length,
    }: &PriceFrame,
    target: Target,
) -> Result<(), sqlx::Error> {
    let tstamp = tstamp as &[time::OffsetDateTime];
    match target {
        Target::Daily => sqlx::query!(
            r#"
        INSERT INTO api.asset_prices (asset_id, tstamp, open, high, low, close, volume)
        SELECT a.id, d.tstamp, d.open, d.high, d.low, d.close, d.volume
        FROM UNNEST(
            $1::text[],
            $2::timestamptz[],
            $3::float8[],
            $4::float8[],
            $5::float8[],
            $6::float8[],
            $7::bigint[]
        ) AS d(symbol, tstamp, open, high, low, close, volume)
        JOIN api.assets a ON a.symbol = d.symbol
        ON CONFLICT (asset_id, tstamp) DO UPDATE SET
            open        = EXCLUDED.open,
            high        = EXCLUDED.high,
            low         = EXCLUDED.low,
            close       = EXCLUDED.close,
            volume      = EXCLUDED.volume;
            "#,
            symbol,
            tstamp,
            open,
            high,
            low,
            close,
            volume,
        )
        .execute(pool)
        .await?,
        Target::Intraday => sqlx::query!(
            r#"
        INSERT INTO api.asset_prices_intraday (asset_id, tstamp, open, high, low, close, volume)
        SELECT a.id, d.tstamp, d.open, d.high, d.low, d.close, d.volume
        FROM UNNEST(
            $1::text[],
            $2::timestamptz[],
            $3::float8[],
            $4::float8[],
            $5::float8[],
            $6::float8[],
            $7::bigint[]
        ) AS d(symbol, tstamp, open, high, low, close, volume)
        JOIN api.assets a ON a.symbol = d.symbol
        ON CONFLICT (asset_id, tstamp) DO UPDATE SET
            open        = EXCLUDED.open,
            high        = EXCLUDED.high,
            low         = EXCLUDED.low,
            close       = EXCLUDED.close,
            volume      = EXCLUDED.volume;
            "#,
            symbol,
            tstamp,
            open,
            high,
            low,
            close,
            volume,
        )
        .execute(pool)
        .await?,
    };

    println!("Inserted {length} {} rows ({target:?})", close.len());
    Ok(())
}
