-- =============================================================================
-- users.is_superuser_session()
-- -----------------------------------------------------------------------------
-- TRUE when the connection itself logged in as a superuser (psql maintenance,
-- migrations, tests). Used as the "or run by hand" escape hatch in role
-- checks. Checks session_user, NOT current_user: inside a SECURITY DEFINER
-- function current_user is the function owner (postgres), so the former
-- `current_user = 'postgres'` checks were always true and let any
-- authenticated client through. PostgREST connects as authenticator, so this
-- is FALSE for every API request. A superuser session that switched to an API
-- role (SET ROLE authenticated, as the tests do) does not count either.
-- =============================================================================

CREATE OR REPLACE FUNCTION users.is_superuser_session()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT COALESCE((SELECT r.rolsuper FROM pg_catalog.pg_roles r WHERE r.rolname = session_user), false)
     AND current_setting('role') = 'none';
$$;
