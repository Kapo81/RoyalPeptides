/*
  # Add Comprehensive Inventory Management System

  1. New Columns for Products
    - `cost_price` (numeric) - Wholesale/cost price in CAD
    - `selling_price` (numeric) - Retail price (cost_price + $50 markup)
    - `qty_in_stock` (integer) - Current quantity in stock
    - `qty_sold` (integer) - Total units sold (for analytics)
    - `form` (text) - Product form: 'vial' or 'bottle'

  2. Updates
    - Migrate existing stock_quantity to qty_in_stock
    - Update triggers to work with new column names
    - Set default values for new columns

  3. Functions
    - Update stock deduction function to increment qty_sold
    - Add function to calculate total sales value
    - Top selling products function
*/

-- Add new columns to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'cost_price'
  ) THEN
    ALTER TABLE products ADD COLUMN cost_price numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'selling_price'
  ) THEN
    ALTER TABLE products ADD COLUMN selling_price numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'qty_sold'
  ) THEN
    ALTER TABLE products ADD COLUMN qty_sold integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'form'
  ) THEN
    ALTER TABLE products ADD COLUMN form text DEFAULT 'vial';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'stock_quantity'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'qty_in_stock'
  ) THEN
    ALTER TABLE products RENAME COLUMN stock_quantity TO qty_in_stock;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'qty_in_stock'
  ) THEN
    ALTER TABLE products ADD COLUMN qty_in_stock integer DEFAULT 0;
  END IF;
END $$;

-- Set default selling_price based on price_cad or price if not set
UPDATE products
SET selling_price = COALESCE(price_cad, price)
WHERE selling_price = 0 OR selling_price IS NULL;

-- Update is_in_stock for existing products
UPDATE products
SET is_in_stock = (qty_in_stock > 0);

-- Drop existing triggers
DROP TRIGGER IF EXISTS trigger_update_stock_status ON products;
DROP TRIGGER IF EXISTS trigger_update_stock_status_insert ON products;
DROP TRIGGER IF EXISTS trigger_update_stock_status_update ON products;

-- Create stock status update function
CREATE OR REPLACE FUNCTION update_stock_status()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_in_stock = (NEW.qty_in_stock > 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for stock status updates
CREATE TRIGGER trigger_update_stock_status_insert
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_stock_status();

CREATE TRIGGER trigger_update_stock_status_update
  BEFORE UPDATE ON products
  FOR EACH ROW
  WHEN (NEW.qty_in_stock IS DISTINCT FROM OLD.qty_in_stock)
  EXECUTE FUNCTION update_stock_status();

-- Update stock deduction function
DROP TRIGGER IF EXISTS trigger_deduct_stock_on_order ON orders;

CREATE OR REPLACE FUNCTION deduct_stock_on_order()
RETURNS TRIGGER AS $$
DECLARE
  item RECORD;
BEGIN
  FOR item IN
    SELECT oi.product_id, oi.quantity
    FROM order_items oi
    WHERE oi.order_id = NEW.id
  LOOP
    UPDATE products
    SET 
      qty_in_stock = GREATEST(qty_in_stock - item.quantity, 0),
      qty_sold = qty_sold + item.quantity
    WHERE id = item.product_id;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_deduct_stock_on_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION deduct_stock_on_order();

-- Create function to get inventory statistics
CREATE OR REPLACE FUNCTION get_inventory_stats()
RETURNS TABLE (
  total_products_in_stock integer,
  total_units_in_stock integer,
  total_units_sold integer,
  total_revenue numeric,
  low_stock_count integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE is_in_stock = true)::integer as total_products_in_stock,
    COALESCE(SUM(qty_in_stock), 0)::integer as total_units_in_stock,
    COALESCE(SUM(qty_sold), 0)::integer as total_units_sold,
    COALESCE(SUM(selling_price * qty_sold), 0) as total_revenue,
    COUNT(*) FILTER (WHERE qty_in_stock > 0 AND qty_in_stock <= 5)::integer as low_stock_count
  FROM products;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get top selling products
CREATE OR REPLACE FUNCTION get_top_selling_products(limit_count integer DEFAULT 10)
RETURNS TABLE (
  product_id uuid,
  product_name text,
  qty_sold integer,
  total_sales numeric,
  image_url text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.qty_sold,
    p.selling_price * p.qty_sold as total_sales,
    p.image_url
  FROM products p
  WHERE p.qty_sold > 0
  ORDER BY p.qty_sold DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_qty_in_stock ON products(qty_in_stock);
CREATE INDEX IF NOT EXISTS idx_products_qty_sold ON products(qty_sold);
CREATE INDEX IF NOT EXISTS idx_products_form ON products(form);
