-- =============================================================================
-- RLS policies for users.special_roles
-- Depends on: users.special_roles (03-tables/users/special_roles.sql),
--             auth.uid() (auth schema, created by GoTrue),
--             users.has_role (04-functions/users/has_role.sql)
-- =============================================================================

ALTER TABLE users.special_roles ENABLE ROW LEVEL SECURITY;

-- Users can read their own role
CREATE POLICY "Users can view own role"
ON users.special_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Only admins can update roles
CREATE POLICY "Admins can update roles"
ON users.special_roles FOR UPDATE
TO authenticated
USING (users.has_role('admin'));

-- Admins can insert new user roles
CREATE POLICY "Admins can insert roles"
ON users.special_roles FOR INSERT
TO authenticated
WITH CHECK (users.has_role('admin'));

-- Admins can delete user roles
CREATE POLICY "Admins can delete roles"
ON users.special_roles FOR DELETE
TO authenticated
USING (users.has_role('admin'));

-- Teachers - Special Roles
CREATE POLICY "Teachers can view special roles"
ON users.special_roles FOR SELECT TO authenticated
USING (users.has_role('teacher'));
