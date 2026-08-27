-- =============================================================================
-- api.asset_prices
-- Depends on: api.assets (03-tables/api/assets.sql) — FK. Must be created AFTER
--             api.assets (plain lexical file order would run this first).
-- =============================================================================

CREATE TABLE api.asset_prices (
  asset_id bigint NOT NULL,
  tstamp   date   NOT NULL,
  open     REAL,
  close    REAL,
  high     real,
  low      real,
  volume   bigint,
  CONSTRAINT AssetPrices_pkey         PRIMARY KEY (asset_id, tstamp),
  CONSTRAINT AssetPrices_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES api.assets (id)
);

SELECT create_hypertable(
  'api.asset_prices',
  'tstamp',
  if_not_exists  => true,
  migrate_data   => true
);

-- Covering index for latest-price lookups (used heavily in get_position_profits)
CREATE INDEX IF NOT EXISTS idx_asset_prices_asset_tstamp
  ON api.asset_prices (asset_id, tstamp DESC);
