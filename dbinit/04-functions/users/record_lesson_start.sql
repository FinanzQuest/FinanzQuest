-- =============================================================================
-- users.record_lesson_start(p_user_id, p_lesson_id, p_at)
-- Depends on: users.tutorial_lessons, users.lesson_progress,
--             users.lesson_attempts, users.learner_stats,
--             users.is_lesson_unlocked
-- -----------------------------------------------------------------------------
-- Internal worker behind users.start_lesson (which passes auth.uid() and
-- now()). No EXECUTE for clients; p_at lets tests control time.
-- * Unknown lesson -> 22023. Locked lesson -> 42501; a lesson that already has
--   a progress row is always repeatable.
-- * At most 20 started attempts per user and Europe/Berlin day -> 54000.
-- * Takes the learner_stats row lock (same per-user lock as completion).
-- Returns the new attempt id, to be passed to users.complete_lesson.
-- =============================================================================

CREATE OR REPLACE FUNCTION users.record_lesson_start(
  p_user_id   uuid,
  p_lesson_id text,
  p_at        timestamptz
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_day date := (p_at AT TIME ZONE 'Europe/Berlin')::date;
  v_id  bigint;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM users.tutorial_lessons l WHERE l.id = p_lesson_id) THEN
    RAISE EXCEPTION 'Unknown lesson %', p_lesson_id USING ERRCODE = '22023';
  END IF;

  INSERT INTO users.learner_stats (user_id) VALUES (p_user_id) ON CONFLICT (user_id) DO NOTHING;
  PERFORM 1 FROM users.learner_stats s WHERE s.user_id = p_user_id FOR UPDATE;

  IF NOT EXISTS (SELECT 1 FROM users.lesson_progress p WHERE p.user_id = p_user_id AND p.lesson_id = p_lesson_id)
     AND NOT users.is_lesson_unlocked(p_user_id, p_lesson_id) THEN
    RAISE EXCEPTION 'Lesson % is locked', p_lesson_id USING ERRCODE = '42501';
  END IF;

  IF (SELECT count(*) FROM users.lesson_attempts a WHERE a.user_id = p_user_id AND a.berlin_day = v_day) >= 20 THEN
    RAISE EXCEPTION 'Daily lesson limit reached' USING ERRCODE = '54000';
  END IF;

  INSERT INTO users.lesson_attempts (user_id, lesson_id, started_at, berlin_day)
  VALUES (p_user_id, p_lesson_id, p_at, v_day)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
