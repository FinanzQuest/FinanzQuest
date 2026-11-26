-- =============================================================================
-- tests/tutorial.sql — tutorial progress: locking, attempts, XP, streak, rewards
-- -----------------------------------------------------------------------------
-- users.start_lesson / users.complete_lesson as the client (role
-- authenticated + JWT claims), plus the internal record_lesson_start /
-- record_lesson_completion with explicit timestamps (minimum duration,
-- Europe/Berlin streak, daily limit). Needs the seeded catalog
-- (seed/tutorial_catalog.sql).
--
-- One transaction, ROLLs BACK.
--
--     psql -d postgres -f dbinit/tests/tutorial.sql
-- =============================================================================

\set ON_ERROR_STOP on
\set QUIET on
\o /dev/null
BEGIN;

CREATE FUNCTION pg_temp.check(ok boolean, label text) RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  IF ok IS NOT TRUE THEN RAISE EXCEPTION 'FAIL: %', label; END IF;
  RAISE NOTICE 'PASS: %', label;
END $$;

-- SQLSTATE raised by p_sql run as the given user, NULL when it succeeds.
CREATE FUNCTION pg_temp.err_as(p_uid uuid, p_sql text) RETURNS text
LANGUAGE plpgsql AS $$
DECLARE v text;
BEGIN
  PERFORM set_config('request.jwt.claims', json_build_object('sub', p_uid, 'role', 'authenticated')::text, true);
  EXECUTE 'SET LOCAL ROLE authenticated';
  BEGIN
    EXECUTE p_sql;
  EXCEPTION WHEN OTHERS THEN
    v := SQLSTATE;
  END;
  EXECUTE 'RESET ROLE';
  RETURN v;
END $$;

-- start_lesson as the user, then pretend 10 minutes passed (min_seconds)
CREATE FUNCTION pg_temp.attempt(p_uid uuid, p_lesson text) RETURNS bigint
LANGUAGE plpgsql AS $$
DECLARE v bigint;
BEGIN
  PERFORM set_config('request.jwt.claims', json_build_object('sub', p_uid, 'role', 'authenticated')::text, true);
  EXECUTE 'SET LOCAL ROLE authenticated';
  v := users.start_lesson(p_lesson);
  EXECUTE 'RESET ROLE';
  UPDATE users.lesson_attempts SET started_at = started_at - interval '10 minutes' WHERE id = v;
  RETURN v;
END $$;

-- full run as the user (start + complete); SQLSTATE or NULL
CREATE FUNCTION pg_temp.finish(p_uid uuid, p_lesson text, p_score numeric, p_depot bigint DEFAULT NULL) RETURNS text
LANGUAGE plpgsql AS $$
BEGIN
  RETURN pg_temp.err_as(p_uid, format('SELECT users.complete_lesson(%L, %s, %s, %s)',
    p_lesson, pg_temp.attempt(p_uid, p_lesson), p_score, COALESCE(p_depot::text, 'NULL')));
END $$;

-- internal run at a given time (started 2 minutes earlier)
CREATE FUNCTION pg_temp.pass_at(p_uid uuid, p_lesson text, p_at timestamptz)
RETURNS TABLE (streak integer, xp_awarded integer)
LANGUAGE sql AS $$
  SELECT r.streak, r.xp_awarded
  FROM users.record_lesson_completion(p_uid, p_lesson,
         users.record_lesson_start(p_uid, p_lesson, p_at - interval '2 minutes'), 1, NULL, p_at) r;
$$;

CREATE FUNCTION pg_temp.raises(p_sql text) RETURNS boolean
LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE p_sql;
  RETURN false;
EXCEPTION WHEN OTHERS THEN
  RETURN true;
END $$;

-- ---------------------------------------------------------------------------
-- Fixture: two students with one depot each.
-- ---------------------------------------------------------------------------
INSERT INTO auth.users (id) VALUES
  ('cccccccc-0000-0000-0000-000000000001'),
  ('cccccccc-0000-0000-0000-000000000002');
