-- =============================================================================
-- GRANTs targeting depots.sell_asset (function)
-- =============================================================================

REVOKE EXECUTE ON FUNCTION depots.sell_asset(bigint, bigint, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION depots.sell_asset(bigint, bigint, numeric) TO authenticated;
