-- =============================================================================
-- users."stats"()
-- Depends on: users.has_any_role (04-functions/users/has_any_role.sql),
--             auth.users, users.special_roles
-- =============================================================================

CREATE OR REPLACE FUNCTION users."stats" () RETURNS TABLE(
    user_count bigint, teacher_count bigint, admin_count bigint, student_count bigint
) AS $$
DECLARE
    v_user_count bigint;
    v_teacher_count bigint;
    v_admin_count bigint;
    v_student_count bigint;
BEGIN
    IF NOT (users.has_any_role('admin', 'teacher') OR current_user = 'postgres') THEN
        RAISE EXCEPTION 'Unauthorized: Admin or Teacher role required'
            USING ERRCODE = '42501';
    END IF;

    -- Total user count
    SELECT COUNT(*) INTO v_user_count
    FROM auth.users;

    -- Teacher count
    SELECT COUNT(DISTINCT user_id) INTO v_teacher_count
    FROM users.special_roles
    WHERE user_role = 'teacher';

    -- Admin count
    SELECT COUNT(DISTINCT user_id) INTO v_admin_count
    FROM users.special_roles
    WHERE user_role = 'admin';

    -- Student count (users with no special roles)
    SELECT COUNT(*) INTO v_student_count
    FROM auth.users au
    WHERE NOT EXISTS (
        SELECT 1 FROM users.special_roles sr
        WHERE sr.user_id = au.id
    );

    RETURN QUERY SELECT v_user_count, v_teacher_count, v_admin_count, v_student_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