INSERT INTO depots.depots (id, created, cash, cash_start, users) OVERRIDING SYSTEM VALUE VALUES
  (992001, now(), 10000, 10000, '{cccccccc-0000-0000-0000-000000000001}'),
  (992002, now(), 10000, 10000, '{cccccccc-0000-0000-0000-000000000002}');

\set s1 '''cccccccc-0000-0000-0000-000000000001'''
\set s2 '''cccccccc-0000-0000-0000-000000000002'''

SELECT pg_temp.check((SELECT count(*) FROM users.tutorial_lessons) = 33
                 AND (SELECT count(*) FROM users.tutorial_path_requires WHERE path_id = 'portfolio') = 2,
  'catalog seeded (33 lessons, portfolio requires two paths)');

-- ---------------------------------------------------------------------------
-- Locking (checked when the attempt starts).
-- ---------------------------------------------------------------------------
SELECT pg_temp.check(pg_temp.err_as(:s1, $$SELECT users.start_lesson('grundlagen.rendite-zinseszins')$$) = '42501',
  'second lesson is locked before the first is passed');
SELECT pg_temp.check(pg_temp.err_as(:s1, $$SELECT users.start_lesson('aktien.unternehmen-bewerten')$$) = '42501',
  'branch path is locked before grundlagen is done');
SELECT pg_temp.check(pg_temp.err_as(:s1, $$SELECT users.start_lesson('grundlagen.nope')$$) = '22023',
  'unknown lesson rejected');
SELECT pg_temp.check(NOT EXISTS (SELECT 1 FROM users.lesson_progress WHERE user_id = :s1)
                 AND NOT EXISTS (SELECT 1 FROM users.lesson_attempts WHERE user_id = :s1),
  'rejected starts leave no trace');

-- ---------------------------------------------------------------------------
-- Attempt checks.
-- ---------------------------------------------------------------------------
SELECT pg_temp.check(pg_temp.err_as(:s1, format('SELECT users.complete_lesson(%L, %s, 1)', 'grundlagen.warum-vorsorgen',
         (SELECT users.record_lesson_start(:s1, 'grundlagen.warum-vorsorgen', now())))) = '22023',
  'completing right after the start is too fast (min_seconds)');
SELECT pg_temp.check(pg_temp.err_as(:s1, format('SELECT users.complete_lesson(%L, %s, 1.5)', 'grundlagen.warum-vorsorgen',
         pg_temp.attempt(:s1, 'grundlagen.warum-vorsorgen'))) = '22023',
  'score above 1 rejected');
SELECT pg_temp.check(pg_temp.err_as(:s2, format('SELECT users.complete_lesson(%L, %s, 1)', 'grundlagen.warum-vorsorgen',
         pg_temp.attempt(:s1, 'grundlagen.warum-vorsorgen'))) = '42501',
  'another user''s attempt rejected');
SELECT pg_temp.check(pg_temp.err_as(:s1, format('SELECT users.complete_lesson(%L, %s, 1)', 'grundlagen.rendite-zinseszins',
         pg_temp.attempt(:s1, 'grundlagen.warum-vorsorgen'))) = '22023',
  'attempt for a different lesson rejected');
SELECT pg_temp.check(NOT EXISTS (SELECT 1 FROM users.lesson_progress WHERE user_id = :s1)
                 AND NOT EXISTS (SELECT 1 FROM users.lesson_attempts WHERE user_id = :s1 AND completed_at IS NOT NULL),
  'rejected completions change nothing');

-- ---------------------------------------------------------------------------
-- First pass pays once; a repeat does not pay again.
-- ---------------------------------------------------------------------------
SELECT pg_temp.attempt(:s1, 'grundlagen.warum-vorsorgen') AS a1 \gset
SELECT pg_temp.check(pg_temp.err_as(:s1, format('SELECT users.complete_lesson(%L, %s, 0.9, 992001)', 'grundlagen.warum-vorsorgen', :a1)) IS NULL,
  'first lesson can be completed');
