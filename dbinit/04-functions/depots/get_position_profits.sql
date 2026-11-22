-- =============================================================================
-- depots.get_position_profits(p_depot_id)
-- Depends on: depots.holdings, depots.transactions, api.assets,
--             api.latest_prices, depots.transaction_expense
-- -----------------------------------------------------------------------------
-- Open positions of one depot: amount from depots.holdings, latest price from
-- api.latest_prices, invested/sold split from the depot's ledger rows.
-- Runs as the caller, so RLS on holdings/transactions applies.
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
  WITH flows AS (
    SELECT
      t.asset_id,
      SUM(CASE WHEN t.amount > 0
            THEN depots.transaction_expense(t.type, t.amount, t.price) + t.commission
            ELSE 0 END) AS total_invested,
      SUM(CASE WHEN t.amount < 0
            THEN -depots.transaction_expense(t.type, t.amount, t.price) - t.commission
            ELSE 0 END) AS total_sold
    FROM depots.transactions t
    WHERE t.depot_id = p_depot_id
      AND t.asset_id IS NOT NULL
    GROUP BY t.asset_id
  )
  SELECT
    h.depot_id,
    h.asset_id,
    a.symbol,
    a.name,
    a.asset_type::text,
    a.description,
    h.amount,
    f.total_invested,
    f.total_sold,
    lp.close,
    h.amount * lp.close,
    f.total_sold + h.amount * lp.close - f.total_invested
  FROM depots.holdings h
  JOIN flows f ON f.asset_id = h.asset_id
  JOIN api.assets a ON a.id = h.asset_id
  LEFT JOIN api.latest_prices lp ON lp.asset_id = h.asset_id
  WHERE h.depot_id = p_depot_id
    AND h.asset_id IS NOT NULL
    AND h.amount > 0;
$$;
