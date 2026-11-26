-- =============================================================================
-- users.start_lesson(p_lesson_id)
-- Depends on: users.record_lesson_start, auth.uid()
-- -----------------------------------------------------------------------------
-- Client RPC, called when the lesson player opens a lesson. Returns the
-- attempt id that users.complete_lesson needs. Errors: 22023 unknown lesson,
-- 42501 locked / not logged in, 54000 more than 20 attempts today (Berlin).
-- =============================================================================

CREATE OR REPLACE FUNCTION users.start_lesson(p_lesson_id text)
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT users.record_lesson_start(auth.uid(), p_lesson_id, now());
$$;
