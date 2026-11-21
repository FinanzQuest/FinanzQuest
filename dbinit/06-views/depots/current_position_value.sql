-- =============================================================================
-- depots.current_position_value
-- Depends on: depots.aggregated_transactions_mat (05-materialized-views/),
--             depots.transactions, api.asset_prices,
--             depots.transaction_expense / depots.transaction_affects_commission
--             (04-functions/depots/), depots.is_depot_member
-- -----------------------------------------------------------------------------
-- Live, per-position snapshot of the depot as of NOW: the last
-- aggregated_transactions_mat snapshot (refreshed daily ~02:00) plus every
-- transaction that landed after that snapshot's cutoff (max_tstamp), priced at
-- the latest known close.
--
--   base  = most recent matview row per (depot, asset)  -> running totals
--   delta = transactions with tstamp > base.max_tstamp   -> not yet in matview
--   brand-new asset (no base row since last refresh)      -> base is zero, delta
--                                                           = all its transactions
--
-- Mirrors the columns of position_values_mat so the same math applies, e.g.
--   depot value now = d.cash_start + SUM(position_profit)
--
-- SECURITY: RLS cannot be enabled on materialized views, so this is an owner-run
-- view (created by the migration superuser) that filters every row through
-- depots.is_depot_member(depot_id) — the same membership check the RLS policies
-- use, reading the caller's JWT via auth.uid() regardless of executing role
-- (same pattern as depots.get_depot_overview). Each caller only sees their own
-- depots. Grant: 10-grants/depots/current_position_value.sql
-- =============================================================================

CREATE OR REPLACE VIEW depots.current_position_value AS
WITH base AS (
  -- Latest pre-aggregated snapshot per depot/asset. max_tstamp is the exact
  -- raw transaction timestamp those running totals already cover.
  SELECT DISTINCT ON (depot_id, asset_id)
    depot_id,
    asset_id,
    running_amount,
    running_commission,
    running_expenses,
    max_tstamp
  FROM depots.aggregated_transactions_mat
  ORDER BY depot_id, asset_id, tstamp DESC
),
delta AS (
  -- Transactions the snapshot does NOT cover yet. No base row (a pair first
  -- traded since the last refresh) => max_tstamp is NULL => all transactions.
  SELECT
    t.depot_id,
    t.asset_id,
    SUM(t.amount::numeric)                                                      AS d_amount,
    SUM(CASE WHEN depots.transaction_affects_commission(t.type)
             THEN t.commission::numeric ELSE 0 END)                             AS d_commission,
    SUM(depots.transaction_expense(t.type, t.amount, t.price))                  AS d_expenses
  FROM depots.transactions t
  LEFT JOIN base b
    ON b.depot_id = t.depot_id
   AND b.asset_id IS NOT DISTINCT FROM t.asset_id      -- NULL-safe: keeps cash rows
  WHERE b.max_tstamp IS NULL OR t.tstamp > b.max_tstamp
  GROUP BY t.depot_id, t.asset_id
),
pairs AS (
  -- Every (depot, asset) that is still relevant: anything the snapshot knows
  -- about plus anything with a new transaction. Fully-sold positions stay so
  -- their realized gains/commissions still count toward depot value.
  SELECT depot_id, asset_id FROM base
  UNION
  SELECT depot_id, asset_id FROM delta
),
current AS (
  SELECT
    p.depot_id,
    p.asset_id,
    COALESCE(b.running_amount,    0::numeric) + COALESCE(d.d_amount,    0::numeric) AS current_amount,
    COALESCE(b.running_commission,0::numeric) + COALESCE(d.d_commission,0::numeric) AS current_commission,
    COALESCE(b.running_expenses,  0::numeric) + COALESCE(d.d_expenses,  0::numeric) AS current_expenses
  FROM pairs p
  LEFT JOIN base b  ON b.depot_id = p.depot_id AND b.asset_id IS NOT DISTINCT FROM p.asset_id
  LEFT JOIN delta d ON d.depot_id = p.depot_id AND d.asset_id IS NOT DISTINCT FROM p.asset_id
)
SELECT
  c.depot_id,
  c.asset_id,
  c.current_amount,
  c.current_commission,
  c.current_expenses,
  ap.close::numeric           AS price,
  ap.tstamp                   AS price_date,
  ap.tstamp = CURRENT_DATE    AS is_actual_price,   -- today's close vs carried forward
  CASE WHEN c.asset_id IS NULL
    THEN 0::numeric                                   -- cash has no price
    ELSE c.current_amount * ap.close::numeric
  END                                              AS market_value,
  CASE WHEN c.asset_id IS NULL
    THEN 0::numeric
    ELSE c.current_amount * ap.close::numeric
  END - c.current_expenses - c.current_commission AS position_profit
FROM current c
LEFT JOIN LATERAL (
  -- Latest known close per asset (no date cap; the consumer sees price_date /
  -- is_actual_price to judge staleness).
  SELECT close, tstamp
  FROM api.asset_prices
  WHERE asset_id = c.asset_id
    AND close IS NOT NULL
  ORDER BY tstamp DESC
  LIMIT 1
) ap ON TRUE
WHERE depots.is_depot_member(c.depot_id)     -- caller sees only their own depots
ORDER BY c.depot_id, c.asset_id;
