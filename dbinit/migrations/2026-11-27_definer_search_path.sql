-- =============================================================================
-- MIGRATION 2026-11-27: pin search_path on the remaining SECURITY DEFINER
-- functions; admin accounts are changed by admins only
-- -----------------------------------------------------------------------------
-- A SECURITY DEFINER function without a fixed search_path resolves unqualified
-- names through the caller's search_path, so objects a caller can create
-- (e.g. in a writable schema) could be picked up with the owner's rights.
-- All of these functions already schema-qualify every object; this only
-- removes the possibility. Same result as the updated 04-functions files.
--
-- users.grant_teacher / users.revoke_teacher also refuse to change an admin's
-- roles unless the caller is an admin (teachers manage students; the
-- frontend's admin actions apply the same rule to delete/ban/password/edit).
--
--     psql -d postgres -f dbinit/migrations/2026-11-27_definer_search_path.sql
--
-- Re-runnable. Afterwards: dbinit/verify_schema.sql and dbinit/tests/*.sql.
-- =============================================================================

\set ON_ERROR_STOP on
BEGIN;

ALTER FUNCTION depots.get_depot_overview()                         SET search_path = '';
ALTER FUNCTION depots.is_depot_member(bigint)                      SET search_path = '';
ALTER FUNCTION depots.grant_default_budget_trigger()               SET search_path = '';
ALTER FUNCTION users.has_role(users.special_role)                  SET search_path = '';
ALTER FUNCTION users.get_all_profiles()                            SET search_path = '';
ALTER FUNCTION users.has_any_role(users.special_role[])            SET search_path = '';
ALTER FUNCTION users.stats()                                       SET search_path = '';
ALTER FUNCTION users.get_admin_overview()                          SET search_path = '';

\ir ../04-functions/users/grant_teacher.sql
\ir ../04-functions/users/revoke_teacher.sql

COMMIT;
