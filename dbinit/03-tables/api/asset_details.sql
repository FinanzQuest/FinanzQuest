-- =============================================================================
-- api.asset_details
-- Depends on: api.assets (03-tables/api/assets.sql)
-- -----------------------------------------------------------------------------
-- Company profile and key figures of a stock, written by the updater
-- (`--mode details`, provider api.assets.details_provider = 'yahoo').
-- Ratios are fractions (dividend_yield 0.012 = 1.2 %); money columns are in
-- `currency` (market_cap: trading currency, revenue: reporting currency in
-- revenue_currency). country: ISO 3166-1 alpha-2.
-- =============================================================================

CREATE TABLE api.asset_details (
  asset_id         bigint PRIMARY KEY REFERENCES api.assets (id) ON DELETE CASCADE,
  sector           text,
  industry         text,
  country          char(2),
  employees        integer,
  website          text,
  currency         char(3),
  market_cap       numeric,
  pe_ratio         numeric,
  price_to_book    numeric,
  dividend_yield   numeric,
  payout_ratio     numeric,
  revenue          numeric,
  revenue_currency char(3),
  profit_margin    numeric,
  revenue_growth   numeric,
  beta             numeric,
  updated_at       timestamptz NOT NULL DEFAULT now()
);
