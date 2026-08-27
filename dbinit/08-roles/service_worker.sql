-- =============================================================================
-- Role: service_worker
-- Also see 10-grants/ for object-specific grants to this role.
-- =============================================================================

CREATE ROLE service_worker NOINHERIT BYPASSRLS LOGIN PASSWORD :'SERVICE_WORKER_PASSWORD';

ALTER ROLE service_worker SET row_security = on;

-- role-scoped access
GRANT CONNECT ON DATABASE postgres TO service_worker;
GRANT USAGE ON SCHEMA api    TO service_worker;
GRANT USAGE ON SCHEMA depots TO service_worker;
