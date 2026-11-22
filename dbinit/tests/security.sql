-- =============================================================================
-- tests/security.sql — what a logged-in student can and cannot do
-- -----------------------------------------------------------------------------
-- Every write path a client has, tried as the client (role authenticated with
-- JWT claims, as PostgREST runs it): direct table writes must fail, the RPCs
-- must check membership / roles / budget, and trades must keep the ledger,
-- depots.cash and holdings consistent.
--
-- One transaction, ROLLs BACK. Needs seeded api.assets ids 1 and 2.
--
--     psql -d postgres -f dbinit/tests/security.sql
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

-- TRUE if the statement raises (any error, incl. permission denied / RLS).
CREATE FUNCTION pg_temp.raises(p_sql text) RETURNS boolean
LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE p_sql;
  RETURN false;
EXCEPTION WHEN OTHERS THEN
  RETURN true;
END $$;

-- run p_sql as the given user (authenticated role + JWT claims)
CREATE FUNCTION pg_temp.as_user(p_uid uuid, p_sql text) RETURNS boolean
LANGUAGE plpgsql AS $$
DECLARE v boolean;
BEGIN
  PERFORM set_config('request.jwt.claims', json_build_object('sub', p_uid, 'role', 'authenticated')::text, true);
  EXECUTE 'SET LOCAL ROLE authenticated';
  v := pg_temp.raises(p_sql);
  EXECUTE 'RESET ROLE';
  RETURN v;
END $$;

-- ---------------------------------------------------------------------------
-- Fixture: a student (owns 991001), another student (991002), a teacher.
-- ---------------------------------------------------------------------------
INSERT INTO auth.users (id) VALUES
  ('bbbbbbbb-0000-0000-0000-000000000001'),
  ('bbbbbbbb-0000-0000-0000-000000000002'),
  ('bbbbbbbb-0000-0000-0000-00000000000f');
INSERT INTO users.special_roles (user_id, user_role) VALUES ('bbbbbbbb-0000-0000-0000-00000000000f', 'teacher');

INSERT INTO api.asset_prices (asset_id, tstamp, open, close) VALUES
  (1, CURRENT_DATE - 1, 0, 80), (2, CURRENT_DATE - 1, 0, 25)
ON CONFLICT (asset_id, tstamp) DO UPDATE SET close = EXCLUDED.close;
-- make sure these are the newest prices for the test
DELETE FROM api.asset_prices WHERE asset_id IN (1, 2) AND tstamp >= CURRENT_DATE;
SELECT api.rebuild_latest_prices();

INSERT INTO depots.depots (id, created, cash, cash_start, users) OVERRIDING SYSTEM VALUE VALUES
  (991001, now(), 10000, 10000, '{bbbbbbbb-0000-0000-0000-000000000001}'),
  (991002, now(), 10000, 10000, '{bbbbbbbb-0000-0000-0000-000000000002}');
-- (the depot insert trigger granted the default monthly budget, 200)

\set s1 '''bbbbbbbb-0000-0000-0000-000000000001'''
\set s2 '''bbbbbbbb-0000-0000-0000-000000000002'''
\set t  '''bbbbbbbb-0000-0000-0000-00000000000f'''


-- ---------------------------------------------------------------------------
-- The ledger and depot money are not directly writable.
-- ---------------------------------------------------------------------------
SELECT pg_temp.check(pg_temp.as_user(:s1,
  $$INSERT INTO depots.transactions (depot_id, asset_id, amount, price, commission, type)
    VALUES (991001, 1, 1000, 0.01, 0, 'user')$$), 'student cannot insert a transaction at any price');
SELECT pg_temp.check(pg_temp.as_user(:s1,
  $$INSERT INTO depots.transactions (depot_id, asset_id, amount, price, commission, type)
    VALUES (991001, NULL, 1000000, NULL, 0, 'movement')$$), 'student cannot insert a cash movement');
SELECT pg_temp.check(pg_temp.as_user(:s1,
  $$UPDATE depots.depots SET cash = 1e9, cash_start = 1e9 WHERE id = 991001$$), 'student cannot update depot cash');
SELECT pg_temp.check(pg_temp.as_user(:s1,
  $$INSERT INTO depots.depots (created, cash, cash_start, users)
    VALUES (now(), 1e9, 1e9, '{bbbbbbbb-0000-0000-0000-000000000001}')$$), 'student cannot insert a rich depot');
SELECT pg_temp.check(pg_temp.as_user(:s1,
  $$DELETE FROM depots.depots WHERE id = 991002$$) OR EXISTS (SELECT 1 FROM depots.depots WHERE id = 991002),
  'student cannot delete another depot');
SELECT pg_temp.check(pg_temp.as_user(:s1,
  $$INSERT INTO depots.savings_plans (depot_id, asset_id, worth, period, created, last_changed, created_by)
    VALUES (991001, 1, 1e6, 'daily', now(), now(), 'bbbbbbbb-0000-0000-0000-000000000001')$$),
  'student cannot insert a savings plan directly (bypassing the budget)');

