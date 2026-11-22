-- =============================================================================
-- depots.rebuild_holdings()
-- Depends on: depots.holdings, depots.transactions, depots.depots,
--             depots.transaction_expense, depots.transaction_affects_commission
-- -----------------------------------------------------------------------------
-- Repair / initial backfill: recompute depots.holdings and depots.depots.cash
-- from the full ledger. Blocks writes to depots.transactions while it runs so
-- no delta is lost.
-- =============================================================================

CREATE OR REPLACE FUNCTION depots.rebuild_holdings()
RETURNS void
LANGUAGE sql
AS $$
  LOCK TABLE depots.transactions IN SHARE MODE;
  DELETE FROM depots.holdings;
  INSERT INTO depots.holdings (depot_id, asset_id, amount, expenses, commission)
  SELECT depot_id,
         asset_id,
         SUM(amount),
         SUM(depots.transaction_expense(type, amount, price)),
         SUM(CASE WHEN depots.transaction_affects_commission(type)
                  THEN commission ELSE 0 END)
  FROM depots.transactions
  GROUP BY depot_id, asset_id;
  UPDATE depots.depots d
  SET cash = d.cash_start - COALESCE(
    (SELECT SUM(h.expenses + h.commission) FROM depots.holdings h WHERE h.depot_id = d.id), 0);
$$;
