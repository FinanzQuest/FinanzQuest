-- =============================================================================
-- GRANTs targeting api.asset_prices_intraday and api.rollup_intraday
-- =============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON api.asset_prices_intraday TO service_worker;
GRANT SELECT ON api.asset_prices_intraday TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION api.rollup_intraday(date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION api.rollup_intraday(date) TO service_worker;
