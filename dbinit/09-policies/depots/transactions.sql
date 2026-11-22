-- =============================================================================
-- RLS policies for depots.transactions
-- Depends on: depots.transactions (03-tables/depots/transactions.sql),
--             depots.is_depot_member (04-functions/depots/is_depot_member.sql),
--             users.has_role (04-functions/users/has_role.sql)
-- -----------------------------------------------------------------------------
-- Read-only for clients: members read their depot's ledger, teachers all.
-- There are deliberately no INSERT/UPDATE/DELETE policies (and no such
-- grants): every write goes through a SECURITY DEFINER function that sets
-- price/amount itself (buy_asset, sell_asset, grant_reward,
-- execute_savings_plans). Direct writes let users trade at any price.
-- =============================================================================

ALTER TABLE depots.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their depot transactions" ON depots.transactions
FOR SELECT TO authenticated
USING (depots.is_depot_member (depot_id)) ;

CREATE POLICY "Teachers can view all transactions"
ON depots.transactions FOR SELECT TO authenticated
USING (users.has_role('teacher'));