-- ---------------------------------------------------------------------------
-- Role escalation through SECURITY DEFINER functions.
-- ---------------------------------------------------------------------------
SELECT pg_temp.check(pg_temp.as_user(:s1,
  $$SELECT users.grant_teacher('bbbbbbbb-0000-0000-0000-000000000001')$$), 'student cannot make themselves teacher');
SELECT pg_temp.check(NOT EXISTS (SELECT 1 FROM users.special_roles WHERE user_id = 'bbbbbbbb-0000-0000-0000-000000000001'),
  '... and has no role afterwards');
SELECT pg_temp.check(pg_temp.as_user(:s1, $$SELECT * FROM users.admin_overview$$), 'student cannot read admin_overview (emails)');
SELECT pg_temp.check(pg_temp.as_user(:s1, $$SELECT * FROM users.stats()$$), 'student cannot read stats');
SELECT pg_temp.check(pg_temp.as_user(:s1, $$SELECT * FROM depots.depot_overview$$), 'student cannot read depot_overview');
SELECT pg_temp.check(pg_temp.as_user(:s1, $$SELECT depots.grant_reward(991001, 1000000)$$), 'student cannot grant themselves a reward');
SELECT pg_temp.check(NOT pg_temp.as_user(:t, $$SELECT * FROM users.admin_overview$$), 'teacher can read admin_overview');
SELECT pg_temp.check(NOT pg_temp.as_user(:t, $$SELECT depots.grant_reward(991002, 50)$$), 'teacher can grant a reward');
SELECT pg_temp.check((SELECT cash FROM depots.depots WHERE id = 991002) = 10050, 'reward lands in depots.cash');

-- Admin accounts: teachers manage students, not admins.
INSERT INTO auth.users (id) VALUES ('bbbbbbbb-0000-0000-0000-0000000000aa'), ('bbbbbbbb-0000-0000-0000-0000000000ab'),
  ('bbbbbbbb-0000-0000-0000-0000000000ac');  -- ac: a student without a depot
INSERT INTO users.special_roles (user_id, user_role) VALUES
  ('bbbbbbbb-0000-0000-0000-0000000000aa', 'admin'), ('bbbbbbbb-0000-0000-0000-0000000000aa', 'teacher'),
  ('bbbbbbbb-0000-0000-0000-0000000000ab', 'admin');
SELECT pg_temp.check(pg_temp.as_user(:t,
  $$SELECT users.revoke_teacher('bbbbbbbb-0000-0000-0000-0000000000aa')$$), 'teacher cannot revoke an admin''s teacher role');
SELECT pg_temp.check(pg_temp.as_user(:t,
  $$SELECT users.grant_teacher('bbbbbbbb-0000-0000-0000-0000000000ab')$$), 'teacher cannot change an admin''s roles');
SELECT pg_temp.check(NOT pg_temp.as_user(:t,
  $$SELECT users.grant_teacher('bbbbbbbb-0000-0000-0000-0000000000ac')$$), 'teacher can still make a student a teacher');
SELECT pg_temp.check(NOT pg_temp.as_user('bbbbbbbb-0000-0000-0000-0000000000aa',
  $$SELECT users.grant_teacher('bbbbbbbb-0000-0000-0000-0000000000ab')$$), 'admin can change an admin''s roles');

-- ---------------------------------------------------------------------------
-- Depot creation.
-- ---------------------------------------------------------------------------
SELECT pg_temp.check(pg_temp.as_user(:s1,
  $$SELECT depots.new_depot_for_user('bbbbbbbb-0000-0000-0000-000000000002')$$), 'student cannot create a depot for someone else');
SELECT pg_temp.check(NOT pg_temp.as_user(:s1,
  $$SELECT depots.new_depot_for_user('bbbbbbbb-0000-0000-0000-000000000001')$$), 'student can create their own depot');
SELECT pg_temp.check(
  (SELECT cash_start = 50000 AND cash = 50000 FROM depots.depots
   WHERE users = '{bbbbbbbb-0000-0000-0000-000000000001}' AND id <> 991001),
  '... with the standard starting cash');
SELECT pg_temp.check(NOT has_function_privilege('anon', 'depots.new_depot_for_user(uuid)', 'EXECUTE'),
  'anon cannot create depots');

-- ---------------------------------------------------------------------------
-- Trading.
-- ---------------------------------------------------------------------------
SELECT pg_temp.check(pg_temp.as_user(:s1, $$SELECT depots.buy_asset(1, 991002, 100)$$), 'student cannot buy in another depot');
SELECT pg_temp.check(pg_temp.as_user(:s1, $$SELECT depots.buy_asset(1, 991001, -100)$$), 'negative buy rejected');
SELECT pg_temp.check(pg_temp.as_user(:s1, $$SELECT depots.sell_asset(1, 991001, -100)$$), 'negative sell rejected');
SELECT pg_temp.check(pg_temp.as_user(:s1, $$SELECT depots.buy_asset(1, 991001, 10000)$$), 'buy above cash - commission rejected');
SELECT pg_temp.check(NOT pg_temp.as_user(:s1, $$SELECT depots.buy_asset(1, 991001, 800)$$), 'buy within cash works');
SELECT pg_temp.check(
  (SELECT amount = 10 AND price = 80 AND user_id = 'bbbbbbbb-0000-0000-0000-000000000001'
   FROM depots.transactions WHERE depot_id = 991001),
  'buy logs amount = worth / latest price and the buyer');
