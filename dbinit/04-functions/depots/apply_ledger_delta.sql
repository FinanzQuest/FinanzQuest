-- =============================================================================
-- depots.apply_ledger_delta(p_rows, p_sign)
-- Depends on: depots.holdings, depots.depots, depots.transaction_expense,
--             depots.transaction_affects_commission (04-functions/depots/)
-- -----------------------------------------------------------------------------
-- Adds (p_sign = 1) or removes (p_sign = -1) the given transactions' effect on
-- depots.holdings. Increments instead of recomputing, so concurrent trades on
-- the same depot serialize on the row lock and never lose an update.
-- Depots that no longer exist (cascaded delete) are skipped.
-- =============================================================================

CREATE OR REPLACE FUNCTION depots.apply_ledger_delta(p_rows depots.transactions[], p_sign int)
RETURNS void
LANGUAGE sql
AS $$
  INSERT INTO depots.holdings AS h (depot_id, asset_id, amount, expenses, commission)
  SELECT r.depot_id,
         r.asset_id,
         p_sign * SUM(r.amount::numeric),
         p_sign * SUM(depots.transaction_expense(r.type, r.amount, r.price)),
         p_sign * SUM(CASE WHEN depots.transaction_affects_commission(r.type)
                           THEN r.commission::numeric ELSE 0 END)
  FROM unnest(p_rows) AS r
  WHERE EXISTS (SELECT 1 FROM depots.depots d WHERE d.id = r.depot_id)
  GROUP BY r.depot_id, r.asset_id
  ON CONFLICT (depot_id, asset_id) DO UPDATE SET
    amount     = h.amount     + EXCLUDED.amount,
    expenses   = h.expenses   + EXCLUDED.expenses,
    commission = h.commission + EXCLUDED.commission;
$$;
