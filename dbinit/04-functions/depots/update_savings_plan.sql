-- =============================================================================
-- depots.update_savings_plan(p_id, p_asset_id, p_worth, p_frequency)
-- Depends on: depots.savings_plans, depots.is_depot_member,
--             depots.check_savings_budget, public.SavingsPeriod
-- -----------------------------------------------------------------------------
-- Changes amount/period of an existing plan (p_asset_id is accepted for API
-- compatibility and ignored). Depot members only, within the budget.
-- =============================================================================

CREATE OR REPLACE FUNCTION depots.update_savings_plan(
  p_id        bigint,
  p_asset_id  bigint,
  p_worth     real,
  p_frequency savingsperiod
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_depot_id bigint;
BEGIN
  SELECT sp.depot_id INTO v_depot_id FROM depots.savings_plans sp WHERE sp.id = p_id;
  IF v_depot_id IS NULL OR NOT depots.is_depot_member(v_depot_id) THEN
    RAISE EXCEPTION 'Savings plan % not found', p_id USING ERRCODE = '42501';
  END IF;
  IF p_worth IS NULL OR p_worth <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive' USING ERRCODE = '22023';
  END IF;

  PERFORM depots.check_savings_budget(v_depot_id, p_id, p_worth::numeric, p_frequency);

  UPDATE depots.savings_plans SET
    worth        = p_worth,
    period       = p_frequency,
    last_changed = NOW()
  WHERE id = p_id;
END;
$$;
