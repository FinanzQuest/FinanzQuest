-- =============================================================================
-- depots.daily_values
-- Depends on: depots.depots (FK)
-- -----------------------------------------------------------------------------
-- Depot value per CLOSED day (tstamp < CURRENT_DATE). Today is never stored;
-- depots.values adds it live from depots.holdings.
--
-- Written only by depots.rebuild_depot_values(), which is called
--   * by the transaction trigger for backdated changes (that depot, from that
--     day on),
--   * by the hourly job depots.refresh_depot_values (last 7 days of every
--     depot, picks up yesterday and late/corrected prices).
--
-- Only days that carry information are stored: a real price for one of the
-- depot's assets, a transaction, or a cash-only depot (weekends drop out).
-- =============================================================================

CREATE TABLE IF NOT EXISTS depots.daily_values (
  depot_id          bigint  NOT NULL,
  tstamp            date    NOT NULL,
  value             numeric NOT NULL,
  cash              numeric NOT NULL,
  profit_from_start numeric NOT NULL,
  assets            numeric NOT NULL,
  CONSTRAINT daily_values_pkey PRIMARY KEY (depot_id, tstamp),
  CONSTRAINT daily_values_depot_fkey FOREIGN KEY (depot_id) REFERENCES depots.depots (id) ON DELETE CASCADE
);
