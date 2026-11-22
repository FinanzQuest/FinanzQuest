-- =============================================================================
-- GRANTs targeting api.asset_facets()
-- =============================================================================

REVOKE ALL ON FUNCTION api.asset_facets() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION api.asset_facets() TO anon, authenticated;
