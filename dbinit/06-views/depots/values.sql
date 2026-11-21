-- =============================================================================
-- depots.values
-- Depends on: depots.position_values_mat (05-materialized-views/depots/),
--             depots.depots
-- -----------------------------------------------------------------------------
-- Simple GROUP BY on the matview, fast
-- =============================================================================

CREATE OR REPLACE VIEW depots.values AS
SELECT
  pv.depot_id,
  pv.tstamp,
  d.cash_start + SUM(pv.position_profit)                            AS value,
  d.cash_start - SUM(pv.running_commission + pv.running_expenses)   AS cash,
  SUM(pv.position_profit)                                           AS profit_from_start,
  SUM(pv.market_value)                                              AS assets
FROM depots.position_values_mat pv
JOIN depots.depots d ON pv.depot_id = d.id
GROUP BY pv.depot_id, pv.tstamp, d.cash_start
HAVING BOOL_OR(pv.is_actual_price) 
  OR BOOL_OR(pv.has_transaction)
  OR BOOL_AND(pv.asset_id IS NULL)
ORDER BY pv.depot_id, pv.tstamp;
