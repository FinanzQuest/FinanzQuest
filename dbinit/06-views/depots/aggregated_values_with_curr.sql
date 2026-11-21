-- =============================================================================
-- depots.aggregated_values_with_curr
-- Depends on: depots.depot_values_with_curr (06-views/depots/depot_values_with_curr.sql)
-- -----------------------------------------------------------------------------
-- Same shape as depots.aggregated_values (one row per depot, latest value plus
-- 1d/1m/1y diffs) but computed over depot_values_with_curr, so "total" is the
-- live value including today's transactions.
--
-- SECURITY: inherits the is_depot_member filter of depot_values_with_curr —
-- each caller only sees their own depots. Inspecting a foreign depot keeps
-- using depots.aggregated_values. Grant:
-- 10-grants/depots/aggregated_values_with_curr.sql
-- =============================================================================

CREATE OR REPLACE VIEW depots.aggregated_values_with_curr AS
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
  FROM depots.depot_values_with_curr
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
