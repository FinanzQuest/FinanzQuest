-- =============================================================================
-- MIGRATION 2026-11-26: api.assets.price_provider is resolved, may be NULL
-- -----------------------------------------------------------------------------
-- Requires 2026-11-25_asset_price_provider.sql. Run from the repository root
-- as the migration superuser:
--
--     psql -d postgres -f dbinit/migrations/2026-11-26_price_provider_resolved.sql
--
-- The provider is no longer derived from the symbol: `updater --mode
-- resolve-providers` asks Alpaca, then Yahoo Finance, and stores NULL when
-- neither serves the asset (the updater skips those). The values the
-- 2026-11-25 migration guessed stay until the resolver replaces them; run it
-- once after deploying the updater image (the container also runs it on
-- start for assets without a provider):
--
--     docker exec updater run_updater.sh resolve-providers --recheck-all
--
-- Afterwards: dbinit/verify_schema.sql.
-- =============================================================================

\set ON_ERROR_STOP on

ALTER TABLE api.assets ALTER COLUMN price_provider DROP NOT NULL;
