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
-- on the price tables. Prices are compared at float noise tolerance (see below).
-- =============================================================================

CREATE OR REPLACE FUNCTION api.on_asset_prices_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_as_of        timestamptz;
  v_partial_day  boolean := false;
BEGIN
  IF NEW.close IS NULL THEN
    RETURN NULL;
  END IF;

  -- TG_ARGV[0] says which table fired: TimescaleDB runs row triggers on the
  -- chunk, so TG_TABLE_NAME is '_hyper_..._chunk', not the hypertable.
  IF TG_ARGV[0] = 'daily' THEN
    v_as_of := api.daily_price_as_of(NEW.tstamp::date);
    -- today's candle (api.rollup_intraday) repeats the newest bar: only take
    -- it if the price differs, so the quote keeps the bar's time
    v_partial_day := NEW.tstamp::date >= (now() AT TIME ZONE 'UTC')::date;
  ELSE
    v_as_of := NEW.tstamp;
  END IF;

  INSERT INTO api.latest_prices AS l (asset_id, tstamp, close)
  VALUES (NEW.asset_id, v_as_of, NEW.close)
  ON CONFLICT (asset_id) DO UPDATE
    SET tstamp = EXCLUDED.tstamp, close = EXCLUDED.close
    WHERE EXCLUDED.tstamp >= l.tstamp
      -- a price counts as new only beyond float noise: the float4 close is
      -- stored in the numeric column with 6 digits (66.0792 for 66.07921) and
      -- the updater stores bars with the noise of an f32 (4.572 vs
      -- 4.57200002670288); neither is a price change
      AND (abs(EXCLUDED.close - l.close) > abs(l.close) * 0.00001
           OR (NOT v_partial_day AND EXCLUDED.tstamp IS DISTINCT FROM l.tstamp));
  RETURN NULL;
END;
$$;
