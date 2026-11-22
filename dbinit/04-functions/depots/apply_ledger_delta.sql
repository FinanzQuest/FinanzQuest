-- =============================================================================
-- depots.apply_ledger_delta(p_rows, p_sign)
-- Depends on: depots.holdings, depots.depots, depots.transaction_expense,
--             depots.transaction_affects_commission (04-functions/depots/)
-- -----------------------------------------------------------------------------
-- Adds (p_sign = 1) or removes (p_sign = -1) the given transactions' effect on
-- depots.depots.cash and depots.holdings. Increments instead of recomputing,
-- so concurrent writers serialize on the row locks and never lose an update.
-- Lock order is always depot row(s) first (by id), then holdings — the same
-- order buy_asset / sell_asset use (they lock the depot row up front), so the
-- two paths cannot deadlock. Depots that no longer exist (cascaded delete)
-- are skipped.
-- =============================================================================

CREATE OR REPLACE FUNCTION depots.apply_ledger_delta(p_rows depots.transactions[], p_sign int)
RETURNS void
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  -- 1. lock the affected depots in id order (no-op if the caller holds them)
  PERFORM 1
  FROM depots.depots d
  WHERE d.id IN (SELECT r.depot_id FROM unnest(p_rows) AS r)
  ORDER BY d.id
  FOR NO KEY UPDATE;

  -- 2. cash
  UPDATE depots.depots d
  SET cash = d.cash - p_sign * x.spent
  FROM (
    SELECT r.depot_id,
           SUM(depots.transaction_expense(r.type, r.amount, r.price)
               + CASE WHEN depots.transaction_affects_commission(r.type)
                      THEN r.commission ELSE 0 END) AS spent
    FROM unnest(p_rows) AS r
    GROUP BY r.depot_id
  ) x
  WHERE d.id = x.depot_id;

  -- 3. holdings
  INSERT INTO depots.holdings AS h (depot_id, asset_id, amount, expenses, commission)
  SELECT r.depot_id,
         r.asset_id,
         p_sign * SUM(r.amount),
         p_sign * SUM(depots.transaction_expense(r.type, r.amount, r.price)),
         p_sign * SUM(CASE WHEN depots.transaction_affects_commission(r.type)
                           THEN r.commission ELSE 0 END)
  FROM unnest(p_rows) AS r
  WHERE EXISTS (SELECT 1 FROM depots.depots d WHERE d.id = r.depot_id)
  GROUP BY r.depot_id, r.asset_id
  ON CONFLICT (depot_id, asset_id) DO UPDATE SET
    amount     = h.amount     + EXCLUDED.amount,
    expenses   = h.expenses   + EXCLUDED.expenses,
    commission = h.commission + EXCLUDED.commission;
END;
$$;
