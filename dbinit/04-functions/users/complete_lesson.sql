-- =============================================================================
-- users.complete_lesson(p_lesson_id, p_attempt_id, p_score, p_depot_id)
-- Depends on: users.record_lesson_completion, auth.uid()
-- -----------------------------------------------------------------------------
-- Client RPC for finishing a lesson (server action in the tutorial engine).
-- p_attempt_id comes from users.start_lesson; p_score is the share of
-- exercises answered correctly (0..1). p_depot_id (optional) is the caller's
-- active depot: every pending virtual cash reward is credited to it.
-- Returns one row: passed, first_completion, xp_awarded, virtual_cash_awarded,
-- mastery, streak, xp_total. All checks (attempt ownership, timing, depot
-- membership) live in users.record_lesson_completion.
-- =============================================================================

CREATE OR REPLACE FUNCTION users.complete_lesson(
  p_lesson_id  text,
  p_attempt_id bigint,
  p_score      numeric,
  p_depot_id   bigint DEFAULT NULL
)
RETURNS TABLE (
  passed               boolean,
  first_completion     boolean,
  xp_awarded           integer,
  virtual_cash_awarded numeric,
  mastery              smallint,
  streak               integer,
  xp_total             integer
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT * FROM users.record_lesson_completion(auth.uid(), p_lesson_id, p_attempt_id, p_score, p_depot_id, now());
$$;
