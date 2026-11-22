-- =============================================================================
-- depots.values
-- Depends on: depots.daily_values (03-tables/depots/),
--             depots.current_values (06-views/depots/current_values.sql)
-- -----------------------------------------------------------------------------
-- One row per depot per day: the stored closed days plus the live row for
-- today. Trades, rewards and new prices show up immediately.
-- Depot totals are public by design; runs with the owner's rights.
-- =============================================================================

CREATE OR REPLACE VIEW depots.values AS
SELECT depot_id, tstamp, value, cash, profit_from_start, assets
FROM depots.daily_values
UNION ALL
SELECT depot_id, tstamp, value, cash, profit_from_start, assets
FROM depots.current_values;
