-- =============================================================================
-- users.has_any_role(VARIADIC required_roles)
-- Depends on: users.special_roles, auth.uid() (auth schema, created by GoTrue)
-- -----------------------------------------------------------------------------
-- Check if user has ANY of the specified roles
-- =============================================================================

CREATE OR REPLACE FUNCTION users.has_any_role(VARIADIC required_roles users.special_role[])
RETURNS BOOLEAN AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    RETURN EXISTS (
        SELECT 1 FROM users.special_roles
        WHERE user_id = auth.uid()
        AND user_role = ANY(required_roles)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' STABLE;
