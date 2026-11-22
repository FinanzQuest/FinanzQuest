-- =============================================================================
-- api.asset_moving_averages(p_asset_id bigint, p_since date)
-- Depends on: api.asset_prices (03-tables/api/asset_prices.sql)
-- -----------------------------------------------------------------------------
-- 100- and 200-day moving averages (simple average of the last 100 / 200
-- daily closes, i.e. trading days) for each daily close since p_since. The
-- windows reach back before p_since, so the first days already have their
-- full history. NULL while fewer closes exist. For the chart overlays.
-- p_since is clamped to 10 years back. SQL, STABLE, SECURITY INVOKER.
-- =============================================================================

CREATE OR REPLACE FUNCTION api.asset_moving_averages(p_asset_id bigint, p_since date)
RETURNS TABLE (tstamp date, ma100 double precision, ma200 double precision)
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  WITH since AS (
    SELECT greatest(p_since, (now() - interval '10 years')::date) AS d
  )
  SELECT w.tstamp,
         CASE WHEN w.n >= 100 THEN w.ma100 END,
         CASE WHEN w.n >= 200 THEN w.ma200 END
  FROM (
    SELECT p.tstamp,
           avg(p.close::double precision) OVER (ORDER BY p.tstamp ROWS 99 PRECEDING)  AS ma100,
           avg(p.close::double precision) OVER (ORDER BY p.tstamp ROWS 199 PRECEDING) AS ma200,
           count(*) OVER (ORDER BY p.tstamp ROWS 199 PRECEDING) AS n
    FROM api.asset_prices p, since s
    WHERE p.asset_id = p_asset_id
      AND p.close > 0
      -- 200 trading days are about 290 calendar days
      AND p.tstamp >= s.d - 300
  ) w, since s
  WHERE w.tstamp >= s.d
  ORDER BY w.tstamp;
$$;
