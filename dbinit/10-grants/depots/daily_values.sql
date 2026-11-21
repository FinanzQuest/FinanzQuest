-- =============================================================================
-- GRANTs targeting depots.daily_values (table)
-- -----------------------------------------------------------------------------
-- No client access; undoes the schema-wide SELECT from 08-roles/authenticated.
-- Read through depots.values.
-- =============================================================================

REVOKE ALL ON depots.daily_values FROM authenticated, anon;
