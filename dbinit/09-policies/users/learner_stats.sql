-- =============================================================================
-- RLS for users.learner_stats
-- Depends on: users.can_view_learner (04-functions/users/can_view_learner.sql)
-- -----------------------------------------------------------------------------
-- Read: the learner and teachers/admins (users.can_view_learner). No write
-- policies: only the SECURITY DEFINER users.record_lesson_completion writes.
-- =============================================================================

ALTER TABLE users.learner_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Learners and teachers can read learner_stats" ON users.learner_stats
FOR SELECT TO authenticated
USING (users.can_view_learner(user_id));
