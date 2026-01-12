/*
  # Add shipping province to orders

  1. Changes
    - Add `shipping_province` column to orders table to store Canadian province codes
    - This enables accurate shipping cost calculation based on destination province
    
  2. Notes
    - Province stored as 2-letter code (ON, QC, BC, etc.)
    - Used by shipping calculator to determine rates and delivery times
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'shipping_province'
  ) THEN
    ALTER TABLE orders ADD COLUMN shipping_province text;
  END IF;
END $$;
