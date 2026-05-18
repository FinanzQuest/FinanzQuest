-- =============================================================================
-- MIGRATION: Apply performance changes to existing database
-- Run this BEFORE replacing init.sql
-- Safe to run on a live database – drops views first, recreates everything
-- =============================================================================

-- -----------------------------------------------------------------------------
-- STEP 1: Drop dependent objects in reverse dependency order
-- -----------------------------------------------------------------------------

DROP VIEW IF EXISTS depots.aggregated_values CASCADE;
DROP VIEW IF EXISTS depots.transactions_with_asset_position CASCADE;
DROP VIEW IF EXISTS depots.values CASCADE;
DROP VIEW IF EXISTS depots.position_values CASCADE;
DROP VIEW IF EXISTS depots.aggregated_transactions CASCADE;

-- Drop old non-materialized position_profits view if it still exists
DROP VIEW IF EXISTS depots.position_profits CASCADE;

-- Drop matviews if this migration is being re-run
DROP MATERIALIZED VIEW IF EXISTS depots.position_values_mat CASCADE;
DROP MATERIALIZED VIEW IF EXISTS depots.aggregated_transactions_mat CASCADE;

-- Drop old functions that will be recreated
DROP FUNCTION IF EXISTS depots.get_position_profits(INT);
DROP FUNCTION IF EXISTS depots.get_transactions_with_position(INT);

