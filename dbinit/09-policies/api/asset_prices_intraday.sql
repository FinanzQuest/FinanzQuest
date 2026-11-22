-- =============================================================================
-- RLS for api.asset_prices_intraday — public market data, read-only for
-- clients; written by the ingestion service (service_worker, BYPASSRLS).
-- =============================================================================

ALTER TABLE api.asset_prices_intraday ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read intraday prices" ON api.asset_prices_intraday
FOR SELECT TO public
USING (true);

