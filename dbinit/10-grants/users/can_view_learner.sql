-- =============================================================================
-- GRANTs targeting users.can_view_learner (function)
-- -----------------------------------------------------------------------------
-- authenticated needs EXECUTE: the tutorial RLS policies call it.
-- =============================================================================

REVOKE EXECUTE ON FUNCTION users.can_view_learner(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION users.can_view_learner(uuid) TO authenticated;
