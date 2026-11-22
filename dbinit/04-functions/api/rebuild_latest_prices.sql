-- =============================================================================
-- api.rebuild_latest_prices()
-- Depends on: api.latest_prices, api.asset_prices, api.asset_prices_intraday,
--             api.daily_price_as_of
-- -----------------------------------------------------------------------------
-- Repair / backfill: recompute api.latest_prices from both price tables with
-- the same "as of" rule as the trigger (e.g. after rows were deleted, which
-- the trigger does not track).
-- Note: today's rolled-up candle yields to that day's bars (see trigger).
-- =============================================================================

CREATE OR REPLACE FUNCTION api.rebuild_latest_prices()
RETURNS void
LANGUAGE sql
AS $$
  DELETE FROM api.latest_prices;
  INSERT INTO api.latest_prices (asset_id, tstamp, close)
  SELECT DISTINCT ON (c.asset_id) c.asset_id, c.as_of, c.close
  FROM (
    (SELECT DISTINCT ON (p.asset_id)
            p.asset_id, api.daily_price_as_of(p.tstamp) AS as_of, p.close::numeric AS close
     FROM api.asset_prices p
     WHERE p.close IS NOT NULL
       -- today's rolled-up candle only counts without bars that day (the
       -- trigger keeps the bar's time when the candle repeats its close)
       AND NOT (p.tstamp >= (now() AT TIME ZONE 'UTC')::date
                AND EXISTS (SELECT 1 FROM api.asset_prices_intraday i
                            WHERE i.asset_id = p.asset_id
                              AND i.tstamp >= (p.tstamp::timestamp AT TIME ZONE 'UTC')))
     ORDER BY p.asset_id, p.tstamp DESC)
    UNION ALL
    (SELECT DISTINCT ON (i.asset_id) i.asset_id, i.tstamp, i.close
     FROM api.asset_prices_intraday i
     WHERE i.close IS NOT NULL
     ORDER BY i.asset_id, i.tstamp DESC)
  ) c
  ORDER BY c.asset_id, c.as_of DESC;
$$;
