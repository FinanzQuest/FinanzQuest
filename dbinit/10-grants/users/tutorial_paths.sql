-- =============================================================================
-- GRANTs targeting users.tutorial_paths
-- -----------------------------------------------------------------------------
-- Read-only for clients; writes only through SECURITY DEFINER functions.
-- =============================================================================

GRANT SELECT ON users.tutorial_paths TO authenticated;
