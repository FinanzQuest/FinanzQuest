-- =============================================================================
-- users.revoke_teacher(p_user_id)
-- Depends on: users.has_any_role (04-functions/users/has_any_role.sql),
--             users.special_roles, auth.users
-- =============================================================================

CREATE OR REPLACE FUNCTION users.revoke_teacher(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT (users.has_any_role('admin', 'teacher') OR users.is_superuser_session()) THEN
        RAISE EXCEPTION 'Unauthorized: Admin or Teacher role required'
            USING ERRCODE = '42501';
    END IF;
    DELETE FROM users.special_roles WHERE user_id = p_user_id AND user_role = 'teacher' ;
    UPDATE auth.users SET is_super_admin = false WHERE id = p_user_id;
END;
$$ SECURITY DEFINER SET search_path = '';
