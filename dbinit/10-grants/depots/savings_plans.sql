-- =============================================================================
-- GRANTs targeting depots.savings_plans
-- -----------------------------------------------------------------------------
-- Clients read only (RLS: members, teachers); writes via the savings plan
-- functions.
-- =============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON depots.savings_plans TO service_worker;

REVOKE INSERT, UPDATE, DELETE ON depots.savings_plans FROM authenticated, anon;
GRANT SELECT ON depots.savings_plans TO authenticated;
