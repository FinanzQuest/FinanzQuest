-- =============================================================================
-- tests/search.sql — api.find_assets, api.asset_facets, api.asset_stats,
-- api.asset_moving_averages
-- -----------------------------------------------------------------------------
-- One transaction, ROLLS BACK. Needs the seeded assets and funds; uses
-- assets 1 and 2 for synthetic prices.
--
--     psql -d postgres -f dbinit/tests/search.sql
-- =============================================================================

\set ON_ERROR_STOP on
\set QUIET on
\o /dev/null
BEGIN;

CREATE FUNCTION pg_temp.check(ok boolean, label text) RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  IF ok IS NOT TRUE THEN RAISE EXCEPTION 'FAIL: %', label; END IF;
  RAISE NOTICE 'PASS: %', label;
END $$;

DELETE FROM api.asset_prices_intraday WHERE asset_id IN (1, 2);
DELETE FROM api.asset_prices WHERE asset_id IN (1, 2);

-- asset 1: 1, 2, 3, ... per trading day (weekdays) for 300 days; asset 2 flat 50
INSERT INTO api.asset_prices (asset_id, tstamp, open, close)
SELECT 1, d, n, n FROM (
  SELECT d::date, row_number() OVER (ORDER BY d) AS n
  FROM generate_series(CURRENT_DATE - 420, CURRENT_DATE - 1, interval '1 day') d
  WHERE extract(isodow FROM d) < 6
) s;
INSERT INTO api.asset_prices (asset_id, tstamp, open, close)
SELECT 2, d::date, 50, 50 FROM generate_series(CURRENT_DATE - 420, CURRENT_DATE - 1, interval '1 day') d;
SELECT api.rebuild_latest_prices();

-- moving averages: over 1..n the 100-day average of day n is n - 49.5
CREATE TEMP TABLE ma AS SELECT * FROM api.asset_moving_averages(1, CURRENT_DATE - 400);
SELECT pg_temp.check((SELECT count(*) FROM ma WHERE ma100 IS NOT NULL AND ma200 IS NULL) = 100, 'ma200 NULL until 200 closes');
SELECT pg_temp.check(
  (SELECT bool_and(abs(ma100 - (p.close - 49.5)) < 1e-6) FROM ma JOIN api.asset_prices p ON p.asset_id = 1 AND p.tstamp = ma.tstamp WHERE ma100 IS NOT NULL),
  'ma100 = average of the last 100 closes');
SELECT pg_temp.check(
  (SELECT bool_and(abs(ma200 - (p.close - 99.5)) < 1e-6) FROM ma JOIN api.asset_prices p ON p.asset_id = 1 AND p.tstamp = ma.tstamp WHERE ma200 IS NOT NULL),
  'ma200 = average of the last 200 closes');
SELECT pg_temp.check(
  (SELECT min(tstamp) FROM api.asset_moving_averages(1, CURRENT_DATE - 30)) >= CURRENT_DATE - 30
  AND (SELECT ma200 FROM api.asset_moving_averages(1, CURRENT_DATE - 30) ORDER BY tstamp LIMIT 1) IS NOT NULL,
  'windows reach back before p_since');

-- stats and search
REFRESH MATERIALIZED VIEW api.asset_stats;
SELECT pg_temp.check(
  (SELECT abs(return_1y) < 1e-9 AND abs(return_3m) < 1e-9 AND cagr_5y IS NULL AND cardinality(sparkline) > 50
   FROM api.asset_stats WHERE asset_id = 2),
  'stats: flat asset has 0 % returns, no 5-year figure, a sparkline');
SELECT pg_temp.check(
  (SELECT return_1y > 0 AND sparkline[cardinality(sparkline)] > sparkline[1] FROM api.asset_stats WHERE asset_id = 1),
  'stats: rising asset');

SELECT pg_temp.check(
  (SELECT symbol FROM api.find_assets('EUNL.DE') LIMIT 1) = 'EUNL.DE', 'exact symbol ranks first');
SELECT pg_temp.check(
  (SELECT bool_and(asset_type = 'fund' AND issuer = 'iShares' AND distribution = 'accumulating')
   FROM api.find_assets(NULL, '{fund}', NULL, NULL, '{iShares}', NULL, 'accumulating')),
  'filters: type, issuer, distribution');
SELECT pg_temp.check(
  (SELECT bool_and(index_name = 'MSCI World') AND count(*) >= 4 FROM api.find_assets(NULL, NULL, NULL, NULL, NULL, '{MSCI World}')),
  'filter: index');
SELECT pg_temp.check(
  (SELECT array_agg(ter ORDER BY rn) = array_agg(ter ORDER BY ter, rn)
   FROM (SELECT ter, row_number() OVER () rn FROM api.find_assets(NULL, '{fund}', p_sort => 'ter') WHERE ter IS NOT NULL) s),
  'ter sorts ascending by default');
SELECT pg_temp.check(
  (SELECT (array_agg(id))[1] = 1 FROM api.find_assets(NULL, NULL, p_sort => 'return_1y', p_limit => 200)
   WHERE return_1y IS NOT NULL) IS NOT NULL,
  'return sort runs');
SELECT pg_temp.check(
  (SELECT count(*) = 3 AND min(total_count) = max(total_count) AND min(total_count) > 3
   FROM api.find_assets(NULL, '{fund}', p_limit => 3)),
  'limit with total_count');
SELECT pg_temp.check(
  (SELECT count(*) FROM api.find_assets(NULL, '{}'::AssetType[], '{}', p_limit => 200)) = 200,
  'empty arrays do not filter');
SELECT pg_temp.check(
  (SELECT count(*) FROM api.asset_facets() WHERE facet = 'issuer') = 3, 'facets: issuers');

-- anon can search, cannot refresh
SET LOCAL ROLE anon;
SELECT pg_temp.check((SELECT count(*) FROM api.find_assets('world', p_limit => 5)) > 0, 'anon searches');
SELECT pg_temp.check((SELECT count(*) FROM api.asset_stats) > 0, 'anon reads asset_stats');
DO $$ BEGIN
  CALL api.refresh_asset_stats(0, '{}');
  RAISE EXCEPTION 'FAIL: anon refreshed asset_stats';
EXCEPTION WHEN insufficient_privilege THEN RAISE NOTICE 'PASS: anon cannot refresh asset_stats';
END $$;
RESET ROLE;

ROLLBACK;
\o
\echo 'search.sql: all checks passed'
