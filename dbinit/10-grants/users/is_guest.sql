-- =============================================================================
-- GRANTs targeting users.is_guest (function)
-- -----------------------------------------------------------------------------
-- Internal helper (takes any user id): no client EXECUTE.
-- =============================================================================

REVOKE EXECUTE ON FUNCTION users.is_guest(uuid) FROM PUBLIC, anon, authenticated;
