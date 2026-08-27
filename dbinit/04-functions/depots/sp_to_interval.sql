-- =============================================================================
-- depots.sp_to_interval(period)
-- Depends on: public.SavingsPeriod (02-types/savings_period.sql)
-- =============================================================================

CREATE OR REPLACE FUNCTION depots.sp_to_interval(period SavingsPeriod)
RETURNS INTERVAL LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  RETURN CASE period
    WHEN 'daily'    THEN '1 day'
    WHEN 'weekly'   THEN '1 week'
    WHEN 'monthly'  THEN '1 month'
    WHEN 'annually' THEN '1 year'
  END;
END;
$$;
