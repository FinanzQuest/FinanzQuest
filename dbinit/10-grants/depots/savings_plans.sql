-- =============================================================================
-- GRANTs targeting depots.savings_plans
-- =============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON depots.savings_plans TO service_worker;

GRANT SELECT, INSERT, UPDATE, DELETE ON depots.savings_plans TO authenticated;

-- (admin.sql)
GRANT SELECT ON depots.savings_plans TO authenticated;
