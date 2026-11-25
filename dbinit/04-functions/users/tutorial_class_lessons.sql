-- =============================================================================
-- users.tutorial_class_lessons(p_user_id)
-- Depends on: users.has_any_role, users.is_superuser_session,
--             users.lesson_progress, users.tutorial_lessons
-- -----------------------------------------------------------------------------
-- Teacher detail view: one row per (learner, passed lesson), for one learner
-- or (p_user_id NULL) everyone. Teacher/admin only, else 42501.
-- =============================================================================

CREATE OR REPLACE FUNCTION users.tutorial_class_lessons(p_user_id uuid DEFAULT NULL)
RETURNS TABLE (
  user_id            uuid,
  lesson_id          text,
  path_id            text,
  mastery            smallint,
  best_score         numeric,
  completions        integer,
  first_completed_at timestamptz,
  last_completed_at  timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
#variable_conflict use_column
BEGIN
  IF NOT (users.has_any_role('admin', 'teacher') OR users.is_superuser_session()) THEN
    RAISE EXCEPTION 'Unauthorized: Admin or Teacher role required' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT p.user_id, p.lesson_id, l.path_id, p.mastery, p.best_score, p.completions,
         p.first_completed_at, p.last_completed_at
  FROM users.lesson_progress p
  JOIN users.tutorial_lessons l ON l.id = p.lesson_id
  WHERE p_user_id IS NULL OR p.user_id = p_user_id
  ORDER BY p.user_id, l.path_id, l.position;
END;
$$;
