-- =============================================================================
-- users.tutorial_paths
-- Depends on: users schema (01-schema/schemas.sql)
-- -----------------------------------------------------------------------------
-- Server-side mirror of the tutorial catalog (frontend tutorial/_engine/
-- catalog.ts). Titles and content live in TS; the DB keeps only what
-- users.complete_lesson validates against. Rows come from
-- seed/tutorial_catalog.sql (and a migration upsert for new paths).
-- "Coming soon" stub paths have no rows.
-- =============================================================================

CREATE TABLE IF NOT EXISTS users.tutorial_paths (
  id       text     PRIMARY KEY CONSTRAINT tutorial_paths_id_slug CHECK (id ~ '^[a-z0-9-]+$'),
  position smallint NOT NULL UNIQUE
);
