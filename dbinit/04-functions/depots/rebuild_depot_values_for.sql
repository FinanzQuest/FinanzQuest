-- =============================================================================
-- depots.rebuild_depot_values_for(p_depot_ids, p_from_days)
-- Depends on: depots.daily_values, depots.depots, depots.transactions,
--             api.asset_prices, depots.transaction_expense,
--             depots.transaction_affects_commission (04-functions/depots/)
-- -----------------------------------------------------------------------------
-- Recomputes depots.daily_values for each given depot from its from_day up to
-- yesterday (closed days only), straight from the ledger and prices. The two
-- arrays are parallel: depot p_depot_ids[i] is rebuilt from p_from_days[i]
-- ('-infinity' = whole history).
--
-- Valuation per depot and day:
--   cash   = cash_start - running SUM(expenses + commission)   (all rows)
--   assets = SUM(held amount * last known close)               (no cutoff)
--   value  = cash + assets
-- Positions are handled as constant-amount segments between trade days, so
-- only (depot, held asset, day) rows are priced — through one hash join on a
-- per-asset daily price grid instead of a lookup per row.
-- A day is stored only if a held asset has a real price that day, the depot
-- traded that day, or the depot holds no assets (weekends drop out).
--
-- Callers: transaction trigger (backdated changes), depots.refresh_depot_values
-- (hourly job), depots.rebuild_depot_values (manual).
-- =============================================================================

CREATE OR REPLACE FUNCTION depots.rebuild_depot_values_for(p_depot_ids bigint[], p_from_days date[])
RETURNS void
LANGUAGE plpgsql
SET search_path = depots, pg_temp
AS $$
DECLARE
  v_last    date := CURRENT_DATE - 1;  -- today is live, never stored
  v_min_day date;                      -- earliest day any target needs
