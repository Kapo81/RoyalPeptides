/*
  # Add Product Soft Delete and Management Enhancements

  1. Changes to Products Table
    - Add `is_active` (boolean, default true) - Soft delete flag
    - Ensure all inventory and management fields are present
    
  2. Security
    - Maintain existing RLS policies
    
  3. Notes
    - Inactive products will not appear in public catalogue
    - Admins can reactivate products instead of permanently deleting
    - All existing products default to active
*/

-- Add is_active column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE products ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;

-- Update any NULL values to true
UPDATE products SET is_active = true WHERE is_active IS NULL;

-- Create index for active products (improves public query performance)
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_in_stock ON products(is_in_stock);

-- Create function to get active products only (for public catalogue)
CREATE OR REPLACE FUNCTION get_active_products()
RETURNS SETOF products AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM products
  WHERE is_active = true
  ORDER BY 
    CASE WHEN is_in_stock = true THEN 0 ELSE 1 END,
    name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get product with categories
CREATE OR REPLACE FUNCTION get_product_with_categories(product_slug text)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'product', row_to_json(p.*),
    'categories', COALESCE(
      (
        SELECT jsonb_agg(row_to_json(c.*))
        FROM categories c
        INNER JOIN product_categories pc ON pc.category_id = c.id
        WHERE pc.product_id = p.id
      ),
      '[]'::jsonb
    )
  ) INTO result
  FROM products p
  WHERE p.slug = product_slug AND p.is_active = true;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get all products with their categories (admin view)
CREATE OR REPLACE FUNCTION get_all_products_with_categories()
RETURNS jsonb AS $$
BEGIN
  RETURN (
    SELECT jsonb_agg(
      jsonb_build_object(
        'product', row_to_json(p.*),
        'categories', COALESCE(
          (
            SELECT jsonb_agg(row_to_json(c.*))
            FROM categories c
            INNER JOIN product_categories pc ON pc.category_id = c.id
            WHERE pc.product_id = p.id
          ),
          '[]'::jsonb
        )
      )
    )
    FROM products p
    ORDER BY p.name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;