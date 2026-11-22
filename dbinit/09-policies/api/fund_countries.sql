-- =============================================================================
-- RLS policies for api.fund_countries
-- Depends on: api.fund_countries (03-tables/api/fund_countries.sql)
-- Public reference data: everyone may read; only the updater (service_worker,
-- BYPASSRLS) writes.
-- =============================================================================

ALTER TABLE api.fund_countries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read fund_countries" ON api.fund_countries
FOR SELECT TO public
USING (true);