SELECT pg_temp.check((SELECT cash FROM depots.depots WHERE id = 991001) = 10000 - 800 - current_setting('config.commission')::numeric,
  'buy: depots.cash is exact');
SELECT pg_temp.check(pg_temp.as_user(:s2, $$SELECT depots.sell_asset(1, 991001, 100)$$), 'student cannot sell from another depot');
SELECT pg_temp.check(NOT pg_temp.as_user(:s1, $$SELECT depots.sell_asset(1, 991001, 1000000)$$), 'selling more than held sells the position');
SELECT pg_temp.check((SELECT amount FROM depots.holdings WHERE depot_id = 991001 AND asset_id = 1) = 0,
  'full sell leaves exactly zero');
SELECT pg_temp.check((SELECT cash FROM depots.depots WHERE id = 991001) = 10000 - 2 * current_setting('config.commission')::numeric,
  'round trip at the same price costs exactly two commissions');
SELECT pg_temp.check(pg_temp.as_user(:s1, $$SELECT depots.sell_asset(1, 991001, 10)$$), 'selling an empty position is rejected');

-- ---------------------------------------------------------------------------
-- Savings plans: membership and budget (default 200 / month).
-- ---------------------------------------------------------------------------
SELECT pg_temp.check(pg_temp.as_user(:s2, $$SELECT depots.upsert_savings_plan(991001, 1, 10, 'monthly')$$),
  'student cannot create a plan in another depot');
SELECT pg_temp.check(pg_temp.as_user(:s1, $$SELECT depots.upsert_savings_plan(991001, 1, 1000, 'monthly')$$),
  'plan above the monthly budget rejected');
SELECT pg_temp.check(pg_temp.as_user(:s1, $$SELECT depots.upsert_savings_plan(991001, 1, 10, 'daily')$$),
  'daily plan is checked per month (10 * 365/12 > 200)');
SELECT pg_temp.check(NOT pg_temp.as_user(:s1, $$SELECT depots.upsert_savings_plan(991001, 1, 150, 'monthly')$$),
  'plan within budget works');
SELECT pg_temp.check(NOT pg_temp.as_user(:s1, $$SELECT depots.upsert_savings_plan(991001, 1, 200, 'monthly')$$),
  'replacing a plan only counts it once');
SELECT pg_temp.check(pg_temp.as_user(:s1, $$SELECT depots.upsert_savings_plan(991001, 2, 1, 'monthly')$$),
  'second plan beyond the budget rejected');
SELECT pg_temp.check(pg_temp.as_user(:s2,
  format('SELECT depots.update_savings_plan(%s, 1, 1, %L)', (SELECT id FROM depots.savings_plans WHERE depot_id = 991001), 'monthly')),
  'student cannot update another depot''s plan');
SELECT pg_temp.check(NOT pg_temp.as_user(:s2,
  format('SELECT depots.delete_savings_plan(ARRAY[%s]::bigint[])', (SELECT id FROM depots.savings_plans WHERE depot_id = 991001)))
  AND EXISTS (SELECT 1 FROM depots.savings_plans WHERE depot_id = 991001),
  'student cannot delete another depot''s plan (silently ignored)');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"bbbbbbbb-0000-0000-0000-000000000002","role":"authenticated"}', true);
SELECT pg_temp.check(NOT EXISTS (SELECT 1 FROM depots.savings_plans_with_asset WHERE depot_id = 991001)
                 AND NOT EXISTS (SELECT 1 FROM depots.savings_plans WHERE depot_id = 991001),
  'savings plans are private to the depot');
RESET ROLE;

-- Execution: due plans run once at the latest price, funded by the budget.
SELECT pg_temp.check(depots.execute_savings_plans() >= 1, 'execute_savings_plans runs the new plan');
SELECT pg_temp.check(
  (SELECT amount = 200 / 80.0 AND type = 'savings_plan' FROM depots.transactions
   WHERE depot_id = 991001 AND type = 'savings_plan'),
  'plan execution logs worth / latest price');
SELECT pg_temp.check((SELECT cash FROM depots.depots WHERE id = 991001) = 10000 - 2 * current_setting('config.commission')::numeric,
  'plan execution does not touch cash');
SELECT pg_temp.check(depots.execute_savings_plans() = 0 OR NOT EXISTS (
    SELECT 1 FROM depots.transactions WHERE depot_id = 991001 AND type = 'savings_plan' GROUP BY depot_id HAVING COUNT(*) > 1),
  'a plan is not executed twice in one period');

\o
\echo 'security.sql: ALL PASS'
ROLLBACK;
