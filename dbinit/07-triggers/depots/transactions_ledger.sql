-- =============================================================================
-- Triggers on depots.transactions -> depots.on_transactions_change()
-- Depends on: depots.on_transactions_change (04-functions/depots/)
-- -----------------------------------------------------------------------------
-- Statement-level with transition tables, so a bulk insert (seeding,
-- execute_savings_plans) updates holdings and rebuilds history once per
-- statement, not once per row. One trigger per event because a trigger with
-- transition tables may only fire on a single event.
-- =============================================================================

CREATE TRIGGER transactions_ledger_insert
AFTER INSERT ON depots.transactions
REFERENCING NEW TABLE AS new_rows
FOR EACH STATEMENT EXECUTE FUNCTION depots.on_transactions_change();

CREATE TRIGGER transactions_ledger_update
AFTER UPDATE ON depots.transactions
REFERENCING OLD TABLE AS old_rows NEW TABLE AS new_rows
FOR EACH STATEMENT EXECUTE FUNCTION depots.on_transactions_change();

CREATE TRIGGER transactions_ledger_delete
AFTER DELETE ON depots.transactions
REFERENCING OLD TABLE AS old_rows
FOR EACH STATEMENT EXECUTE FUNCTION depots.on_transactions_change();
