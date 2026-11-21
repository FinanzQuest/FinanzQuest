-- =============================================================================
-- MIGRATION 2026-11-22: depot values from the transaction ledger
-- -----------------------------------------------------------------------------
-- Replaces the matview pipeline (aggregated_transactions_mat,
-- position_values_mat, refresh_depot_mats job and the *_with_curr /
-- current_position_value views) with:
--   depots.holdings      current totals per depot/asset (trigger-maintained)
--   depots.daily_values  value per closed day (trigger + hourly job)
--   depots.values        daily_values + live today row (same columns as before)
-- and logs grant_reward as a 'movement' transaction.
--
-- For databases initialised before this change. Fresh databases get the same
-- result from manifest.txt. Runs in one transaction; not re-runnable. Run from
-- the repository root as the migration superuser:
--
--     psql -d postgres -f dbinit/migrations/2026-11-22_ledger_depot_values.sql
--
-- Afterwards: dbinit/verify_schema.sql and dbinit/tests/depot_values.sql.
-- =============================================================================

\set ON_ERROR_STOP on
BEGIN;

-- 1. Old pipeline -------------------------------------------------------------
SELECT delete_job(job_id)
FROM timescaledb_information.jobs
WHERE proc_name = 'refresh_depot_mats';

DROP VIEW IF EXISTS depots.leaderboard;
DROP VIEW IF EXISTS depots.aggregated_values;
DROP VIEW IF EXISTS depots.aggregated_values_with_curr;
DROP VIEW IF EXISTS depots.depot_values_with_curr;
DROP VIEW IF EXISTS depots.position_values_with_curr;
DROP VIEW IF EXISTS depots.current_position_value;
DROP VIEW IF EXISTS depots.values;
DROP MATERIALIZED VIEW IF EXISTS depots.position_values_mat;
DROP MATERIALIZED VIEW IF EXISTS depots.aggregated_transactions_mat;
DROP PROCEDURE IF EXISTS depots.refresh_depot_mats(int, jsonb);

-- 2. New objects (same files as the manifest, in manifest order) ---------------
\ir ../03-tables/depots/holdings.sql
\ir ../03-tables/depots/daily_values.sql

\ir ../04-functions/depots/apply_ledger_delta.sql
\ir ../04-functions/depots/rebuild_holdings.sql
\ir ../04-functions/depots/rebuild_depot_values_for.sql
\ir ../04-functions/depots/rebuild_depot_values.sql
\ir ../04-functions/depots/refresh_depot_values.sql
\ir ../04-functions/depots/on_transactions_change.sql
\ir ../04-functions/depots/grant_reward.sql

\ir ../06-views/depots/values.sql
\ir ../06-views/depots/aggregated_values.sql
\ir ../06-views/depots/leaderboard.sql

\ir ../07-triggers/depots/transactions_ledger.sql

\ir ../09-policies/depots/holdings.sql
\ir ../09-policies/depots/daily_values.sql
-- (the rest of 09-policies/depots/transactions.sql already exists)
CREATE POLICY "Teachers can log cash movements" ON depots.transactions
FOR INSERT TO authenticated
WITH CHECK (users.has_role('teacher') AND type = 'movement');

\ir ../10-grants/depots/holdings.sql
\ir ../10-grants/depots/daily_values.sql
\ir ../10-grants/depots/values.sql
\ir ../10-grants/depots/aggregated_values.sql
\ir ../10-grants/depots/leaderboard.sql
\ir ../10-grants/depots/apply_ledger_delta.sql
\ir ../10-grants/depots/rebuild_holdings.sql
\ir ../10-grants/depots/rebuild_depot_values_for.sql
\ir ../10-grants/depots/rebuild_depot_values.sql
\ir ../10-grants/depots/on_transactions_change.sql

\ir ../12-jobs/refresh_depot_values.sql

-- 3. Backfill from the existing ledger ------------------------------------------
SELECT depots.rebuild_holdings();
SELECT depots.rebuild_depot_values();

COMMIT;
