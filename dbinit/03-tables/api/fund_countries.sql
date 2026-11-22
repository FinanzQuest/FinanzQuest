-- =============================================================================
-- api.fund_countries
-- Depends on: api.funds (03-tables/api/funds.sql)
-- -----------------------------------------------------------------------------
-- Country weights of a fund, replaced as a whole by the updater.
-- country: ISO 3166-1 alpha-2; 'ZZ' collects what the provider lists as
-- other, cash or unknown. weight: fraction of the fund.
-- iShares: aggregated from every holding (complete); Vanguard: the page's
-- country table (largest countries, the rest goes to 'ZZ').
-- =============================================================================

CREATE TABLE api.fund_countries (
  fund_id bigint  NOT NULL REFERENCES api.funds (id) ON DELETE CASCADE,
  country char(2) NOT NULL CONSTRAINT fund_countries_country_format CHECK (country ~ '^[A-Z]{2}$'),
  weight  numeric(7,6) NOT NULL CONSTRAINT fund_countries_weight_range CHECK (weight >= 0 AND weight <= 1),
  PRIMARY KEY (fund_id, country)
);
