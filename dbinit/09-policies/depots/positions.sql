-- =============================================================================
-- RLS policies for depots.positions
-- Depends on: depots.positions (03-tables/depots/positions.sql),
--             depots.is_depot_member (04-functions/depots/is_depot_member.sql),
--             users.has_role (04-functions/users/has_role.sql),
--             auth.uid() (auth schema, created by GoTrue)
-- -----------------------------------------------------------------------------
-- Policies were formerly split across permissions.sql, postauth.sql and
-- admin.sql; all of this table's policies are consolidated here.
-- =============================================================================

ALTER TABLE depots.positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their depot positions" ON depots.positions
FOR SELECT TO authenticated
USING (depots.is_depot_member (depot_id)) ;

CREATE POLICY "Users can manage their depot positions" ON depots.positions
FOR INSERT TO authenticated
WITH CHECK (depots.is_depot_member (depot_id)) ;

CREATE POLICY "Users can update their depot positions" ON depots.positions
FOR UPDATE TO authenticated
USING (depots.is_depot_member (depot_id))
WITH CHECK (depots.is_depot_member (depot_id)) ;

CREATE POLICY "Users can delete their depot positions" ON depots.positions
FOR DELETE TO authenticated
USING (depots.is_depot_member (depot_id)) ;

-- (postauth.sql)
CREATE POLICY "read_access_for_owners"
ON depots.positions
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM depots.depots d
    WHERE d.id = positions.depot_id
      AND auth.uid() = ANY(d.users)
  )
);

-- (admin.sql)
CREATE POLICY "Teachers can view all Positions"
ON depots.positions FOR SELECT TO authenticated
USING (users.has_role('teacher'));
