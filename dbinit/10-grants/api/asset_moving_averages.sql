-- =============================================================================
-- GRANTs targeting api.asset_moving_averages(bigint, date)
-- =============================================================================

REVOKE ALL ON FUNCTION api.asset_moving_averages(bigint, date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION api.asset_moving_averages(bigint, date) TO anon, authenticated;
