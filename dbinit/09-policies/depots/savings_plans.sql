-- =============================================================================
-- RLS policies for depots.savings_plans
-- Depends on: depots.savings_plans (03-tables/depots/savings_plans.sql),
--             depots.is_depot_member (04-functions/depots/is_depot_member.sql),
--             users.has_role (04-functions/users/has_role.sql)
-- -----------------------------------------------------------------------------
-- Read: members and teachers. Writes only through the SECURITY DEFINER
-- functions upsert_/update_/delete_savings_plan, which check membership and
-- the monthly budget — no client write policies or grants.
-- =============================================================================

ALTER TABLE depots.savings_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their depot savings plans" ON depots.savings_plans
FOR SELECT TO authenticated
USING (depots.is_depot_member (depot_id)) ;

CREATE POLICY "Teachers can view all savings plans entrys"
ON depots.savings_plans FOR SELECT TO authenticated
USING (users.has_role('teacher'));
