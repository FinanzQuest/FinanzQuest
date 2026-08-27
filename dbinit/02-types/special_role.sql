-- =============================================================================
-- users.special_role
-- Depends on: users schema (01-schema/schemas.sql)
-- =============================================================================

CREATE TYPE users.special_role AS ENUM (
    'admin',
    'teacher'
);
