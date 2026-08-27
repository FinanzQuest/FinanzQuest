-- =============================================================================
-- depots.get_commission()
-- Depends on: config.commission setting (11-config/config.sql)
-- =============================================================================

CREATE OR REPLACE FUNCTION depots.get_commission() RETURNS REAL LANGUAGE sql AS $$
    SELECT current_setting('config.commission')::REAL AS result;
$$;
