-- =============================================================================
-- depots.execute_savings_plans() / PROCEDURE depots.run_savings_plans(job_id, config)
-- Depends on: depots.savings_plans, api.latest_prices, depots.transactions,
--             depots.sp_to_interval (04-functions/depots/sp_to_interval.sql)
-- Job registration: 12-jobs/execute_savings_plans.sql (daily)
-- -----------------------------------------------------------------------------
-- Executes every due plan at the asset's latest price: a plan is due when it
-- has never run, or its period has passed since the last run. Each execution
-- is a 'savings_plan' transaction (funded by the budget, not depot cash).
-- Returns the number of executed plans.
-- =============================================================================

CREATE OR REPLACE FUNCTION depots.execute_savings_plans()
RETURNS integer
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_count integer;
BEGIN
  WITH due AS (
    SELECT sp.id, sp.depot_id, sp.asset_id,
           sp.worth::numeric / lp.close AS amount,
           lp.close AS price
    FROM depots.savings_plans sp
    JOIN api.latest_prices lp ON lp.asset_id = sp.asset_id
    WHERE lp.close > 0
      AND (sp.last_executed IS NULL
           OR sp.last_executed + depots.sp_to_interval(sp.period) <= CURRENT_DATE)
    FOR UPDATE OF sp SKIP LOCKED
  ),
  inserted AS (
    INSERT INTO depots.transactions (depot_id, user_id, asset_id, amount, price, commission, type)
    SELECT due.depot_id, NULL, due.asset_id, due.amount, due.price, 0, 'savings_plan'
    FROM due
  )
  UPDATE depots.savings_plans sp
  SET last_executed = CURRENT_DATE
  FROM due
  WHERE sp.id = due.id;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

CREATE OR REPLACE PROCEDURE depots.run_savings_plans(job_id int, config jsonb)
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM depots.execute_savings_plans();
END;
$$;
