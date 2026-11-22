-- =============================================================================
-- depots.random_depot_name()
-- Depends on: nothing (listed before 03-tables/depots/depots.sql in
--             manifest.txt: it is the default of depots.depots.name)
-- -----------------------------------------------------------------------------
-- A friendly random name such as "Sparsamer Hamster" for depots whose owner
-- did not pick one, so the database id never has to be shown as a name.
-- Adjectives are in the masculine form, matching the (masculine) animals.
-- =============================================================================

CREATE OR REPLACE FUNCTION depots.random_depot_name()
RETURNS text
LANGUAGE sql
VOLATILE
SET search_path = ''
AS $$
  SELECT a[1 + floor(random() * cardinality(a))::int]
         || ' ' ||
         n[1 + floor(random() * cardinality(n))::int]
  FROM (SELECT
    ARRAY['Mutiger', 'Kluger', 'Schlauer', 'Ruhiger', 'Flinker', 'Geduldiger',
          'Weiser', 'Tapferer', 'Fleißiger', 'Sparsamer', 'Stetiger', 'Wacher',
          'Kühner', 'Heiterer', 'Listiger', 'Treuer', 'Starker', 'Stiller',
          'Goldener', 'Umsichtiger'] AS a,
    ARRAY['Fuchs', 'Bär', 'Bulle', 'Adler', 'Falke', 'Wolf', 'Luchs', 'Biber',
          'Dachs', 'Hirsch', 'Igel', 'Otter', 'Panther', 'Tiger', 'Delfin',
          'Pinguin', 'Kranich', 'Rabe', 'Hamster', 'Elefant'] AS n
  ) words
$$;