SELECT pg_temp.check(pg_temp.err_as(:s1, format('SELECT users.complete_lesson(%L, %s, 1, 992001)', 'grundlagen.warum-vorsorgen', :a1)) = '22023',
  'an attempt completes only once');
SELECT pg_temp.check(
  (SELECT reward_paid_at IS NOT NULL AND reward_depot_id = 992001 AND virtual_cash_reward = 100 AND mastery = 2
   FROM users.lesson_progress WHERE user_id = :s1 AND lesson_id = 'grundlagen.warum-vorsorgen'),
  'first pass: reward snapshot paid into the depot, mastery 2 at 90 %');
SELECT pg_temp.check((SELECT cash FROM depots.depots WHERE id = 992001) = 10100, 'reward lands in depots.cash');
SELECT pg_temp.check(
  (SELECT count(*) = 1 AND bool_and(type = 'movement' AND amount = 100 AND asset_id IS NULL AND user_id = :s1)
   FROM depots.transactions WHERE depot_id = 992001),
  'reward is one movement transaction');
SELECT pg_temp.check((SELECT xp_total FROM users.learner_stats WHERE user_id = :s1) = 20, 'first pass grants the lesson xp');

SELECT pg_temp.check(pg_temp.finish(:s1, 'grundlagen.warum-vorsorgen', 1, 992001) IS NULL,
  'completed lesson can be repeated');
SELECT pg_temp.check((SELECT cash FROM depots.depots WHERE id = 992001) = 10100
                 AND (SELECT count(*) FROM depots.transactions WHERE depot_id = 992001) = 1,
  'double completion pays once');
SELECT pg_temp.check(
  (SELECT completions = 2 AND best_score = 1 AND mastery = 3 FROM users.lesson_progress
   WHERE user_id = :s1 AND lesson_id = 'grundlagen.warum-vorsorgen'),
  'repeat updates completions, best score and mastery');
SELECT pg_temp.check((SELECT xp_total FROM users.learner_stats WHERE user_id = :s1) = 20,
  'no repeat xp on the day of the first pass');

-- ---------------------------------------------------------------------------
-- Foreign depot.
-- ---------------------------------------------------------------------------
SELECT pg_temp.check(pg_temp.finish(:s1, 'grundlagen.rendite-zinseszins', 1, 992002) = '42501',
  'foreign depot rejected');
SELECT pg_temp.check((SELECT cash FROM depots.depots WHERE id = 992002) = 10000
                 AND NOT EXISTS (SELECT 1 FROM users.lesson_progress WHERE user_id = :s1 AND lesson_id = 'grundlagen.rendite-zinseszins'),
  '... and nothing is recorded or paid');

-- ---------------------------------------------------------------------------
-- Pending reward is paid later.
-- ---------------------------------------------------------------------------
SELECT pg_temp.check(pg_temp.finish(:s1, 'grundlagen.rendite-zinseszins', 0.5) IS NULL,
  'lesson without a depot passes');
SELECT pg_temp.check(
  (SELECT reward_paid_at IS NULL FROM users.lesson_progress WHERE user_id = :s1 AND lesson_id = 'grundlagen.rendite-zinseszins')
  AND (SELECT cash FROM depots.depots WHERE id = 992001) = 10100,
  '... its reward stays pending');
SELECT pg_temp.check(pg_temp.finish(:s1, 'grundlagen.risiko-streuung', 0.5, 992001) IS NULL,
  'next lesson with a depot');
SELECT pg_temp.check((SELECT cash FROM depots.depots WHERE id = 992001) = 10300
                 AND NOT EXISTS (SELECT 1 FROM users.lesson_progress WHERE user_id = :s1 AND reward_paid_at IS NULL),
  'pending reward paid later together with the new one');
