-- =============================================================================
-- GRANTs targeting users.revoke_role (function)
-- =============================================================================

GRANT EXECUTE ON FUNCTION users.revoke_role(UUID, users.special_role) TO authenticated;
