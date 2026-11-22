-- =============================================================================
-- depots.aggregated_values
-- Depends on: depots.current_values (06-views/depots/current_values.sql),
--             depots.daily_values (03-tables/depots/daily_values.sql)
-- -----------------------------------------------------------------------------
-- One row per depot: today's live value and the change against the last
-- stored day before today, and the last stored day at least one month / one
-- year ago (calendar-based; NULL when the history is shorter). Each previous
-- value is a single backward primary-key probe into daily_values.
-- =============================================================================

CREATE OR REPLACE VIEW depots.aggregated_values AS
SELECT
  c.assets,
  c.depot_id,
  c.cash,
  c.value                                            AS total,
  c.profit_from_start,
  c.tstamp,
  p1d.value                                          AS prev_1d_total,
  p1m.value                                          AS prev_1m_total,
  p1y.value                                          AS prev_1y_total,
  c.value - p1d.value                                AS diff_1d,
  c.value - p1m.value                                AS diff_1m,
  c.value - p1y.value                                AS diff_1y,
  (c.value - p1d.value) / NULLIF(p1d.value, 0) * 100 AS rel_diff_1d,
  (c.value - p1m.value) / NULLIF(p1m.value, 0) * 100 AS rel_diff_1m,
  (c.value - p1y.value) / NULLIF(p1y.value, 0) * 100 AS rel_diff_1y
FROM depots.current_values c
LEFT JOIN LATERAL (
  SELECT dv.value FROM depots.daily_values dv
  WHERE dv.depot_id = c.depot_id AND dv.tstamp < c.tstamp
  ORDER BY dv.tstamp DESC LIMIT 1
) p1d ON TRUE
LEFT JOIN LATERAL (
  SELECT dv.value FROM depots.daily_values dv
  WHERE dv.depot_id = c.depot_id AND dv.tstamp <= (c.tstamp - INTERVAL '1 month')::date
  ORDER BY dv.tstamp DESC LIMIT 1
) p1m ON TRUE
LEFT JOIN LATERAL (
  SELECT dv.value FROM depots.daily_values dv
  WHERE dv.depot_id = c.depot_id AND dv.tstamp <= (c.tstamp - INTERVAL '1 year')::date
  ORDER BY dv.tstamp DESC LIMIT 1
) p1y ON TRUE;
