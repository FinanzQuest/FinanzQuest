-- =============================================================================
-- users.tutorial_path_requires
-- Depends on: users.tutorial_paths
-- -----------------------------------------------------------------------------
-- A path unlocks once every path it requires is fully completed. A join table
-- because a path can require several parents (portfolio: aktien AND anleihen).
-- =============================================================================

CREATE TABLE IF NOT EXISTS users.tutorial_path_requires (
  path_id          text NOT NULL REFERENCES users.tutorial_paths (id) ON DELETE CASCADE,
  requires_path_id text NOT NULL REFERENCES users.tutorial_paths (id) ON DELETE CASCADE,
  PRIMARY KEY (path_id, requires_path_id),
  CONSTRAINT tutorial_path_requires_not_self CHECK (path_id <> requires_path_id)
);
