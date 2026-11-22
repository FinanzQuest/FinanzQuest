-- =============================================================================
-- RLS policies for api.funds
-- Depends on: api.funds (03-tables/api/funds.sql)
-- Public reference data: everyone may read; only the updater (service_worker,
-- BYPASSRLS) writes.
-- =============================================================================

ALTER TABLE api.funds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read funds" ON api.funds
FOR SELECT TO public
USING (true);
