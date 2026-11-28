-- =============================================================================
-- users.tutorial_class_overview()
-- Depends on: users.has_any_role, users.is_superuser_session, auth.users,
--             users.special_roles, users.learner_overview (06-views, resolved
--             at call time), users.tutorial_lessons, users.tutorial_paths,
--             users.lesson_progress, users.tutorial_path_requires
-- -----------------------------------------------------------------------------
-- Teacher progress view: one row per student (every user without a special
-- role), including students who never started. current_* is the first
-- unlocked, not yet passed lesson in catalog order (NULL when all are done),
-- computed set-based: per student and path the first lesson without a
-- progress row ("done" = progress row exists, as in is_lesson_unlocked); a
-- path is done when it has no such lesson; the current lesson is the first
-- open one (by path position) whose required paths are all done.
-- streak is the effective streak. Teacher/admin only, else 42501 (like
-- users.get_admin_overview, it exposes emails).
-- =============================================================================

CREATE OR REPLACE FUNCTION users.tutorial_class_overview()
RETURNS TABLE (
  user_id           uuid,
  email             text,
  user_name         text,
  xp_total          integer,
  streak            integer,
  streak_best       integer,
  lessons_completed bigint,
  current_path_id   text,
  current_lesson_id text,
  last_active_day   date
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
  WITH students AS (
    SELECT au.id, au.email, au.raw_user_meta_data
    FROM auth.users au
    WHERE NOT au.is_anonymous
      AND NOT EXISTS (SELECT 1 FROM users.special_roles sr WHERE sr.user_id = au.id)
  ), first_open AS (
    -- per student and path: the first lesson not yet passed
    SELECT DISTINCT ON (st.id, l.path_id) st.id AS user_id, l.path_id, l.id AS lesson_id, tp.position AS path_position
    FROM students st
    CROSS JOIN users.tutorial_lessons l
    JOIN users.tutorial_paths tp ON tp.id = l.path_id
    WHERE NOT EXISTS (SELECT 1 FROM users.lesson_progress p WHERE p.user_id = st.id AND p.lesson_id = l.id)
    ORDER BY st.id, l.path_id, l.position
  ), current_lesson AS (
    -- first open lesson whose required paths have no open lesson left
    SELECT DISTINCT ON (f.user_id) f.user_id, f.path_id, f.lesson_id
    FROM first_open f
    WHERE NOT EXISTS (
      SELECT 1 FROM users.tutorial_path_requires r
      JOIN first_open o ON o.user_id = f.user_id AND o.path_id = r.requires_path_id
      WHERE r.path_id = f.path_id
    )
    ORDER BY f.user_id, f.path_position
  )
  SELECT
    st.id,
    st.email::text,
    st.raw_user_meta_data->>'name',
    COALESCE(lo.xp_total, 0),
    COALESCE(lo.streak, 0),
    COALESCE(lo.streak_best, 0),
    COALESCE(lo.lessons_completed, 0),
    cl.path_id,
    cl.lesson_id,
    lo.last_active_day
  FROM students st
  LEFT JOIN users.learner_overview lo ON lo.user_id = st.id
  LEFT JOIN current_lesson cl ON cl.user_id = st.id
  ORDER BY st.email;
END;
$$;
