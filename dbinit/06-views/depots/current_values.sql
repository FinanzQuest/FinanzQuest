-- =============================================================================
-- depots.current_values
-- Depends on: depots.depots, depots.holdings, api.latest_prices
-- -----------------------------------------------------------------------------
-- The live row per depot (tstamp = today): holdings valued at the latest known
-- close. One hash join of holdings against api.latest_prices — no per-holding
-- lookups into the price hypertable. Every depot has a row (a depot without
-- transactions is worth its cash_start).
--
-- Runs with the owner's rights: depot totals are public by design
-- (leaderboard, inspecting other depots); per-position data stays in
-- depots.holdings behind RLS.
-- =============================================================================

CREATE OR REPLACE VIEW depots.current_values AS
SELECT
  d.id                                                           AS depot_id,
  CURRENT_DATE                                                   AS tstamp,
  d.cash_start + COALESCE(SUM(h.market_value - h.expenses - h.commission), 0) AS value,
  d.cash_start - COALESCE(SUM(h.expenses + h.commission), 0)    AS cash,
  COALESCE(SUM(h.market_value - h.expenses - h.commission), 0)  AS profit_from_start,
  COALESCE(SUM(h.market_value), 0)                              AS assets
FROM depots.depots d
LEFT JOIN (
  SELECT h.depot_id,
         h.expenses,
         h.commission,
         COALESCE(h.amount * lp.close, 0) AS market_value
  FROM depots.holdings h
  LEFT JOIN api.latest_prices lp ON lp.asset_id = h.asset_id
) h ON h.depot_id = d.id
GROUP BY d.id, d.cash_start;
