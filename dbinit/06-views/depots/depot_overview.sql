-- =============================================================================
-- depots.depot_overview
-- Depends on: depots.get_depot_overview (04-functions/depots/get_depot_overview.sql)
-- =============================================================================

CREATE OR REPLACE VIEW depots.depot_overview AS SELECT * FROM depots.get_depot_overview();
