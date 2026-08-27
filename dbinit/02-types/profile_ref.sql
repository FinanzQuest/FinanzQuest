-- =============================================================================
-- users.profile_ref
-- Depends on: users schema (01-schema/schemas.sql)
-- Used by depots.leaderboard (06-views/depots/leaderboard.sql)
-- =============================================================================

CREATE TYPE users.profile_ref AS (
    user_id uuid,
    name text
);
