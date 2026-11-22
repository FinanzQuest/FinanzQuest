-- =============================================================================
-- GRANTs targeting depots.transactions
-- -----------------------------------------------------------------------------
-- Clients read only; writes go through SECURITY DEFINER functions.
-- =============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON depots.transactions TO service_worker;

REVOKE INSERT, UPDATE, DELETE ON depots.transactions FROM authenticated, anon;
GRANT SELECT ON depots.transactions TO authenticated;
