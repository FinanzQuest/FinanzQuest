-- =============================================================================
-- depots.get_intraday_values(p_depot_id, p_since DEFAULT start of today)
-- Depends on: depots.depots, depots.holdings, depots.transactions,
--             api.asset_prices_intraday, api.asset_prices, api.latest_prices,
--             depots.transaction_expense, depots.transaction_affects_commission
-- -----------------------------------------------------------------------------
-- The depot's value over the day: one point at p_since (valued at the
-- previous close), one per 15-minute bar time of any asset the depot holds or
-- traded, and a final point at now() valued exactly like
-- depots.current_values (latest prices).
--
-- Positions at a point = holdings minus the transactions after it, so a trade
-- at 14:07 counts from the first point after 14:07. Prices are carried
-- forward: last bar at or before the point, else the last daily close before
-- the window.
--
-- Totals only; SECURITY DEFINER because depot totals are public (like
-- depots.values) while holdings/transactions are RLS-protected.
-- =============================================================================

CREATE OR REPLACE FUNCTION depots.get_intraday_values(
  p_depot_id bigint,
  p_since    timestamptz DEFAULT NULL
) RETURNS TABLE (tstamp timestamptz, value numeric, cash numeric, assets numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH params AS (
    SELECT COALESCE(p_since, date_trunc('day', now())) AS since
  ),
  dep AS (
    SELECT d.cash_start FROM depots.depots d WHERE d.id = p_depot_id
  ),
  -- every depot/asset row (incl. cash and sold-out positions) with its
  -- previous close and latest price
  hs AS MATERIALIZED (
    SELECT h.asset_id,
           h.amount,
           h.expenses + h.commission AS spent,
           lp.close AS latest,
           seed.close AS prev_close
    FROM depots.holdings h
    CROSS JOIN params
    LEFT JOIN api.latest_prices lp ON lp.asset_id = h.asset_id
    LEFT JOIN LATERAL (
      SELECT p.close::numeric AS close
      FROM api.asset_prices p
      WHERE p.asset_id = h.asset_id
        AND p.tstamp < params.since::date
        AND p.close IS NOT NULL
      ORDER BY p.tstamp DESC
      LIMIT 1
    ) seed ON h.asset_id IS NOT NULL
    WHERE h.depot_id = p_depot_id
  ),
  -- ledger rows inside the window (to roll positions back to each point)
  late AS MATERIALIZED (
    SELECT t.asset_id,
           t.tstamp::timestamptz AS ts,
           t.amount,
           depots.transaction_expense(t.type, t.amount, t.price)
             + CASE WHEN depots.transaction_affects_commission(t.type) THEN t.commission ELSE 0 END AS spent
    FROM depots.transactions t, params
    WHERE t.depot_id = p_depot_id
      AND t.tstamp::timestamptz > params.since
  ),
  grid AS (
    SELECT params.since AS ts FROM params
    UNION
    SELECT i.tstamp
    FROM api.asset_prices_intraday i, params
    WHERE i.asset_id IN (SELECT hs.asset_id FROM hs WHERE hs.asset_id IS NOT NULL)
      AND i.tstamp > params.since
      AND i.tstamp < now()
    UNION
    SELECT now()
  )
  SELECT g.ts,
         dep.cash_start + COALESCE(SUM(x.mv - x.spent), 0),
         dep.cash_start - COALESCE(SUM(x.spent), 0),
         COALESCE(SUM(x.mv), 0)
  FROM grid g
  CROSS JOIN dep
  CROSS JOIN params
  LEFT JOIN LATERAL (
    SELECT hs.spent - COALESCE(lt.spent, 0) AS spent,
           CASE WHEN hs.asset_id IS NULL THEN 0
                ELSE COALESCE((hs.amount - COALESCE(lt.amount, 0)) *
                       CASE WHEN g.ts = now() THEN hs.latest
                            ELSE COALESCE(bar.close, hs.prev_close) END, 0)
           END AS mv
    FROM hs
    LEFT JOIN LATERAL (
      SELECT SUM(l.amount) AS amount, SUM(l.spent) AS spent
      FROM late l
      WHERE l.asset_id IS NOT DISTINCT FROM hs.asset_id
        AND l.ts > g.ts
    ) lt ON TRUE
    LEFT JOIN LATERAL (
      SELECT i.close
      FROM api.asset_prices_intraday i
      WHERE i.asset_id = hs.asset_id
        AND i.tstamp <= g.ts
        AND i.tstamp > params.since
        AND i.close IS NOT NULL
      ORDER BY i.tstamp DESC
      LIMIT 1
    ) bar ON hs.asset_id IS NOT NULL AND g.ts <> now()
  ) x ON TRUE
  GROUP BY g.ts, dep.cash_start
  ORDER BY g.ts;
$$;
