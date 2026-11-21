-- =============================================================================
-- depots.values
-- Depends on: depots.daily_values, depots.holdings, depots.depots
--             (03-tables/depots/), api.asset_prices
-- -----------------------------------------------------------------------------
-- One row per depot per day: the stored closed days (depots.daily_values) plus
-- a live row for today computed from depots.holdings and the latest known
-- close. Trades, rewards and new prices show up immediately.
-- Every depot has a today row (a depot without transactions is worth its
-- cash_start).
--
-- Depot totals are public by design (leaderboard, inspecting other depots);
-- per-position data stays in depots.holdings behind RLS. The view runs with
-- the owner's rights so it can total every depot.
-- =============================================================================

CREATE OR REPLACE VIEW depots.values AS
SELECT depot_id, tstamp, value, cash, profit_from_start, assets
FROM depots.daily_values
UNION ALL
SELECT
  d.id                                                            AS depot_id,
  CURRENT_DATE                                                    AS tstamp,
  d.cash_start + COALESCE(SUM(h.market_value - h.expenses - h.commission), 0) AS value,
  d.cash_start - COALESCE(SUM(h.expenses + h.commission), 0)     AS cash,
  COALESCE(SUM(h.market_value - h.expenses - h.commission), 0)   AS profit_from_start,
  COALESCE(SUM(h.market_value), 0)                               AS assets
FROM depots.depots d
LEFT JOIN LATERAL (
  SELECT h.expenses,
         h.commission,
         CASE WHEN h.asset_id IS NULL THEN 0
              ELSE COALESCE(h.amount * (
                SELECT p.close::numeric
                FROM api.asset_prices p
                WHERE p.asset_id = h.asset_id
                  AND p.close IS NOT NULL
                ORDER BY p.tstamp DESC
                LIMIT 1), 0)
         END AS market_value
  FROM depots.holdings h
  WHERE h.depot_id = d.id
) h ON TRUE
GROUP BY d.id, d.cash_start;
