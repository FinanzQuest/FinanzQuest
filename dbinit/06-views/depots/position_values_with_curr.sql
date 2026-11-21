-- =============================================================================
-- depots.position_values_with_curr
-- Depends on: depots.position_values_mat (05-materialized-views/),
--             depots.current_position_value (06-views/depots/current_position_value.sql),
--             depots.transactions, depots.is_depot_member
-- -----------------------------------------------------------------------------
-- Full position history up to yesterday (position_values_mat) UNIONed with the
-- live positions for today (current_position_value, incl. today's transactions).
-- The matview's own CURRENT_DATE rows are excluded so each (depot, asset) has
-- exactly one row per day — the current day is the live snapshot, not the last
-- refreshed one. Columns match position_values_mat, so this view is a drop-in
-- superset of it.
--
-- SECURITY: same as current_position_value — owner-run view whose whole result
-- is filtered through depots.is_depot_member(depot_id) (the history side reads
-- position_values_mat, which cannot carry RLS). Each caller sees only their own
-- depots. Grant: 10-grants/depots/position_values_with_curr.sql
-- =============================================================================

CREATE OR REPLACE VIEW depots.position_values_with_curr AS
SELECT * FROM (
  SELECT depot_id, tstamp, asset_id, running_amount, running_commission,
         running_expenses, has_transaction, price, price_date, is_actual_price,
         market_value, position_profit
  FROM depots.position_values_mat
  WHERE tstamp < CURRENT_DATE
  UNION ALL
  SELECT
    cpv.depot_id,
    CURRENT_DATE,
    cpv.asset_id,
    cpv.current_amount,
    cpv.current_commission,
    cpv.current_expenses,
    EXISTS (SELECT 1 FROM depots.transactions tx
            WHERE tx.depot_id = cpv.depot_id
              AND tx.asset_id IS NOT DISTINCT FROM cpv.asset_id
              AND tx.tstamp::date = CURRENT_DATE) AS has_transaction,
    cpv.price,
    cpv.price_date,
    cpv.is_actual_price,
    cpv.market_value,
    cpv.position_profit
  FROM depots.current_position_value cpv
) u
WHERE depots.is_depot_member(u.depot_id);
