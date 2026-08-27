-- =============================================================================
-- GRANTs targeting depots.positions_id_seq
-- (identity sequence backing depots.positions.id)
-- =============================================================================

GRANT USAGE ON SEQUENCE depots.positions_id_seq     TO service_worker;
