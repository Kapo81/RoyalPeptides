/*
  # Add Pricing and Images to Products

  1. Changes
    - Add `price` column to products table (decimal)
    - Add `image_url` column for product vial renders
    - Add `image_detail_url` column for detailed product shots
    - Add `featured` boolean column for highlighting products

  2. Notes
    - Prices are in USD
    - Images will be placeholders initially
    - All existing products will get default values
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'price'
  ) THEN
    ALTER TABLE products ADD COLUMN price DECIMAL(10,2) DEFAULT 99.99;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE products ADD COLUMN image_url TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'image_detail_url'
  ) THEN
    ALTER TABLE products ADD COLUMN image_detail_url TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'featured'
  ) THEN
    ALTER TABLE products ADD COLUMN featured BOOLEAN DEFAULT false;
  END IF;
END $$;