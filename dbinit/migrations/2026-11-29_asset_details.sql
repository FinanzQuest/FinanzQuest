-- =============================================================================
-- MIGRATION 2026-11-29: fund facts, holdings, country weights, stock details
-- -----------------------------------------------------------------------------
-- Requires 2026-11-28_depot_names.sql. Run from the repository root as the
-- migration superuser:
--
--     psql -d postgres -f dbinit/migrations/2026-11-29_asset_details.sql
--
-- New: DetailsProvider enum, api.funds (one row per fund, hand-maintained
-- facts), api.fund_holdings, api.fund_countries, api.asset_details,
-- api.asset_performance(asset_id), and on api.assets the columns
-- details_provider and fund_id. Seeds the funds and links their listings
-- (seed/funds.sql). Stocks get their details_provider from
-- `updater --mode resolve-providers`; the data from `updater --mode details`.
--
-- Runs in one transaction; not re-runnable.
-- Afterwards: dbinit/verify_schema.sql and dbinit/tests/*.sql.
-- =============================================================================

\set ON_ERROR_STOP on
BEGIN;

\ir ../02-types/details_provider.sql
\ir ../03-tables/api/funds.sql

ALTER TABLE api.assets
  ADD COLUMN details_provider DetailsProvider,
  ADD COLUMN fund_id bigint REFERENCES api.funds (id);
CREATE INDEX assets_fund_id_idx ON api.assets (fund_id) WHERE fund_id IS NOT NULL;

\ir ../03-tables/api/fund_holdings.sql
\ir ../03-tables/api/fund_countries.sql
\ir ../03-tables/api/asset_details.sql
\ir ../04-functions/api/asset_performance.sql

\ir ../09-policies/api/funds.sql
\ir ../09-policies/api/fund_holdings.sql
\ir ../09-policies/api/fund_countries.sql
\ir ../09-policies/api/asset_details.sql

\ir ../10-grants/api/funds.sql
\ir ../10-grants/api/fund_holdings.sql
\ir ../10-grants/api/fund_countries.sql
\ir ../10-grants/api/asset_details.sql
\ir ../10-grants/api/asset_performance.sql

\ir ../seed/funds.sql

SELECT f.issuer, a.details_provider, count(DISTINCT f.id) AS funds, count(*) AS listings
FROM api.assets a JOIN api.funds f ON f.id = a.fund_id
GROUP BY 1, 2 ORDER BY 1, 2;

COMMIT;
