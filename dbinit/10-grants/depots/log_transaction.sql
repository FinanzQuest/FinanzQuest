-- =============================================================================
-- GRANTs targeting depots.log_transaction (function)
-- =============================================================================

GRANT EXECUTE ON FUNCTION depots.log_transaction(BIGINT, BIGINT, REAL, REAL, REAL) TO authenticated;
