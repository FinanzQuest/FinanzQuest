-- =============================================================================
-- api.on_asset_prices_change()  — row-level trigger function
-- Depends on: api.latest_prices (03-tables/api/latest_prices.sql)
-- Trigger: 07-triggers/api/asset_prices_latest.sql
-- -----------------------------------------------------------------------------
-- Moves api.latest_prices forward when a newer (or same-day corrected) close
-- arrives. Row-level because TimescaleDB hypertables do not support transition
-- tables. Rows without a close are ignored (they carry no price).
-- SECURITY DEFINER: the ingestion role only needs rights on asset_prices.
-- =============================================================================

CREATE OR REPLACE FUNCTION api.on_asset_prices_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.close IS NOT NULL THEN
    INSERT INTO api.latest_prices AS l (asset_id, tstamp, close)
    VALUES (NEW.asset_id, NEW.tstamp, NEW.close)
    ON CONFLICT (asset_id) DO UPDATE
      SET tstamp = EXCLUDED.tstamp, close = EXCLUDED.close
      WHERE EXCLUDED.tstamp >= l.tstamp
        AND (EXCLUDED.tstamp, EXCLUDED.close) IS DISTINCT FROM (l.tstamp, l.close);
  END IF;
  RETURN NULL;
END;
$$;
