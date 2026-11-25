-- =============================================================================
-- seed/tutorial_catalog.sql — server-side mirror of the tutorial catalog
-- Depends on: users.tutorial_paths, users.tutorial_path_requires,
--             users.tutorial_lessons
-- -----------------------------------------------------------------------------
-- Must match frontend tutorial/_engine/catalog.ts (ids, order, requires, xp,
-- reward, min_score, min_seconds). Idempotent: re-runnable, also included by
-- the migration 2026-12-05_tutorial_progress.sql. Paths and lessons are never
-- deleted here (progress references them, ON DELETE RESTRICT); a new lesson
-- needs a new migration that upserts it. Requires rows not listed here ARE
-- deleted. Stub paths (steuern, spekulation) have no rows.
-- Lesson:     20 XP, 100 virtual EUR, min_score 0 (finishing passes), 45 s.
-- Checkpoint: 50 XP, 500 virtual EUR, min_score 0.7, 90 s.
-- =============================================================================

-- positions are unique: move the managed rows out of the way first so a
-- reorder cannot collide mid-statement (the upserts set them back)
UPDATE users.tutorial_paths SET position = -position - 1
WHERE id IN ('grundlagen', 'aktien', 'etfs', 'psychologie', 'anleihen', 'portfolio') AND position >= 0;

INSERT INTO users.tutorial_paths (id, position) VALUES
  ('grundlagen', 1),
  ('aktien', 2),
  ('etfs', 3),
  ('psychologie', 4),
  ('anleihen', 5),
  ('portfolio', 6)
ON CONFLICT (id) DO UPDATE SET position = EXCLUDED.position;

DELETE FROM users.tutorial_path_requires
WHERE (path_id, requires_path_id) NOT IN (VALUES
  ('aktien', 'grundlagen'),
  ('etfs', 'grundlagen'),
  ('psychologie', 'grundlagen'),
  ('anleihen', 'grundlagen'),
  ('portfolio', 'aktien'),
  ('portfolio', 'anleihen')
);

INSERT INTO users.tutorial_path_requires (path_id, requires_path_id) VALUES
  ('aktien', 'grundlagen'),
  ('etfs', 'grundlagen'),
  ('psychologie', 'grundlagen'),
  ('anleihen', 'grundlagen'),
  ('portfolio', 'aktien'),
  ('portfolio', 'anleihen')
ON CONFLICT DO NOTHING;

UPDATE users.tutorial_lessons SET position = -position - 1
WHERE id IN (
  'grundlagen.warum-vorsorgen', 'grundlagen.rendite-zinseszins', 'grundlagen.risiko-streuung', 'grundlagen.etf-sparplan',
  'grundlagen.checkpoint', 'aktien.unternehmen-bewerten', 'aktien.kgv-kbv-dividende', 'aktien.risiko-kennzahlen',
  'aktien.charts-lesen', 'aktien.checkpoint', 'etfs.index-bauen', 'etfs.indizes-vergleich',
  'etfs.laender-sektoren', 'etfs.kosten-varianten', 'etfs.checkpoint', 'psychologie.crashs',
  'psychologie.panik-simulation', 'psychologie.time-in-market', 'psychologie.einmal-vs-sparplan', 'psychologie.rebalancing',
  'psychologie.checkpoint', 'anleihen.wie-anleihen-funktionieren', 'anleihen.zinsen-und-kurse', 'anleihen.bonitaet',
  'anleihen.anleihen-im-portfolio', 'anleihen.checkpoint', 'portfolio.rendite-volatilitaet-mathe', 'portfolio.kovarianz-korrelation',
  'portfolio.sharpe-alpha-beta', 'portfolio.efficient-frontier', 'portfolio.capm', 'portfolio.optionen-griechen',
  'portfolio.checkpoint'
) AND position >= 0;

