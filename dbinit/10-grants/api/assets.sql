-- =============================================================================
-- GRANTs targeting api.assets
-- =============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON api.assets       TO service_worker;

GRANT SELECT ON api.assets TO anon, authenticated;
