-- =============================================================================
-- Role: view_refresher
-- Also see 10-grants/ for object-specific grants to this role.
-- =============================================================================

CREATE ROLE view_refresher NOINHERIT;

GRANT USAGE ON SCHEMA depots TO view_refresher;
GRANT USAGE ON SCHEMA api    TO view_refresher;

-- role membership (view_refresher is the role being granted)
GRANT view_refresher TO authenticated, service_worker, postgres;
