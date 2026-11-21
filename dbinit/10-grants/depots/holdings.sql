-- =============================================================================
-- GRANTs targeting depots.holdings (table)
-- -----------------------------------------------------------------------------
-- Read-only for authenticated, rows limited by RLS (09-policies/depots/
-- holdings.sql). Nothing for anon.
-- =============================================================================

GRANT SELECT ON depots.holdings TO authenticated;
REVOKE INSERT, UPDATE, DELETE ON depots.holdings FROM authenticated;
