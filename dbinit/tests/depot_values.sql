-- =============================================================================
-- tests/depot_values.sql — behaviour test for the depot valuation pipeline
-- -----------------------------------------------------------------------------
-- Covers: depots.holdings, depots.daily_values, depots.values (+ live today
-- row), depots.aggregated_values, depots.rebuild_depot_values, the transaction
-- triggers and grant_reward.
--
-- Runs entirely inside one transaction and ROLLs BACK, so it is safe against a
-- fresh dev database (it needs the seeded api.assets ids 1 and 2). Not part of
-- the manifest. Run as the migration superuser:
--
--     psql -d postgres -f dbinit/tests/depot_values.sql
--
-- Stops at the first failing assertion (ON_ERROR_STOP).
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

-- Naive reference valuation of one depot on one day, straight from the ledger
-- and prices (last known close carried forward, no cutoff).
CREATE FUNCTION pg_temp.ref_value(p_depot bigint, p_day date,
  OUT value numeric, OUT cash numeric, OUT assets numeric)
LANGUAGE sql AS $$
  WITH pos AS (
    SELECT t.asset_id,
           SUM(t.amount::numeric) AS amount,
           SUM(depots.transaction_expense(t.type, t.amount, t.price)) AS expenses,
           SUM(CASE WHEN depots.transaction_affects_commission(t.type)
                    THEN t.commission::numeric ELSE 0 END) AS commission
    FROM depots.transactions t
    WHERE t.depot_id = p_depot AND t.tstamp::date <= p_day
    GROUP BY t.asset_id
  ), priced AS (
    SELECT pos.*,
           CASE WHEN pos.asset_id IS NULL THEN 0 ELSE COALESCE(pos.amount * (
             SELECT p.close::numeric FROM api.asset_prices p
             WHERE p.asset_id = pos.asset_id AND p.tstamp <= p_day AND p.close IS NOT NULL
             ORDER BY p.tstamp DESC LIMIT 1), 0) END AS mv
    FROM pos
  )
  SELECT d.cash_start + COALESCE(SUM(mv - expenses - commission), 0),
         d.cash_start - COALESCE(SUM(expenses + commission), 0),
         COALESCE(SUM(mv), 0)
  FROM depots.depots d LEFT JOIN priced ON TRUE
  WHERE d.id = p_depot
  GROUP BY d.cash_start
$$;

-- Every stored/live row of depot p matches the reference.
CREATE FUNCTION pg_temp.history_matches(p_depot bigint) RETURNS boolean
LANGUAGE sql AS $$
  SELECT COUNT(*) > 0 AND BOOL_AND(
           abs(v.value - r.value) < 0.01 AND abs(v.cash - r.cash) < 0.01
       AND abs(v.assets - r.assets) < 0.01)
  FROM depots.values v, LATERAL pg_temp.ref_value(v.depot_id, v.tstamp) r
  WHERE v.depot_id = p_depot
$$;

-- depots.cash (trigger-maintained) equals the ledger for every test depot.
CREATE FUNCTION pg_temp.cash_consistent() RETURNS boolean
LANGUAGE sql AS $$
  SELECT BOOL_AND(d.cash = d.cash_start - COALESCE(
           (SELECT SUM(depots.transaction_expense(t.type, t.amount, t.price)
                       + CASE WHEN depots.transaction_affects_commission(t.type) THEN t.commission ELSE 0 END)
            FROM depots.transactions t WHERE t.depot_id = d.id), 0))
  FROM depots.depots d WHERE d.id >= 990001
$$;

CREATE FUNCTION pg_temp.today_value(p_depot bigint) RETURNS numeric
LANGUAGE sql AS $$
  SELECT value FROM depots.values WHERE depot_id = p_depot AND tstamp = CURRENT_DATE
$$;

-- -----------------------------------------------------------------------------
-- Fixture: two assets with weekday prices for the last 40 days, two depots.
-- -----------------------------------------------------------------------------
INSERT INTO api.asset_prices (asset_id, tstamp, open, close)
SELECT a, d::date, 0, CASE a WHEN 1 THEN 100 + (CURRENT_DATE - d::date) % 7
                             ELSE 40 + (CURRENT_DATE - d::date) % 5 END
FROM generate_series(CURRENT_DATE - 40, CURRENT_DATE - 1, '1 day') d,
     (VALUES (1), (2)) v(a)
