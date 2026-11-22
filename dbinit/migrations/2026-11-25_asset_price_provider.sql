-- =============================================================================
-- MIGRATION 2026-11-25: api.assets.price_provider
-- -----------------------------------------------------------------------------
-- Requires 2026-11-24_ledger_lockdown_intraday.sql. Run from the repository
-- root as the migration superuser:
--
--     psql -d postgres -f dbinit/migrations/2026-11-25_asset_price_provider.sql
--
-- The updater used to guess the price API per asset (symbol contains '.' or
-- '-', or asset_type = 'fund' -> Yahoo Finance, else Alpaca). The choice is
-- now stored: api.assets.price_provider (PriceProvider, NOT NULL, no default).
-- Existing rows get the provider the old rule picked, so nothing changes for
-- the updater. Deploy the updater image that reads the column afterwards.
--
-- Runs in one transaction; not re-runnable.
-- Afterwards: dbinit/verify_schema.sql.
-- =============================================================================

\set ON_ERROR_STOP on
BEGIN;

\ir ../02-types/price_provider.sql

ALTER TABLE api.assets ADD COLUMN price_provider PriceProvider;

UPDATE api.assets
SET price_provider = CASE
  WHEN symbol ~ '[.-]' OR asset_type = 'fund' THEN 'yahoo'::PriceProvider
  ELSE 'alpaca'::PriceProvider
END;

ALTER TABLE api.assets ALTER COLUMN price_provider SET NOT NULL;

SELECT price_provider, count(*) AS assets FROM api.assets GROUP BY 1 ORDER BY 1;

COMMIT;
