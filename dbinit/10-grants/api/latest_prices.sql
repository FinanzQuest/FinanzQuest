-- =============================================================================
-- GRANTs targeting api.latest_prices
-- =============================================================================

GRANT SELECT ON api.latest_prices TO anon, authenticated, service_worker;