WHERE extract(isodow FROM d) < 6
ON CONFLICT (asset_id, tstamp) DO UPDATE SET close = EXCLUDED.close;

INSERT INTO depots.depots (id, created, cash, cash_start, users) OVERRIDING SYSTEM VALUE VALUES
  (990001, now() - interval '40 days', 10000, 10000, '{aaaaaaaa-0000-0000-0000-000000000001}'),
  (990002, now() - interval '40 days', 10000, 10000, '{aaaaaaaa-0000-0000-0000-000000000002}'),
  (990003, now(),                      5000,  5000,  '{aaaaaaaa-0000-0000-0000-000000000003}');

-- Backdated history for depot A in ONE statement (bulk path of the trigger).
INSERT INTO depots.transactions (depot_id, asset_id, amount, price, commission, type, tstamp) VALUES
  (990001, 1,    10,   100,  1, 'user',         now() - interval '30 days'),
  (990001, 2,    20,   40,   1, 'user',         now() - interval '20 days'),
  (990001, 1,    -4,   103,  1, 'user',         now() - interval '12 days'),
  (990001, NULL, 500,  NULL, 0, 'movement',     now() - interval '9 days'),
  (990001, 2,    3,    41,   0, 'savings_plan', now() - interval '6 days'),
  (990002, 2,    50,   40,   1, 'user',         now() - interval '25 days');

SELECT pg_temp.check(pg_temp.history_matches(990001), 'backdated bulk insert: depot A history matches reference');
SELECT pg_temp.check(pg_temp.history_matches(990002), 'backdated bulk insert: depot B history matches reference');

SELECT pg_temp.check(
  (SELECT COUNT(*) FROM depots.daily_values WHERE depot_id = 990001 AND tstamp >= CURRENT_DATE) = 0,
  'daily_values only holds closed days');

SELECT pg_temp.check(
  (SELECT COUNT(*) FROM depots.values WHERE depot_id = 990001 AND tstamp = CURRENT_DATE) = 1,
  'values has exactly one live row for today');

SELECT pg_temp.check(NOT EXISTS (
    SELECT 1 FROM depots.values v
    WHERE v.depot_id = 990001 AND v.tstamp < CURRENT_DATE
      AND extract(isodow FROM v.tstamp) >= 6
      AND NOT EXISTS (SELECT 1 FROM depots.transactions t
                      WHERE t.depot_id = v.depot_id AND t.tstamp::date = v.tstamp)),
  'no weekend filler rows in history');

SELECT pg_temp.check(
  (SELECT MIN(tstamp) FROM depots.values WHERE depot_id = 990001) = CURRENT_DATE - 30,
  'history starts at the first transaction');

SELECT pg_temp.check(NOT EXISTS (
    SELECT 1 FROM depots.holdings h
    FULL JOIN (SELECT depot_id, asset_id, SUM(amount::numeric) amount,
                      SUM(depots.transaction_expense(type, amount, price)) expenses,
                      SUM(CASE WHEN depots.transaction_affects_commission(type)
                               THEN commission::numeric ELSE 0 END) commission
               FROM depots.transactions GROUP BY depot_id, asset_id) s
      ON s.depot_id = h.depot_id AND s.asset_id IS NOT DISTINCT FROM h.asset_id
    WHERE h.depot_id IS NULL OR s.depot_id IS NULL
       OR abs(h.amount - s.amount) > 1e-6 OR abs(h.expenses - s.expenses) > 1e-6
       OR abs(h.commission - s.commission) > 1e-6),
  'holdings == SUM(transactions) for every depot/asset');

SELECT pg_temp.check(pg_temp.cash_consistent(), 'depots.cash == cash_start - spent (bulk insert)');
SELECT pg_temp.check(NOT EXISTS (
    SELECT 1 FROM api.latest_prices lp
    WHERE lp.close IS DISTINCT FROM (SELECT p.close::numeric FROM api.asset_prices p
                                     WHERE p.asset_id = lp.asset_id AND p.close IS NOT NULL
                                     ORDER BY p.tstamp DESC LIMIT 1)),
  'latest_prices == newest close per asset');

-- -----------------------------------------------------------------------------
-- Freshness: a trade through the real RPC shows up immediately.
-- -----------------------------------------------------------------------------
CREATE TEMP TABLE snap AS SELECT * FROM depots.values WHERE depot_id = 990001;
GRANT SELECT ON snap TO authenticated;

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"sub":"aaaaaaaa-0000-0000-0000-000000000001","role":"authenticated"}';
SET LOCAL search_path = depots, public;   -- as PostgREST does for Accept-Profile: depots
SELECT depots.buy_asset(1, 990001, 1000);
RESET ROLE;
RESET search_path;

