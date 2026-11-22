-- =============================================================================
-- tests/asset_details.sql — api.asset_performance and the fund/detail tables
-- -----------------------------------------------------------------------------
-- Performance figures on synthetic prices (known growth, a known drop, a
-- too-short history) and who may read and write the new tables.
--
-- One transaction, ROLLS BACK. Needs seeded api.assets id 1 and the seeded
-- funds (seed/funds.sql).
--
--     psql -d postgres -f dbinit/tests/asset_details.sql
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

DELETE FROM api.asset_prices_intraday WHERE asset_id = 1;
DELETE FROM api.asset_prices WHERE asset_id = 1;

-- asset 1: grows exactly 10 % a year (continuously) for six years up to
-- yesterday, with a 50 % crash 200 days ago that recovers 100 days later
INSERT INTO api.asset_prices (asset_id, tstamp, open, close, high, low)
SELECT 1, d::date, c, c, c, c
FROM (
  SELECT d, 100 * power(1.10, extract(epoch FROM d - (CURRENT_DATE - interval '6 years')) / extract(epoch FROM interval '1 year'))
         * CASE WHEN d BETWEEN CURRENT_DATE - 200 AND CURRENT_DATE - 101 THEN 0.5 ELSE 1 END AS c
  FROM generate_series(CURRENT_DATE - interval '6 years', CURRENT_DATE - 1, interval '1 day') d
) s;

CREATE TEMP TABLE perf AS SELECT * FROM api.asset_performance(1);

SELECT pg_temp.check((SELECT as_of FROM perf) = CURRENT_DATE - 1, 'as_of is the newest close');
SELECT pg_temp.check((SELECT abs(cagr_5y - 0.10) < 0.002 FROM perf), 'cagr_5y = 10 %');
SELECT pg_temp.check((SELECT abs(cagr_3y - 0.10) < 0.002 FROM perf), 'cagr_3y = 10 %');
SELECT pg_temp.check((SELECT abs(return_1y - 0.10) < 0.002 FROM perf), 'return_1y = 10 %');
SELECT pg_temp.check((SELECT abs(max_drawdown_5y + 0.5) < 0.01 FROM perf), 'max drawdown = -50 %');
SELECT pg_temp.check((SELECT low_52w < high_52w / 1.5 FROM perf), '52-week low inside the crash');
SELECT pg_temp.check((SELECT volatility_1y > 0 FROM perf), 'volatility computed');

-- only two years of history: no 3- or 5-year figures
DELETE FROM api.asset_prices WHERE asset_id = 1 AND tstamp < CURRENT_DATE - interval '2 years';
SELECT pg_temp.check(
  (SELECT cagr_3y IS NULL AND cagr_5y IS NULL AND return_1y IS NOT NULL FROM api.asset_performance(1)),
  'returns beyond the history are NULL');

-- no recent close: no row
DELETE FROM api.asset_prices WHERE asset_id = 1 AND tstamp > CURRENT_DATE - interval '13 months';
SELECT pg_temp.check(NOT EXISTS (SELECT 1 FROM api.asset_performance(1)), 'stale asset returns no row');

-- seeded funds and their listings
SELECT pg_temp.check(
  (SELECT count(*) FROM api.assets a JOIN api.funds f ON f.id = a.fund_id WHERE a.symbol IN ('EUNL.DE', 'IWDA.AS', 'SWDA.L')
   AND f.isin = 'IE00B4L5Y983' AND a.details_provider = 'ishares') = 3,
  'listings of one fund share its row');
SELECT pg_temp.check(
  NOT EXISTS (SELECT 1 FROM api.assets a JOIN api.funds f ON f.id = a.fund_id
              WHERE a.details_provider IN ('ishares', 'vanguard') AND f.details_source IS NULL),
  'issuer-provided funds have a source');

-- anon reads, but cannot write
SET LOCAL ROLE anon;
SELECT pg_temp.check((SELECT count(*) FROM api.funds) > 0, 'anon reads funds');
SELECT pg_temp.check((SELECT count(*) FROM api.asset_performance((SELECT id FROM api.assets WHERE symbol = 'EUNL.DE'))) <= 1, 'anon runs asset_performance');
DO $$ BEGIN
  INSERT INTO api.fund_countries VALUES (1, 'US', 0.5);
  RAISE EXCEPTION 'FAIL: anon inserted into fund_countries';
EXCEPTION WHEN insufficient_privilege THEN RAISE NOTICE 'PASS: anon cannot write fund_countries';
END $$;
RESET ROLE;

-- the updater writes details, but cannot add funds or change hand-kept facts
SET LOCAL ROLE service_worker;
INSERT INTO api.fund_countries (fund_id, country, weight)
SELECT id, 'US', 0.7 FROM api.funds WHERE isin = 'IE00B4L5Y983';
UPDATE api.funds SET fund_size = 1e9, holdings_count = 1000 WHERE isin = 'IE00B4L5Y983';
SELECT pg_temp.check(true, 'service_worker writes countries and fund size');
DO $$ BEGIN
  UPDATE api.funds SET isin = 'IE0000000000' WHERE isin = 'IE00B4L5Y983';
  RAISE EXCEPTION 'FAIL: service_worker changed an ISIN';
EXCEPTION WHEN insufficient_privilege THEN RAISE NOTICE 'PASS: service_worker cannot change hand-kept facts';
END $$;
RESET ROLE;

ROLLBACK;
\o
\echo 'asset_details.sql: all checks passed'
