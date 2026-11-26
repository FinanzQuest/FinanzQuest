-- =============================================================================
-- GRANTs targeting users.learner_overview
-- -----------------------------------------------------------------------------
-- Read-only for clients; writes only through SECURITY DEFINER functions.
-- =============================================================================

GRANT SELECT ON users.learner_overview TO authenticated;
