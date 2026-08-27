-- =============================================================================
-- GRANTs targeting api.search_assets (function)
-- =============================================================================

-- search_assets accessible to all
GRANT EXECUTE ON FUNCTION api.search_assets(text, text, integer) TO anon, authenticated;
