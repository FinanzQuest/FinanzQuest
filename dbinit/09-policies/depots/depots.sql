-- =============================================================================
-- RLS policies for depots.depots
-- Depends on: depots.depots (03-tables/depots/depots.sql),
--             auth.uid() (auth schema, created by GoTrue),
--             users.has_role (04-functions/users/has_role.sql)
-- -----------------------------------------------------------------------------
-- Policies were formerly split across permissions.sql, postauth.sql and
-- admin.sql; all of this table's policies are consolidated here.
-- "auth_admin_insert" carries a USING on an INSERT policy — see flagged issues.
-- =============================================================================

ALTER TABLE depots.depots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read depots" ON depots.depots
FOR SELECT TO public
USING (true) ;

CREATE POLICY "Users can manage their depots" ON depots.depots
FOR ALL TO authenticated
USING (auth.uid ()::uuid = ANY (users))
WITH CHECK (auth.uid ()::uuid = ANY (users)) ;

-- (postauth.sql)
CREATE POLICY "read_acces_all" ON depots.depots FOR SELECT USING (true) ;

-- (postauth.sql)
CREATE POLICY "auth_admin_insert" ON depots.depots TO auth_admin USING (TRUE);

-- (postauth.sql)
CREATE POLICY "authenticated_insert" ON depots.depots FOR INSERT TO authenticated WITH CHECK (auth.uid()::uuid = ANY(users));

-- (admin.sql)
CREATE POLICY "Teachers can view all Depots"
ON depots.depots FOR SELECT TO authenticated
USING (users.has_role('teacher'));

-- (admin.sql)
CREATE POLICY "Teachers can edit all Depots"
ON depots.depots FOR UPDATE TO authenticated
USING (users.has_role('teacher'));

-- (admin.sql)
CREATE POLICY "Teachers can insert Depots"
ON depots.depots FOR INSERT TO authenticated
WITH CHECK (users.has_role('teacher'));

-- (admin.sql)
CREATE POLICY "Teachers can delete Depots"
ON depots.depots FOR DELETE TO authenticated
USING (users.has_role('teacher'));
