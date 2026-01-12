/*
  # Add Inventory Tracking
  
  1. Changes to Products Table
    - Add `stock_quantity` column to track available inventory
    - Add `low_stock_threshold` column to set alert levels
  
  2. New Features
    - Automatic low stock detection
    - Inventory management for admins
  
  3. Security
    - Only admins can update stock quantities
*/

-- Add stock tracking columns to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'stock_quantity'
  ) THEN
    ALTER TABLE products ADD COLUMN stock_quantity integer DEFAULT 100;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'low_stock_threshold'
  ) THEN
    ALTER TABLE products ADD COLUMN low_stock_threshold integer DEFAULT 10;
  END IF;
END $$;

-- Create index for stock queries
CREATE INDEX IF NOT EXISTS idx_products_stock_quantity ON products(stock_quantity);

-- Add policy for admins to update stock
CREATE POLICY "Admins can update product stock"
  ON products FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Function to get low stock products
CREATE OR REPLACE FUNCTION get_low_stock_products()
RETURNS TABLE (
  id uuid,
  name text,
  stock_quantity integer,
  low_stock_threshold integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.name, p.stock_quantity, p.low_stock_threshold
  FROM products p
  WHERE p.stock_quantity <= p.low_stock_threshold
  ORDER BY p.stock_quantity ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;