-- =============================================================================
-- GRANTs targeting depots.transactions_id_seq
-- (identity sequence backing depots.transactions.id)
-- =============================================================================

GRANT USAGE ON SEQUENCE depots.transactions_id_seq  TO service_worker;
