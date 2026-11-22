-- =============================================================================
-- depots.savings_plans_with_asset
-- Depends on: depots.savings_plans, api.assets
-- security_invoker: the caller's RLS on savings_plans / savings_plans_budget
-- applies (members and teachers only).
-- =============================================================================

CREATE OR REPLACE VIEW depots.savings_plans_with_asset
WITH (security_invoker = true) AS
SELECT
  sp.depot_id,
  sp.asset_id,
  sp.worth,
  sp.period AS frequency,
  sp.created,
  sp.last_changed,
  sp.last_executed,
  sp.id,
  a.symbol,
  a.name,
  a.description,
  a.asset_type,
  a.last_updated
FROM depots.savings_plans sp
JOIN api.assets a ON sp.asset_id = a.id;
