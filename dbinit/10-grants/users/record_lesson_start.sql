-- =============================================================================
-- GRANTs targeting users.record_lesson_start (function)
-- -----------------------------------------------------------------------------
-- Internal worker (takes any user id and time): no client EXECUTE. Clients
-- go through users.start_lesson.
-- =============================================================================

REVOKE EXECUTE ON FUNCTION users.record_lesson_start(uuid, text, timestamptz) FROM PUBLIC;
