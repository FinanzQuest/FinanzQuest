-- =============================================================================
-- users.tutorial_lessons
-- Depends on: users.tutorial_paths
-- -----------------------------------------------------------------------------
-- Lessons unlock in `position` order within their path. id is the stable slug
-- '<path>.<lesson>'. min_score (0..1) is the share of exercises answered
-- correctly needed to pass; xp and virtual_cash_reward (virtual money only)
-- are granted on the first pass. min_seconds is the minimum time between
-- users.start_lesson and users.complete_lesson (anti-farming).
-- path_id is ON DELETE RESTRICT: deleting a path must not cascade through its
-- lessons into lesson_progress (paid-reward records).
-- =============================================================================

CREATE TABLE IF NOT EXISTS users.tutorial_lessons (
  id                  text     PRIMARY KEY,
  path_id             text     NOT NULL REFERENCES users.tutorial_paths (id) ON DELETE RESTRICT,
  position            smallint NOT NULL,
  is_checkpoint       boolean  NOT NULL DEFAULT false,
  xp                  integer  NOT NULL DEFAULT 0 CHECK (xp >= 0),
  virtual_cash_reward numeric  NOT NULL DEFAULT 0 CHECK (virtual_cash_reward >= 0),
  min_score           numeric  NOT NULL DEFAULT 0 CHECK (min_score BETWEEN 0 AND 1),
  min_seconds         integer  NOT NULL DEFAULT 0 CHECK (min_seconds >= 0),
  CONSTRAINT tutorial_lessons_path_position UNIQUE (path_id, position),
  CONSTRAINT tutorial_lessons_id_prefix CHECK (id LIKE path_id || '.%')
);
