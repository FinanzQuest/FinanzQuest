-- =============================================================================
-- RLS for api.latest_prices — public market data, read-only for clients.
-- Written only by the SECURITY DEFINER trigger on api.asset_prices.
-- =============================================================================

ALTER TABLE api.latest_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read latest prices" ON api.latest_prices
FOR SELECT TO public
USING (true);
