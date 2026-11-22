-- =============================================================================
-- GRANTs targeting depots.execute_savings_plans / run_savings_plans /
-- check_savings_budget — internal (job and savings plan functions only).
-- =============================================================================

REVOKE EXECUTE ON FUNCTION depots.execute_savings_plans() FROM PUBLIC;
REVOKE EXECUTE ON PROCEDURE depots.run_savings_plans(int, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION depots.check_savings_budget(bigint, bigint, numeric, SavingsPeriod) FROM PUBLIC;
