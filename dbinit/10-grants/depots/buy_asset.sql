-- =============================================================================
-- GRANTs targeting depots.buy_asset (function)
-- =============================================================================

GRANT EXECUTE ON FUNCTION depots.buy_asset(BIGINT, BIGINT, REAL) TO authenticated;
