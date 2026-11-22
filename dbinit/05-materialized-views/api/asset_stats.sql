-- =============================================================================
-- api.asset_stats (materialized view)
-- Depends on: api.assets, api.asset_prices, api.latest_prices
-- -----------------------------------------------------------------------------
-- Per asset, for search and lists (api.find_assets): the current price, a
-- sparkline (daily closes of the last 3 months) and returns, so a search over
-- all assets need not scan the price history. Refreshed hourly by the job
-- in 12-jobs/refresh_asset_stats.sql (api.refresh_asset_stats).
-- Returns are fractions; NULL when the history does not reach back far
-- enough (reference close within 10 days before the anniversary).
-- Public data, read by anon/authenticated (materialized views have no RLS).
-- =============================================================================

CREATE MATERIALIZED VIEW api.asset_stats AS
SELECT
  a.id AS asset_id,
  lp.close::double precision AS last_close,
  lp.tstamp AS last_tstamp,
  spark.closes AS sparkline,
  lp.close::double precision / NULLIF(spark.closes[1], 0) - 1 AS return_3m,
  lp.close::double precision / NULLIF(y1.close, 0) - 1 AS return_1y,
  power(lp.close::double precision / NULLIF(y5.close, 0), 1.0 / 5) - 1 AS cagr_5y
FROM api.assets a
LEFT JOIN api.latest_prices lp ON lp.asset_id = a.id
LEFT JOIN LATERAL (
  SELECT array_agg(round(p.close::numeric, 4)::double precision ORDER BY p.tstamp) AS closes
  FROM api.asset_prices p
  WHERE p.asset_id = a.id AND p.close > 0
    AND p.tstamp >= current_date - 91
) spark ON true
LEFT JOIN LATERAL (
  SELECT p.close::double precision AS close
  FROM api.asset_prices p
  WHERE p.asset_id = a.id AND p.close > 0
    AND p.tstamp <= current_date - interval '1 year'
    AND p.tstamp >= current_date - interval '1 year 10 days'
  ORDER BY p.tstamp DESC
  LIMIT 1
) y1 ON true
LEFT JOIN LATERAL (
  SELECT p.close::double precision AS close
  FROM api.asset_prices p
  WHERE p.asset_id = a.id AND p.close > 0
    AND p.tstamp <= current_date - interval '5 years'
    AND p.tstamp >= current_date - interval '5 years 10 days'
  ORDER BY p.tstamp DESC
  LIMIT 1
) y5 ON true;

-- REFRESH ... CONCURRENTLY needs a unique index
CREATE UNIQUE INDEX asset_stats_asset_id_idx ON api.asset_stats (asset_id);
