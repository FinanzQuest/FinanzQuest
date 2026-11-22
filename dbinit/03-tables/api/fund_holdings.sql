-- =============================================================================
-- api.fund_holdings
-- Depends on: api.funds (03-tables/api/funds.sql)
-- -----------------------------------------------------------------------------
-- The largest positions of a fund (top 15 by weight), replaced as a whole by
-- the updater on every details run. weight: fraction of the fund (0.05 = 5 %).
-- country: ISO 3166-1 alpha-2 where the provider names one.
-- =============================================================================

CREATE TABLE api.fund_holdings (
  fund_id  bigint   NOT NULL REFERENCES api.funds (id) ON DELETE CASCADE,
  position smallint NOT NULL CONSTRAINT fund_holdings_position_positive CHECK (position > 0),
  name     text     NOT NULL,
  ticker   text,
  weight   numeric(7,6) NOT NULL CONSTRAINT fund_holdings_weight_range CHECK (weight >= 0 AND weight <= 1),
  sector   text,
  country  char(2),
  PRIMARY KEY (fund_id, position)
);
