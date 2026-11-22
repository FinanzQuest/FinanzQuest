-- =============================================================================
-- api.asset_prices_intraday
-- Depends on: api.assets (FK)
-- -----------------------------------------------------------------------------
-- 15-minute bars from the updater's intraday run (Alpaca 15Min / Yahoo 15m).
-- tstamp is the bar's start time. Hypertable with 1-day chunks; a retention
-- policy (12-jobs/asset_prices_intraday_retention.sql) drops chunks older
-- than 30 days — long-term history lives in the daily api.asset_prices.
-- Owned by the ingestion service like api.asset_prices; clients only read.
-- =============================================================================

CREATE TABLE IF NOT EXISTS api.asset_prices_intraday (
  asset_id bigint      NOT NULL,
  tstamp   timestamptz NOT NULL,
  open     numeric,
  high     numeric,
  low      numeric,
  close    numeric,
  volume   bigint,
  CONSTRAINT asset_prices_intraday_pkey PRIMARY KEY (asset_id, tstamp),
  CONSTRAINT asset_prices_intraday_asset_fkey FOREIGN KEY (asset_id) REFERENCES api.assets (id)
);

SELECT create_hypertable(
  'api.asset_prices_intraday',
  'tstamp',
  chunk_time_interval => INTERVAL '1 day',
  if_not_exists       => true
);

CREATE INDEX IF NOT EXISTS idx_asset_prices_intraday_asset_tstamp
  ON api.asset_prices_intraday (asset_id, tstamp DESC);
