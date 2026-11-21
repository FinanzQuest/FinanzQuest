-- =============================================================================
-- depots.aggregated_transactions_mat
-- Depends on: depots.transactions,
--             depots.transaction_expense, depots.transaction_affects_commission
--             (04-functions/depots/)
-- -----------------------------------------------------------------------------
-- Running totals per depot/asset/day. Window functions run once on refresh,
-- not on every query. asset_id IS NULL = the depot's cash "position".
-- max_tstamp = the raw transaction timestamp the day's row was aggregated
-- from (the last transaction included in that row). Consumers that overlay
-- *live* transactions on top of this snapshot (depots.current_position_value)
-- use it as the exact cutoff: everything with tstamp > max_tstamp is not yet
-- reflected in the running totals.
-- =============================================================================

CREATE MATERIALIZED VIEW depots.aggregated_transactions_mat AS
WITH daily_totals AS (
  SELECT
    depot_id,
    asset_id,                                    -- NULL = cash (movement rows)
    date(tstamp) AS tstamp,
    MAX(tstamp)  AS max_tstamp,                  -- last transaction folded into this day
    SUM(depots.transaction_expense(type, amount, price)) AS daily_expenses,
    SUM(amount::numeric)                                 AS daily_amount,
    SUM(
      CASE WHEN depots.transaction_affects_commission(type)
        THEN commission::numeric ELSE 0 END
    )                                                    AS daily_commission
  FROM depots.transactions
  GROUP BY depot_id, asset_id, date(tstamp)
)
SELECT
  depot_id,
  asset_id,
  tstamp,
  daily_amount,
  daily_commission,
  max_tstamp,
  SUM(daily_expenses)   OVER w AS running_expenses,
  SUM(daily_amount)     OVER w AS running_amount,
  SUM(daily_commission) OVER w AS running_commission
FROM daily_totals
WINDOW w AS (
  PARTITION BY depot_id, asset_id
  ORDER BY tstamp
  ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
)
ORDER BY depot_id, asset_id, tstamp
WITH DATA;

-- Required for CONCURRENTLY refresh.
-- NULLS NOT DISTINCT needs PG 15+; on older versions use COALESCE(asset_id, 0).
CREATE UNIQUE INDEX idx_agg_tx_mat_unique
  ON depots.aggregated_transactions_mat (depot_id, asset_id, tstamp) NULLS NOT DISTINCT;
