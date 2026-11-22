-- =============================================================================
-- GRANTs targeting depots.depots
-- -----------------------------------------------------------------------------
-- authenticated: read, and delete (policy limits it to teachers). No INSERT /
-- UPDATE: depots are created by new_depot_for_user, cash is ledger-derived.
-- =============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON depots.depots TO service_worker;

GRANT SELECT ON depots.depots TO authenticator;

REVOKE INSERT, UPDATE ON depots.depots FROM authenticated;
GRANT SELECT, DELETE ON depots.depots TO authenticated;

GRANT INSERT ON depots.depots TO auth_admin;

GRANT SELECT ON depots.depots TO anon;
