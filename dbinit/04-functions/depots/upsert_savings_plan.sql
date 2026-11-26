-- =============================================================================
-- depots.upsert_savings_plan(p_depot_id, p_asset_id, p_worth, p_frequency)
-- Depends on: depots.savings_plans, depots.is_depot_member,
--             depots.check_savings_budget, users.require_asset_tutorial, public.SavingsPeriod,
--             auth.uid() (auth schema, created by GoTrue)
-- -----------------------------------------------------------------------------
-- Creates or replaces the depot's plan for an asset. Depot members only, and
-- only within the monthly budget. SECURITY DEFINER because clients have no
-- direct write access to depots.savings_plans. The asset's tutorial path must
-- be passed first (users.require_asset_tutorial).
-- =============================================================================

CREATE OR REPLACE FUNCTION depots.upsert_savings_plan(
  p_depot_id  bigint,
  p_asset_id  bigint,
  p_worth     real,
  p_frequency savingsperiod
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT depots.is_depot_member(p_depot_id) THEN
    RAISE EXCEPTION 'Not a member of depot %', p_depot_id USING ERRCODE = '42501';
  END IF;
  IF p_worth IS NULL OR p_worth <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive' USING ERRCODE = '22023';
  END IF;

  PERFORM users.require_asset_tutorial(auth.uid(), p_asset_id);

  PERFORM depots.check_savings_budget(
    p_depot_id,
    (SELECT sp.id FROM depots.savings_plans sp
     WHERE sp.depot_id = p_depot_id AND sp.asset_id = p_asset_id),
    p_worth::numeric, p_frequency);

  INSERT INTO depots.savings_plans (depot_id, asset_id, worth, period, created, last_changed, last_executed, created_by)
  VALUES (p_depot_id, p_asset_id, p_worth, p_frequency, NOW(), NOW(), NULL, auth.uid())
  ON CONFLICT (asset_id, depot_id) DO UPDATE SET
    worth        = EXCLUDED.worth,
    period       = EXCLUDED.period,
    last_changed = NOW();
END;
$$;
