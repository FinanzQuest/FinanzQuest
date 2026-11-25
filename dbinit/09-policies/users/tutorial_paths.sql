-- =============================================================================
-- RLS for users.tutorial_paths
-- -----------------------------------------------------------------------------
-- Tutorial catalog: readable by every logged-in user. No write policies: rows
-- come from seed/tutorial_catalog.sql and migrations.
-- =============================================================================

ALTER TABLE users.tutorial_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read tutorial_paths" ON users.tutorial_paths
FOR SELECT TO authenticated
USING (true);
