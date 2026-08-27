-- =============================================================================
-- RLS policies for api.assets
-- Depends on: api.assets (03-tables/api/assets.sql)
-- ENABLE ROW LEVEL SECURITY appeared twice in the original source
-- (init.sql and permissions.sql); kept once here.
-- =============================================================================

ALTER TABLE api.assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read assets" ON api.assets
FOR SELECT TO public
USING (true) ;