INSERT INTO users.tutorial_lessons (id, path_id, position, is_checkpoint, xp, virtual_cash_reward, min_score, min_seconds) VALUES
  ('grundlagen.warum-vorsorgen', 'grundlagen', 1, false, 20, 100, 0, 45),
  ('grundlagen.rendite-zinseszins', 'grundlagen', 2, false, 20, 100, 0, 45),
  ('grundlagen.risiko-streuung', 'grundlagen', 3, false, 20, 100, 0, 45),
  ('grundlagen.etf-sparplan', 'grundlagen', 4, false, 20, 100, 0, 45),
  ('grundlagen.checkpoint', 'grundlagen', 5, true, 50, 500, 0.7, 90),
  ('aktien.unternehmen-bewerten', 'aktien', 1, false, 20, 100, 0, 45),
  ('aktien.kgv-kbv-dividende', 'aktien', 2, false, 20, 100, 0, 45),
  ('aktien.risiko-kennzahlen', 'aktien', 3, false, 20, 100, 0, 45),
  ('aktien.charts-lesen', 'aktien', 4, false, 20, 100, 0, 45),
  ('aktien.checkpoint', 'aktien', 5, true, 50, 500, 0.7, 90),
  ('etfs.index-bauen', 'etfs', 1, false, 20, 100, 0, 45),
  ('etfs.indizes-vergleich', 'etfs', 2, false, 20, 100, 0, 45),
  ('etfs.laender-sektoren', 'etfs', 3, false, 20, 100, 0, 45),
  ('etfs.kosten-varianten', 'etfs', 4, false, 20, 100, 0, 45),
  ('etfs.checkpoint', 'etfs', 5, true, 50, 500, 0.7, 90),
  ('psychologie.crashs', 'psychologie', 1, false, 20, 100, 0, 45),
  ('psychologie.panik-simulation', 'psychologie', 2, false, 20, 100, 0, 45),
  ('psychologie.time-in-market', 'psychologie', 3, false, 20, 100, 0, 45),
  ('psychologie.einmal-vs-sparplan', 'psychologie', 4, false, 20, 100, 0, 45),
  ('psychologie.rebalancing', 'psychologie', 5, false, 20, 100, 0, 45),
  ('psychologie.checkpoint', 'psychologie', 6, true, 50, 500, 0.7, 90),
  ('anleihen.wie-anleihen-funktionieren', 'anleihen', 1, false, 20, 100, 0, 45),
  ('anleihen.zinsen-und-kurse', 'anleihen', 2, false, 20, 100, 0, 45),
  ('anleihen.bonitaet', 'anleihen', 3, false, 20, 100, 0, 45),
  ('anleihen.anleihen-im-portfolio', 'anleihen', 4, false, 20, 100, 0, 45),
  ('anleihen.checkpoint', 'anleihen', 5, true, 50, 500, 0.7, 90),
  ('portfolio.rendite-volatilitaet-mathe', 'portfolio', 1, false, 20, 100, 0, 45),
  ('portfolio.kovarianz-korrelation', 'portfolio', 2, false, 20, 100, 0, 45),
  ('portfolio.sharpe-alpha-beta', 'portfolio', 3, false, 20, 100, 0, 45),
  ('portfolio.efficient-frontier', 'portfolio', 4, false, 20, 100, 0, 45),
  ('portfolio.capm', 'portfolio', 5, false, 20, 100, 0, 45),
  ('portfolio.optionen-griechen', 'portfolio', 6, false, 20, 100, 0, 45),
  ('portfolio.checkpoint', 'portfolio', 7, true, 50, 500, 0.7, 90)
ON CONFLICT (id) DO UPDATE SET
  path_id             = EXCLUDED.path_id,
  position            = EXCLUDED.position,
  is_checkpoint       = EXCLUDED.is_checkpoint,
  xp                  = EXCLUDED.xp,
  virtual_cash_reward = EXCLUDED.virtual_cash_reward,
  min_score           = EXCLUDED.min_score,
  min_seconds         = EXCLUDED.min_seconds;