SELECT pg_temp.check(
  (SELECT count(DISTINCT p.reward_transaction_id) = 3 AND bool_and(t.amount = p.virtual_cash_reward AND t.depot_id = 992001)
   FROM users.lesson_progress p JOIN depots.transactions t ON t.id = p.reward_transaction_id
   WHERE p.user_id = :s1),
  'one ledger row per paid lesson, linked from progress');

-- RPC result row
SELECT pg_temp.attempt(:s1, 'grundlagen.etf-sparplan') AS a2 \gset
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"cccccccc-0000-0000-0000-000000000001","role":"authenticated"}', true);
SELECT pg_temp.check(
  (SELECT passed AND first_completion AND xp_awarded = 20 AND virtual_cash_awarded = 100 AND mastery = 1 AND streak = 1 AND xp_total = 80
   FROM users.complete_lesson('grundlagen.etf-sparplan', :a2, 0, 992001)),
  'complete_lesson returns the outcome');
RESET ROLE;
-- ---------------------------------------------------------------------------
-- Checkpoint min_score and multi-parent unlocking.
-- ---------------------------------------------------------------------------
SELECT pg_temp.attempt(:s1, 'grundlagen.checkpoint') AS a3 \gset
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"cccccccc-0000-0000-0000-000000000001","role":"authenticated"}', true);
SELECT pg_temp.check(
  (SELECT NOT passed AND NOT first_completion AND xp_awarded = 0 AND virtual_cash_awarded = 0
   FROM users.complete_lesson('grundlagen.checkpoint', :a3, 0.6, 992001)),
  'checkpoint below min_score 0.7 does not pass');
RESET ROLE;
SELECT pg_temp.check(pg_temp.err_as(:s1, $$SELECT users.start_lesson('aktien.unternehmen-bewerten')$$) = '42501',
  '... and aktien stays locked');
SELECT pg_temp.check(pg_temp.finish(:s1, 'grundlagen.checkpoint', 0.7, 992001) IS NULL,
  'checkpoint at min_score passes');
SELECT pg_temp.check((SELECT cash FROM depots.depots WHERE id = 992001) = 10900, 'checkpoint pays 500');
SELECT pg_temp.check(users.is_lesson_unlocked(:s1, 'aktien.unternehmen-bewerten')
                 AND users.is_lesson_unlocked(:s1, 'anleihen.wie-anleihen-funktionieren')
                 AND NOT users.is_lesson_unlocked(:s1, 'portfolio.rendite-volatilitaet-mathe'),
  'grundlagen done unlocks the branches, not portfolio');
INSERT INTO users.lesson_progress (user_id, lesson_id, first_completed_at, last_completed_at, best_score, mastery, reward_paid_at)
SELECT :s1, id, now(), now(), 1, 3, now() FROM users.tutorial_lessons WHERE path_id = 'aktien';
SELECT pg_temp.check(NOT users.is_lesson_unlocked(:s1, 'portfolio.rendite-volatilitaet-mathe'),
  'portfolio needs anleihen too');
INSERT INTO users.lesson_progress (user_id, lesson_id, first_completed_at, last_completed_at, best_score, mastery, reward_paid_at)
SELECT :s1, id, now(), now(), 1, 3, now() FROM users.tutorial_lessons WHERE path_id = 'anleihen';
SELECT pg_temp.check(users.is_lesson_unlocked(:s1, 'portfolio.rendite-volatilitaet-mathe'),
  'aktien + anleihen unlock portfolio');

-- A passed lesson stays repeatable even if the catalog later locks its path.
INSERT INTO users.tutorial_path_requires (path_id, requires_path_id) VALUES ('aktien', 'etfs');
SELECT pg_temp.check(pg_temp.err_as(:s1, $$SELECT users.start_lesson('aktien.unternehmen-bewerten')$$) IS NULL
                 AND NOT users.is_lesson_unlocked(:s1, 'aktien.unternehmen-bewerten'),
  'repeat of a passed lesson skips the lock check');
