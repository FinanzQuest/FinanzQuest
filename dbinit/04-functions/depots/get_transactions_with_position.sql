-- =============================================================================
-- depots.get_transactions_with_position(p_depot_id)
-- Depends on: depots.transactions,
--             depots.get_position_profits (04-functions/depots/get_position_profits.sql)
-- -----------------------------------------------------------------------------
-- Calls get_position_profits once, joins result against filtered transactions
-- (no repeated view evaluation). 'movement' rows come back with NULL asset
-- columns (LEFT JOIN).
-- =============================================================================

CREATE OR REPLACE FUNCTION depots.get_transactions_with_position(p_depot_id bigint)
RETURNS TABLE (
  depot_id       bigint,
  user_id        uuid,
  asset_id       bigint,
  amount         real,
  price          real,
  tstamp         timestamp,
  commission     real,
  id             bigint,
  symbol         text,
  description    text,
  asset_type     text,
  current_amount numeric,
  total_invested numeric,
  total_sold     numeric,
  total_profit   numeric,
  current_price  numeric,
  market_value   numeric,
  type           text
)
LANGUAGE sql STABLE AS $$
  SELECT
    dt.depot_id,
    dt.user_id,
    dt.asset_id,
    dt.amount,
    dt.price,
    dt.tstamp,
    dt.commission,
    dt.id,
    pp.symbol,
    pp.description,
    pp.asset_type,
    pp.current_amount,
    pp.total_invested,
    pp.total_sold,
    pp.total_profit,
    pp.current_price,
    pp.market_value,
    dt.type::text
  FROM depots.transactions dt
  LEFT JOIN depots.get_position_profits(p_depot_id) pp
    ON pp.asset_id = dt.asset_id
  WHERE dt.depot_id = p_depot_id;
$$;
