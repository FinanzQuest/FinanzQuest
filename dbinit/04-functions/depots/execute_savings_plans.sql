-- =============================================================================
-- depots.execute_savings_plans()
-- Depends on: depots.savings_plans, depots.depots, api.asset_prices,
--             depots.sp_to_interval (04-functions/depots/sp_to_interval.sql),
--             depots.TransactionType
-- -----------------------------------------------------------------------------
-- NOTE: casts to unqualified TransactionType (relies on search_path) — see
-- flagged issues.
-- =============================================================================

CREATE OR REPLACE FUNCTION depots.execute_savings_plans()
RETURNS void AS $$
BEGIN
  WITH executable_plans AS (
    SELECT
      sp.id,
      sp.depot_id,
      sp.asset_id,
      sp.worth / p.close AS amount,
      p.close AS price
    FROM depots.savings_plans sp
    JOIN depots.depots d ON d.id = sp.depot_id
    JOIN LATERAL (
      SELECT close FROM api.asset_prices
      WHERE asset_id = sp.asset_id
      ORDER BY tstamp DESC
      LIMIT 1
    ) p ON TRUE
    WHERE sp.last_executed + depots.sp_to_interval(sp.period) <= CURRENT_DATE -- only the plans due to update today or before
  ),
  inserted AS (
    INSERT INTO depots.transactions (depot_id, asset_id, amount, price, commission, user_id, type)
    SELECT
      ep.depot_id,
      ep.asset_id,
      ep.amount,
      ep.price,
      0.0,
      NULL,
      'savings_plan'::TransactionType
    FROM executable_plans ep
    RETURNING depot_id, asset_id
  )
  UPDATE depots.savings_plans sp
  SET last_executed = CURRENT_DATE
  FROM executable_plans ep
  WHERE sp.id = ep.id;
END;
$$ LANGUAGE plpgsql;
