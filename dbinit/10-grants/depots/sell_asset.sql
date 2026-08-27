-- =============================================================================
-- GRANTs targeting depots.sell_asset (function)
-- =============================================================================

GRANT EXECUTE ON FUNCTION depots.sell_asset(BIGINT, BIGINT, REAL) TO authenticated;
