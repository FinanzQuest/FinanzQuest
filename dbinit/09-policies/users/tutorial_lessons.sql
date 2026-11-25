-- =============================================================================
-- RLS for users.tutorial_lessons
-- -----------------------------------------------------------------------------
-- Tutorial catalog: readable by every logged-in user. No write policies: rows
-- come from seed/tutorial_catalog.sql and migrations.
-- =============================================================================

ALTER TABLE users.tutorial_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read tutorial_lessons" ON users.tutorial_lessons
FOR SELECT TO authenticated
USING (true);
