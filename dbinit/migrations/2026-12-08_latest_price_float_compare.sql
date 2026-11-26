-- =============================================================================
-- MIGRATION 2026-12-08: latest_prices trigger ignores float noise
-- -----------------------------------------------------------------------------
-- Run from the repository root as the migration superuser:
--
--     psql -d postgres -f dbinit/migrations/2026-12-08_latest_price_float_compare.sql
--
-- api.on_asset_prices_change compared the float4 close of a daily candle with
-- the numeric close of the newest bar. The updater stores bars with the float
-- noise of an f32 (4.572 vs 4.57200002670288), so every rolled-up candle that
-- repeated the newest bar's price looked like a new price: latest_prices got
-- the candle's time (now()) instead of the bar's, and api.rebuild_latest_prices
-- disagreed with the trigger-maintained state. A price now only counts as new
-- beyond 0.001% (float noise). Then latest_prices is rebuilt once. Re-runnable.
-- =============================================================================

\set ON_ERROR_STOP on
BEGIN;
\ir ../04-functions/api/on_asset_prices_change.sql
SELECT api.rebuild_latest_prices();
COMMIT;
