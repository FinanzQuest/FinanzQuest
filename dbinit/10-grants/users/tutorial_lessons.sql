-- =============================================================================
-- GRANTs targeting users.tutorial_lessons
-- -----------------------------------------------------------------------------
-- Read-only for clients; writes only through SECURITY DEFINER functions.
-- =============================================================================

GRANT SELECT ON users.tutorial_lessons TO authenticated;
