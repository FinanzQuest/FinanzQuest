-- =============================================================================
-- api.rollup_intraday(p_from date)
-- Depends on: api.asset_prices_intraday, api.asset_prices
-- -----------------------------------------------------------------------------
-- Writes the daily candle of every (asset, UTC day >= p_from) that has
-- intraday bars into api.asset_prices: first open, max high, min low, last
-- close, summed volume. Called by the updater after each intraday upload so
-- the daily chart and day-over-day changes include today. The nightly daily
-- run later replaces the row with the provider's adjusted daily bar.
-- Returns the number of daily rows written.
-- =============================================================================

CREATE OR REPLACE FUNCTION api.rollup_intraday(p_from date)
RETURNS integer
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_count integer;
BEGIN
  INSERT INTO api.asset_prices AS p (asset_id, tstamp, open, high, low, close, volume)
  SELECT i.asset_id,
         (i.tstamp AT TIME ZONE 'UTC')::date,
         (array_agg(i.open  ORDER BY i.tstamp ASC)  FILTER (WHERE i.open  IS NOT NULL))[1],
         max(i.high),
         min(i.low),
         (array_agg(i.close ORDER BY i.tstamp DESC) FILTER (WHERE i.close IS NOT NULL))[1],
         sum(i.volume)
  FROM api.asset_prices_intraday i
  WHERE i.tstamp >= (p_from::timestamp AT TIME ZONE 'UTC')
  GROUP BY i.asset_id, (i.tstamp AT TIME ZONE 'UTC')::date
  ON CONFLICT (asset_id, tstamp) DO UPDATE SET
    open   = EXCLUDED.open,
    high   = EXCLUDED.high,
    low    = EXCLUDED.low,
    close  = EXCLUDED.close,
    volume = EXCLUDED.volume
  WHERE (p.open, p.high, p.low, p.close, p.volume)
        IS DISTINCT FROM (EXCLUDED.open, EXCLUDED.high, EXCLUDED.low, EXCLUDED.close, EXCLUDED.volume);

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;
