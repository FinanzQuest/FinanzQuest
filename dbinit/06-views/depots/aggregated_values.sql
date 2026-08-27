-- =============================================================================
-- depots.aggregated_values
-- Depends on: depots.values (06-views/depots/values.sql)
-- -----------------------------------------------------------------------------
-- One row per depot with diff columns
-- =============================================================================

CREATE OR REPLACE VIEW depots.aggregated_values AS
WITH latest_per_depot AS (
  SELECT
    assets,
    depot_id,
    cash,
    profit_from_start,
    value AS total,
    tstamp,
    NTH_VALUE(value, 2) OVER (
      PARTITION BY depot_id ORDER BY tstamp DESC
      ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS prev_1d_total,
    NTH_VALUE(value, 23) OVER (
      PARTITION BY depot_id ORDER BY tstamp DESC
      ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS prev_1m_total,
    NTH_VALUE(value, 253) OVER (
      PARTITION BY depot_id ORDER BY tstamp DESC
      ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS prev_1y_total,
    ROW_NUMBER() OVER (PARTITION BY depot_id ORDER BY tstamp DESC) AS rn
  FROM depots.values
)
SELECT
  assets,
  depot_id,
  cash,
  total,
  profit_from_start,
  tstamp,
  prev_1d_total,
  prev_1m_total,
  prev_1y_total,
  total - prev_1d_total                              AS diff_1d,
  total - prev_1m_total                              AS diff_1m,
  total - prev_1y_total                              AS diff_1y,
  (total - prev_1d_total) / NULLIF(prev_1d_total, 0) * 100 AS rel_diff_1d,
  (total - prev_1m_total) / NULLIF(prev_1m_total, 0) * 100 AS rel_diff_1m,
  (total - prev_1y_total) / NULLIF(prev_1y_total, 0) * 100 AS rel_diff_1y
FROM latest_per_depot
WHERE rn = 1;
