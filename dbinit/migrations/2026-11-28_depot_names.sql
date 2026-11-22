-- =============================================================================
-- MIGRATION 2026-11-28: depot names
-- -----------------------------------------------------------------------------
-- Requires 2026-11-27_definer_search_path.sql. Run from the repository root
-- as the migration superuser:
--
--     psql -d postgres -f dbinit/migrations/2026-11-28_depot_names.sql
--
-- depots.depots.name: shown instead of the database id. Chosen when the depot
-- is created (new_depot_for_user(user, name)), otherwise a random friendly
-- name (depots.random_depot_name(), also the column default). Existing
-- depots get a random name. Exposed by depots.leaderboard and
-- depots.depot_overview.
--
-- Runs in one transaction; not re-runnable.
-- Afterwards: dbinit/verify_schema.sql and dbinit/tests/*.sql.
-- =============================================================================

\set ON_ERROR_STOP on
BEGIN;

\ir ../04-functions/depots/random_depot_name.sql

ALTER TABLE depots.depots ADD COLUMN name text;
UPDATE depots.depots SET name = depots.random_depot_name();
ALTER TABLE depots.depots
  ALTER COLUMN name SET NOT NULL,
  ALTER COLUMN name SET DEFAULT depots.random_depot_name(),
  ADD CONSTRAINT depots_name_length CHECK (char_length(btrim(name)) BETWEEN 1 AND 40);

DROP FUNCTION depots.new_depot_for_user(uuid);
\ir ../04-functions/depots/new_depot_for_user.sql
\ir ../10-grants/depots/new_depot_for_user.sql

\ir ../06-views/depots/leaderboard.sql

DROP VIEW depots.depot_overview;
DROP FUNCTION depots.get_depot_overview();
\ir ../04-functions/depots/get_depot_overview.sql
\ir ../06-views/depots/depot_overview.sql
\ir ../10-grants/depots/get_depot_overview.sql
\ir ../10-grants/depots/depot_overview.sql

COMMIT;
