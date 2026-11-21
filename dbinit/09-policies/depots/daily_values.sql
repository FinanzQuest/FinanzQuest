-- =============================================================================
-- RLS for depots.daily_values
-- -----------------------------------------------------------------------------
-- Enabled with NO client policies on purpose: clients read depot values
-- through depots.values (owner-run view). Only depots.rebuild_depot_values_for
-- (called by the trigger / job as the owner) writes it.
-- =============================================================================

ALTER TABLE depots.daily_values ENABLE ROW LEVEL SECURITY;
