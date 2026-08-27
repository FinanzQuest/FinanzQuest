-- =============================================================================
-- GRANTs targeting depots.transactions
-- =============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON depots.transactions  TO service_worker;

GRANT SELECT, INSERT, UPDATE, DELETE ON depots.transactions TO authenticated;
