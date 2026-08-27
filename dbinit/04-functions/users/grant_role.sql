-- =============================================================================
-- users.grant_role(p_user_id, p_user_role)
-- Depends on: users.special_roles, users.special_role (02-types/special_role.sql)
-- =============================================================================

CREATE OR REPLACE FUNCTION users.grant_role(p_user_id UUID, p_user_role users.special_role)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO users.special_roles (user_id, user_role) VALUES (p_user_id, p_user_role);
END;
$$;
