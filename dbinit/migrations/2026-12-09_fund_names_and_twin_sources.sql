-- =============================================================================
-- MIGRATION 2026-12-09: fund names and holdings sources of the iShares UCITS funds
-- -----------------------------------------------------------------------------
-- Run from the repository root as the migration superuser:
--
--     psql -d postgres -f dbinit/migrations/2026-12-09_fund_names_and_twin_sources.sql
--
-- * BlackRock's UCITS holdings CSV (blackrock.com/uk …ajax) now answers with
--   the website, so the updater's iShares parser failed for six funds and
--   the country maps (e.g. the MSCI World map in the tutorial) stayed empty.
--   Holdings and country weights now come from the CSV of the US-listed twin
--   of the same index (URTH, IVV, IEMG); the updater keeps size/TER/inception
--   of the UCITS fund itself. MSCI Europe has no US twin and stays without.
--   details_updated_at is cleared so the next `details` run refetches them.
-- * Names of listings: bond ETFs in the German "<Kategorie> ETF (<Anbieter>)"
--   style of the other funds, the distributing S&P 500 listing marked
--   "ausschüttend", VEA marked as US listing (VHVE.MI has the same name).
-- Same values as dbinit/seed/funds.sql and dbinit/assets.csv. Re-runnable.
-- =============================================================================

\set ON_ERROR_STOP on
BEGIN;

UPDATE api.funds f
SET details_source = 'https://www.ishares.com/us/products/' || v.product || '/x/latest-holdings.csv',
    details_updated_at = NULL
FROM (VALUES
  ('iShares Core MSCI World UCITS ETF USD (Acc)', '239696'),
  ('iShares MSCI World UCITS ETF USD (Dist)',     '239696'),
  ('iShares Core S&P 500 UCITS ETF USD (Acc)',    '239726'),
  ('iShares Core S&P 500 UCITS ETF USD (Dist)',   '239726'),
  ('iShares Core MSCI EM IMI UCITS ETF USD (Acc)', '244050')
) AS v(name, product)
WHERE f.name = v.name;

UPDATE api.assets a
SET name = v.name,
    description = COALESCE(v.description, a.description)
FROM (VALUES
  (1180, 'S&P 500 ETF ausschüttend (iShares, London)', NULL),
  (1185, 'US-Anleihenmarkt ETF (iShares)', NULL),
  (1189, 'Industrieländer ETF (Vanguard, USA)', NULL),
  (1221, 'US-Staatsanleihen 1-3 Jahre ETF (iShares)', 'US-Staatsanleihen - kurze Laufzeiten (iShares 1-3 Year Treasury Bond ETF)'),
  (1222, 'US-Staatsanleihen 7-10 Jahre ETF (iShares)', 'US-Staatsanleihen - mittlere Laufzeiten (iShares 7-10 Year Treasury Bond ETF)'),
  (1223, 'US-Staatsanleihen 20+ Jahre ETF (iShares)', 'US-Staatsanleihen - lange Laufzeiten (iShares 20+ Year Treasury Bond ETF)'),
  (1224, 'US-Staatsanleihen inflationsgeschützt ETF (iShares)', 'US-Staatsanleihen - inflationsgeschützt (iShares TIPS Bond ETF)'),
  (1226, 'US-Anleihenmarkt ETF (Vanguard)', 'US-Anleihenmarkt - breit gemischt, sehr niedrige Kosten (Vanguard Total Bond Market ETF)'),
  (1227, 'US-Unternehmensanleihen ETF (iShares)', 'Unternehmensanleihen - gute Bonität (iShares iBoxx $ Investment Grade Corporate Bond ETF)'),
  (1228, 'US-Hochzinsanleihen ETF (iShares)', 'Unternehmensanleihen - schwächere Bonität (iShares iBoxx $ High Yield Corporate Bond ETF)'),
  (1229, 'Schwellenländer-Staatsanleihen ETF (iShares)', 'Staatsanleihen - Schwellenländer in US-Dollar (iShares J.P. Morgan USD Emerging Markets Bond ETF)'),
  (1230, 'Internationale Anleihen ETF (Vanguard)', 'Anleihen - international ohne USA, währungsgesichert (Vanguard Total International Bond ETF)')
) AS v(id, name, description)
WHERE a.id = v.id;

SELECT id, symbol, name FROM api.assets WHERE id IN (1180,1185,1189,1221,1222,1223,1224,1226,1227,1228,1229,1230) ORDER BY id;

COMMIT;
