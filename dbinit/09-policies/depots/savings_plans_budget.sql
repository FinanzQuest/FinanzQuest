-- =============================================================================
-- RLS policies for depots.savings_plans_budget
-- Depends on: depots.savings_plans_budget (03-tables/depots/savings_plans_budget.sql),
--             depots.is_depot_member (04-functions/depots/is_depot_member.sql),
--             users.has_role (04-functions/users/has_role.sql)
-- =============================================================================

ALTER TABLE depots.savings_plans_budget ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their budget" ON depots.savings_plans_budget
FOR SELECT TO authenticated
USING (depots.is_depot_member(depot_id));

CREATE POLICY "Teachers can read all budgets" ON depots.savings_plans_budget
FOR SELECT TO authenticated
USING (users.has_role('teacher'));

CREATE POLICY "Teachers can grant budget" ON depots.savings_plans_budget
FOR INSERT TO authenticated
WITH CHECK (users.has_role('teacher'));

CREATE POLICY "Teachers can update all budgets" ON depots.savings_plans_budget
FOR UPDATE TO authenticated
USING (users.has_role('teacher'));
