-- =============================================================================
-- users.has_role(required_role)
-- Depends on: users.special_roles, auth.uid() (auth schema, created by GoTrue)
-- =============================================================================

CREATE OR REPLACE FUNCTION users.has_role(required_role users.special_role)
RETURNS BOOLEAN AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    RETURN EXISTS (
        SELECT 1 FROM users.special_roles
        WHERE user_id = auth.uid() AND user_role = required_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
