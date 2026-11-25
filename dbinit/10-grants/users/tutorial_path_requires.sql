-- =============================================================================
-- GRANTs targeting users.tutorial_path_requires
-- -----------------------------------------------------------------------------
-- Read-only for clients; writes only through SECURITY DEFINER functions.
-- =============================================================================

GRANT SELECT ON users.tutorial_path_requires TO authenticated;
