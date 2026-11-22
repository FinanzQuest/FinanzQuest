-- =============================================================================
-- api.latest_prices
-- Depends on: api.assets (FK)
-- -----------------------------------------------------------------------------
-- The newest known price per asset, one row per asset, fed by row triggers
-- on api.asset_prices (daily) and api.asset_prices_intraday (15-minute bars)
-- — see api.on_asset_prices_change. Live valuations, trades and the
-- leaderboard do an O(1) lookup here instead of searching the hypertables.
--
-- tstamp is the time the price is valid as of: a bar's start time, or for a
-- daily close the end of its day capped at now(). So the official close of
-- day D outranks D's intraday bars, and the next day's bars outrank it.
-- Repair: api.rebuild_latest_prices().
-- =============================================================================

CREATE TABLE IF NOT EXISTS api.latest_prices (
  asset_id bigint      NOT NULL,
  tstamp   timestamptz NOT NULL,
  close    numeric     NOT NULL,
  CONSTRAINT latest_prices_pkey PRIMARY KEY (asset_id),
  CONSTRAINT latest_prices_asset_fkey FOREIGN KEY (asset_id) REFERENCES api.assets (id)
);
