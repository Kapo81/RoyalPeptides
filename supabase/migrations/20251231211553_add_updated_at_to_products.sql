/*
  # Add updated_at timestamp to products table
  
  1. Changes
    - Add `updated_at` column to products table
    - Set default to now()
    - Create trigger to automatically update timestamp on changes
  
  2. Purpose
    - Track when product information (price, stock, etc.) was last modified
    - Enable admin to see last update time for inventory management
*/

-- Add updated_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE products ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists (to avoid duplicate)
DROP TRIGGER IF EXISTS update_products_updated_at ON products;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
