-- =============================================================================
-- GRANTs targeting users.record_lesson_completion (function)
-- -----------------------------------------------------------------------------
-- Internal worker (takes any user id and time): no client EXECUTE. Clients
-- go through users.complete_lesson.
-- =============================================================================

REVOKE EXECUTE ON FUNCTION users.record_lesson_completion(uuid, text, bigint, numeric, bigint, timestamptz) FROM PUBLIC;
