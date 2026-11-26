-- =============================================================================
-- MIGRATION 2026-12-10: ETFs unlock after the introduction
-- -----------------------------------------------------------------------------
-- Run from the repository root as the migration superuser:
--
--     psql -d postgres -f dbinit/migrations/2026-12-10_etfs_after_introduction.sql
--
-- Requires 2026-12-07_commodities_and_bonds.sql. Funds (ETFs) can be bought
-- once the introduction (grundlagen, which has the ETF & Sparplan lesson) is
-- passed; the ETF course (etfs) becomes optional and advanced and no longer
-- gates anything. Path order: etfs follows grundlagen (was aktien); anleihen,
-- krypto and rohstoffe follow aktien (were etfs, which is optional now).
-- Updates users.require_asset_tutorial and the catalog. Re-runnable.
-- =============================================================================

\set ON_ERROR_STOP on
BEGIN;
\ir ../04-functions/users/require_asset_tutorial.sql
\ir ../10-grants/users/require_asset_tutorial.sql
\ir ../seed/tutorial_catalog.sql
COMMIT;
