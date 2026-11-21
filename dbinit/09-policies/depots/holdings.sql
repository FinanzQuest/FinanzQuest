-- =============================================================================
-- RLS for depots.holdings
-- -----------------------------------------------------------------------------
-- Read: depot members and teachers. No write policies: only the SECURITY
-- DEFINER transaction trigger writes this table.
-- =============================================================================

ALTER TABLE depots.holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their depot holdings" ON depots.holdings
FOR SELECT TO authenticated
USING (depots.is_depot_member(depot_id));

CREATE POLICY "Teachers can view all holdings" ON depots.holdings
FOR SELECT TO authenticated
USING (users.has_role('teacher'));
