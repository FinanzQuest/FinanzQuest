-- =============================================================================
-- users.lesson_progress
-- Depends on: auth.users, users.tutorial_lessons, depots.depots,
--             depots.transactions
-- -----------------------------------------------------------------------------
-- One row per (user, passed lesson); a row exists only once the lesson was
-- passed. Written only by users.record_lesson_completion.
-- "Done" everywhere (unlocking, class overview) means: a progress row exists,
-- i.e. the lesson was passed under the min_score valid at that time.
-- lesson_id is ON DELETE RESTRICT so catalog edits cannot erase the record of
-- a paid reward.
-- virtual_cash_reward is the reward snapshot taken at the first pass. It is
-- paid at most once: reward_paid_at is set (under the learner_stats row lock)
-- together with the 'movement' transaction that credits it. A pending reward
-- (no depot given yet) has reward_paid_at NULL.
-- =============================================================================

CREATE TABLE IF NOT EXISTS users.lesson_progress (
  user_id               uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  lesson_id             text        NOT NULL REFERENCES users.tutorial_lessons (id) ON DELETE RESTRICT,
  first_completed_at    timestamptz NOT NULL,
  last_completed_at     timestamptz NOT NULL,
  completions           integer     NOT NULL DEFAULT 1 CHECK (completions >= 1),
  best_score            numeric     NOT NULL CHECK (best_score BETWEEN 0 AND 1),
  mastery               smallint    NOT NULL CHECK (mastery BETWEEN 0 AND 3),
  virtual_cash_reward   numeric     NOT NULL DEFAULT 0 CHECK (virtual_cash_reward >= 0),
  reward_paid_at        timestamptz,
  reward_depot_id       bigint      REFERENCES depots.depots (id) ON DELETE SET NULL,
  reward_transaction_id bigint      REFERENCES depots.transactions (id) ON DELETE SET NULL,
  PRIMARY KEY (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_reward_pending
  ON users.lesson_progress (user_id) WHERE reward_paid_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_lesson_progress_reward_transaction
  ON users.lesson_progress (reward_transaction_id) WHERE reward_transaction_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_lesson_progress_reward_depot
  ON users.lesson_progress (reward_depot_id) WHERE reward_depot_id IS NOT NULL;
