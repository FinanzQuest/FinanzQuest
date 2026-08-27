-- =============================================================================
-- Role: auth_admin — later grants only
-- -----------------------------------------------------------------------------
-- The role definition + bootstrap grants (GRANT CREATE ON DATABASE,
-- ALTER USER ... SET search_path) live in 00-preauth/01_auth_admin.sql and
-- are NOT duplicated here. This file holds only the grants issued after
-- GoTrue has started (formerly in postauth.sql).
-- Also see 10-grants/ for object-specific grants to this role.
-- =============================================================================

GRANT USAGE ON SCHEMA depots TO auth_admin;
