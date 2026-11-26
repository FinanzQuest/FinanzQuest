-- =============================================================================
-- GRANTs targeting users.learner_stats
-- -----------------------------------------------------------------------------
-- Read-only for clients; writes only through SECURITY DEFINER functions.
-- =============================================================================

GRANT SELECT ON users.learner_stats TO authenticated;