-- (amount = worth/price is a rounded numeric division, so cost is ~exact)
SELECT pg_temp.check(abs(
    (SELECT v.cash FROM depots.values v WHERE depot_id = 990001 AND tstamp = CURRENT_DATE)
  - ((SELECT s.cash FROM snap s WHERE tstamp = CURRENT_DATE) - 1000 - current_setting('config.commission')::numeric)
  ) < 1e-9,
  'buy_asset: today''s cash drops by worth + commission immediately');
SELECT pg_temp.check(pg_temp.history_matches(990001), 'buy_asset: depot A still matches reference');
SELECT pg_temp.check(
  (SELECT COUNT(*) FROM depots.daily_values d JOIN snap s USING (depot_id, tstamp)
   WHERE d.depot_id = 990001 AND d.value <> s.value) = 0,
  'buy_asset (today): closed days untouched');
SELECT pg_temp.check(
  (SELECT total FROM depots.aggregated_values WHERE depot_id = 990001) = pg_temp.today_value(990001),
  'aggregated_values.total is the live value');
SELECT pg_temp.check(
  (SELECT prev_1d_total FROM depots.aggregated_values WHERE depot_id = 990001)
  = (SELECT value FROM depots.daily_values WHERE depot_id = 990001 ORDER BY tstamp DESC LIMIT 1),
  'aggregated_values.prev_1d_total is the last closed day');
SELECT pg_temp.check(
  (SELECT prev_1m_total FROM depots.aggregated_values WHERE depot_id = 990001)
  IS NOT DISTINCT FROM (SELECT value FROM depots.daily_values WHERE depot_id = 990001
       AND tstamp <= (CURRENT_DATE - interval '1 month')::date ORDER BY tstamp DESC LIMIT 1),
  'aggregated_values.prev_1m_total is the last day at least a month ago');
SELECT pg_temp.check(pg_temp.cash_consistent(), 'depots.cash == cash_start - spent (after buy_asset)');
SELECT pg_temp.check(
  (SELECT value = pg_temp.today_value(990001)
          AND sparkline[1] = value
          AND sparkline[2:] = (SELECT array_agg(value ORDER BY tstamp DESC) FROM
                                 (SELECT value, tstamp FROM depots.daily_values WHERE depot_id = 990001
                                  ORDER BY tstamp DESC LIMIT 6) x)
          AND cardinality(sparkline) = 7
   FROM depots.leaderboard WHERE id = 990001),
  'leaderboard: live value and 7-point sparkline');
SELECT pg_temp.check(
  (SELECT rank FROM depots.leaderboard WHERE id = 990001)
  = 1 + (SELECT COUNT(DISTINCT value) FROM depots.current_values
         WHERE value > pg_temp.today_value(990001)),
  'leaderboard: dense rank by live value');

-- -----------------------------------------------------------------------------
-- Freshness: a new price for today is reflected immediately.
-- -----------------------------------------------------------------------------
DO $$
DECLARE before numeric := pg_temp.today_value(990001);
        held   numeric := (SELECT amount FROM depots.holdings WHERE depot_id = 990001 AND asset_id = 1);
        last_close numeric := (SELECT close FROM api.asset_prices WHERE asset_id = 1 ORDER BY tstamp DESC LIMIT 1);
BEGIN
  INSERT INTO api.asset_prices (asset_id, tstamp, open, close) VALUES (1, CURRENT_DATE, 0, last_close + 10)
  ON CONFLICT (asset_id, tstamp) DO UPDATE SET close = EXCLUDED.close;
  PERFORM pg_temp.check(abs(pg_temp.today_value(990001) - (before + held * 10)) < 0.01,
                        'new price today: live value moves by amount * delta');
END $$;

-- -----------------------------------------------------------------------------
-- Rewards are cash and count towards value.
-- -----------------------------------------------------------------------------
-- Granted by a teacher (not a member of the depot), as in the admin UI.
INSERT INTO auth.users (id) VALUES ('aaaaaaaa-0000-0000-0000-00000000000f');
INSERT INTO users.special_roles (user_id, user_role) VALUES ('aaaaaaaa-0000-0000-0000-00000000000f', 'teacher');
CREATE TEMP TABLE before_reward AS
  SELECT value, cash FROM depots.values WHERE depot_id = 990001 AND tstamp = CURRENT_DATE;

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"sub":"aaaaaaaa-0000-0000-0000-00000000000f","role":"authenticated"}';
SELECT depots.grant_reward(990001, 100);
RESET ROLE;

