-- =============================================================================
-- users.is_lesson_unlocked(p_user_id, p_lesson_id)
-- Depends on: users.tutorial_lessons, users.tutorial_path_requires,
--             users.lesson_progress
-- -----------------------------------------------------------------------------
-- Strict locking: a lesson is unlocked when every path its path requires is
-- fully passed AND every earlier lesson (by position) of its own path is
-- passed. FALSE for unknown lessons.
-- "Passed"/"done" = a users.lesson_progress row exists (rows are written only
-- on a pass, under the min_score valid at that time). The frontend
-- (tutorial/_engine unlock logic) uses the same definition.
-- Lessons with a progress row stay repeatable regardless of this check
-- (users.record_lesson_start skips it for them).
-- Internal helper (no EXECUTE for clients: it takes any user id). The
-- frontend derives lock states from the catalog and its own progress rows;
-- users.start_lesson enforces them.
-- =============================================================================

CREATE OR REPLACE FUNCTION users.is_lesson_unlocked(p_user_id uuid, p_lesson_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM users.tutorial_lessons l
    WHERE l.id = p_lesson_id
      -- every required path: no lesson of it is missing a progress row
      AND NOT EXISTS (
        SELECT 1
        FROM users.tutorial_path_requires r
        JOIN users.tutorial_lessons rl ON rl.path_id = r.requires_path_id
        WHERE r.path_id = l.path_id
          AND NOT EXISTS (
            SELECT 1 FROM users.lesson_progress p
            WHERE p.user_id = p_user_id AND p.lesson_id = rl.id
          )
      )
      -- every earlier lesson of the same path is passed
      AND NOT EXISTS (
        SELECT 1
        FROM users.tutorial_lessons el
        WHERE el.path_id = l.path_id
          AND el.position < l.position
          AND NOT EXISTS (
            SELECT 1 FROM users.lesson_progress p
            WHERE p.user_id = p_user_id AND p.lesson_id = el.id
          )
      )
  );
$$;
