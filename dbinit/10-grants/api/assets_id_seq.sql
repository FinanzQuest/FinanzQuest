-- =============================================================================
-- GRANTs targeting api.assets_id_seq
-- (identity sequence backing api.assets.id)
-- =============================================================================

GRANT USAGE ON SEQUENCE api.assets_id_seq                TO service_worker;
