-- =============================================================================
-- GRANTs targeting api.asset_stats (materialized view) and its refresh
-- =============================================================================

GRANT SELECT ON api.asset_stats TO anon, authenticated;

-- only the TimescaleDB job (runs as the owner) refreshes it
REVOKE ALL ON PROCEDURE api.refresh_asset_stats(integer, jsonb) FROM PUBLIC;
