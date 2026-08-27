-- =============================================================================
-- users.revoke_role(p_user_id, p_user_role)
-- Depends on: users.special_roles
-- =============================================================================

CREATE OR REPLACE FUNCTION users.revoke_role(p_user_id UUID, p_user_role users.special_role)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM users.special_roles
    WHERE user_id = p_user_id
    AND user_role = p_user_role;
END;
$$;
