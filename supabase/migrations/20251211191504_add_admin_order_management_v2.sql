/*
  # Add Admin Order Management Features

  1. New Columns for Orders
    - `admin_notes` (text) - Internal notes for admins
    - `tracking_number` (text) - Shipping tracking number
    - `carrier` (text) - Shipping carrier name
    - `fulfillment_status` (text) - unfulfilled, packed, shipped, completed
    
  2. New Columns for Bundles
    - `category` (text) - Bundle category (Recovery, Fat Loss, Nootropics, Libido, etc.)
    - `tagline` (text) - Short benefit description
    - `synergy_explanation` (text) - Detailed explanation of how products work together
    - `ideal_for` (text) - Target use case description
    
  3. New Table for Admin Settings
    - `admin_settings` - Store-wide configuration
    - Single row with key-value pairs

  4. Security
    - Maintain existing RLS policies
    - Add policies for admin operations
*/

-- Add new columns to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'admin_notes'
  ) THEN
    ALTER TABLE orders ADD COLUMN admin_notes text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'tracking_number'
  ) THEN
    ALTER TABLE orders ADD COLUMN tracking_number text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'carrier'
  ) THEN
    ALTER TABLE orders ADD COLUMN carrier text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'fulfillment_status'
  ) THEN
    ALTER TABLE orders ADD COLUMN fulfillment_status text DEFAULT 'unfulfilled';
  END IF;
END $$;

-- Add new columns to bundles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bundles' AND column_name = 'category'
  ) THEN
    ALTER TABLE bundles ADD COLUMN category text DEFAULT 'General';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bundles' AND column_name = 'tagline'
  ) THEN
    ALTER TABLE bundles ADD COLUMN tagline text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bundles' AND column_name = 'synergy_explanation'
  ) THEN
    ALTER TABLE bundles ADD COLUMN synergy_explanation text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bundles' AND column_name = 'ideal_for'
  ) THEN
    ALTER TABLE bundles ADD COLUMN ideal_for text DEFAULT '';
  END IF;
END $$;

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text DEFAULT 'Royal Peptides',
  support_email text DEFAULT 'support@royalpeptides.com',
  currency text DEFAULT 'CAD',
  shipping_free_threshold_canada numeric DEFAULT 300.00,
  shipping_free_threshold_international numeric DEFAULT 500.00,
  shipping_base_cost numeric DEFAULT 15.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Insert default settings if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_settings LIMIT 1) THEN
    INSERT INTO admin_settings (business_name, support_email, currency, shipping_free_threshold_canada, shipping_free_threshold_international, shipping_base_cost)
    VALUES ('Royal Peptides', 'support@royalpeptides.com', 'CAD', 300.00, 500.00, 15.00);
  END IF;
END $$;

-- RLS Policies for admin_settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'admin_settings' AND policyname = 'Anyone can view settings'
  ) THEN
    CREATE POLICY "Anyone can view settings"
      ON admin_settings FOR SELECT
      USING (true);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_status ON orders(fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);
CREATE INDEX IF NOT EXISTS idx_bundles_category ON bundles(category);

-- Update policies to allow admin operations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Anyone can update orders'
  ) THEN
    CREATE POLICY "Anyone can update orders"
      ON orders FOR UPDATE
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bundles' AND policyname = 'Anyone can update bundles'
  ) THEN
    CREATE POLICY "Anyone can update bundles"
      ON bundles FOR UPDATE
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bundles' AND policyname = 'Anyone can insert bundles'
  ) THEN
    CREATE POLICY "Anyone can insert bundles"
      ON bundles FOR INSERT
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bundle_products' AND policyname = 'Anyone can insert bundle products'
  ) THEN
    CREATE POLICY "Anyone can insert bundle products"
      ON bundle_products FOR INSERT
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bundle_products' AND policyname = 'Anyone can update bundle products'
  ) THEN
    CREATE POLICY "Anyone can update bundle products"
      ON bundle_products FOR UPDATE
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bundle_products' AND policyname = 'Anyone can delete bundle products'
  ) THEN
    CREATE POLICY "Anyone can delete bundle products"
      ON bundle_products FOR DELETE
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Anyone can update products'
  ) THEN
    CREATE POLICY "Anyone can update products"
      ON products FOR UPDATE
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Drop and recreate functions with correct signatures
DROP FUNCTION IF EXISTS get_order_stats(integer);
DROP FUNCTION IF EXISTS get_top_selling_products(integer);
DROP FUNCTION IF EXISTS get_low_stock_products();

-- Function to get order statistics for dashboard
CREATE FUNCTION get_order_stats(days_back integer DEFAULT 30)
RETURNS TABLE (
  today_revenue numeric,
  today_orders bigint,
  last_7_days_revenue numeric,
  last_7_days_orders bigint,
  last_30_days_revenue numeric,
  last_30_days_orders bigint,
  average_order_value numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN o.created_at >= CURRENT_DATE THEN o.total ELSE 0 END), 0) as today_revenue,
    COUNT(CASE WHEN o.created_at >= CURRENT_DATE THEN 1 END) as today_orders,
    COALESCE(SUM(CASE WHEN o.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN o.total ELSE 0 END), 0) as last_7_days_revenue,
    COUNT(CASE WHEN o.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as last_7_days_orders,
    COALESCE(SUM(CASE WHEN o.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN o.total ELSE 0 END), 0) as last_30_days_revenue,
    COUNT(CASE WHEN o.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as last_30_days_orders,
    COALESCE(AVG(o.total), 0) as average_order_value
  FROM orders o
  WHERE o.payment_status = 'paid';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get top selling products
CREATE FUNCTION get_top_selling_products(limit_count integer DEFAULT 5)
RETURNS TABLE (
  product_id uuid,
  product_name text,
  total_quantity_sold bigint,
  total_revenue numeric,
  image_url text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    COALESCE(SUM(oi.quantity), 0)::bigint as total_quantity_sold,
    COALESCE(SUM(oi.subtotal), 0) as total_revenue,
    p.image_url
  FROM products p
  LEFT JOIN order_items oi ON oi.product_id = p.id
  LEFT JOIN orders o ON o.id = oi.order_id AND o.payment_status = 'paid'
  GROUP BY p.id, p.name, p.image_url
  ORDER BY total_quantity_sold DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get low stock products
CREATE FUNCTION get_low_stock_products()
RETURNS TABLE (
  product_id uuid,
  product_name text,
  qty_in_stock integer,
  low_stock_threshold integer,
  image_url text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.qty_in_stock,
    p.low_stock_threshold,
    p.image_url
  FROM products p
  WHERE p.qty_in_stock <= p.low_stock_threshold
  ORDER BY p.qty_in_stock ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
