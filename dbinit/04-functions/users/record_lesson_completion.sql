-- =============================================================================
-- users.record_lesson_completion(p_user_id, p_lesson_id, p_attempt_id, p_score, p_depot_id, p_at)
-- Depends on: users.tutorial_lessons, users.lesson_progress,
--             users.lesson_attempts, users.learner_stats,
--             depots.depots, depots.transactions
-- -----------------------------------------------------------------------------
-- Internal worker behind users.complete_lesson (which passes auth.uid() and
-- now()). No EXECUTE for clients; p_at lets tests control time.
--
-- Checks (any failure changes nothing):
-- * score outside 0..1, unknown attempt, attempt for another lesson, attempt
--   already completed, or less than tutorial_lessons.min_seconds since the
--   attempt started -> 22023.
-- * attempt of another user, depot p_user_id is not a member of -> 42501.
--   (Lock state was checked by record_lesson_start when the attempt began.)
-- * The learner_stats row is locked FOR UPDATE first: one call per user at a
--   time, so an attempt completes once and a reward is never paid twice.
--
-- Rules:
-- * passed = p_score >= min_score; the attempt row gets the result.
-- * First pass: lesson xp, progress row with the reward snapshot.
--   Repeat pass: xp/4 (rounded up), at most once per lesson and Berlin day.
-- * mastery = 1 when passed, +1 at best_score >= 0.8, +1 at best_score = 1.
-- * Streak (Europe/Berlin days of passes): same day unchanged, next day +1,
--   later reset to 1.
-- * With p_depot_id every pending reward of the user (reward_paid_at NULL,
--   amount > 0) is credited to that depot in one INSERT (one 'movement'
--   transaction per lesson, like depots.grant_reward; the ledger trigger runs
--   once) and marked paid. Without a depot the reward stays pending.
-- Returns one row; streak is the effective streak after this call.
-- =============================================================================

