-- =============================================================================
-- GRANTs targeting api.fund_countries
-- =============================================================================

GRANT SELECT ON api.fund_countries TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON api.fund_countries TO service_worker;
