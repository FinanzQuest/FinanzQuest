-- =============================================================================
-- RLS for users.tutorial_path_requires
-- -----------------------------------------------------------------------------
-- Tutorial catalog: readable by every logged-in user. No write policies: rows
-- come from seed/tutorial_catalog.sql and migrations.
-- =============================================================================

ALTER TABLE users.tutorial_path_requires ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read tutorial_path_requires" ON users.tutorial_path_requires
FOR SELECT TO authenticated
USING (true);
