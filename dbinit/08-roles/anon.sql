-- =============================================================================
-- Role: anon
-- Also see 10-grants/ for object-specific grants to this role.
-- =============================================================================

CREATE ROLE anon          NOINHERIT NOLOGIN;

ALTER ROLE anon SET search_path = api;
ALTER ROLE anon SET row_security = on;

-- role membership (anon is the role being granted)
GRANT anon          TO authenticator;

-- role-scoped access
GRANT USAGE ON SCHEMA api    TO anon;
GRANT USAGE ON SCHEMA depots TO anon;
