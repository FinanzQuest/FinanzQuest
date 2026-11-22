-- =============================================================================
-- RLS policies for depots.depots
-- Depends on: depots.depots (03-tables/depots/depots.sql),
--             users.has_role (04-functions/users/has_role.sql)
-- -----------------------------------------------------------------------------
-- Depots are public to read (leaderboard, inspecting other depots).
-- Clients cannot INSERT or UPDATE: cash/cash_start are money, so depots are
-- created only by depots.new_depot_for_user and cash is maintained by the
-- ledger trigger. Teachers may delete depots (admin page).
-- auth_admin (GoTrue) keeps its insert policy.
-- =============================================================================

ALTER TABLE depots.depots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read depots" ON depots.depots
FOR SELECT TO public
USING (true) ;

CREATE POLICY "auth_admin_insert" ON depots.depots
FOR INSERT TO auth_admin
WITH CHECK (true);

CREATE POLICY "Teachers can delete Depots"
ON depots.depots FOR DELETE TO authenticated
USING (users.has_role('teacher'));
