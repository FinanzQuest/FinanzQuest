-- =============================================================================
-- GRANTs targeting api.asset_performance(bigint)
-- =============================================================================

REVOKE ALL ON FUNCTION api.asset_performance(bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION api.asset_performance(bigint) TO anon, authenticated;
