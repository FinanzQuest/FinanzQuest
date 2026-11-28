-- =============================================================================
-- MIGRATION 2026-12-11: guest mode (anonymous users)
-- -----------------------------------------------------------------------------
-- Run from the repository root as the migration superuser:
--
--     psql -d postgres -f dbinit/migrations/2026-12-11_guest_mode.sql
--
-- Adds users.is_guest; guests may own only one depot (new_depot_for_user);
-- guest depots are hidden from depots.leaderboard; guests are excluded from
-- the admin/teacher user lists and counts; users.cleanup_guests plus a daily
-- job (03:30) delete guests inactive for 30 days together with their depots.
-- GoTrue itself needs GOTRUE_EXTERNAL_ANONYMOUS_USERS_ENABLED (compose.core.yml).
-- Re-runnable.
-- =============================================================================

\set ON_ERROR_STOP on
BEGIN;

\ir ../04-functions/users/is_guest.sql
\ir ../10-grants/users/is_guest.sql

\ir ../04-functions/depots/new_depot_for_user.sql
\ir ../06-views/depots/leaderboard.sql

\ir ../04-functions/users/get_admin_overview.sql
\ir ../04-functions/users/tutorial_class_overview.sql
\ir ../04-functions/users/stats.sql

\ir ../04-functions/users/cleanup_guests.sql
\ir ../10-grants/users/cleanup_guests.sql

-- same as 12-jobs/cleanup_guests.sql, guarded: add_job is not idempotent
SELECT add_job(
  proc              => 'users.cleanup_guests',
  schedule_interval => INTERVAL '1 day',
  config            => '{"days": 30}'::jsonb,
  initial_start     => date_trunc('day', NOW()) + INTERVAL '1 day 3 hours 30 minutes',
  scheduled         => true,
  fixed_schedule    => true
)
WHERE NOT EXISTS (
  SELECT 1 FROM timescaledb_information.jobs
  WHERE proc_schema = 'users' AND proc_name = 'cleanup_guests'
);

COMMIT;
