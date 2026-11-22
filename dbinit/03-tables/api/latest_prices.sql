-- =============================================================================
-- api.latest_prices
-- Depends on: api.assets (FK)
-- -----------------------------------------------------------------------------
-- The newest known close per asset, one row per asset. Maintained by the row
-- trigger on api.asset_prices (07-triggers/api/asset_prices_latest.sql), so
-- live valuations (depots.current_values, buy/sell, leaderboard) do an O(1)
-- lookup instead of an ORDER BY tstamp DESC LIMIT 1 over the hypertable's
-- chunks. Repair: api.rebuild_latest_prices().
-- =============================================================================

CREATE TABLE IF NOT EXISTS api.latest_prices (
  asset_id bigint  NOT NULL,
  tstamp   date    NOT NULL,
  close    numeric NOT NULL,
  CONSTRAINT latest_prices_pkey PRIMARY KEY (asset_id),
  CONSTRAINT latest_prices_asset_fkey FOREIGN KEY (asset_id) REFERENCES api.assets (id)
);
