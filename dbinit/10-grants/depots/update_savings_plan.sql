-- =============================================================================
-- GRANTs targeting depots.update_savings_plan (function)
-- =============================================================================

REVOKE EXECUTE ON FUNCTION depots.update_savings_plan(bigint, bigint, real, savingsperiod) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION depots.update_savings_plan(bigint, bigint, real, savingsperiod) TO authenticated;
