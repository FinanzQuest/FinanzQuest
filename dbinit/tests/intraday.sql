-- =============================================================================
-- tests/intraday.sql — intraday prices end to end
-- -----------------------------------------------------------------------------
-- api.asset_prices_intraday -> api.latest_prices -> live depot value, trades,
-- api.rollup_intraday, the "as of" ordering of daily vs intraday prices, and
-- depots.get_intraday_values.
--
-- One transaction, ROLLs BACK. Needs seeded api.assets ids 1 and 2. Works at
-- any time of day (all times are relative to now() or to fixed past days).
--
--     psql -d postgres -f dbinit/tests/intraday.sql
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

-- clean slate for assets 1 and 2 (rolled back at the end)
DELETE FROM api.asset_prices_intraday WHERE asset_id IN (1, 2);
DELETE FROM api.asset_prices WHERE asset_id IN (1, 2);
SELECT api.rebuild_latest_prices();

CREATE TEMP TABLE w AS SELECT now() - interval '3 hours' AS since;

-- previous close, a depot holding 10 x asset 1 bought two days ago
INSERT INTO api.asset_prices (asset_id, tstamp, open, close) VALUES (1, CURRENT_DATE - 3, 0, 100);
INSERT INTO depots.depots (id, created, cash, cash_start, users) OVERRIDING SYSTEM VALUE VALUES
  (993001, now() - interval '3 days', 10000, 10000, '{dddddddd-0000-0000-0000-000000000001}'),
  (993002, now() - interval '3 days', 10000, 10000, '{dddddddd-0000-0000-0000-000000000002}');
INSERT INTO depots.transactions (depot_id, asset_id, amount, price, commission, type, tstamp)
VALUES (993001, 1, 10, 100, 1, 'user', now() - interval '2 days');

-- two 15-minute bars during the window
INSERT INTO api.asset_prices_intraday (asset_id, tstamp, open, high, low, close, volume) VALUES
  (1, now() - interval '2 hours', 100.5, 101.5, 100, 101, 10),
  (1, now() - interval '1 hour',  101,   106,   101, 105, 20);

SELECT pg_temp.check(
  (SELECT close = 105 AND tstamp = now() - interval '1 hour' FROM api.latest_prices WHERE asset_id = 1),
  'intraday bar moves latest_prices');
SELECT pg_temp.check(
  (SELECT value FROM depots.current_values WHERE depot_id = 993001) = 10000 - 1001 + 10 * 105,
  'live depot value uses the newest bar');

-- ---------------------------------------------------------------------------
-- get_intraday_values: previous close, each bar, now
-- ---------------------------------------------------------------------------
SELECT pg_temp.check(
  (SELECT array_agg(value ORDER BY tstamp) FROM depots.get_intraday_values(993001, (SELECT since FROM w)))
  = ARRAY[10000 - 1001 + 1000, 10000 - 1001 + 1010, 10000 - 1001 + 1050, 10000 - 1001 + 1050]::numeric[],
  'intraday curve: since (prev close), two bars, now');

-- a trade between the two bars counts from the second bar on
INSERT INTO depots.transactions (depot_id, asset_id, amount, price, commission, type, tstamp)
VALUES (993001, 1, 5, 101, 1, 'user', now() - interval '90 minutes');
SELECT pg_temp.check(
  (SELECT array_agg(value ORDER BY tstamp) FROM depots.get_intraday_values(993001, (SELECT since FROM w)))
  = ARRAY[9999, 10009, 10000 - 1507 + 15 * 105, 10000 - 1507 + 15 * 105]::numeric[],
  'intraday curve: a mid-day trade is placed between the bars');
SELECT pg_temp.check(
  (SELECT value FROM depots.get_intraday_values(993001, (SELECT since FROM w)) ORDER BY tstamp DESC LIMIT 1)
  = (SELECT value FROM depots.current_values WHERE depot_id = 993001),
  'intraday curve ends at the live value');
SELECT pg_temp.check(
  (SELECT cash FROM depots.get_intraday_values(993001, (SELECT since FROM w)) ORDER BY tstamp LIMIT 1) = 10000 - 1001
  AND (SELECT cash FROM depots.get_intraday_values(993001, (SELECT since FROM w)) ORDER BY tstamp DESC LIMIT 1) = 10000 - 1507,
  'intraday curve: cash before and after the trade');
SELECT pg_temp.check(
  (SELECT array_agg(value) FROM depots.get_intraday_values(993002, (SELECT since FROM w))) = '{10000,10000}',
  'depot without positions: flat line from since to now');
