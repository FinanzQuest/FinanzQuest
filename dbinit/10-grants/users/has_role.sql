-- =============================================================================
-- GRANTs targeting users.has_role (function)
-- =============================================================================

GRANT EXECUTE ON FUNCTION users.has_role(users.special_role) TO authenticated;
