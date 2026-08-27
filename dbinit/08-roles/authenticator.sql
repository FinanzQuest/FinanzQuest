-- =============================================================================
-- Role: authenticator
-- Also see 10-grants/ for object-specific grants to this role.
-- -----------------------------------------------------------------------------
-- NOTE: the anon/authenticated membership grants live in anon.sql and
-- authenticated.sql respectively (the role being granted).
-- =============================================================================

CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD :'AUTHENTICATOR_PASSWORD';

-- role-scoped access
GRANT CONNECT ON DATABASE postgres TO authenticator;
GRANT USAGE ON SCHEMA depots TO authenticator;
