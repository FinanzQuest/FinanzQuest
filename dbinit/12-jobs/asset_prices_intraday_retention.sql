-- =============================================================================
-- Retention: drop api.asset_prices_intraday chunks older than 30 days
-- Depends on: api.asset_prices_intraday (03-tables/api/)
-- =============================================================================

SELECT add_retention_policy('api.asset_prices_intraday', INTERVAL '30 days', if_not_exists => true);
