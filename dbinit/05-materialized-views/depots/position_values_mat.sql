-- =============================================================================
-- depots.position_values_mat
-- Depends on: depots.transactions,
--             depots.aggregated_transactions_mat
--             (05-materialized-views/depots/aggregated_transactions_mat.sql),
--             api.asset_prices
-- -----------------------------------------------------------------------------
-- Daily market value + profit per depot/asset. Reads from the matview above
-- so no window functions run at query time.
-- Cash rides along as a pseudo-position: asset_id IS NULL, no price,
-- market_value = 0. That keeps depots.values unchanged while letting
-- deposits/withdrawals flow into cash and total value.
-- =============================================================================

CREATE MATERIALIZED VIEW depots.position_values_mat AS
WITH depot_first_transaction AS (
  SELECT depot_id, MIN(tstamp::date) AS first_date
  FROM depots.transactions
  GROUP BY depot_id
),
depot_assets AS (
  SELECT DISTINCT depot_id, asset_id
  FROM depots.transactions
),
date_range AS (
  SELECT
    da.depot_id,
    da.asset_id,
    generate_series(dft.first_date, CURRENT_DATE, '1 day'::interval)::date AS tstamp
  FROM depot_assets da
  JOIN depot_first_transaction dft ON da.depot_id = dft.depot_id
),
joined AS (
  SELECT
    dr.depot_id,
    dr.tstamp,
    dr.asset_id,
    t.running_amount,
    t.running_commission,
    t.running_expenses,
    ap.close AS price,
    CASE WHEN dr.asset_id IS NULL
      THEN 0::numeric                                   -- cash is not an asset holding
      ELSE t.running_amount * ap.close::numeric
    END AS market_value
  FROM date_range dr
  INNER JOIN LATERAL (
    SELECT running_amount, running_commission, running_expenses
    FROM depots.aggregated_transactions_mat t
    WHERE t.depot_id  = dr.depot_id
      AND t.asset_id IS NOT DISTINCT FROM dr.asset_id   -- NULL-safe: keeps cash rows
      AND t.tstamp   <= dr.tstamp
    ORDER BY t.tstamp DESC
    LIMIT 1
  ) t ON TRUE
  LEFT JOIN LATERAL (
    SELECT close
    FROM api.asset_prices
    WHERE asset_id = dr.asset_id
      AND tstamp  <= dr.tstamp
    ORDER BY tstamp DESC
    LIMIT 1
  ) ap ON TRUE
  WHERE dr.asset_id IS NULL OR ap.close IS NOT NULL     -- cash has no price, keep it anyway
)
SELECT
  depot_id,
  tstamp,
  asset_id,
  running_amount,
  running_commission,
  running_expenses,
  price,
  market_value,
  market_value - running_expenses - running_commission AS position_profit
FROM joined
ORDER BY depot_id, tstamp, asset_id
WITH DATA;

-- Required for CONCURRENTLY refresh
CREATE UNIQUE INDEX idx_position_values_mat_unique
  ON depots.position_values_mat (depot_id, asset_id, tstamp) NULLS NOT DISTINCT;

-- Optimised for GROUP BY in depots.values
CREATE INDEX idx_position_values_mat_depot_tstamp
  ON depots.position_values_mat (depot_id, tstamp);

-- Optimised for LATERAL join in get_position_profits
CREATE INDEX idx_position_values_mat_asset_depot
  ON depots.position_values_mat (asset_id, depot_id);
