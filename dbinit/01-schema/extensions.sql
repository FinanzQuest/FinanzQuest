-- =============================================================================
-- Extensions
-- pg_trgm is required by the GIN trgm indexes on api.assets;
-- timescaledb is required by api.asset_prices hypertable and the
-- continuous aggregate on api.asset_prices_weekly.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
