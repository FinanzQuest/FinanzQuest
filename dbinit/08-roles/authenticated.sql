-- =============================================================================
-- Role: authenticated
-- Also see 10-grants/ for object-specific grants to this role.
-- =============================================================================

CREATE ROLE authenticated NOINHERIT NOLOGIN;

ALTER ROLE authenticated SET row_security = on;

-- role membership (authenticated is the role being granted)
GRANT authenticated TO authenticator;

-- role-scoped access
GRANT USAGE ON SCHEMA api    TO authenticated;
GRANT USAGE ON SCHEMA depots TO authenticated;
GRANT USAGE ON SCHEMA users  TO authenticated;

-- schema-wide grants (not splittable per-object; kept with the role)
GRANT SELECT ON ALL TABLES IN SCHEMA depots TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA depots TO authenticated;
