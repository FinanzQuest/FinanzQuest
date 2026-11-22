-- =============================================================================
-- users.grant_teacher(p_user_id)
-- Depends on: users.has_any_role (04-functions/users/has_any_role.sql),
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
    INSERT INTO users.special_roles (user_id, user_role) VALUES (p_user_id, 'teacher');
    UPDATE auth.users SET is_super_admin = true WHERE id = p_user_id;
END;
$$ SECURITY DEFINER SET search_path = '';
