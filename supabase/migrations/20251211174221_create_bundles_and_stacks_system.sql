/*
  # Create Bundles and Stacks System

  1. New Tables
    - `bundles`
      - `id` (uuid, primary key)
      - `name` (text) - Bundle name (e.g., "Joint & Tissue Recovery Stack")
      - `slug` (text) - URL-friendly slug
      - `description` (text) - Benefit-focused description
      - `discount_percentage` (numeric) - Discount % (10-20)
      - `is_active` (boolean) - Show/hide bundle
      - `display_order` (integer) - Sort order
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `bundle_products`
      - `id` (uuid, primary key)
      - `bundle_id` (uuid) - References bundles
      - `product_id` (uuid) - References products
      - `quantity` (integer) - Quantity of product in bundle (default 1)
      - `created_at` (timestamptz)

  2. New Columns for Products
    - `compare_at_price` (numeric) - For showing sale prices
    - `is_in_stock` (boolean) - Explicit stock status flag

  3. Functions
    - Calculate bundle price automatically
    - Get bundle with products

  4. Security
    - Public can read active bundles
    - Only admins can create/edit bundles
*/

-- Create bundles table
CREATE TABLE IF NOT EXISTS bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  discount_percentage numeric DEFAULT 15,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;

-- Create bundle_products junction table
CREATE TABLE IF NOT EXISTS bundle_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id uuid REFERENCES bundles(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE(bundle_id, product_id)
);

ALTER TABLE bundle_products ENABLE ROW LEVEL SECURITY;

-- Add compare_at_price and is_in_stock to products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'compare_at_price'
  ) THEN
    ALTER TABLE products ADD COLUMN compare_at_price numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'is_in_stock'
  ) THEN
    ALTER TABLE products ADD COLUMN is_in_stock boolean DEFAULT true;
  END IF;
END $$;

-- Update is_in_stock based on stock_quantity
UPDATE products SET is_in_stock = (stock_quantity > 0);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bundles_slug ON bundles(slug);
CREATE INDEX IF NOT EXISTS idx_bundles_active ON bundles(is_active);
CREATE INDEX IF NOT EXISTS idx_bundle_products_bundle ON bundle_products(bundle_id);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(is_in_stock);

-- RLS Policies for bundles
CREATE POLICY "Anyone can view active bundles"
  ON bundles FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage bundles"
  ON bundles FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- RLS Policies for bundle_products
CREATE POLICY "Anyone can view bundle products"
  ON bundle_products FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage bundle products"
  ON bundle_products FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Function to get bundle with products and calculated price
CREATE OR REPLACE FUNCTION get_bundle_details(bundle_slug text)
RETURNS TABLE (
  bundle_id uuid,
  bundle_name text,
  bundle_description text,
  discount_percentage numeric,
  products jsonb,
  total_price numeric,
  discounted_price numeric,
  savings numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.name,
    b.description,
    b.discount_percentage,
    jsonb_agg(
      jsonb_build_object(
        'id', p.id,
        'name', p.name,
        'slug', p.slug,
        'price', COALESCE(p.price_cad, p.price),
        'quantity', bp.quantity,
        'image_url', p.image_url
      )
    ) as products,
    SUM(COALESCE(p.price_cad, p.price) * bp.quantity) as total_price,
    ROUND(SUM(COALESCE(p.price_cad, p.price) * bp.quantity) * (1 - b.discount_percentage / 100), 2) as discounted_price,
    ROUND(SUM(COALESCE(p.price_cad, p.price) * bp.quantity) * (b.discount_percentage / 100), 2) as savings
  FROM bundles b
  JOIN bundle_products bp ON bp.bundle_id = b.id
  JOIN products p ON p.id = bp.product_id
  WHERE b.slug = bundle_slug AND b.is_active = true
  GROUP BY b.id, b.name, b.description, b.discount_percentage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all active bundles with details
CREATE OR REPLACE FUNCTION get_all_bundles()
RETURNS TABLE (
  bundle_id uuid,
  bundle_name text,
  bundle_slug text,
  bundle_description text,
  discount_percentage numeric,
  image_url text,
  display_order integer,
  products jsonb,
  total_price numeric,
  discounted_price numeric,
  savings numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.name,
    b.slug,
    b.description,
    b.discount_percentage,
    b.image_url,
    b.display_order,
    jsonb_agg(
      jsonb_build_object(
        'id', p.id,
        'name', p.name,
        'slug', p.slug,
        'price', COALESCE(p.price_cad, p.price),
        'quantity', bp.quantity,
        'image_url', p.image_url
      )
    ) as products,
    SUM(COALESCE(p.price_cad, p.price) * bp.quantity) as total_price,
    ROUND(SUM(COALESCE(p.price_cad, p.price) * bp.quantity) * (1 - b.discount_percentage / 100), 2) as discounted_price,
    ROUND(SUM(COALESCE(p.price_cad, p.price) * bp.quantity) * (b.discount_percentage / 100), 2) as savings
  FROM bundles b
  JOIN bundle_products bp ON bp.bundle_id = b.id
  JOIN products p ON p.id = bp.product_id
  WHERE b.is_active = true
  GROUP BY b.id, b.name, b.slug, b.description, b.discount_percentage, b.image_url, b.display_order
  ORDER BY b.display_order ASC, b.name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update is_in_stock when stock_quantity changes
CREATE OR REPLACE FUNCTION update_stock_status()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_in_stock = (NEW.stock_quantity > 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_stock_status ON products;
CREATE TRIGGER trigger_update_stock_status
  BEFORE UPDATE ON products
  FOR EACH ROW
  WHEN (OLD.stock_quantity IS DISTINCT FROM NEW.stock_quantity)
  EXECUTE FUNCTION update_stock_status();
