-- =============================================================================
-- MIGRATION 2026-12-06: assets are unlocked by tutorial paths
-- -----------------------------------------------------------------------------
-- Run from the repository root as the migration superuser:
--
--     psql -d postgres -f dbinit/migrations/2026-12-06_asset_tutorial_gate.sql
--
-- Requires 2026-12-05_tutorial_progress.sql.
-- A user may buy (and start a savings plan for) an asset only after passing
-- every lesson of its tutorial path: stock -> aktien, fund -> etfs,
-- crypto -> krypto, commodity -> rohstoffe. The paths unlock in that order:
-- etfs now requires aktien (was grundlagen); krypto and rohstoffe, two new
-- paths, require etfs. Selling and savings plans that already run are not
-- affected. Adds users.require_asset_tutorial, calls it from
-- depots.buy_asset and depots.upsert_savings_plan, and upserts the catalog.
-- Re-runnable.
-- =============================================================================

\set ON_ERROR_STOP on
BEGIN;

\ir ../04-functions/users/require_asset_tutorial.sql
\ir ../04-functions/depots/buy_asset.sql
\ir ../04-functions/depots/upsert_savings_plan.sql

\ir ../10-grants/users/require_asset_tutorial.sql
\ir ../10-grants/depots/buy_asset.sql
\ir ../10-grants/depots/upsert_savings_plan.sql

\ir ../seed/tutorial_catalog.sql

COMMIT;
