-- =============================================================================
-- MIGRATION 2026-11-30: search page, chart overlays
-- -----------------------------------------------------------------------------
-- Requires 2026-11-29_asset_details.sql. Run from the repository root as the
-- migration superuser:
--
--     psql -d postgres -f dbinit/migrations/2026-11-30_search_moving_averages.sql
--
-- New: api.asset_stats (materialized view: price, returns, sparkline per
-- asset) with its hourly refresh job, api.find_assets (search with filters
-- and sorting), api.asset_facets (filter options) and
-- api.asset_moving_averages (100/200-day lines for the chart).
-- Builds asset_stats once (about a second).
--
-- Runs in one transaction; not re-runnable.
-- Afterwards: dbinit/verify_schema.sql and dbinit/tests/*.sql.
-- =============================================================================

\set ON_ERROR_STOP on
BEGIN;

\ir ../05-materialized-views/api/asset_stats.sql
\ir ../04-functions/api/refresh_asset_stats.sql
\ir ../04-functions/api/asset_moving_averages.sql
\ir ../04-functions/api/asset_facets.sql
\ir ../04-functions/api/find_assets.sql

\ir ../10-grants/api/asset_moving_averages.sql
\ir ../10-grants/api/find_assets.sql
\ir ../10-grants/api/asset_facets.sql
\ir ../10-grants/api/asset_stats.sql

\ir ../12-jobs/refresh_asset_stats.sql

SELECT count(*) AS assets, count(return_1y) AS with_1y_return FROM api.asset_stats;

COMMIT;
