-- =============================================================================
-- depots.holdings
-- Depends on: depots.depots, api.assets (FKs)
-- -----------------------------------------------------------------------------
-- Current running totals per depot and asset, derived from depots.transactions
-- (the single source of truth). asset_id IS NULL = the depot's cash movements.
-- Rows are kept after a position is sold out so realized gains/losses and
-- commissions still count towards the depot value.
--
-- Maintained ONLY by the transaction triggers (07-triggers/depots/
-- transactions_ledger.sql), which apply deltas — never written by clients.
-- Repair: depots.rebuild_holdings().
--
--   value contribution = amount * latest price - expenses - commission
-- =============================================================================

CREATE TABLE IF NOT EXISTS depots.holdings (
  depot_id   bigint  NOT NULL,
  asset_id   bigint,                         -- NULL = cash
  amount     numeric NOT NULL DEFAULT 0,     -- SUM(amount)
  expenses   numeric NOT NULL DEFAULT 0,     -- SUM(transaction_expense(...))
  commission numeric NOT NULL DEFAULT 0,     -- SUM(commission) where it applies
  CONSTRAINT holdings_depot_asset_key UNIQUE NULLS NOT DISTINCT (depot_id, asset_id),
  CONSTRAINT holdings_depot_fkey FOREIGN KEY (depot_id) REFERENCES depots.depots (id) ON DELETE CASCADE,
  CONSTRAINT holdings_asset_fkey FOREIGN KEY (asset_id) REFERENCES api.assets (id)
);

CREATE INDEX IF NOT EXISTS idx_holdings_asset ON depots.holdings (asset_id);
