-- =============================================================================
-- depots.check_savings_budget(p_depot_id, p_exclude_id, p_worth, p_period)
-- Depends on: depots.savings_plans, depots.savings_plans_budget,
--             depots.sp_to_per_month (04-functions/depots/sp_to_per_month.sql)
-- -----------------------------------------------------------------------------
-- Raises if the depot's savings plans would cost more per month than its
-- budget once a plan of p_worth per p_period is added (p_exclude_id: the plan
-- being replaced, if any). Savings plan executions are funded by this budget,
-- not by depot cash, so the cap is what keeps them from being free money.
-- Locks the budget row so concurrent plan changes are checked one at a time.
-- =============================================================================

CREATE OR REPLACE FUNCTION depots.check_savings_budget(
  p_depot_id   bigint,
  p_exclude_id bigint,
  p_worth      numeric,
  p_period     SavingsPeriod
) RETURNS void
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_budget numeric;
  v_used   numeric;
  v_new    numeric := p_worth * depots.sp_to_per_month(p_period);
BEGIN
  SELECT b.budget INTO v_budget
  FROM depots.savings_plans_budget b
  WHERE b.depot_id = p_depot_id
  FOR UPDATE;

  SELECT COALESCE(SUM(sp.worth * depots.sp_to_per_month(sp.period)), 0) INTO v_used
  FROM depots.savings_plans sp
  WHERE sp.depot_id = p_depot_id
    AND sp.id IS DISTINCT FROM p_exclude_id;

  IF v_used + v_new > COALESCE(v_budget, 0) + 0.005 THEN
    RAISE EXCEPTION 'Savings plans exceed the monthly budget (% of % used, this plan adds %)',
      round(v_used, 2), COALESCE(v_budget, 0), round(v_new, 2)
      USING ERRCODE = '22023';
  END IF;
END;
$$;
