-- =============================================================================
-- GRANTs targeting users.complete_lesson (function)
-- =============================================================================

REVOKE EXECUTE ON FUNCTION users.complete_lesson(text, bigint, numeric, bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION users.complete_lesson(text, bigint, numeric, bigint) TO authenticated;
