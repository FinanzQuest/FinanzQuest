-- =============================================================================
-- depots.TransactionType
-- Depends on: depots schema (01-schema/schemas.sql)
-- -----------------------------------------------------------------------------
-- Transaction semantics:
--   'user'         cash <-> asset, initiated by a user  (asset_id + price required)
--   'movement'     cash in/out of the depot, no asset   (asset_id + price NULL)
--                  deposit  = amount > 0  (e.g. reward, top-up, incoming transfer)
--                  withdraw = amount < 0  (e.g. payout, outgoing transfer)
--   'savings_plan' externally funded asset purchase     (asset_id + price required)
-- =============================================================================

CREATE TYPE depots.TransactionType AS ENUM ('user', 'movement', 'savings_plan');
