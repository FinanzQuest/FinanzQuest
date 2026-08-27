-- =============================================================================
-- depots.leaderboard
-- Depends on: depots.values (06-views/depots/values.sql), depots.depots,
--             users.profile (06-views/users/profile.sql),
--             users.profile_ref (02-types/profile_ref.sql)
-- =============================================================================

CREATE OR REPLACE VIEW depots.leaderboard AS
  WITH ranked AS (
      SELECT
          dv.depot_id,
          dv.tstamp,
          dv.value,
          dv.cash,
          dv.profit_from_start,
          dv.assets,
          ROW_NUMBER() OVER (PARTITION BY dv.depot_id ORDER BY dv.tstamp DESC) AS rn
      FROM depots.values AS dv
  ),
  latest AS (
      SELECT * FROM ranked WHERE rn = 1
  ),
  previous AS (
      SELECT * FROM ranked WHERE rn = 2
  ),
  current_ranks AS (
      SELECT
          l.depot_id,
          DENSE_RANK() OVER (ORDER BY l.value DESC) AS rank
      FROM latest l
  ),
  previous_ranks AS (
      SELECT
          p.depot_id,
          DENSE_RANK() OVER (ORDER BY p.value DESC) AS prev_rank
      FROM previous p
  ),
  last7 AS (
      SELECT
          depot_id,
          ARRAY_AGG(value ORDER BY tstamp DESC) AS sparkline
      FROM ranked
      WHERE rn <= 7
      GROUP BY depot_id
  )
  SELECT
      l.depot_id AS id,
      l.tstamp,
      l.value,
      l.cash,
      l.profit_from_start,
      l.assets,
      d.created,
      d.cash_start,
      cr.rank,
      pr.prev_rank,
      l7.sparkline,
      ARRAY_AGG(ROW(up.user_id, up.name)::users.profile_ref) AS users
  FROM latest AS l
  LEFT JOIN depots.depots AS d ON d.id = l.depot_id
  LEFT JOIN users.profile AS up ON up.user_id = ANY(d.users)
  LEFT JOIN current_ranks AS cr ON cr.depot_id = l.depot_id
  LEFT JOIN previous_ranks AS pr ON pr.depot_id = l.depot_id
  LEFT JOIN last7 AS l7 ON l7.depot_id = l.depot_id
  GROUP BY l.depot_id, l.tstamp, l.value, l.cash, l.profit_from_start, l.assets,
           d.id, d.created, d.cash, d.cash_start, d.users,
           cr.rank, pr.prev_rank, l7.sparkline
  ORDER BY cr.rank;
