-- =============================================================================
-- Trigger api.asset_prices_latest ON api.asset_prices
-- Depends on: api.on_asset_prices_change (04-functions/api/)
-- =============================================================================

CREATE TRIGGER asset_prices_latest
AFTER INSERT OR UPDATE ON api.asset_prices
FOR EACH ROW EXECUTE FUNCTION api.on_asset_prices_change();
