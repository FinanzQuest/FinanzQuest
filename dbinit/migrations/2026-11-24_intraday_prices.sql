-- =============================================================================
-- MIGRATION 2026-11-24: intraday prices
-- -----------------------------------------------------------------------------
-- Requires 2026-11-23_lockdown_numeric_ledger.sql. Run from the repository
-- root as the migration superuser:
--
--     psql -d postgres -f dbinit/migrations/2026-11-24_intraday_prices.sql
--
-- - api.asset_prices_intraday: 15-minute bars (hypertable, 1-day chunks,
--   30-day retention), written by the updater's intraday run
-- - api.latest_prices.tstamp becomes timestamptz ("valid as of"); fed by
--   both price tables (see docs/intraday-pricing.md)
-- - api.rollup_intraday(date): today's daily candle from the bars
-- - depots.get_intraday_values(depot, since): the depot's value curve today
--
-- Then deploy the updater image (adds the 15-minute intraday cron).
-- Runs in one transaction; not re-runnable.
-- Afterwards: dbinit/verify_schema.sql and dbinit/tests/intraday.sql.
-- =============================================================================

\set ON_ERROR_STOP on
BEGIN;

\ir ../03-tables/api/asset_prices_intraday.sql

\ir ../04-functions/api/daily_price_as_of.sql
ALTER TABLE api.latest_prices
  ALTER COLUMN tstamp TYPE timestamptz USING api.daily_price_as_of(tstamp);

\ir ../04-functions/api/on_asset_prices_change.sql
\ir ../04-functions/api/rebuild_latest_prices.sql
\ir ../04-functions/api/rollup_intraday.sql
\ir ../04-functions/depots/get_intraday_values.sql

DROP TRIGGER asset_prices_latest ON api.asset_prices;
\ir ../07-triggers/api/asset_prices_latest.sql

\ir ../09-policies/api/asset_prices_intraday.sql
\ir ../10-grants/api/asset_prices_intraday.sql
\ir ../10-grants/depots/get_intraday_values.sql
\ir ../12-jobs/asset_prices_intraday_retention.sql

SELECT api.rebuild_latest_prices();

COMMIT;
