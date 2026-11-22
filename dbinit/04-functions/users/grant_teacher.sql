-- =============================================================================
-- users.grant_teacher(p_user_id)
-- Depends on: users.has_any_role, users.has_role (04-functions/users/),
--             users.special_roles, auth.users
-- -----------------------------------------------------------------------------
-- Only admins/teachers (or a superuser session) may call it. The is_super_admin
-- update is scoped to p_user_id (it used to flag every user).
-- =============================================================================

CREATE OR REPLACE FUNCTION users.grant_teacher(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT (users.has_any_role('admin', 'teacher') OR users.is_superuser_session()) THEN
        RAISE EXCEPTION 'Unauthorized: Admin or Teacher role required'
            USING ERRCODE = '42501';
    END IF;
    -- admin accounts are changed by admins only (teachers manage students)
    IF NOT (users.has_role('admin') OR users.is_superuser_session())
       AND EXISTS (SELECT 1 FROM users.special_roles
                   WHERE user_id = p_user_id AND user_role = 'admin') THEN
        RAISE EXCEPTION 'Unauthorized: only admins may change admin accounts'
            USING ERRCODE = '42501';
    END IF;
    INSERT INTO users.special_roles (user_id, user_role) VALUES (p_user_id, 'teacher');
    UPDATE auth.users SET is_super_admin = true WHERE id = p_user_id;
END;
$$ SECURITY DEFINER SET search_path = '';