BEGIN
  SELECT MIN(GREATEST(t.from_day, f.first_day))
  INTO v_min_day
  FROM unnest(p_depot_ids, p_from_days) AS t(depot_id, from_day)
  CROSS JOIN LATERAL (
    SELECT MIN(tx.tstamp)::date AS first_day
    FROM depots.transactions tx
    WHERE tx.depot_id = t.depot_id
  ) f;

  DELETE FROM depots.daily_values dv
  USING unnest(p_depot_ids, p_from_days) AS t(depot_id, from_day)
  WHERE dv.depot_id = t.depot_id
    AND dv.tstamp  >= t.from_day;

  INSERT INTO depots.daily_values AS dv (depot_id, tstamp, value, cash, profit_from_start, assets)
  WITH target AS (
    SELECT t.depot_id, MIN(t.from_day) AS from_day
    FROM unnest(p_depot_ids, p_from_days) AS t(depot_id, from_day)
    JOIN depots.depots d ON d.id = t.depot_id
    GROUP BY t.depot_id
  ),
  daily AS (                         -- ledger per depot/asset/day, closed days
    SELECT tx.depot_id,
           tx.asset_id,
           tx.tstamp::date AS day,
           SUM(tx.amount::numeric)                                      AS amount,
           SUM(depots.transaction_expense(tx.type, tx.amount, tx.price)) AS expenses,
           SUM(CASE WHEN depots.transaction_affects_commission(tx.type)
                    THEN tx.commission::numeric ELSE 0 END)             AS commission
    FROM depots.transactions tx
    JOIN target t ON t.depot_id = tx.depot_id
    WHERE tx.tstamp::date <= v_last
    GROUP BY tx.depot_id, tx.asset_id, tx.tstamp::date
  ),
  date_range AS (                    -- never before the first transaction
    SELECT t.depot_id, GREATEST(t.from_day, MIN(d.day)) AS from_day
    FROM target t
    JOIN daily d ON d.depot_id = t.depot_id
    GROUP BY t.depot_id, t.from_day
  ),
  -- Cash side, per depot and day: running expenses + commission -------------
  depot_daily AS (
    SELECT depot_id, day, SUM(expenses + commission) AS spent
    FROM daily
    GROUP BY depot_id, day
  ),
  spent_before AS (                  -- spent before the range
    SELECT r.depot_id, COALESCE(SUM(b.spent), 0) AS spent
    FROM date_range r
    LEFT JOIN depot_daily b ON b.depot_id = r.depot_id AND b.day < r.from_day
    GROUP BY r.depot_id
  ),
  depot_days AS (
    SELECT r.depot_id, g.day::date AS day,
           sb.spent + SUM(COALESCE(dd.spent, 0)) OVER (PARTITION BY r.depot_id ORDER BY g.day) AS spent,
           dd.depot_id IS NOT NULL AS has_transaction
    FROM date_range r
    JOIN spent_before sb ON sb.depot_id = r.depot_id
    CROSS JOIN LATERAL generate_series(r.from_day, v_last, interval '1 day') AS g(day)
    LEFT JOIN depot_daily dd ON dd.depot_id = r.depot_id AND dd.day = g.day::date
  ),
  -- Asset side: constant-amount segments between trade days ------------------
  segments AS (
    SELECT s.depot_id, s.asset_id, s.amount,
           GREATEST(s.day, r.from_day) AS seg_from,
           s.seg_to
    FROM (
      SELECT d.depot_id, d.asset_id, d.day,
             SUM(d.amount) OVER (PARTITION BY d.depot_id, d.asset_id ORDER BY d.day) AS amount,
             COALESCE(LEAD(d.day) OVER (PARTITION BY d.depot_id, d.asset_id ORDER BY d.day) - 1,
                      v_last) AS seg_to
      FROM daily d
      WHERE d.asset_id IS NOT NULL
    ) s
    JOIN date_range r ON r.depot_id = s.depot_id
    WHERE s.seg_to >= r.from_day
      AND s.amount <> 0               -- sold out: contributes nothing
  ),
  need AS (                          -- assets to price, from when on
    SELECT asset_id, MIN(seg_from) AS from_day
    FROM segments
    GROUP BY asset_id
  ),
  seed AS (                          -- last close before the range, per asset
    SELECT n.asset_id, s.close, s.tstamp
    FROM need n
    CROSS JOIN LATERAL (
      SELECT ap.close::numeric AS close, ap.tstamp
      FROM api.asset_prices ap
      WHERE ap.asset_id = n.asset_id
        AND ap.tstamp   < n.from_day
        AND ap.close IS NOT NULL
      ORDER BY ap.tstamp DESC
      LIMIT 1
    ) s
  ),
  asset_days AS (                    -- one range scan instead of a lookup per day
    SELECT n.asset_id, g.day::date AS day, ap.close::numeric AS close, ap.tstamp AS price_date
    FROM need n
    CROSS JOIN LATERAL generate_series(n.from_day, v_last, interval '1 day') AS g(day)
    LEFT JOIN api.asset_prices ap
      ON ap.asset_id = n.asset_id
     AND ap.tstamp   = g.day::date
     AND ap.tstamp  >= v_min_day     -- constant bound -> chunk exclusion
     AND ap.close IS NOT NULL
  ),
  prices AS (                        -- carry the last close forward
    SELECT a.asset_id, a.day,
           CASE WHEN a.grp = 0 THEN s.close  ELSE FIRST_VALUE(a.close)      OVER w END AS close,
           CASE WHEN a.grp = 0 THEN s.tstamp ELSE FIRST_VALUE(a.price_date) OVER w END AS price_date
    FROM (SELECT asset_days.*,
                 COUNT(close) OVER (PARTITION BY asset_id ORDER BY day) AS grp
          FROM asset_days) a
    LEFT JOIN seed s ON s.asset_id = a.asset_id
    WINDOW w AS (PARTITION BY a.asset_id, a.grp ORDER BY a.day)
  ),
  market AS (                        -- held amount * price, per depot and day
    SELECT sg.depot_id, p.day,
           SUM(sg.amount * COALESCE(p.close, 0)) AS market_value,
           BOOL_OR(p.price_date = p.day)          AS has_price
    FROM segments sg
    JOIN prices p ON p.asset_id = sg.asset_id
                 AND p.day BETWEEN sg.seg_from AND sg.seg_to
    GROUP BY sg.depot_id, p.day
  )
  SELECT dd.depot_id,
         dd.day,
         dep.cash_start - dd.spent + COALESCE(m.market_value, 0),
         dep.cash_start - dd.spent,
         COALESCE(m.market_value, 0) - dd.spent,
         COALESCE(m.market_value, 0)
  FROM depot_days dd
  JOIN depots.depots dep ON dep.id = dd.depot_id
  LEFT JOIN market m ON m.depot_id = dd.depot_id AND m.day = dd.day
  -- keep days that carry information: a real price for a held asset, a trade,
  -- or nothing held at all (value only moves with cash then)
  WHERE m.has_price OR dd.has_transaction OR m.depot_id IS NULL
  ON CONFLICT (depot_id, tstamp) DO UPDATE SET
    value             = EXCLUDED.value,
    cash              = EXCLUDED.cash,
    profit_from_start = EXCLUDED.profit_from_start,
    assets            = EXCLUDED.assets;
END;
$$;
