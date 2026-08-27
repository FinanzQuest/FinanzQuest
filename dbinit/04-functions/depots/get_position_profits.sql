-- =============================================================================
-- depots.get_position_profits(p_depot_id)
-- Depends on: depots.transactions, api.assets, api.asset_prices,
--             depots.transaction_expense (04-functions/depots/transaction_expense.sql)
-- -----------------------------------------------------------------------------
-- Scoped to one depot, only fetches prices for assets the depot actually
-- holds (avoids full table scan). Cash rows (asset_id IS NULL) are excluded;
-- they have no price.
-- =============================================================================

CREATE OR REPLACE FUNCTION depots.get_position_profits(p_depot_id bigint)
RETURNS TABLE (
  depot_id       bigint,
  asset_id       bigint,
  symbol         text,
  name           text,
  asset_type     text,
  description    text,
  current_amount numeric,
  total_invested numeric,
  total_sold     numeric,
  current_price  numeric,
  market_value   numeric,
  total_profit   numeric
)
LANGUAGE sql STABLE AS $$
  WITH position_summary AS (
    SELECT
      t.depot_id,
      t.asset_id,
      SUM(t.amount::numeric) AS current_amount,
      SUM(CASE WHEN t.amount > 0
            THEN depots.transaction_expense(t.type, t.amount, t.price) + t.commission::numeric
            ELSE 0 END) AS total_invested,
      SUM(CASE WHEN t.amount < 0
            THEN -depots.transaction_expense(t.type, t.amount, t.price) - t.commission::numeric
            ELSE 0 END) AS total_sold
    FROM depots.transactions t
    WHERE t.depot_id  = p_depot_id
      AND t.asset_id IS NOT NULL          -- skip cash movements
    GROUP BY t.depot_id, t.asset_id
    HAVING SUM(t.amount) > 0
  ),
  latest_prices AS (
    SELECT DISTINCT ON (p.asset_id)
      p.asset_id,
      p.close::numeric AS current_price
    FROM api.asset_prices p
    WHERE p.close IS NOT NULL
      AND p.asset_id IN (SELECT ps.asset_id FROM position_summary ps)
    ORDER BY p.asset_id, p.tstamp DESC
  )
  SELECT
    ps.depot_id,
    ps.asset_id,
    a.symbol,
    a.name,
    a.asset_type::text,
    a.description,
    ps.current_amount,
    ps.total_invested,
    ps.total_sold,
    lp.current_price,
    ps.current_amount * lp.current_price                                       AS market_value,
    ps.total_sold + (ps.current_amount * lp.current_price) - ps.total_invested AS total_profit
  FROM position_summary ps
  JOIN api.assets a ON ps.asset_id = a.id
  LEFT JOIN latest_prices lp ON ps.asset_id = lp.asset_id;
$$;
