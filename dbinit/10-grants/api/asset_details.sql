-- =============================================================================
-- GRANTs targeting api.asset_details
-- =============================================================================

GRANT SELECT ON api.asset_details TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON api.asset_details TO service_worker;
