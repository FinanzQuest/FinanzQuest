-- =============================================================================
-- GRANTs targeting users.lesson_progress
-- -----------------------------------------------------------------------------
-- Read-only for clients; writes only through SECURITY DEFINER functions.
-- =============================================================================

GRANT SELECT ON users.lesson_progress TO authenticated;