-- -----------------------------------------------------------------------------
-- STEP 2: Add missing indexes
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_asset_prices_asset_tstamp
  ON api.asset_prices (asset_id, tstamp DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_depot_asset_date
  ON depots.transactions (depot_id, asset_id, (tstamp::date));

-- Fix: savings_plans indexes were pointing at transactions in old init
CREATE INDEX IF NOT EXISTS idx_savings_assets_depot ON depots.savings_plans (asset_id, depot_id);
CREATE INDEX IF NOT EXISTS idx_savings_asset         ON depots.savings_plans (asset_id);
CREATE INDEX IF NOT EXISTS idx_savings_depot         ON depots.savings_plans (depot_id);

-- -----------------------------------------------------------------------------
-- STEP 3: aggregated_transactions_mat
-- -----------------------------------------------------------------------------

CREATE MATERIALIZED VIEW depots.aggregated_transactions_mat AS
WITH daily_totals AS (
  SELECT
    depot_id,
    asset_id,
    date(tstamp) AS tstamp,
    SUM(
      CASE WHEN depots.transaction_affects_cash(type)
        THEN amount * price ELSE 0 END
    ) AS daily_expenses,
    SUM(amount) AS daily_amount,
    SUM(
      CASE WHEN depots.transaction_affects_commission(type)
        THEN commission ELSE 0 END
    ) AS daily_commission
  FROM depots.transactions
  GROUP BY depot_id, asset_id, date(tstamp)
)
SELECT
  depot_id,
  asset_id,
  tstamp,
  daily_amount,
  daily_commission,
  SUM(daily_expenses)   OVER w AS running_expenses,
  SUM(daily_amount)     OVER w AS running_amount,
  SUM(daily_commission) OVER w AS running_commission
FROM daily_totals
WINDOW w AS (
  PARTITION BY depot_id, asset_id
  ORDER BY tstamp
  ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
)
ORDER BY depot_id, asset_id, tstamp
WITH DATA;

CREATE UNIQUE INDEX idx_agg_tx_mat_unique
  ON depots.aggregated_transactions_mat (depot_id, asset_id, tstamp);

-- -----------------------------------------------------------------------------
-- STEP 4: position_values_mat
-- -----------------------------------------------------------------------------

CREATE MATERIALIZED VIEW depots.position_values_mat AS
WITH depot_first_transaction AS (
  SELECT depot_id, MIN(tstamp::date) AS first_date
  FROM depots.transactions
  GROUP BY depot_id
),
depot_assets AS (
  SELECT DISTINCT depot_id, asset_id
  FROM depots.transactions
),
date_range AS (
  SELECT
    da.depot_id,
    da.asset_id,
    generate_series(dft.first_date, CURRENT_DATE, '1 day'::interval)::date AS tstamp
  FROM depot_assets da
  JOIN depot_first_transaction dft ON da.depot_id = dft.depot_id
)
SELECT
  dr.depot_id,
  dr.tstamp,
  dr.asset_id,
  t.running_amount,
  t.running_commission,
  t.running_expenses,
  ap.close                                                                    AS price,
  t.running_amount * ap.close                                                 AS market_value,
  (t.running_amount * ap.close) - t.running_expenses - t.running_commission   AS position_profit
FROM date_range dr
INNER JOIN LATERAL (
  SELECT running_amount, running_commission, running_expenses
  FROM depots.aggregated_transactions_mat t
  WHERE t.depot_id = dr.depot_id
    AND t.asset_id = dr.asset_id
    AND t.tstamp  <= dr.tstamp
  ORDER BY t.tstamp DESC
  LIMIT 1
) t ON TRUE
LEFT JOIN LATERAL (
  SELECT close
  FROM api.asset_prices
  WHERE asset_id = dr.asset_id
    AND tstamp   <= dr.tstamp
  ORDER BY tstamp DESC
  LIMIT 1
) ap ON TRUE
WHERE ap.close IS NOT NULL
ORDER BY dr.depot_id, dr.tstamp, dr.asset_id
WITH DATA;

CREATE UNIQUE INDEX idx_position_values_mat_unique
  ON depots.position_values_mat (depot_id, asset_id, tstamp);

CREATE INDEX idx_position_values_mat_depot_tstamp
  ON depots.position_values_mat (depot_id, tstamp);

CREATE INDEX idx_position_values_mat_asset_depot
  ON depots.position_values_mat (asset_id, depot_id);

-- -----------------------------------------------------------------------------
-- STEP 5: Recreate views on top of matviews
-- -----------------------------------------------------------------------------

CREATE OR REPLACE VIEW depots.values AS
SELECT
  pv.depot_id,
  pv.tstamp,
  d.cash_start + SUM(pv.position_profit)                          AS value,
  d.cash_start - SUM(pv.running_commission + pv.running_expenses) AS cash,
  SUM(pv.position_profit)                                         AS profit_from_start,
  SUM(pv.market_value)                                            AS assets
FROM depots.position_values_mat pv
JOIN depots.depots d ON pv.depot_id = d.id
GROUP BY pv.depot_id, pv.tstamp, d.cash_start
ORDER BY pv.depot_id, pv.tstamp;

-- FIX: prev_1y_total now has PARTITION BY depot_id (was mixing rows across depots)
-- FIX: missing comma after profit_from_start
CREATE OR REPLACE VIEW depots.aggregated_values AS
WITH latest_per_depot AS (
  SELECT
    assets,
    depot_id,
    cash,
    profit_from_start,
    value AS total,
    tstamp,
    NTH_VALUE(value, 2) OVER (
      PARTITION BY depot_id ORDER BY tstamp DESC
      ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS prev_1d_total,
    NTH_VALUE(value, 23) OVER (
      PARTITION BY depot_id ORDER BY tstamp DESC
      ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS prev_1m_total,
    NTH_VALUE(value, 253) OVER (
      PARTITION BY depot_id ORDER BY tstamp DESC
      ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS prev_1y_total,
    ROW_NUMBER() OVER (PARTITION BY depot_id ORDER BY tstamp DESC) AS rn
  FROM depots.values
)
SELECT
  assets,
  depot_id,
  cash,
  total,
  profit_from_start,
  tstamp,
  prev_1d_total,
  prev_1m_total,
  prev_1y_total,
  total - prev_1d_total                                    AS diff_1d,
  total - prev_1m_total                                    AS diff_1m,
  total - prev_1y_total                                    AS diff_1y,
  (total - prev_1d_total) / NULLIF(prev_1d_total, 0) * 100 AS rel_diff_1d,
  (total - prev_1m_total) / NULLIF(prev_1m_total, 0) * 100 AS rel_diff_1m,
  (total - prev_1y_total) / NULLIF(prev_1y_total, 0) * 100 AS rel_diff_1y
FROM latest_per_depot
WHERE rn = 1;

-- -----------------------------------------------------------------------------
-- STEP 6: Recreate functions
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION depots.get_position_profits(p_depot_id INT)
RETURNS TABLE (
  depot_id       INT,
  asset_id       INT,
  symbol         TEXT,
  name           TEXT,
  asset_type     TEXT,
  description    TEXT,
  current_amount NUMERIC,
  total_invested NUMERIC,
  total_sold     NUMERIC,
  current_price  NUMERIC,
  market_value   NUMERIC,
  total_profit   NUMERIC
)
LANGUAGE sql STABLE AS $$
  WITH position_summary AS (
    SELECT
      t.depot_id,
      t.asset_id,
      SUM(t.amount) AS current_amount,
      SUM(CASE WHEN t.amount > 0 THEN t.amount * t.price + t.commission ELSE 0 END) AS total_invested,
      SUM(CASE WHEN t.amount < 0 THEN ABS(t.amount * t.price) - t.commission ELSE 0 END) AS total_sold
    FROM depots.transactions t
    WHERE t.depot_id = p_depot_id
    GROUP BY t.depot_id, t.asset_id
    HAVING SUM(t.amount) > 0
  ),
  latest_prices AS (
    SELECT DISTINCT ON (asset_id)
      asset_id,
      close AS current_price
    FROM api.asset_prices
    WHERE close    IS NOT NULL
      AND asset_id IN (SELECT asset_id FROM position_summary)
    ORDER BY asset_id, tstamp DESC
  )
  SELECT
    ps.depot_id,
    ps.asset_id,
    a.symbol,
    a.name,
    a.asset_type::text,
    a.description,
    ps.current_amount,
    ps.total_invested,
    ps.total_sold,
    lp.current_price,
    ps.current_amount * lp.current_price                                       AS market_value,
    ps.total_sold + (ps.current_amount * lp.current_price) - ps.total_invested AS total_profit
  FROM position_summary ps
  JOIN api.assets a ON ps.asset_id = a.id
  LEFT JOIN latest_prices lp ON ps.asset_id = lp.asset_id;
$$;

CREATE OR REPLACE FUNCTION depots.get_transactions_with_position(p_depot_id INT)
RETURNS TABLE (
  depot_id       INT,
  user_id        UUID,
  asset_id       INT,
  amount         NUMERIC,
  price          NUMERIC,
  tstamp         TIMESTAMPTZ,
  commission     NUMERIC,
  id             INT,
  symbol         TEXT,
  description    TEXT,
  asset_type     TEXT,
  current_amount NUMERIC,
  total_invested NUMERIC,
  total_sold     NUMERIC,
  total_profit   NUMERIC,
  current_price  NUMERIC,
  market_value   NUMERIC,
  type           TEXT
)
LANGUAGE sql STABLE AS $$
  SELECT
    dt.depot_id,
    dt.user_id,
    dt.asset_id,
    dt.amount,
    dt.price,
    dt.tstamp,
    dt.commission,
    dt.id,
    pp.symbol,
    pp.description,
    pp.asset_type,
    pp.current_amount,
    pp.total_invested,
    pp.total_sold,
    pp.total_profit,
    pp.current_price,
    pp.market_value,
    dt.type::text
  FROM depots.transactions dt
  LEFT JOIN depots.get_position_profits(p_depot_id) pp
    ON pp.asset_id = dt.asset_id
  WHERE dt.depot_id = p_depot_id;
$$;

-- -----------------------------------------------------------------------------
-- STEP 7: Register refresh job (skip if already exists)
-- -----------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM timescaledb_information.jobs
    WHERE proc_name = 'refresh_depot_mats'
  ) THEN
    PERFORM add_job(
      proc              => 'depots.refresh_depot_mats',
      schedule_interval => INTERVAL '1 day',
      initial_start     => date_trunc('day', NOW()) + INTERVAL '2 hours',
      scheduled         => true,
      fixed_schedule    => true
    );
  END IF;
END;
$$;

-- -----------------------------------------------------------------------------
-- STEP 8: Verify
-- -----------------------------------------------------------------------------

DO $$
DECLARE
  job_count int;
BEGIN
  SELECT COUNT(*) INTO job_count
  FROM timescaledb_information.jobs
  WHERE proc_name = 'refresh_depot_mats';

  IF job_count = 0 THEN
    RAISE WARNING 'refresh_depot_mats job not registered – check TimescaleDB setup';
  ELSE
    RAISE NOTICE 'Migration complete. Refresh job registered (% job(s)).', job_count;
  END IF;
END;
$$;

-- -----------------------------------------------------------------------------
-- Done. Verify matviews have data:
--   SELECT COUNT(*) FROM depots.aggregated_transactions_mat;
--   SELECT COUNT(*) FROM depots.position_values_mat;
-- -----------------------------------------------------------------------------
