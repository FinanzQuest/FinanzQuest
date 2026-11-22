-- =============================================================================
-- MIGRATION 2026-11-23: lock down writes, exact ledger, fast live values
-- -----------------------------------------------------------------------------
-- Requires 2026-11-22_ledger_depot_values.sql. Run from the repository root as
-- the migration superuser:
--
--     psql -d postgres -f dbinit/migrations/2026-11-23_lockdown_numeric_ledger.sql
--
-- 1. Security
--    - role checks used `current_user = 'postgres'`, which is always true in a
--      SECURITY DEFINER function -> users.is_superuser_session()
--      (grant_teacher, revoke_teacher, stats, get_admin_overview,
--      get_depot_overview were callable by every logged-in user;
--      grant_teacher also flagged *every* user as super admin)
--    - depots.transactions, depots.depots (INSERT/UPDATE) and
--      depots.savings_plans are no longer writable by clients; all writes go
--      through checked SECURITY DEFINER functions
--    - savings plan functions check membership and the monthly budget
--    - new_depot_for_user: only for yourself (or as admin/teacher), not anon
-- 2. Exact money: transactions.amount/price/commission and depots.cash are
--    numeric; depots.cash is maintained by the ledger trigger. Existing
--    depots.cash that differs from the ledger by >= 1 (e.g. rewards granted
--    before rewards were logged) is carried over as one 'movement' row, so no
--    balance changes.
-- 3. depots.positions (separate, drifting state) is dropped; everything reads
--    depots.holdings.
-- 4. api.latest_prices (trigger-maintained) replaces per-holding lookups into
--    the price hypertable; leaderboard / aggregated_values rewritten.
-- 5. Savings plans are executed by a daily job (they never ran before).
--
-- Runs in one transaction; not re-runnable.
-- Afterwards: dbinit/verify_schema.sql, dbinit/tests/depot_values.sql,
-- dbinit/tests/security.sql.
-- =============================================================================

\set ON_ERROR_STOP on
BEGIN;

-- Old depots.cash, for the reconciliation in step 6
CREATE TEMP TABLE old_cash ON COMMIT DROP AS
SELECT id, cash::numeric AS cash FROM depots.depots;

-- 1. Drop dependants of changed objects ----------------------------------------
DROP VIEW depots.leaderboard;
DROP VIEW depots.aggregated_values;
DROP VIEW depots.values;
DROP VIEW depots.depot_overview;

DROP FUNCTION depots.buy_asset(bigint, bigint, real);
DROP FUNCTION depots.sell_asset(bigint, bigint, real);
DROP FUNCTION IF EXISTS depots.buy_asset_at(bigint, bigint, real, timestamptz);
DROP FUNCTION IF EXISTS depots.log_transaction(bigint, bigint, real, real, real);
DROP FUNCTION IF EXISTS depots.update_depot_positions();
DROP FUNCTION depots.get_transactions_with_position(bigint);
DROP FUNCTION depots.get_depot_overview();
DROP FUNCTION depots.transaction_expense(depots.TransactionType, real, real);
DROP FUNCTION depots.execute_savings_plans();

DROP TABLE depots.positions CASCADE;

-- 2. Exact money columns ---------------------------------------------------------
-- real -> text -> numeric keeps the shortest exact decimal (what users saw);
-- real::numeric would round to 6 significant digits.
ALTER TABLE depots.transactions
  ALTER COLUMN amount     TYPE numeric USING amount::text::numeric,
  ALTER COLUMN price      TYPE numeric USING price::text::numeric,
  ALTER COLUMN commission TYPE numeric USING commission::text::numeric;
ALTER TABLE depots.depots ALTER COLUMN cash TYPE numeric;

-- 3. Objects (same files as the manifest) ----------------------------------------
\ir ../03-tables/api/latest_prices.sql

