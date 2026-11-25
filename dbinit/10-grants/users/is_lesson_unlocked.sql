-- =============================================================================
-- GRANTs targeting users.is_lesson_unlocked (function)
-- -----------------------------------------------------------------------------
-- Internal helper (takes any user id): no client EXECUTE.
-- =============================================================================

REVOKE EXECUTE ON FUNCTION users.is_lesson_unlocked(uuid, text) FROM PUBLIC;
