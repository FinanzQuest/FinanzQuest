-- =============================================================================
-- depots.sp_to_per_month(period)
-- Depends on: public.SavingsPeriod (02-types/savings_period.sql)
-- =============================================================================

CREATE OR REPLACE FUNCTION depots.sp_to_per_month(period SavingsPeriod)
RETURNS NUMERIC LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  RETURN CASE period
    WHEN 'daily'    THEN 365.0 / 12
    WHEN 'weekly'   THEN 52.0  / 12
    WHEN 'monthly'  THEN 1
    WHEN 'annually' THEN 1.0   / 12
  END;
END;
$$;
