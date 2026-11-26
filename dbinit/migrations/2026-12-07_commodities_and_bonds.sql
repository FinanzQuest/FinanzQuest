-- =============================================================================
-- MIGRATION 2026-12-07: commodities and bonds as assets
-- -----------------------------------------------------------------------------
-- Requires 2026-12-06_asset_tutorial_gate.sql. Run from the repository root
-- as the migration superuser:
--
--     psql -d postgres -f dbinit/migrations/2026-12-07_commodities_and_bonds.sql
--
-- * new asset type 'bond'; bonds are bought through bond ETFs
-- * 13 commodities (ids 1208-1220): Yahoo Finance serves the front-month
--   futures (GC=F, CL=F, ...); Alpaca has no commodity prices (only
--   commodity ETFs). Agricultural futures are quoted in US cents.
-- * 10 bond ETFs (ids 1185 and 1221-1230, 1225 unused): Alpaca serves them
--   (US-listed). AGG existed as a 'fund' and becomes a 'bond'.
-- * the bond tutorial path (anleihen) now unlocks 'bond' assets and follows
--   etfs (was grundlagen), like krypto and rohstoffe
-- Same rows as in dbinit/assets.csv. The updater fetches the prices on its
-- next daily run (docker exec updater run_updater.sh daily). Re-runnable.
-- =============================================================================

\set ON_ERROR_STOP on

-- a new enum value cannot be used in the transaction that adds it
ALTER TYPE AssetType ADD VALUE IF NOT EXISTS 'bond' BEFORE 'commodity';

BEGIN;

INSERT INTO api.assets (id, symbol, name, description, asset_type, price_provider) VALUES
  (1208, 'GC=F', 'Gold',
   'Edelmetalle - Gold-Future (Preis je Feinunze in USD)', 'commodity', 'yahoo'),
  (1209, 'SI=F', 'Silber',
   'Edelmetalle - Silber-Future (Preis je Feinunze in USD)', 'commodity', 'yahoo'),
  (1210, 'PL=F', 'Platin',
   'Edelmetalle - Platin-Future (Preis je Feinunze in USD)', 'commodity', 'yahoo'),
  (1211, 'HG=F', 'Kupfer',
   'Industriemetalle - Kupfer-Future (Preis je Pfund in USD)', 'commodity', 'yahoo'),
  (1212, 'CL=F', 'Rohöl (WTI)',
   'Energie - WTI-Rohöl-Future (Preis je Barrel in USD)', 'commodity', 'yahoo'),
  (1213, 'BZ=F', 'Rohöl (Brent)',
   'Energie - Brent-Rohöl-Future (Preis je Barrel in USD)', 'commodity', 'yahoo'),
  (1214, 'NG=F', 'Erdgas',
   'Energie - Erdgas-Future (Preis je MMBtu in USD)', 'commodity', 'yahoo'),
  (1215, 'ZW=F', 'Weizen',
   'Agrar - Weizen-Future (Preis je Scheffel in US-Cent)', 'commodity', 'yahoo'),
  (1216, 'ZC=F', 'Mais',
   'Agrar - Mais-Future (Preis je Scheffel in US-Cent)', 'commodity', 'yahoo'),
  (1217, 'ZS=F', 'Sojabohnen',
   'Agrar - Sojabohnen-Future (Preis je Scheffel in US-Cent)', 'commodity', 'yahoo'),
  (1218, 'KC=F', 'Kaffee',
   'Agrar - Kaffee-Future (Preis je Pfund in US-Cent)', 'commodity', 'yahoo'),
  (1219, 'SB=F', 'Zucker',
   'Agrar - Zucker-Future (Preis je Pfund in US-Cent)', 'commodity', 'yahoo'),
  (1220, 'CC=F', 'Kakao',
   'Agrar - Kakao-Future (Preis je Tonne in USD)', 'commodity', 'yahoo'),
  (1221, 'SHY', 'iShares 1-3 Year Treasury Bond ETF',
   'US-Staatsanleihen - kurze Laufzeiten (1-3 Jahre)', 'bond', 'alpaca'),
  (1222, 'IEF', 'iShares 7-10 Year Treasury Bond ETF',
   'US-Staatsanleihen - mittlere Laufzeiten (7-10 Jahre)', 'bond', 'alpaca'),
  (1223, 'TLT', 'iShares 20+ Year Treasury Bond ETF',
   'US-Staatsanleihen - lange Laufzeiten (über 20 Jahre)', 'bond', 'alpaca'),
  (1224, 'TIP', 'iShares TIPS Bond ETF',
   'US-Staatsanleihen - inflationsgeschützt (TIPS)', 'bond', 'alpaca'),
  (1226, 'BND', 'Vanguard Total Bond Market ETF',
   'US-Anleihenmarkt - breit gemischt, sehr niedrige Kosten', 'bond', 'alpaca'),
  (1227, 'LQD', 'iShares iBoxx $ Investment Grade Corporate Bond ETF',
   'Unternehmensanleihen - gute Bonität (Investment Grade)', 'bond', 'alpaca'),
  (1228, 'HYG', 'iShares iBoxx $ High Yield Corporate Bond ETF',
   'Unternehmensanleihen - schwächere Bonität (High Yield)', 'bond', 'alpaca'),
  (1229, 'EMB', 'iShares J.P. Morgan USD Emerging Markets Bond ETF',
   'Staatsanleihen - Schwellenländer in US-Dollar', 'bond', 'alpaca'),
  (1230, 'BNDX', 'Vanguard Total International Bond ETF',
   'Anleihen - international ohne USA, währungsgesichert', 'bond', 'alpaca')
ON CONFLICT (symbol) DO NOTHING;

-- explicit ids: keep the identity sequence ahead of them
SELECT setval(pg_get_serial_sequence('api.assets', 'id'), (SELECT max(id) FROM api.assets));

UPDATE api.assets SET asset_type = 'bond' WHERE symbol = 'AGG' AND asset_type = 'fund';

\ir ../04-functions/users/require_asset_tutorial.sql
\ir ../10-grants/users/require_asset_tutorial.sql
\ir ../seed/tutorial_catalog.sql

SELECT asset_type, count(*) FROM api.assets GROUP BY 1 ORDER BY 1;

COMMIT;
