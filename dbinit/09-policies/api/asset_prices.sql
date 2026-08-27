-- =============================================================================
-- RLS policies for api.asset_prices
-- Depends on: api.asset_prices (03-tables/api/asset_prices.sql)
-- ENABLE ROW LEVEL SECURITY appeared twice in the original source
-- (init.sql and permissions.sql); kept once here.
-- =============================================================================

ALTER TABLE api.asset_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read asset prices" ON api.asset_prices
FOR SELECT TO public
USING (true) ;
