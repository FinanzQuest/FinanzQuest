-- =============================================================================
-- depots.update_savings_plan(p_id, p_asset_id, p_worth, p_frequency)
-- Depends on: depots.savings_plans,
--             public.SavingsPeriod (02-types/savings_period.sql)
-- =============================================================================

CREATE OR REPLACE FUNCTION depots.update_savings_plan(
  p_id bigint,
  p_asset_id bigint,
  p_worth real,
  p_frequency savingsperiod
) RETURNS void AS $$
BEGIN
  UPDATE depots.savings_plans SET
    worth = p_worth,
    period = p_frequency,
    last_changed = NOW()
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
