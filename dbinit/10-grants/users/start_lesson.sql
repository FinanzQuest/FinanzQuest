-- =============================================================================
-- GRANTs targeting users.start_lesson (function)
-- =============================================================================

REVOKE EXECUTE ON FUNCTION users.start_lesson(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION users.start_lesson(text) TO authenticated;
