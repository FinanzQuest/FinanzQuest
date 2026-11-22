-- =============================================================================
-- GRANTs targeting api.find_assets(text, AssetType[], text[], text[], text[], text[], text, text, boolean, integer, integer)
-- =============================================================================

REVOKE ALL ON FUNCTION api.find_assets(text, AssetType[], text[], text[], text[], text[], text, text, boolean, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION api.find_assets(text, AssetType[], text[], text[], text[], text[], text, text, boolean, integer, integer) TO anon, authenticated;
