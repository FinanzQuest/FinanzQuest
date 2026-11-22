-- =============================================================================
-- public.PriceProvider
-- -----------------------------------------------------------------------------
-- Market data API the updater fetches an asset's prices from
-- (api.assets.price_provider).
-- =============================================================================

CREATE TYPE PriceProvider AS ENUM ('alpaca', 'yahoo');
