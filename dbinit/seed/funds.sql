-- =============================================================================
-- Seed: api.funds, and api.assets.fund_id / details_provider of their listings
-- Depends on: seed/assets.sql (links listings by symbol)
-- -----------------------------------------------------------------------------
-- Hand-maintained facts, checked on 2026-11-22 against the issuers' product
-- pages (iShares UCITS, Vanguard UK) or their published holdings files
-- (iShares US: ISIN; TER from the fund pages). NULL where not verified: the
-- updater fills ter/inception from its provider where they are NULL.
-- Re-runnable: funds are matched by name.
-- details_source:
--   ishares  BlackRock holdings CSV (ishares.com/us/products/<id>/x/latest-holdings.csv;
--            UCITS funds use the CSV of their US twin, see below)
--   vanguard Vanguard UK product page (server-rendered country and holdings
--            tables)
--   yahoo    no source: the updater asks Yahoo for one of the listings
-- =============================================================================

CREATE TEMP TABLE seed_funds (
  name text, isin text, issuer text, index_name text, ter numeric, replication text,
  distribution text, domicile char(2), currency char(3), inception date,
  provider DetailsProvider, details_source text, symbols text[]
);

INSERT INTO seed_funds VALUES
  -- iShares UCITS. BlackRock's UCITS CSV is gone (the UK site now answers with
  -- its web page), so holdings and country weights come from the CSV of the
  -- US-listed twin of the same index: MSCI World = iShares MSCI World ETF
  -- (URTH), S&P 500 = IVV, MSCI EM IMI = IEMG. The updater then leaves the
  -- fund's own size / TER / inception alone (details/mod.rs is_twin_source).
  -- MSCI Europe has no US twin: no details until a source exists.
  ('iShares Core S&P 500 UCITS ETF USD (Acc)', 'IE00B5BMR087', 'iShares', 'S&P 500', 0.0007, 'full', 'accumulating', 'IE', 'USD', '2010-05-19', 'ishares',
   'https://www.ishares.com/us/products/239726/x/latest-holdings.csv', '{SXR8.DE,CSPX.MI}'),
  ('iShares Core MSCI World UCITS ETF USD (Acc)', 'IE00B4L5Y983', 'iShares', 'MSCI World', 0.0020, 'sampling', 'accumulating', 'IE', 'USD', '2009-09-25', 'ishares',
   'https://www.ishares.com/us/products/239696/x/latest-holdings.csv', '{EUNL.DE,IWDA.AS,SWDA.L,SWDA.MI}'),
  ('iShares Core MSCI Europe UCITS ETF EUR (Acc)', 'IE00B4K48X80', 'iShares', 'MSCI Europe', 0.0012, 'sampling', 'accumulating', 'IE', 'EUR', '2009-09-25', 'ishares',
   'https://www.blackrock.com/uk/individual/products/251861/x/1472631233320.ajax?fileType=csv&fileName=holdings&dataType=fund', '{EUNK.DE,IMAE.AS,SMEA.MI}'),
  ('iShares Core MSCI EM IMI UCITS ETF USD (Acc)', 'IE00BKM4GZ66', 'iShares', 'MSCI Emerging Markets IMI', 0.0018, 'full', 'accumulating', 'IE', 'USD', '2014-05-30', 'ishares',
   'https://www.ishares.com/us/products/244050/x/latest-holdings.csv', '{EMIM.AS,IS3N.DE}'),
  ('iShares Core S&P 500 UCITS ETF USD (Dist)', 'IE0031442068', 'iShares', 'S&P 500', 0.0007, 'full', 'distributing', 'IE', 'USD', '2002-03-15', 'ishares',
   'https://www.ishares.com/us/products/239726/x/latest-holdings.csv', '{IUSA.L}'),
  ('iShares MSCI World UCITS ETF USD (Dist)', 'IE00B0M62Q58', 'iShares', 'MSCI World', 0.0050, 'sampling', 'distributing', 'IE', 'USD', '2005-10-28', 'ishares',
   'https://www.ishares.com/us/products/239696/x/latest-holdings.csv', '{IWRD.L}'),
  -- iShares US (inception comes from the CSV header)
  ('iShares Core S&P 500 ETF', 'US4642872000', 'iShares', 'S&P 500', 0.0003, 'full', 'distributing', 'US', 'USD', NULL, 'ishares',
   'https://www.ishares.com/us/products/239726/x/latest-holdings.csv', '{IVV}'),
  ('iShares Core S&P Total U.S. Stock Market ETF', 'US4642871507', 'iShares', 'S&P Total Market', 0.0003, 'sampling', 'distributing', 'US', 'USD', NULL, 'ishares',
   'https://www.ishares.com/us/products/239724/x/latest-holdings.csv', '{ITOT}'),
  ('iShares Core U.S. Aggregate Bond ETF', 'US4642872265', 'iShares', 'Bloomberg US Aggregate Bond', 0.0003, 'sampling', 'distributing', 'US', 'USD', NULL, 'ishares',
   'https://www.ishares.com/us/products/239458/x/latest-holdings.csv', '{AGG}'),
  ('iShares Core High Dividend ETF', 'US46429B6636', 'iShares', 'Morningstar Dividend Yield Focus', 0.0008, 'full', 'distributing', 'US', 'USD', NULL, 'ishares',
   'https://www.ishares.com/us/products/239563/x/latest-holdings.csv', '{HDV}'),
  ('iShares Core Dividend Growth ETF', 'US46434V6213', 'iShares', 'Morningstar US Dividend Growth', 0.0008, 'full', 'distributing', 'US', 'USD', NULL, 'ishares',
   'https://www.ishares.com/us/products/264623/x/latest-holdings.csv', '{DGRO}'),
  -- Vanguard UCITS (Vanguard UK product pages)
  ('Vanguard FTSE All-World UCITS ETF USD (Acc)', 'IE00BK5BQT80', 'Vanguard', 'FTSE All-World', 0.0014, 'physical', 'accumulating', 'IE', 'USD', '2019-07-23', 'vanguard',
   'https://www.vanguard.co.uk/professional/product/etf/equity/9679/ftse-all-world-ucits-etf-usd-accumulating', '{VWCE.DE,VWRA.L}'),
  ('Vanguard FTSE Developed World UCITS ETF USD (Acc)', 'IE00BK5BQV03', 'Vanguard', 'FTSE Developed', 0.0012, 'physical', 'accumulating', 'IE', 'USD', '2019-09-24', 'vanguard',
   'https://www.vanguard.co.uk/professional/product/etf/equity/9675/ftse-developed-world-ucits-etf-usd-accumulating', '{VHVE.MI}'),
  ('Vanguard FTSE 100 UCITS ETF GBP (Dist)', 'IE00B810Q511', 'Vanguard', 'FTSE 100', 0.0009, 'physical', 'distributing', 'IE', 'GBP', '2012-05-22', 'vanguard',
   'https://www.vanguard.co.uk/professional/product/etf/equity/9509/ftse-100-ucits-etf-gbp-distributing', '{VUKE.L}'),
  -- no issuer source the updater can read (pages rendered in the browser):
  -- top holdings and missing facts from Yahoo
  ('Vanguard Total Stock Market ETF', 'US9229087690', 'Vanguard', 'CRSP US Total Market', 0.0003, NULL, 'distributing', 'US', 'USD', NULL, 'yahoo', NULL, '{VTI}'),
  ('Vanguard FTSE Developed Markets ETF', 'US9219438580', 'Vanguard', 'FTSE Developed All Cap ex US', NULL, NULL, 'distributing', 'US', 'USD', NULL, 'yahoo', NULL, '{VEA}'),
  ('Vanguard FTSE All-World ex-US ETF', 'US9220427754', 'Vanguard', 'FTSE All-World ex US', NULL, NULL, 'distributing', 'US', 'USD', NULL, 'yahoo', NULL, '{VEU}'),
  ('Vanguard FTSE Europe ETF', 'US9220428745', 'Vanguard', 'FTSE Developed Europe All Cap', NULL, NULL, 'distributing', 'US', 'USD', NULL, 'yahoo', NULL, '{VGK}'),
  ('Amundi MSCI World UCITS ETF', NULL, 'Amundi', 'MSCI World', NULL, NULL, NULL, NULL, NULL, NULL, 'yahoo', NULL, '{CW8.PA}'),
  ('Amundi S&P 500 UCITS ETF', NULL, 'Amundi', 'S&P 500', NULL, NULL, NULL, NULL, NULL, NULL, 'yahoo', NULL, '{500.PA,A500.MI}'),
  ('Amundi Nasdaq-100 UCITS ETF', NULL, 'Amundi', 'Nasdaq-100', NULL, NULL, NULL, NULL, NULL, NULL, 'yahoo', NULL, '{ANX.PA,ANX.MI}'),
  ('Amundi Stoxx Europe 600 UCITS ETF', NULL, 'Amundi', 'STOXX Europe 600', NULL, NULL, NULL, NULL, NULL, NULL, 'yahoo', NULL, '{LYP6.DE,MEUD.PA}'),
  ('Amundi Prime All Country World UCITS ETF', NULL, 'Amundi', 'Solactive GBS Global Markets', NULL, NULL, NULL, NULL, NULL, NULL, 'yahoo', NULL, '{WEBN.DE}'),
  ('Amundi MSCI Emerging Markets UCITS ETF', NULL, 'Amundi', 'MSCI Emerging Markets', NULL, NULL, NULL, NULL, NULL, NULL, 'yahoo', NULL, '{AEEM.MI}');

INSERT INTO api.funds (name, isin, issuer, index_name, ter, replication, distribution, domicile, currency, inception, details_source)
SELECT name, isin, issuer, index_name, ter, replication, distribution, domicile, currency, inception, details_source
FROM seed_funds s
WHERE NOT EXISTS (SELECT 1 FROM api.funds f WHERE f.name = s.name);

UPDATE api.assets a
SET fund_id = f.id, details_provider = s.provider
FROM seed_funds s
JOIN api.funds f ON f.name = s.name
WHERE a.symbol = ANY (s.symbols);

DROP TABLE seed_funds;
