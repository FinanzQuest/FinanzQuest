-- =============================================================================
-- Schemas
-- -----------------------------------------------------------------------------
-- The auth schema is NOT created here: it is created in
-- 00-preauth/01_auth_admin.sql (AUTHORIZATION auth_admin) as GoTrue's
-- prerequisite.
-- =============================================================================

CREATE SCHEMA api;
CREATE SCHEMA depots;
CREATE SCHEMA IF NOT EXISTS users;
