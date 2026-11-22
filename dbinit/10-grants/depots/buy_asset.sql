-- =============================================================================
-- GRANTs targeting depots.buy_asset (function)
-- =============================================================================

REVOKE EXECUTE ON FUNCTION depots.buy_asset(bigint, bigint, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION depots.buy_asset(bigint, bigint, numeric) TO authenticated;
