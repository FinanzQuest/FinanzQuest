-- =============================================================================
-- GRANTs targeting api.asset_prices
-- =============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON api.asset_prices TO service_worker;

GRANT SELECT ON api.asset_prices TO anon, authenticated;
