-- =============================================================================
-- MIGRATION 2026-12-05: tutorial progress (learning path S1)
-- -----------------------------------------------------------------------------
-- Run from the repository root as the migration superuser:
--
--     psql -d postgres -f dbinit/migrations/2026-12-05_tutorial_progress.sql
--
-- Adds the Duolingo-style tutorial backend (docs/tutorial-plan.md) in schema
-- users: catalog tables (tutorial_paths, tutorial_path_requires,
-- tutorial_lessons), progress (lesson_progress, lesson_attempts,
-- learner_stats), the RPCs users.start_lesson / users.complete_lesson
-- (attempt with minimum duration and daily limit, XP, Berlin-day streak,
-- one-time virtual cash reward as a 'movement' transaction), the view
-- users.learner_overview, the teacher RPCs users.tutorial_class_overview /
-- users.tutorial_class_lessons, RLS, grants and the catalog upsert.
--
-- Runs in one transaction; re-runnable (IF NOT EXISTS, CREATE OR REPLACE,
-- policies dropped and recreated, idempotent catalog upsert).
-- Afterwards: dbinit/verify_schema.sql, dbinit/tests/tutorial.sql,
-- dbinit/tests/security.sql; regenerate frontend types.
-- =============================================================================

\set ON_ERROR_STOP on
BEGIN;

\ir ../03-tables/users/tutorial_paths.sql
\ir ../03-tables/users/tutorial_path_requires.sql
\ir ../03-tables/users/tutorial_lessons.sql
\ir ../03-tables/users/lesson_progress.sql
\ir ../03-tables/users/lesson_attempts.sql
\ir ../03-tables/users/learner_stats.sql

\ir ../04-functions/users/can_view_learner.sql
\ir ../04-functions/users/is_lesson_unlocked.sql
\ir ../04-functions/users/record_lesson_start.sql
\ir ../04-functions/users/start_lesson.sql
\ir ../04-functions/users/record_lesson_completion.sql
\ir ../04-functions/users/complete_lesson.sql
\ir ../04-functions/users/tutorial_class_overview.sql
\ir ../04-functions/users/tutorial_class_lessons.sql

\ir ../06-views/users/learner_overview.sql

DROP POLICY IF EXISTS "Authenticated can read tutorial_paths" ON users.tutorial_paths;
DROP POLICY IF EXISTS "Authenticated can read tutorial_path_requires" ON users.tutorial_path_requires;
DROP POLICY IF EXISTS "Authenticated can read tutorial_lessons" ON users.tutorial_lessons;
DROP POLICY IF EXISTS "Learners and teachers can read lesson_progress" ON users.lesson_progress;
DROP POLICY IF EXISTS "Learners and teachers can read lesson_attempts" ON users.lesson_attempts;
DROP POLICY IF EXISTS "Learners and teachers can read learner_stats" ON users.learner_stats;
\ir ../09-policies/users/tutorial_paths.sql
\ir ../09-policies/users/tutorial_path_requires.sql
\ir ../09-policies/users/tutorial_lessons.sql
\ir ../09-policies/users/lesson_progress.sql
\ir ../09-policies/users/lesson_attempts.sql
\ir ../09-policies/users/learner_stats.sql

\ir ../10-grants/users/tutorial_paths.sql
\ir ../10-grants/users/tutorial_path_requires.sql
\ir ../10-grants/users/tutorial_lessons.sql
\ir ../10-grants/users/lesson_progress.sql
\ir ../10-grants/users/lesson_attempts.sql
\ir ../10-grants/users/learner_stats.sql
\ir ../10-grants/users/learner_overview.sql
\ir ../10-grants/users/can_view_learner.sql
\ir ../10-grants/users/is_lesson_unlocked.sql
\ir ../10-grants/users/record_lesson_start.sql
\ir ../10-grants/users/start_lesson.sql
\ir ../10-grants/users/record_lesson_completion.sql
\ir ../10-grants/users/complete_lesson.sql
\ir ../10-grants/users/tutorial_class_overview.sql
\ir ../10-grants/users/tutorial_class_lessons.sql

\ir ../seed/tutorial_catalog.sql

COMMIT;
