-- =============================================================================
-- MIGRATION 2026-12-02: new listings SpaceX (SPCX) and Anthropic (ANT)
-- -----------------------------------------------------------------------------
-- Requires 2026-12-01_admin_position_count.sql. Run from the repository root
-- as the migration superuser:
--
--     psql -d postgres -f dbinit/migrations/2026-12-02_new_listings_spcx_ant.sql
--
-- Both trade on Nasdaq (SPCX since 2026-06-12, ANT since 2026-11-19); Alpaca
-- serves their daily bars. Same rows as in dbinit/assets.csv (ids 1206,
-- 1207). The updater fetches their prices on its next daily run (and their
-- company figures on its next details run). Re-runnable: existing symbols
-- are skipped.
-- =============================================================================

\set ON_ERROR_STOP on
BEGIN;

INSERT INTO api.assets (id, symbol, name, description, asset_type, price_provider) VALUES
  (1206, 'SPCX', 'SpaceX (Space Exploration Technologies Corp.)',
   'Raumfahrt - Raketen, Satelliten und Starlink-Internet', 'stock', 'alpaca'),
  (1207, 'ANT', 'Anthropic PBC',
   'Künstliche Intelligenz - Entwickler des KI-Assistenten Claude', 'stock', 'alpaca')
ON CONFLICT (symbol) DO NOTHING;

-- explicit ids: keep the identity sequence ahead of them
SELECT setval(pg_get_serial_sequence('api.assets', 'id'), (SELECT max(id) FROM api.assets));

SELECT id, symbol, name, price_provider FROM api.assets WHERE symbol IN ('SPCX', 'ANT');

COMMIT;
