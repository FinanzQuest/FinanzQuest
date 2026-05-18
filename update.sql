CREATE OR REPLACE VIEW depots.position_profits AS
WITH position_summary AS (
  SELECT
    depot_id,
    asset_id,
    SUM(amount) AS current_amount,
    SUM(
      CASE WHEN amount > 0 THEN
        amount * price + commission
      ELSE
        0
      END) AS total_invested,
    SUM(
      CASE WHEN amount < 0 THEN
        ABS(amount * price) - commission
      ELSE
        0
      END) AS total_sold
  FROM
    depots.transactions
  GROUP BY
    depot_id,
    asset_id
  HAVING
    SUM(amount) > 0 -- Only active positions
),
latest_prices AS (
  SELECT DISTINCT ON (asset_id)
    asset_id,
    CLOSE AS current_price
  FROM
    api.asset_prices
  WHERE close IS NOT NULL
  ORDER BY
    asset_id,
    tstamp DESC
)
SELECT
  ps.depot_id,
  ps.asset_id,
  a.symbol,
  a.name,
  a.asset_type,
  a.description,
  ps.current_amount,
  ps.total_invested,
  ps.total_sold,
  lp.current_price,
  ps.current_amount * lp.current_price AS market_value,
  -- Total profit
  ps.total_sold + (ps.current_amount * lp.current_price) - ps.total_invested AS total_profit
FROM
  position_summary ps
  JOIN api.assets a ON ps.asset_id = a.id
  LEFT JOIN latest_prices lp ON ps.asset_id = lp.asset_id;
