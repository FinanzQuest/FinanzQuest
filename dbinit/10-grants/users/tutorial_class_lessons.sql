-- =============================================================================
-- GRANTs targeting users.tutorial_class_lessons (function)
-- -----------------------------------------------------------------------------
-- Callable by authenticated; the function itself rejects non-teachers (42501).
-- =============================================================================

REVOKE EXECUTE ON FUNCTION users.tutorial_class_lessons(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION users.tutorial_class_lessons(uuid) TO authenticated;
