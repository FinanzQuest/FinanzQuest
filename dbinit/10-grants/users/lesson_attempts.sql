-- =============================================================================
-- GRANTs targeting users.lesson_attempts
-- -----------------------------------------------------------------------------
-- Read-only for clients; writes only through SECURITY DEFINER functions.
-- =============================================================================

GRANT SELECT ON users.lesson_attempts TO authenticated;
