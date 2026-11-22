-- =============================================================================
-- depots.leaderboard
-- Depends on: depots.current_values (06-views/depots/current_values.sql),
--             depots.daily_values, depots.depots,
--             users.profile (06-views/users/profile.sql),
--             users.profile_ref (02-types/profile_ref.sql)
-- -----------------------------------------------------------------------------
-- One row per depot, ranked by today's live value. prev_rank ranks the last
-- stored day before today (NULL for depots without history); sparkline is the
-- live value followed by up to 6 stored days, newest first.
-- Per depot this is one hash-joined live row plus one backward primary-key
-- range scan of at most 6 daily_values rows — no window over the history.
-- =============================================================================

CREATE OR REPLACE VIEW depots.leaderboard AS
WITH base AS (
  SELECT c.depot_id, c.tstamp, c.value, c.cash, c.profit_from_start, c.assets,
         hist.values AS history
  FROM depots.current_values c
  LEFT JOIN LATERAL (
    SELECT array_agg(x.value ORDER BY x.tstamp DESC) AS values
    FROM (
      SELECT dv.value, dv.tstamp
      FROM depots.daily_values dv
      WHERE dv.depot_id = c.depot_id AND dv.tstamp < c.tstamp
      ORDER BY dv.tstamp DESC
      LIMIT 6
    ) x
  ) hist ON TRUE
)
SELECT
  b.depot_id                                         AS id,
  b.tstamp,
  b.value,
  b.cash,
  b.profit_from_start,
  b.assets,
  d.created,
  d.cash_start,
  DENSE_RANK() OVER (ORDER BY b.value DESC)          AS rank,
  CASE WHEN b.history[1] IS NOT NULL
       THEN DENSE_RANK() OVER (ORDER BY b.history[1] DESC NULLS LAST)
  END                                                AS prev_rank,
  ARRAY[b.value] || COALESCE(b.history, '{}')        AS sparkline,
  COALESCE(u.users, '{}')                            AS users,
  d.name
FROM base b
JOIN depots.depots d ON d.id = b.depot_id
LEFT JOIN (
  -- one pass over users.profile (a function scan over auth.users), hash-joined
  SELECT d2.id AS depot_id,
         array_agg(ROW(up.user_id, up.name)::users.profile_ref ORDER BY up.user_id) AS users
  FROM depots.depots d2
  CROSS JOIN LATERAL unnest(d2.users) AS m(user_id)
  JOIN users.profile up ON up.user_id = m.user_id
  GROUP BY d2.id
) u ON u.depot_id = b.depot_id
ORDER BY rank;
