-- =============================================================================
-- GRANTs targeting depots.upsert_savings_plan (function)
-- =============================================================================

GRANT EXECUTE ON FUNCTION depots.upsert_savings_plan(bigint, bigint, real, savingsperiod) TO authenticated;
