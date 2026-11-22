-- =============================================================================
-- api.asset_performance(p_asset_id bigint)
-- Depends on: api.asset_prices (03-tables/api/asset_prices.sql)
-- -----------------------------------------------------------------------------
-- Performance figures of one asset from its daily closes (no outside data),
-- all as fractions (0.07 = 7 %), relative to the newest daily close (as_of):
--   return_1y          change over the last year
--   cagr_3y / cagr_5y  average yearly return (compound annual growth rate)
--   high_52w / low_52w highest / lowest price in the last 52 weeks
--   volatility_1y      annualised standard deviation of daily log returns
--   max_drawdown_5y    largest fall from a previous high in the last 5 years
--                      (negative, e.g. -0.34)
-- Assets without a close in the last year return no row.
-- A return is NULL when the history does not reach back far enough (the
-- reference close must lie within 10 days before the anniversary).
-- SQL, STABLE, SECURITY INVOKER: reads only the public price table.
-- =============================================================================

CREATE OR REPLACE FUNCTION api.asset_performance(p_asset_id bigint)
RETURNS TABLE (
  as_of           date,
  return_1y       double precision,
  cagr_3y         double precision,
  cagr_5y         double precision,
  high_52w        double precision,
  low_52w         double precision,
  volatility_1y   double precision,
  max_drawdown_5y double precision
)
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  -- one scan of the price table (it has weekly chunks: every extra scan
  -- costs a few hundred chunk lookups); everything below works on p
  WITH p AS (
    SELECT ap.tstamp, ap.close::double precision AS close,
           coalesce(ap.high, ap.close)::double precision AS high,
           coalesce(ap.low, ap.close)::double precision AS low
    FROM api.asset_prices ap
    WHERE ap.asset_id = p_asset_id
      AND ap.close > 0
      -- constant bound: lets TimescaleDB skip older chunks
      AND ap.tstamp >= (now() - interval '5 years 1 month')::date
  ),
  latest AS (
    SELECT max(p.tstamp) AS tstamp FROM p
    HAVING max(p.tstamp) >= (now() - interval '1 year')::date
  ),
  last_close AS (
    SELECT p.close FROM p, latest l WHERE p.tstamp = l.tstamp
  ),
  -- close on (or up to 10 days before) the anniversary n years back
  ref AS (
    SELECT y.years,
           (SELECT p.close FROM p
            WHERE p.tstamp <= l.tstamp - make_interval(years => y.years)
              AND p.tstamp >= l.tstamp - make_interval(years => y.years) - interval '10 days'
            ORDER BY p.tstamp DESC
            LIMIT 1) AS close
    FROM (VALUES (1), (3), (5)) AS y(years), latest l
  ),
  year AS (
    SELECT max(p.high) AS high, min(p.low) AS low,
           stddev_samp(p.log_return) * sqrt(252) AS volatility
    FROM (
      SELECT p.tstamp, p.high, p.low,
             ln(p.close / lag(p.close) OVER (ORDER BY p.tstamp)) AS log_return
      FROM p
    ) p, latest l
    WHERE p.tstamp > l.tstamp - interval '1 year'
  ),
  drawdown AS (
    SELECT min(d.close / d.running_high - 1) AS max_drawdown
    FROM (
      SELECT p.close, max(p.close) OVER (ORDER BY p.tstamp) AS running_high
      FROM p, latest l
      WHERE p.tstamp >= l.tstamp - interval '5 years'
    ) d
  )
  SELECT
    l.tstamp,
    (SELECT lc.close / r.close - 1 FROM ref r, last_close lc WHERE r.years = 1),
    (SELECT power(lc.close / r.close, 1.0 / 3) - 1 FROM ref r, last_close lc WHERE r.years = 3),
    (SELECT power(lc.close / r.close, 1.0 / 5) - 1 FROM ref r, last_close lc WHERE r.years = 5),
    year.high, year.low, year.volatility,
    (SELECT max_drawdown FROM drawdown)
  FROM latest l, year;
$$;
