-- =============================================================================
-- GRANTs targeting depots.current_position_value (view)
-- -----------------------------------------------------------------------------
-- Per-position current data -> authenticated only (never anon), like
-- depots.get_position_profits. The view is security_invoker, so each caller is
-- additionally scoped to their own depots by RLS on the underlying relations.
-- =============================================================================

GRANT SELECT ON depots.current_position_value TO authenticated;
