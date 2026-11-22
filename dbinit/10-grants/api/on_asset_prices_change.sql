-- =============================================================================
-- GRANTs targeting api.on_asset_prices_change (trigger function) and
-- api.rebuild_latest_prices (repair) — internal, not callable by clients.
-- =============================================================================

REVOKE EXECUTE ON FUNCTION api.on_asset_prices_change() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION api.rebuild_latest_prices() FROM PUBLIC;
