-- =============================================================================
-- RLS policies for api.fund_holdings
-- Depends on: api.fund_holdings (03-tables/api/fund_holdings.sql)
-- Public reference data: everyone may read; only the updater (service_worker,
-- BYPASSRLS) writes.
-- =============================================================================

ALTER TABLE api.fund_holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read fund_holdings" ON api.fund_holdings
FOR SELECT TO public
USING (true);
