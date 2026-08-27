-- =============================================================================
-- depots.upsert_savings_plan(p_depot_id, p_asset_id, p_worth, p_frequency)
-- Depends on: depots.savings_plans,
--             public.SavingsPeriod (02-types/savings_period.sql),
--             auth.uid() (auth schema, created by GoTrue)
-- =============================================================================

CREATE OR REPLACE FUNCTION depots.upsert_savings_plan(
  p_depot_id bigint,
  p_asset_id bigint,
  p_worth real,
  p_frequency savingsperiod
) RETURNS void AS $$
BEGIN
  INSERT INTO depots.savings_plans (depot_id, asset_id, worth, period, created, last_changed, last_executed, created_by)
  VALUES (p_depot_id, p_asset_id, p_worth, p_frequency, NOW(), NOW(), NULL, auth.uid())
  ON CONFLICT (asset_id, depot_id) DO UPDATE SET
    worth = EXCLUDED.worth,
    period = EXCLUDED.period,
    last_changed = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
