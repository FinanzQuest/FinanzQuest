-- =============================================================================
-- GRANTs targeting depots.depots
-- =============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON depots.depots        TO service_worker;

-- authenticator / authenticated
GRANT SELECT ON depots.depots TO authenticator;

GRANT SELECT, INSERT, UPDATE, DELETE ON depots.depots TO authenticated;

-- (postauth.sql)
GRANT INSERT ON depots.depots TO auth_admin;
GRANT INSERT ON depots.depots TO authenticated;

GRANT SELECT ON depots.depots TO anon;