SELECT pg_temp.check(
  (SELECT count(*) FROM depots.get_intraday_values(993001)) >= 2,
  'default window (start of today) works');

-- ---------------------------------------------------------------------------
-- Trades execute at the newest bar
-- ---------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"sub":"dddddddd-0000-0000-0000-000000000001","role":"authenticated"}';
SELECT depots.buy_asset(1, 993001, 210);
RESET ROLE;
SELECT pg_temp.check(
  (SELECT amount = 2 AND price = 105 FROM depots.transactions
   WHERE depot_id = 993001 ORDER BY id DESC LIMIT 1),
  'buy_asset executes at the latest intraday price');

-- ---------------------------------------------------------------------------
-- Rollup: daily candle from the bars
-- ---------------------------------------------------------------------------
SELECT api.rollup_intraday((SELECT since FROM w)::date);
SELECT pg_temp.check(
  (SELECT open = 100.5 AND high = 106 AND low = 100 AND close = 105 AND volume = 30
   FROM api.asset_prices WHERE asset_id = 1 AND tstamp = ((now() - interval '1 hour') AT TIME ZONE 'UTC')::date)
  OR ((now() - interval '2 hours') AT TIME ZONE 'UTC')::date <> ((now() - interval '1 hour') AT TIME ZONE 'UTC')::date,
  'rollup: daily candle = first open / max high / min low / last close');
SELECT pg_temp.check(
  (SELECT close = 105 AND tstamp = now() - interval '1 hour' FROM api.latest_prices WHERE asset_id = 1),
  'rollup keeps the latest price and its bar time');
SELECT pg_temp.check(api.rollup_intraday((SELECT since FROM w)::date) = 0, 'rollup is idempotent (no rewrite)');

-- ---------------------------------------------------------------------------
-- As-of ordering (fixed past days): the official close of day D outranks
-- D's bars, the next day's bars outrank it again.
-- ---------------------------------------------------------------------------
INSERT INTO api.asset_prices_intraday (asset_id, tstamp, close)
VALUES (2, (CURRENT_DATE - 2)::timestamp AT TIME ZONE 'UTC' + interval '14 hours', 50);
INSERT INTO api.asset_prices (asset_id, tstamp, open, close) VALUES (2, CURRENT_DATE - 2, 0, 49);
SELECT pg_temp.check((SELECT close FROM api.latest_prices WHERE asset_id = 2) = 49,
  'official daily close outranks the same day''s bars');
INSERT INTO api.asset_prices_intraday (asset_id, tstamp, close)
VALUES (2, (CURRENT_DATE - 1)::timestamp AT TIME ZONE 'UTC' + interval '9 hours', 51);
SELECT pg_temp.check((SELECT close FROM api.latest_prices WHERE asset_id = 2) = 51,
  'next day''s bar outranks the previous close');
-- re-uploading old history (the nightly run refetches it) must not go back
INSERT INTO api.asset_prices (asset_id, tstamp, open, close) VALUES (2, CURRENT_DATE - 5, 0, 10);
SELECT pg_temp.check((SELECT close FROM api.latest_prices WHERE asset_id = 2) = 51,
  'older daily rows do not overwrite a newer price');

-- rebuild_latest_prices agrees with the trigger-maintained state
CREATE TEMP TABLE lp_before AS SELECT * FROM api.latest_prices;
SELECT api.rebuild_latest_prices();
SELECT pg_temp.check(NOT EXISTS (
    (SELECT * FROM lp_before EXCEPT SELECT * FROM api.latest_prices)
    UNION ALL (SELECT * FROM api.latest_prices EXCEPT SELECT * FROM lp_before)),
  'rebuild_latest_prices == trigger-maintained latest_prices');

-- ---------------------------------------------------------------------------
-- Access
-- ---------------------------------------------------------------------------
SELECT pg_temp.check(has_table_privilege('anon', 'api.asset_prices_intraday', 'SELECT')
                 AND NOT has_table_privilege('authenticated', 'api.asset_prices_intraday', 'INSERT'),
  'intraday prices: public read, no client writes');
SELECT pg_temp.check(has_function_privilege('service_worker', 'api.rollup_intraday(date)', 'EXECUTE')
                 AND NOT has_function_privilege('authenticated', 'api.rollup_intraday(date)', 'EXECUTE'),
  'rollup: ingestion only');

\o
\echo 'intraday.sql: ALL PASS'
ROLLBACK;
