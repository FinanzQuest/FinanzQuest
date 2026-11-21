-- =============================================================================
-- depots.depot_values_with_curr
-- Depends on: depots.values (06-views/depots/values.sql),
--             depots.current_position_value (06-views/depots/current_position_value.sql),
--             depots.depots, depots.is_depot_member
-- -----------------------------------------------------------------------------
-- One row per depot per day: depot value history up to yesterday (depots.values)
-- UNIONed with the live depot value for today (aggregated from
-- depots.current_position_value, incl. today's transactions). The matview's own
-- CURRENT_DATE row is excluded so today appears exactly once, as the live value.
-- Columns match depots.values: depot_id, tstamp, value, cash, profit_from_start,
-- assets.
--
-- SECURITY: owner-run view filtered through depots.is_depot_member(depot_id);
-- each caller sees only their own depots. Grant:
-- 10-grants/depots/depot_values_with_curr.sql
-- =============================================================================

CREATE OR REPLACE VIEW depots.depot_values_with_curr AS
SELECT * FROM (
  SELECT depot_id, tstamp, value, cash, profit_from_start, assets
  FROM depots.values
  WHERE tstamp < CURRENT_DATE
  UNION ALL
  SELECT
    pv.depot_id,
    CURRENT_DATE,
    d.cash_start + SUM(pv.position_profit)                        AS value,
    d.cash_start - SUM(pv.current_commission + pv.current_expenses) AS cash,
    SUM(pv.position_profit)                                       AS profit_from_start,
    SUM(pv.market_value)                                          AS assets
  FROM depots.current_position_value pv
  JOIN depots.depots d ON d.id = pv.depot_id
  GROUP BY pv.depot_id, d.cash_start
) u
WHERE depots.is_depot_member(u.depot_id);
