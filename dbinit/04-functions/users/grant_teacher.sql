-- =============================================================================
-- users.grant_teacher(p_user_id)
-- Depends on: users.has_any_role (04-functions/users/has_any_role.sql),
--             users.special_roles, auth.users
-- -----------------------------------------------------------------------------
-- NOTE: `UPDATE auth.users SET is_super_admin = true;` has no WHERE clause and
-- marks every user a super-admin — see flagged issues.
-- =============================================================================

CREATE OR REPLACE FUNCTION users.grant_teacher(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT (users.has_any_role('admin', 'teacher') OR current_user = 'postgres') THEN
        RAISE EXCEPTION 'Unauthorized: Admin or Teacher role required'
            USING ERRCODE = '42501';
    END IF;
    INSERT INTO users.special_roles (user_id, user_role) VALUES (p_user_id, 'teacher');
    UPDATE auth.users SET is_super_admin = true;
END;
$$ SECURITY DEFINER;
