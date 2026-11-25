-- =============================================================================
-- users.learner_stats
-- Depends on: auth.users
-- -----------------------------------------------------------------------------
-- Per-user totals. Its row is also the per-user lock: record_lesson_start and
-- record_lesson_completion take it FOR UPDATE before touching attempts,
-- progress or rewards, so concurrent calls of one user serialize (no double
-- payout, exact daily attempt limit).
-- streak_current is the stored value as of last_active_day (Europe/Berlin);
-- users.learner_overview shows the effective streak (0 once a day was missed).
-- =============================================================================

CREATE TABLE IF NOT EXISTS users.learner_stats (
  user_id         uuid        PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  xp_total        integer     NOT NULL DEFAULT 0 CHECK (xp_total >= 0),
  streak_current  integer     NOT NULL DEFAULT 0 CHECK (streak_current >= 0),
  streak_best     integer     NOT NULL DEFAULT 0 CHECK (streak_best >= 0),
  last_active_day date,
  updated_at      timestamptz NOT NULL DEFAULT now()
);
