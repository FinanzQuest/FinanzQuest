-- =============================================================================
-- RLS policies for depots.transactions
-- Depends on: depots.transactions (03-tables/depots/transactions.sql),
--             depots.is_depot_member (04-functions/depots/is_depot_member.sql),
--             users.has_role (04-functions/users/has_role.sql)
-- -----------------------------------------------------------------------------
-- Policies were formerly split across permissions.sql and admin.sql; all of
-- this table's policies are consolidated here.
-- =============================================================================

ALTER TABLE depots.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their depot transactions" ON depots.transactions
FOR SELECT TO authenticated
USING (depots.is_depot_member (depot_id)) ;

CREATE POLICY "Users can create transactions in their depots" ON depots.transactions
FOR INSERT TO authenticated
WITH CHECK (depots.is_depot_member (depot_id)) ;

CREATE POLICY "Users can update their depot transactions" ON depots.transactions
FOR UPDATE TO authenticated
USING (depots.is_depot_member (depot_id))
WITH CHECK (depots.is_depot_member (depot_id)) ;

CREATE POLICY "Users can delete their depot transactions" ON depots.transactions
FOR DELETE TO authenticated
USING (depots.is_depot_member (depot_id)) ;

-- (admin.sql)
CREATE POLICY "Teachers can view all transactions"
ON depots.transactions FOR SELECT TO authenticated
USING (users.has_role('teacher'));