SELECT pg_temp.check(
  pg_temp.today_value(990001) = (SELECT value FROM before_reward) + 100, 'grant_reward (teacher): value +100');
SELECT pg_temp.check(
  (SELECT cash FROM depots.values WHERE depot_id = 990001 AND tstamp = CURRENT_DATE)
  = (SELECT cash FROM before_reward) + 100, 'grant_reward (teacher): cash +100');
SELECT pg_temp.check(pg_temp.cash_consistent(), 'depots.cash == cash_start - spent (after reward)');

-- -----------------------------------------------------------------------------
-- Backdated single insert and delete recompute history.
-- -----------------------------------------------------------------------------
INSERT INTO depots.transactions (depot_id, asset_id, amount, price, commission, type, tstamp)
VALUES (990001, 2, 7, 42, 1, 'user', now() - interval '15 days');
SELECT pg_temp.check(pg_temp.history_matches(990001), 'backdated insert: history recomputed');

DELETE FROM depots.transactions WHERE depot_id = 990001 AND asset_id = 1 AND amount = -4;
SELECT pg_temp.check(pg_temp.history_matches(990001), 'backdated delete: history recomputed');

UPDATE depots.transactions SET amount = 25 WHERE depot_id = 990002 AND asset_id = 2;
SELECT pg_temp.check(pg_temp.history_matches(990002), 'backdated update: history recomputed');
SELECT pg_temp.check(pg_temp.cash_consistent(), 'depots.cash == cash_start - spent (after backdated changes)');

-- -----------------------------------------------------------------------------
-- Rebuild is idempotent; a depot without transactions shows its cash.
-- -----------------------------------------------------------------------------
-- (scoped to the test depots: the fixture overwrote asset 1/2 prices, which
-- a rebuild legitimately re-values for any other depot holding them)
CREATE TEMP TABLE before_rebuild AS SELECT * FROM depots.daily_values WHERE depot_id >= 990001;
SELECT depots.rebuild_depot_values();
CALL depots.refresh_depot_values(0, '{"days": 7}');
SELECT pg_temp.check(NOT EXISTS (
    (SELECT * FROM before_rebuild EXCEPT SELECT * FROM depots.daily_values WHERE depot_id >= 990001)
    UNION ALL
    (SELECT * FROM depots.daily_values WHERE depot_id >= 990001 EXCEPT SELECT * FROM before_rebuild)),
  'rebuild_depot_values() and the hourly job are idempotent');

SELECT pg_temp.check(pg_temp.today_value(990003) = 5000, 'new depot: live value == cash_start');

-- Deleting a depot cascades into transactions; the trigger must not choke.
DELETE FROM depots.depots WHERE id = 990002;
SELECT pg_temp.check(
  NOT EXISTS (SELECT 1 FROM depots.holdings WHERE depot_id = 990002)
  AND NOT EXISTS (SELECT 1 FROM depots.values WHERE depot_id = 990002),
  'deleting a depot removes its holdings and values');

-- -----------------------------------------------------------------------------
-- Access control.
-- -----------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"sub":"aaaaaaaa-0000-0000-0000-000000000001","role":"authenticated"}';
SELECT pg_temp.check(
  (SELECT array_agg(DISTINCT depot_id) FROM depots.holdings WHERE depot_id >= 990001) = '{990001}',
  'holdings: members see only their own depot');
RESET ROLE;

SET LOCAL ROLE anon;
SELECT pg_temp.check(
  (SELECT COUNT(DISTINCT depot_id) FROM depots.values WHERE depot_id >= 990001) = 2,
  'values: depot totals stay public (leaderboard / inspect)');
RESET ROLE;
SELECT pg_temp.check(NOT has_table_privilege('anon', 'depots.holdings', 'SELECT'),
  'holdings: not readable by anon');
SELECT pg_temp.check(NOT has_table_privilege('authenticated', 'depots.daily_values', 'INSERT'),
  'daily_values: not writable by clients');

\o
\echo 'depot_values.sql: ALL PASS'
ROLLBACK;
