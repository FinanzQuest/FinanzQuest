-- =============================================================================
-- MIGRATION 2026-12-04: api.asset_prices_weekly covers the full history
-- -----------------------------------------------------------------------------
-- Run from the repository root as the migration superuser:
--
--     psql -d postgres -f dbinit/migrations/2026-12-04_weekly_prices_full_history.sql
--
-- The 5J chart reads api.asset_prices_weekly (a materialized-only continuous
-- aggregate). Its refresh policy only looked back 3 weeks, so history the
-- updater backfilled after the view was created never got materialized and
-- ranges of a year or more showed no data. The policy now refreshes all
-- history, and one refresh runs here. Re-runnable.
-- =============================================================================

\set ON_ERROR_STOP on
BEGIN;
SELECT remove_continuous_aggregate_policy('api.asset_prices_weekly', if_exists => true);
SELECT add_continuous_aggregate_policy(
  'api.asset_prices_weekly',
  start_offset      => NULL,
  end_offset        => INTERVAL '1 day',
  schedule_interval => INTERVAL '1 day'
);
COMMIT;

-- Cannot run inside a transaction block.
CALL refresh_continuous_aggregate('api.asset_prices_weekly', NULL, NULL);
SELECT count(*) AS weekly_rows, min(tstamp) AS oldest FROM api.asset_prices_weekly;
