-- =============================================================================
-- GRANTs targeting users.tutorial_class_overview (function)
-- -----------------------------------------------------------------------------
-- Callable by authenticated; the function itself rejects non-teachers (42501).
-- =============================================================================

REVOKE EXECUTE ON FUNCTION users.tutorial_class_overview() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION users.tutorial_class_overview() TO authenticated;
