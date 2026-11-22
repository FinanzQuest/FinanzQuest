-- =============================================================================
-- GRANTs targeting depots.upsert_savings_plan (function)
-- =============================================================================

REVOKE EXECUTE ON FUNCTION depots.upsert_savings_plan(bigint, bigint, real, savingsperiod) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION depots.upsert_savings_plan(bigint, bigint, real, savingsperiod) TO authenticated;
