-- =============================================================================
-- tests/depot_values_perf.sql — timing smoke test for depot valuation
-- -----------------------------------------------------------------------------
-- THROWAWAY DATABASES ONLY: inserts ~500 depots / ~20k transactions / ~29k
-- prices and does not clean up. Works against both the old matview pipeline
-- and the ledger pipeline (detects which one is installed), so the same data
-- can be timed on both:
--
--     psql -d postgres -f dbinit/tests/depot_values_perf.sql
-- =============================================================================

\set ON_ERROR_STOP on
\pset footer off
SELECT setseed(0.42);
SELECT to_regclass('depots.holdings') IS NOT NULL AS is_new \gset
\if :is_new
  \echo '### pipeline: ledger (holdings + daily_values)'
\else
  \echo '### pipeline: matviews'
\endif

-- Fixture -----------------------------------------------------------------------
INSERT INTO api.asset_prices (asset_id, tstamp, open, close)
SELECT a, d::date, 0, 50 + 20 * sin(a + (CURRENT_DATE - d::date) / 15.0)
FROM generate_series(1, 80) a,
     generate_series(CURRENT_DATE - 400, CURRENT_DATE - 1, '1 day') d
WHERE extract(isodow FROM d) < 6
ON CONFLICT DO NOTHING;

INSERT INTO depots.depots (id, created, cash, cash_start, users) OVERRIDING SYSTEM VALUE
SELECT 100000 + i, now() - interval '1 year', 50000, 50000, ARRAY[gen_random_uuid()]
FROM generate_series(1, 500) i;

\echo '--- bulk insert 20k backdated transactions (one statement)'
\timing on
INSERT INTO depots.transactions (depot_id, asset_id, amount, price, commission, type, tstamp)
SELECT 100000 + (i % 500) + 1, 1 + (random() * 79)::int, 1 + (random() * 20)::int, 50, 1, 'user',
       now() - (random() * 360 || ' days')::interval
FROM generate_series(1, 20000) i;
\timing off

\if :is_new
  \echo '--- hourly job (re-value last 7 days of every depot)'
  \timing on
  CALL depots.refresh_depot_values(0, '{"days": 7}');
  \timing off
  \echo '--- full rebuild of all history (repair / migration)'
  \timing on
  SELECT depots.rebuild_depot_values();
  \timing off
\else
  \echo '--- nightly matview refresh (both)'
  \timing on
  REFRESH MATERIALIZED VIEW depots.aggregated_transactions_mat;
  REFRESH MATERIALIZED VIEW depots.position_values_mat;
  \timing off
\endif
ANALYZE;

-- One trade now, then what the dashboard / leaderboard read ---------------------
\echo '--- trade now (insert dated today)'
\timing on
INSERT INTO depots.transactions (depot_id, asset_id, amount, price, commission, type)
VALUES (100001, 3, 5, 50, 1, 'user');
\timing off
\echo '--- backdated trade (30 days ago)'
\timing on
INSERT INTO depots.transactions (depot_id, asset_id, amount, price, commission, type, tstamp)
VALUES (100002, 3, 5, 50, 1, 'user', now() - interval '30 days');
\timing off

\if :is_new
  \echo '--- dashboard: aggregated_values (owner)'
  \timing on
  SELECT total, diff_1d FROM depots.aggregated_values WHERE depot_id = 100001;
  SELECT total, diff_1d FROM depots.aggregated_values WHERE depot_id = 100001;
  \timing off
  \echo '--- dashboard: 30 days of values (owner)'
  \timing on
  SELECT count(*) FROM depots.values WHERE depot_id = 100001 AND tstamp >= CURRENT_DATE - 30;
  SELECT count(*) FROM depots.values WHERE depot_id = 100001 AND tstamp >= CURRENT_DATE - 30;
  \timing off
\else
  SET request.jwt.claims = '{"sub":"00000000-0000-0000-0000-000000000000"}';
  UPDATE depots.depots SET users = '{00000000-0000-0000-0000-000000000000}' WHERE id = 100001;
  \echo '--- dashboard: aggregated_values_with_curr (owner)'
  \timing on
  SELECT total, diff_1d FROM depots.aggregated_values_with_curr WHERE depot_id = 100001;
  SELECT total, diff_1d FROM depots.aggregated_values_with_curr WHERE depot_id = 100001;
  \timing off
  \echo '--- dashboard: 30 days of depot_values_with_curr (owner)'
  \timing on
  SELECT count(*) FROM depots.depot_values_with_curr WHERE depot_id = 100001 AND tstamp >= CURRENT_DATE - 30;
  SELECT count(*) FROM depots.depot_values_with_curr WHERE depot_id = 100001 AND tstamp >= CURRENT_DATE - 30;
  \timing off
\endif

\echo '--- leaderboard (all depots)'
\timing on
SELECT count(*) FROM depots.leaderboard;
SELECT count(*) FROM depots.leaderboard;
\timing off

\echo '--- freshness: does the trade from above show up in today''s value?'
SELECT value, cash FROM depots.values WHERE depot_id = 100001 ORDER BY tstamp DESC LIMIT 1;
\if :is_new
\else
SELECT value, cash FROM depots.depot_values_with_curr WHERE depot_id = 100001 ORDER BY tstamp DESC LIMIT 1;
\endif

\echo '--- storage'
SELECT relname, pg_size_pretty(pg_total_relation_size(c.oid)) AS size, reltuples::bigint AS rows
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'depots'
  AND relname IN ('holdings', 'daily_values', 'aggregated_transactions_mat', 'position_values_mat')
ORDER BY relname;