DELETE FROM users.tutorial_path_requires WHERE path_id = 'aktien' AND requires_path_id = 'etfs';

SELECT pg_temp.check(pg_temp.raises($$DELETE FROM users.tutorial_lessons WHERE id = 'grundlagen.warum-vorsorgen'$$)
                 AND pg_temp.raises($$DELETE FROM users.tutorial_paths WHERE id = 'grundlagen'$$),
  'catalog rows with progress cannot be deleted (RESTRICT)');

-- ---------------------------------------------------------------------------
-- Streak across Berlin midnight (winter time, UTC+1).
-- ---------------------------------------------------------------------------
-- 22:30 UTC = 23:30 Berlin on Jan 14; 23:30 UTC = 00:30 Berlin on Jan 15
SELECT pg_temp.check((SELECT streak = 1 FROM pg_temp.pass_at(:s2, 'grundlagen.warum-vorsorgen', '2026-01-14 22:30+00')),
  'day 1: streak 1');
SELECT pg_temp.check((SELECT streak = 2 FROM pg_temp.pass_at(:s2, 'grundlagen.rendite-zinseszins', '2026-01-14 23:30+00')),
  'one hour later, after Berlin midnight (same UTC day): streak 2');
SELECT pg_temp.check(
  (SELECT array_agg(berlin_day ORDER BY started_at) = '{2026-01-14,2026-01-15}'::date[]
   FROM users.lesson_attempts WHERE user_id = :s2),
  'attempts are stamped with the Berlin day');
SELECT pg_temp.check((SELECT streak = 2 AND xp_awarded = 5 FROM pg_temp.pass_at(:s2, 'grundlagen.warum-vorsorgen', '2026-01-15 20:00+00')),
  'same Berlin day: streak unchanged; repeat on a later day earns xp/4');
SELECT pg_temp.check((SELECT xp_awarded = 0 FROM pg_temp.pass_at(:s2, 'grundlagen.warum-vorsorgen', '2026-01-15 21:00+00')),
  'repeat xp only once per lesson and day');
SELECT pg_temp.check((SELECT streak = 1 FROM pg_temp.pass_at(:s2, 'grundlagen.risiko-streuung', '2026-01-17 10:00+00')),
  'a missed day resets the streak');
SELECT pg_temp.check(
  (SELECT streak_current = 1 AND streak_best = 2 AND last_active_day = '2026-01-17' AND xp_total = 65
   FROM users.learner_stats WHERE user_id = :s2),
  'learner_stats keeps the best streak and xp');
SELECT pg_temp.check((SELECT streak = 0 AND lessons_completed = 3 FROM users.learner_overview WHERE user_id = :s2),
  'learner_overview: effective streak is 0 after inactivity');
SELECT pg_temp.check(
  NOT EXISTS (SELECT 1 FROM users.lesson_progress WHERE user_id = :s2 AND reward_paid_at IS NOT NULL)
  AND (SELECT cash FROM depots.depots WHERE id = 992002) = 10000,
  'no depot given: all rewards pending');

-- ---------------------------------------------------------------------------
-- Daily attempt limit (20 per Berlin day).
-- ---------------------------------------------------------------------------
SELECT users.record_lesson_start(:s2, 'grundlagen.warum-vorsorgen', '2026-02-01 12:00+00') FROM generate_series(1, 20);
SELECT pg_temp.check(pg_temp.raises($$SELECT users.record_lesson_start('cccccccc-0000-0000-0000-000000000002', 'grundlagen.warum-vorsorgen', '2026-02-01 22:59+00')$$),
  '21st attempt on the same Berlin day rejected');
SELECT pg_temp.check(users.record_lesson_start(:s2, 'grundlagen.warum-vorsorgen', '2026-02-01 23:01+00') IS NOT NULL,
  '... allowed again after Berlin midnight');

\o
\echo 'tutorial.sql: ALL PASS'
ROLLBACK;
