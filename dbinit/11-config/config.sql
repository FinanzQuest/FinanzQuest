-- =============================================================================
-- ALTER DATABASE ... SET config.* statements (custom GUCs)
-- =============================================================================

ALTER DATABASE postgres SET config.commission           = '1';
ALTER DATABASE postgres SET config.monthly_budget_start = '200';