\ir ../04-functions/users/is_superuser_session.sql
\ir ../04-functions/users/grant_teacher.sql
\ir ../04-functions/users/revoke_teacher.sql
\ir ../04-functions/users/stats.sql
\ir ../04-functions/users/get_admin_overview.sql
\ir ../04-functions/api/on_asset_prices_change.sql
\ir ../04-functions/api/rebuild_latest_prices.sql
\ir ../04-functions/depots/transaction_expense.sql
\ir ../04-functions/depots/apply_ledger_delta.sql
\ir ../04-functions/depots/rebuild_holdings.sql
\ir ../04-functions/depots/check_savings_budget.sql
\ir ../04-functions/depots/get_position_profits.sql
\ir ../04-functions/depots/get_transactions_with_position.sql
\ir ../04-functions/depots/buy_asset.sql
\ir ../04-functions/depots/sell_asset.sql
\ir ../04-functions/depots/execute_savings_plans.sql
\ir ../04-functions/depots/new_depot_for_user.sql
\ir ../04-functions/depots/update_savings_plan.sql
\ir ../04-functions/depots/upsert_savings_plan.sql
\ir ../04-functions/depots/delete_savings_plan.sql
\ir ../04-functions/depots/grant_reward.sql
\ir ../04-functions/depots/get_depot_overview.sql

\ir ../06-views/depots/current_values.sql
\ir ../06-views/depots/values.sql
\ir ../06-views/depots/aggregated_values.sql
\ir ../06-views/depots/depot_overview.sql
\ir ../06-views/depots/savings_plans_budget_overview.sql
\ir ../06-views/depots/savings_plans_with_asset.sql
\ir ../06-views/depots/leaderboard.sql

\ir ../07-triggers/api/asset_prices_latest.sql

-- 4. Policies: replace everything on the locked-down tables ----------------------
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT schemaname, tablename, policyname FROM pg_policies
           WHERE (schemaname, tablename) IN (('depots','depots'), ('depots','transactions'), ('depots','savings_plans'))
  LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;
\ir ../09-policies/api/latest_prices.sql
\ir ../09-policies/depots/depots.sql
\ir ../09-policies/depots/transactions.sql
\ir ../09-policies/depots/savings_plans.sql

-- 5. Grants ----------------------------------------------------------------------
REVOKE ALL ON depots.depots, depots.transactions, depots.savings_plans FROM authenticated, anon;
\ir ../10-grants/api/latest_prices.sql
\ir ../10-grants/api/on_asset_prices_change.sql
\ir ../10-grants/depots/depots.sql
\ir ../10-grants/depots/transactions.sql
\ir ../10-grants/depots/savings_plans.sql
\ir ../10-grants/depots/current_values.sql
\ir ../10-grants/depots/values.sql
\ir ../10-grants/depots/aggregated_values.sql
\ir ../10-grants/depots/leaderboard.sql
\ir ../10-grants/depots/depot_overview.sql
\ir ../10-grants/depots/buy_asset.sql
\ir ../10-grants/depots/sell_asset.sql
\ir ../10-grants/depots/new_depot_for_user.sql
\ir ../10-grants/depots/grant_reward.sql
\ir ../10-grants/depots/get_depot_overview.sql
\ir ../10-grants/depots/update_savings_plan.sql
\ir ../10-grants/depots/upsert_savings_plan.sql
\ir ../10-grants/depots/delete_savings_plan.sql
\ir ../10-grants/depots/execute_savings_plans.sql
GRANT EXECUTE ON FUNCTION depots.get_transactions_with_position(bigint) TO authenticated;

\ir ../12-jobs/execute_savings_plans.sql

-- 6. Backfill ----------------------------------------------------------------------
SELECT api.rebuild_latest_prices();
SELECT depots.rebuild_holdings();          -- also sets depots.cash from the ledger

\echo 'Depots whose depots.cash differed from the ledger by >= 1 (carried over as a movement):'
SELECT d.id AS depot_id, o.cash AS old_cash, d.cash AS ledger_cash, round(o.cash - d.cash, 2) AS movement
FROM depots.depots d JOIN old_cash o ON o.id = d.id
WHERE abs(o.cash - d.cash) >= 1
ORDER BY d.id;

INSERT INTO depots.transactions (depot_id, asset_id, amount, price, commission, type)
SELECT d.id, NULL, round(o.cash - d.cash, 2), NULL, 0, 'movement'
FROM depots.depots d
JOIN old_cash o ON o.id = d.id
WHERE abs(o.cash - d.cash) >= 1;

SELECT depots.rebuild_depot_values();

COMMIT;
