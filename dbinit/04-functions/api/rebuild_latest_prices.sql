-- =============================================================================
-- api.rebuild_latest_prices()
-- Depends on: api.latest_prices, api.asset_prices
-- -----------------------------------------------------------------------------
-- Repair / backfill: recompute api.latest_prices from api.asset_prices
-- (e.g. after rows were deleted, which the trigger does not track).
-- =============================================================================

CREATE OR REPLACE FUNCTION api.rebuild_latest_prices()
RETURNS void
LANGUAGE sql
AS $$
  DELETE FROM api.latest_prices;
  INSERT INTO api.latest_prices (asset_id, tstamp, close)
  SELECT DISTINCT ON (asset_id) asset_id, tstamp, close::numeric
  FROM api.asset_prices
  WHERE close IS NOT NULL
  ORDER BY asset_id, tstamp DESC;
$$;
