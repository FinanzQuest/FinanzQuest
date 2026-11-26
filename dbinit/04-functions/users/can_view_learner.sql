-- =============================================================================
-- users.can_view_learner(p_user_id)
-- Depends on: users.has_any_role (04-functions/users/has_any_role.sql),
--             auth.uid() (auth schema, created by GoTrue)
-- -----------------------------------------------------------------------------
-- TRUE if the caller may read p_user_id's tutorial progress: the learner
-- themselves, or any teacher/admin (no class relation exists, so teachers see
-- every learner). Every SELECT policy on lesson_progress, lesson_attempts and
-- learner_stats goes through this function.
-- =============================================================================

CREATE OR REPLACE FUNCTION users.can_view_learner(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT auth.uid() IS NOT NULL
     AND (p_user_id = auth.uid() OR users.has_any_role('teacher', 'admin'));
$$;
