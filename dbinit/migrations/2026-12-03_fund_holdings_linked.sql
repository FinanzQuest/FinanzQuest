-- =============================================================================
-- MIGRATION 2026-12-03: api.fund_holdings_linked
-- -----------------------------------------------------------------------------
-- Requires 2026-12-02_new_listings_spcx_ant.sql. Run from the repository
-- root as the migration superuser:
--
--     psql -d postgres -f dbinit/migrations/2026-12-03_fund_holdings_linked.sql
--
-- New view: fund holdings with the matching stock's asset_id, so the ETF
-- page links its largest positions to their asset pages. Re-runnable.
-- =============================================================================

\set ON_ERROR_STOP on
BEGIN;
\ir ../06-views/api/fund_holdings_linked.sql
\ir ../10-grants/api/fund_holdings_linked.sql
SELECT count(*) AS holdings, count(asset_id) AS linked FROM api.fund_holdings_linked;
COMMIT;
