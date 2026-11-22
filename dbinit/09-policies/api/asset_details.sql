-- =============================================================================
-- RLS policies for api.asset_details
-- Depends on: api.asset_details (03-tables/api/asset_details.sql)
-- Public reference data: everyone may read; only the updater (service_worker,
-- BYPASSRLS) writes.
-- =============================================================================

ALTER TABLE api.asset_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read asset_details" ON api.asset_details
FOR SELECT TO public
USING (true);
