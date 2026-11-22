-- =============================================================================
-- Triggers keeping api.latest_prices current
-- Depends on: api.on_asset_prices_change (04-functions/api/)
-- =============================================================================

CREATE TRIGGER asset_prices_latest
AFTER INSERT OR UPDATE ON api.asset_prices
FOR EACH ROW EXECUTE FUNCTION api.on_asset_prices_change('daily');

CREATE TRIGGER asset_prices_intraday_latest
AFTER INSERT OR UPDATE ON api.asset_prices_intraday
FOR EACH ROW EXECUTE FUNCTION api.on_asset_prices_change('intraday');
