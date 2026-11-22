-- =============================================================================
-- MIGRATION 2026-11-24: ledger, write lockdown, exact money, intraday prices
-- -----------------------------------------------------------------------------
-- One step from the matview schema (depots.positions, aggregated_transactions_mat,
-- position_values_mat, *_with_curr views, real money columns) to the current
-- manifest. Run from the repository root as the migration superuser:
--
--     psql -d postgres -f dbinit/migrations/2026-11-24_ledger_lockdown_intraday.sql
--
-- Then deploy the updater image (no matview refresh, 15-minute intraday cron).
--
-- What changes
-- 1. Depot values come from the transaction ledger:
--      depots.holdings      current totals per depot/asset (trigger-maintained)
--      depots.daily_values  value per closed day (trigger + hourly job)
--      depots.values        daily_values + live row (depots.current_values)
--    api.latest_prices (trigger-maintained, from daily and intraday prices)
--    replaces per-holding lookups into the price hypertable.
-- 2. Security
--    - role checks used `current_user = 'postgres'`, always true in a
--      SECURITY DEFINER function -> users.is_superuser_session()
--      (grant_teacher, revoke_teacher, stats, get_admin_overview and
--      get_depot_overview were callable by every logged-in user;
--      grant_teacher also flagged *every* user as super admin)
--    - depots.transactions, depots.depots (INSERT/UPDATE) and
--      depots.savings_plans are no longer writable by clients; all writes go
--      through checked SECURITY DEFINER functions
--    - savings plan functions check membership and the monthly budget
--    - new_depot_for_user: only for yourself (or as admin/teacher), not anon
-- 3. Exact money: transactions.amount/price/commission and depots.cash are
--    numeric; depots.cash is maintained by the ledger trigger. Existing
--    depots.cash that differs from the ledger by >= 1 (e.g. rewards granted
--    before rewards were logged) is carried over as one 'movement' row, so no
--    balance changes. The affected depots are listed.
-- 4. depots.positions (separate, drifting state) is dropped.
-- 5. Savings plans are executed by a daily job (they never ran before).
-- 6. Intraday prices: api.asset_prices_intraday (15-minute bars, 30-day
--    retention), api.rollup_intraday, depots.get_intraday_values.
--
-- Step 0 also cleans up a database on which db-init re-applied the new
-- manifest over the old schema (half-created tables, triggers, jobs and
-- function overloads); on a clean old database it does nothing.
--
-- Runs in one transaction: on any error nothing is changed.
-- Afterwards: dbinit/verify_schema.sql and dbinit/tests/*.sql.
-- =============================================================================

\set ON_ERROR_STOP on
BEGIN;

DO $$
BEGIN
  IF to_regclass('depots.positions') IS NULL THEN
    RAISE EXCEPTION 'depots.positions does not exist: this database is not on the old (matview) schema, nothing to migrate';
  END IF;
END $$;

-- Old depots.cash, for the reconciliation at the end
CREATE TEMP TABLE old_cash ON COMMIT DROP AS
SELECT id, cash::numeric AS cash FROM depots.depots;

-- 0. Leftovers of a re-applied new manifest ---------------------------------------
DROP TRIGGER IF EXISTS transactions_ledger_insert ON depots.transactions;
DROP TRIGGER IF EXISTS transactions_ledger_update ON depots.transactions;
DROP TRIGGER IF EXISTS transactions_ledger_delete ON depots.transactions;
DROP TRIGGER IF EXISTS asset_prices_latest ON api.asset_prices;

SELECT delete_job(job_id)
FROM timescaledb_information.jobs
WHERE proc_schema = 'depots'
  AND proc_name IN ('refresh_depot_mats', 'refresh_depot_values', 'run_savings_plans');

-- derived data only (rebuilt below); intraday bars are refetched by the updater
DROP TABLE IF EXISTS api.asset_prices_intraday, api.latest_prices,
                     depots.daily_values, depots.holdings CASCADE;

DROP FUNCTION IF EXISTS api.daily_price_as_of(date);
DROP FUNCTION IF EXISTS api.on_asset_prices_change();
DROP FUNCTION IF EXISTS api.rebuild_latest_prices();
DROP FUNCTION IF EXISTS api.rollup_intraday(date);
DROP FUNCTION IF EXISTS depots.transaction_expense(depots.TransactionType, numeric, numeric);
DROP FUNCTION IF EXISTS depots.apply_ledger_delta(depots.transactions[], integer);
DROP FUNCTION IF EXISTS depots.rebuild_holdings();
DROP FUNCTION IF EXISTS depots.rebuild_depot_values_for(bigint[], date[]);
DROP FUNCTION IF EXISTS depots.rebuild_depot_values(bigint, date);
DROP PROCEDURE IF EXISTS depots.refresh_depot_values(integer, jsonb);
DROP FUNCTION IF EXISTS depots.on_transactions_change();
DROP FUNCTION IF EXISTS depots.check_savings_budget(bigint, bigint, numeric, savingsperiod);
DROP FUNCTION IF EXISTS depots.get_intraday_values(bigint, timestamptz);
DROP FUNCTION IF EXISTS depots.buy_asset(bigint, bigint, numeric);
DROP FUNCTION IF EXISTS depots.sell_asset(bigint, bigint, numeric);
DROP PROCEDURE IF EXISTS depots.run_savings_plans(integer, jsonb);

-- 1. Old pipeline and changed objects ---------------------------------------------
DROP VIEW IF EXISTS depots.leaderboard;
DROP VIEW IF EXISTS depots.aggregated_values;
DROP VIEW IF EXISTS depots.aggregated_values_with_curr;
DROP VIEW IF EXISTS depots.depot_values_with_curr;
DROP VIEW IF EXISTS depots.position_values_with_curr;
DROP VIEW IF EXISTS depots.current_position_value;
DROP VIEW IF EXISTS depots.values;
DROP VIEW IF EXISTS depots.current_values;
DROP VIEW IF EXISTS depots.depot_overview;
DROP MATERIALIZED VIEW IF EXISTS depots.position_values_mat;
DROP MATERIALIZED VIEW IF EXISTS depots.aggregated_transactions_mat;
DROP PROCEDURE IF EXISTS depots.refresh_depot_mats(integer, jsonb);

DROP FUNCTION IF EXISTS depots.buy_asset(bigint, bigint, real);
DROP FUNCTION IF EXISTS depots.sell_asset(bigint, bigint, real);
DROP FUNCTION IF EXISTS depots.buy_asset_at(bigint, bigint, real, timestamptz);
DROP FUNCTION IF EXISTS depots.log_transaction(bigint, bigint, real, real, real);
DROP FUNCTION IF EXISTS depots.update_depot_positions();
DROP FUNCTION IF EXISTS depots.get_transactions_with_position(bigint);
DROP FUNCTION IF EXISTS depots.get_position_profits(bigint);
DROP FUNCTION IF EXISTS depots.get_depot_overview();
DROP FUNCTION IF EXISTS depots.transaction_expense(depots.TransactionType, real, real);
DROP FUNCTION IF EXISTS depots.transaction_affects_cash(depots.TransactionType);
DROP FUNCTION IF EXISTS depots.execute_savings_plans();

DROP TABLE depots.positions CASCADE;

-- 2. Exact money columns ------------------------------------------------------------
-- real -> text -> numeric keeps the shortest exact decimal (what users saw);
-- real::numeric would round to 6 significant digits.
ALTER TABLE depots.transactions
  ALTER COLUMN amount     TYPE numeric USING amount::text::numeric,
  ALTER COLUMN price      TYPE numeric USING price::text::numeric,
  ALTER COLUMN commission TYPE numeric USING commission::text::numeric;
ALTER TABLE depots.depots ALTER COLUMN cash TYPE numeric;

-- 3. Objects (same files and order as manifest.txt) ---------------------------------
\ir ../03-tables/api/asset_prices_intraday.sql
\ir ../03-tables/api/latest_prices.sql
\ir ../03-tables/depots/holdings.sql
\ir ../03-tables/depots/daily_values.sql

\ir ../04-functions/api/daily_price_as_of.sql
\ir ../04-functions/api/on_asset_prices_change.sql
\ir ../04-functions/api/rebuild_latest_prices.sql
\ir ../04-functions/api/rollup_intraday.sql
\ir ../04-functions/users/is_superuser_session.sql
\ir ../04-functions/users/grant_teacher.sql
\ir ../04-functions/users/revoke_teacher.sql
\ir ../04-functions/users/get_admin_overview.sql
\ir ../04-functions/users/stats.sql
\ir ../04-functions/depots/transaction_expense.sql
\ir ../04-functions/depots/transaction_affects_commission.sql
\ir ../04-functions/depots/apply_ledger_delta.sql
\ir ../04-functions/depots/rebuild_holdings.sql
\ir ../04-functions/depots/rebuild_depot_values_for.sql
\ir ../04-functions/depots/rebuild_depot_values.sql
\ir ../04-functions/depots/refresh_depot_values.sql
\ir ../04-functions/depots/on_transactions_change.sql
\ir ../04-functions/depots/check_savings_budget.sql
\ir ../04-functions/depots/get_position_profits.sql
\ir ../04-functions/depots/get_intraday_values.sql
\ir ../04-functions/depots/get_transactions_with_position.sql
\ir ../04-functions/depots/buy_asset.sql
\ir ../04-functions/depots/sell_asset.sql
\ir ../04-functions/depots/execute_savings_plans.sql
\ir ../04-functions/depots/is_depot_member.sql
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

\ir ../07-triggers/depots/transactions_ledger.sql
\ir ../07-triggers/api/asset_prices_latest.sql

-- 4. Policies: replace everything on the changed tables -----------------------------
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT schemaname, tablename, policyname FROM pg_policies
           WHERE (schemaname, tablename) IN (('depots','depots'), ('depots','transactions'), ('depots','savings_plans'))
  LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;
\ir ../09-policies/api/asset_prices_intraday.sql
\ir ../09-policies/api/latest_prices.sql
\ir ../09-policies/depots/depots.sql
\ir ../09-policies/depots/transactions.sql
\ir ../09-policies/depots/holdings.sql
\ir ../09-policies/depots/daily_values.sql
\ir ../09-policies/depots/savings_plans.sql

-- 5. Grants ---------------------------------------------------------------------------
REVOKE ALL ON depots.depots, depots.transactions, depots.savings_plans FROM authenticated, anon;
\ir ../10-grants/api/asset_prices_intraday.sql
\ir ../10-grants/api/latest_prices.sql
\ir ../10-grants/api/on_asset_prices_change.sql
\ir ../10-grants/depots/depots.sql
\ir ../10-grants/depots/transactions.sql
\ir ../10-grants/depots/holdings.sql
\ir ../10-grants/depots/daily_values.sql
\ir ../10-grants/depots/savings_plans.sql
\ir ../10-grants/depots/values.sql
\ir ../10-grants/depots/current_values.sql
\ir ../10-grants/depots/aggregated_values.sql
\ir ../10-grants/depots/depot_overview.sql
\ir ../10-grants/depots/savings_plans_budget_overview.sql
\ir ../10-grants/depots/savings_plans_with_asset.sql
\ir ../10-grants/depots/leaderboard.sql
\ir ../10-grants/depots/buy_asset.sql
\ir ../10-grants/depots/sell_asset.sql
\ir ../10-grants/depots/apply_ledger_delta.sql
\ir ../10-grants/depots/rebuild_holdings.sql
\ir ../10-grants/depots/rebuild_depot_values_for.sql
\ir ../10-grants/depots/rebuild_depot_values.sql
\ir ../10-grants/depots/on_transactions_change.sql
\ir ../10-grants/depots/new_depot_for_user.sql
\ir ../10-grants/depots/get_depot_overview.sql
\ir ../10-grants/depots/grant_reward.sql
\ir ../10-grants/depots/update_savings_plan.sql
\ir ../10-grants/depots/upsert_savings_plan.sql
\ir ../10-grants/depots/delete_savings_plan.sql
\ir ../10-grants/depots/execute_savings_plans.sql
\ir ../10-grants/depots/get_intraday_values.sql
\ir ../10-grants/users/admin_overview.sql
\ir ../10-grants/users/grant_teacher.sql
\ir ../10-grants/users/stats.sql
GRANT EXECUTE ON FUNCTION depots.get_transactions_with_position(bigint) TO authenticated;

\ir ../12-jobs/refresh_depot_values.sql
\ir ../12-jobs/execute_savings_plans.sql
\ir ../12-jobs/asset_prices_intraday_retention.sql

-- 6. Backfill -------------------------------------------------------------------------
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
