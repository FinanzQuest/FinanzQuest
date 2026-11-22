-- =============================================================================
-- MIGRATION 2026-12-01: admin overview position count
-- -----------------------------------------------------------------------------
-- Requires 2026-11-30_search_moving_averages.sql. Run from the repository
-- root as the migration superuser:
--
--     psql -d postgres -f dbinit/migrations/2026-12-01_admin_position_count.sql
--
-- users.get_admin_overview counted one position for users without any
-- holdings (the LEFT JOIN's (NULL, NULL) row value). Same signature:
-- CREATE OR REPLACE keeps the grants. Re-runnable.
-- =============================================================================

\set ON_ERROR_STOP on
BEGIN;
\ir ../04-functions/users/get_admin_overview.sql
COMMIT;