CREATE OR REPLACE FUNCTION users.record_lesson_completion(
  p_user_id    uuid,
  p_lesson_id  text,
  p_attempt_id bigint,
  p_score      numeric,
  p_depot_id   bigint,
  p_at         timestamptz
)
RETURNS TABLE (
  passed               boolean,
  first_completion     boolean,
  xp_awarded           integer,
  virtual_cash_awarded numeric,
  mastery              smallint,
  streak               integer,
  xp_total             integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
#variable_conflict use_column
DECLARE
  v_lesson  users.tutorial_lessons%ROWTYPE;
  v_attempt users.lesson_attempts%ROWTYPE;
  v_stats   users.learner_stats%ROWTYPE;
  v_prog    users.lesson_progress%ROWTYPE;
  v_day     date := (p_at AT TIME ZONE 'Europe/Berlin')::date;
  v_passed  boolean;
  v_first   boolean := false;
  v_xp      integer := 0;
  v_cash    numeric := 0;
  v_best    numeric;
  v_mastery smallint := 0;
  v_streak  integer;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;
  IF p_score IS NULL OR p_score < 0 OR p_score > 1 THEN
    RAISE EXCEPTION 'Score must be between 0 and 1' USING ERRCODE = '22023';
  END IF;
  IF p_depot_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM depots.depots d WHERE d.id = p_depot_id AND p_user_id = ANY (d.users)
  ) THEN
    RAISE EXCEPTION 'Not a member of depot %', p_depot_id USING ERRCODE = '42501';
  END IF;

  -- Per-user lock: serializes all starts, completions and payouts of this user.
  INSERT INTO users.learner_stats AS s (user_id) VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;
  SELECT * INTO v_stats FROM users.learner_stats s WHERE s.user_id = p_user_id FOR UPDATE;

  SELECT * INTO v_attempt FROM users.lesson_attempts a WHERE a.id = p_attempt_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unknown attempt %', p_attempt_id USING ERRCODE = '22023';
  END IF;
  IF v_attempt.user_id <> p_user_id THEN
    RAISE EXCEPTION 'Attempt % belongs to another user', p_attempt_id USING ERRCODE = '42501';
  END IF;
  IF v_attempt.lesson_id IS DISTINCT FROM p_lesson_id THEN
    RAISE EXCEPTION 'Attempt % is not for lesson %', p_attempt_id, p_lesson_id USING ERRCODE = '22023';
  END IF;
  IF v_attempt.completed_at IS NOT NULL THEN
    RAISE EXCEPTION 'Attempt % is already completed', p_attempt_id USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_lesson FROM users.tutorial_lessons l WHERE l.id = p_lesson_id;
  IF p_at - v_attempt.started_at < make_interval(secs => v_lesson.min_seconds) THEN
    RAISE EXCEPTION 'Lesson % completed too fast', p_lesson_id USING ERRCODE = '22023';
  END IF;

  v_passed := p_score >= v_lesson.min_score;

  SELECT * INTO v_prog FROM users.lesson_progress p
  WHERE p.user_id = p_user_id AND p.lesson_id = p_lesson_id;
  v_first := v_passed AND NOT FOUND;

  IF v_passed THEN
    v_best := GREATEST(COALESCE(v_prog.best_score, 0), p_score);
    v_mastery := 1 + (v_best >= 0.8)::int + (v_best >= 1)::int;

    IF v_first THEN
      v_xp := v_lesson.xp;
      INSERT INTO users.lesson_progress AS p (
        user_id, lesson_id, first_completed_at, last_completed_at, completions,
        best_score, mastery, virtual_cash_reward
      ) VALUES (
        p_user_id, p_lesson_id, p_at, p_at, 1, v_best, v_mastery, v_lesson.virtual_cash_reward
      );
    ELSE
      IF NOT EXISTS (
        SELECT 1 FROM users.lesson_attempts a
        WHERE a.user_id = p_user_id AND a.lesson_id = p_lesson_id AND a.xp_awarded > 0
          AND (a.completed_at AT TIME ZONE 'Europe/Berlin')::date = v_day
      ) THEN
        v_xp := ceil(v_lesson.xp / 4.0)::integer;
      END IF;
      UPDATE users.lesson_progress p
      SET last_completed_at = GREATEST(p.last_completed_at, p_at),
          completions       = p.completions + 1,
          best_score        = v_best,
          mastery           = v_mastery
      WHERE p.user_id = p_user_id AND p.lesson_id = p_lesson_id;
    END IF;

    v_streak := CASE
      WHEN v_stats.last_active_day IS NULL OR v_stats.last_active_day < v_day - 1 THEN 1
      WHEN v_stats.last_active_day = v_day - 1 THEN v_stats.streak_current + 1
      ELSE GREATEST(v_stats.streak_current, 1)  -- same day (or an older p_at)
    END;

    UPDATE users.learner_stats s
    SET xp_total        = s.xp_total + v_xp,
        streak_current  = v_streak,
        streak_best     = GREATEST(s.streak_best, v_streak),
        last_active_day = GREATEST(s.last_active_day, v_day),
        updated_at      = now()
    WHERE s.user_id = p_user_id
    RETURNING * INTO v_stats;
  ELSE
    v_mastery := COALESCE(v_prog.mastery, 0);
  END IF;

  UPDATE users.lesson_attempts a
  SET completed_at = p_at, score = p_score, passed = v_passed, xp_awarded = v_xp
  WHERE a.id = p_attempt_id;

  -- Pay every pending reward into the given depot (once: reward_paid_at).
  -- Transaction ids are drawn up front so the progress rows can point at
  -- them; a single INSERT keeps the ledger trigger to one run.
  IF p_depot_id IS NOT NULL THEN
    WITH pending AS MATERIALIZED (
      SELECT p.lesson_id, p.virtual_cash_reward,
             nextval(pg_catalog.pg_get_serial_sequence('depots.transactions', 'id')) AS tx_id
      FROM users.lesson_progress p
      WHERE p.user_id = p_user_id AND p.reward_paid_at IS NULL AND p.virtual_cash_reward > 0
    ), ledger AS (
      INSERT INTO depots.transactions (id, depot_id, user_id, asset_id, amount, price, commission, type)
      SELECT pe.tx_id, p_depot_id, p_user_id, NULL, pe.virtual_cash_reward, NULL, 0, 'movement'
      FROM pending pe
      RETURNING 1
    ), paid AS (
      UPDATE users.lesson_progress p
      SET reward_paid_at = p_at, reward_depot_id = p_depot_id, reward_transaction_id = pe.tx_id
      FROM pending pe
      WHERE p.user_id = p_user_id AND p.lesson_id = pe.lesson_id
      RETURNING pe.virtual_cash_reward
    )
    -- (data-modifying CTEs always run, referenced or not)
    SELECT COALESCE(sum(pd.virtual_cash_reward), 0) INTO v_cash FROM paid pd;
  END IF;

  passed               := v_passed;
  first_completion     := v_first;
  xp_awarded           := v_xp;
  virtual_cash_awarded := v_cash;
  mastery              := v_mastery;
  streak               := CASE WHEN v_stats.last_active_day >= v_day - 1 THEN v_stats.streak_current ELSE 0 END;
  xp_total             := v_stats.xp_total;
  RETURN NEXT;
END;
$$;
