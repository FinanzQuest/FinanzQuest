-- =============================================================================
-- users.learner_overview
-- Depends on: users.learner_stats, users.lesson_progress
-- -----------------------------------------------------------------------------
-- XP / streak header of the tutorial. security_invoker: the RLS of
-- learner_stats and lesson_progress applies (own row; teachers/admins all).
-- streak is the effective streak: the stored streak_current while the last
-- active Europe/Berlin day is today or yesterday, otherwise 0.
-- =============================================================================

CREATE OR REPLACE VIEW users.learner_overview
WITH (security_invoker = true) AS
SELECT
  s.user_id,
  s.xp_total,
  CASE WHEN s.last_active_day >= (now() AT TIME ZONE 'Europe/Berlin')::date - 1
       THEN s.streak_current ELSE 0 END AS streak,
  s.streak_best,
  s.last_active_day,
  (SELECT count(*) FROM users.lesson_progress p WHERE p.user_id = s.user_id) AS lessons_completed
FROM users.learner_stats s;
