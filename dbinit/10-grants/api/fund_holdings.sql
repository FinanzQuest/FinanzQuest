-- =============================================================================
-- GRANTs targeting api.fund_holdings
-- =============================================================================

GRANT SELECT ON api.fund_holdings TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON api.fund_holdings TO service_worker;
