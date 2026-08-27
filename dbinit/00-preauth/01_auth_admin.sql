-- =============================================================================
-- 00-preauth / auth_admin
-- -----------------------------------------------------------------------------
-- The ONLY block GoTrue needs to exist before it starts. Runs pre-GoTrue.
-- Everything else in this tree runs after GoTrue has booted (which creates
-- auth.users and the rest of the auth schema).
-- =============================================================================

CREATE ROLE auth_admin NOINHERIT LOGIN PASSWORD :'AUTH_ADMIN_PASSWORD';
CREATE SCHEMA IF NOT EXISTS auth AUTHORIZATION auth_admin;
GRANT CREATE ON DATABASE postgres TO auth_admin;
ALTER USER auth_admin SET search_path = auth;
