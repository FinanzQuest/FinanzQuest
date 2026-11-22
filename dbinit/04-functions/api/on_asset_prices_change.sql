-- =============================================================================
-- api.on_asset_prices_change()  — row-level trigger function
-- Depends on: api.latest_prices, api.daily_price_as_of
-- Triggers: 07-triggers/api/asset_prices_latest.sql (daily and intraday;
--           argument 'daily' or 'intraday')
-- -----------------------------------------------------------------------------
-- Moves api.latest_prices forward when a newer (or corrected) price arrives
-- in api.asset_prices (daily: as of the end of its day, capped at now()) or
-- api.asset_prices_intraday (as of the bar time). Row-level because
-- TimescaleDB hypertables do not support transition tables. Rows without a
-- close are ignored. SECURITY DEFINER: the ingestion role only needs rights
-- on the price tables.
-- =============================================================================

CREATE OR REPLACE FUNCTION api.on_asset_prices_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_as_of timestamptz;
BEGIN
  IF NEW.close IS NULL THEN
    RETURN NULL;
  END IF;

  -- TG_ARGV[0] says which table fired: TimescaleDB runs row triggers on the
  -- chunk, so TG_TABLE_NAME is '_hyper_..._chunk', not the hypertable.
  IF TG_ARGV[0] = 'daily' THEN
    v_as_of := api.daily_price_as_of(NEW.tstamp::date);
  ELSE
    v_as_of := NEW.tstamp;
  END IF;

  INSERT INTO api.latest_prices AS l (asset_id, tstamp, close)
  VALUES (NEW.asset_id, v_as_of, NEW.close)
  ON CONFLICT (asset_id) DO UPDATE
    SET tstamp = EXCLUDED.tstamp, close = EXCLUDED.close
    WHERE EXCLUDED.tstamp >= l.tstamp
      AND (EXCLUDED.tstamp, EXCLUDED.close) IS DISTINCT FROM (l.tstamp, l.close);
  RETURN NULL;
END;
$$;
