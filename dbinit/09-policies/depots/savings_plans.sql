-- =============================================================================
-- RLS policies for depots.savings_plans
-- Depends on: depots.savings_plans (03-tables/depots/savings_plans.sql),
--             depots.is_depot_member (04-functions/depots/is_depot_member.sql),
--             users.has_role (04-functions/users/has_role.sql)
-- -----------------------------------------------------------------------------
-- Policies were formerly split across permissions.sql and admin.sql; all of
-- this table's policies are consolidated here.
-- NOTE: no ENABLE ROW LEVEL SECURITY statement exists for this table anywhere
-- in the source — the policies below are inert until it is enabled.
-- Deliberately not added here (behavior change); see flagged issues.
-- =============================================================================

CREATE POLICY "Users can read their depot savings plans" ON depots.savings_plans
FOR SELECT TO authenticated
USING (depots.is_depot_member (depot_id)) ;

CREATE POLICY "Users can create savings plans in their depots" ON depots.savings_plans
FOR INSERT TO authenticated
WITH CHECK (depots.is_depot_member (depot_id)) ;

CREATE POLICY "Users can update their depot savings plans" ON depots.savings_plans
FOR UPDATE TO authenticated
USING (depots.is_depot_member (depot_id))
WITH CHECK (depots.is_depot_member (depot_id)) ;

CREATE POLICY "Users can delete their depot savings plans" ON depots.savings_plans
FOR DELETE TO authenticated
USING (depots.is_depot_member (depot_id)) ;

-- (admin.sql)
CREATE POLICY "Teachers can view all savings plans entrys"
ON depots.savings_plans FOR SELECT TO authenticated
USING (users.has_role('teacher'));
