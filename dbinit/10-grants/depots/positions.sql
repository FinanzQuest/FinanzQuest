-- =============================================================================
-- GRANTs targeting depots.positions
-- =============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON depots.positions     TO service_worker;

GRANT SELECT, INSERT, UPDATE, DELETE ON depots.positions TO authenticated;
