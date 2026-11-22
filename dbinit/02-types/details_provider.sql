-- =============================================================================
-- public.DetailsProvider
-- -----------------------------------------------------------------------------
-- Source the updater fetches an asset's details from (api.assets.
-- details_provider), separate from where its prices come from
-- (price_provider):
--   ishares  - BlackRock holdings CSV (api.funds.details_source)
--   vanguard - Vanguard UK product page (api.funds.details_source)
--   yahoo    - Yahoo Finance quoteSummary: company metrics for stocks
--              (api.asset_details), top holdings for funds without an
--              issuer source
-- =============================================================================

CREATE TYPE DetailsProvider AS ENUM ('ishares', 'vanguard', 'yahoo');
