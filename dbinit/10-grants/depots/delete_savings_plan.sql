-- =============================================================================
-- GRANTs targeting depots.delete_savings_plan (function)
-- =============================================================================

REVOKE EXECUTE ON FUNCTION depots.delete_savings_plan(bigint[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION depots.delete_savings_plan(bigint[]) TO authenticated;
