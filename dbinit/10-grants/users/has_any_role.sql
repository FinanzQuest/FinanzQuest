-- =============================================================================
-- GRANTs targeting users.has_any_role (function)
-- =============================================================================

GRANT EXECUTE ON FUNCTION users.has_any_role(VARIADIC users.special_role[]) TO authenticated;
