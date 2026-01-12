/*
  # Update Category Names and Add Descriptions

  1. Changes
    - Add description column to categories table
    - Update category names to new taxonomy:
      - "Precurseur GH" → "Précurseur HGH"
      - "Amplificateur" → "Growth Factor"
      - "Fat Burner / Mitochondry" → "Fat Burner / Myostatin Inhibitor"
      - "Recovery" → "Recovery / Injury / Sleep"
    - Add descriptions for all categories
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'description'
  ) THEN
    ALTER TABLE categories ADD COLUMN description text;
  END IF;
END $$;

UPDATE categories SET 
  name = 'Précurseur HGH',
  description = 'Growth hormone releasing peptides that stimulate natural HGH production'
WHERE slug = 'precurseur-gh';

UPDATE categories SET 
  name = 'Growth Factor',
  description = 'Insulin-like growth factor peptides for research applications'
WHERE slug = 'amplificateur';

UPDATE categories SET 
  name = 'Fat Burner / Myostatin Inhibitor',
  description = 'Peptides for metabolic research and myostatin regulation studies'
WHERE slug = 'fat-burner-mitochondry';

UPDATE categories SET 
  name = 'Recovery / Injury / Sleep',
  description = 'Research peptides for tissue repair, recovery, and sleep cycle studies'
WHERE slug = 'recovery';

UPDATE categories SET
  description = 'Peptides for cosmetic and aesthetic research applications'
WHERE slug = 'aesthetic';

UPDATE categories SET
  description = 'Research compounds for fertility and testosterone studies'
WHERE slug = 'fertility-test-booster';