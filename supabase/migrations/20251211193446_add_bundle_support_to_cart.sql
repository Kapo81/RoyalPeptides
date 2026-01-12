/*
  # Add Bundle Support to Cart and Orders

  1. Modifications to cart_items
    - Add `bundle_id` column to reference bundles table
    - Add `bundle_name` column to store bundle name snapshot
    - Add `bundle_products` JSONB column to store included products info
    - Make product_id nullable so bundles can be cart items without individual product
    
  2. Modifications to order_items
    - Add `bundle_id` column to reference bundles table
    - Add `bundle_products` JSONB column to store included products for admin reference
    
  3. Purpose
    - Allow bundles to be added to cart as single line items
    - Track bundle purchases in orders
    - Store bundle product composition for fulfillment
*/

-- Add bundle support to cart_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cart_items' AND column_name = 'bundle_id'
  ) THEN
    ALTER TABLE cart_items ADD COLUMN bundle_id uuid REFERENCES bundles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cart_items' AND column_name = 'bundle_name'
  ) THEN
    ALTER TABLE cart_items ADD COLUMN bundle_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cart_items' AND column_name = 'bundle_products'
  ) THEN
    ALTER TABLE cart_items ADD COLUMN bundle_products jsonb DEFAULT '[]'::jsonb;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cart_items' AND column_name = 'bundle_price'
  ) THEN
    ALTER TABLE cart_items ADD COLUMN bundle_price numeric;
  END IF;
END $$;

-- Add bundle support to order_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'bundle_id'
  ) THEN
    ALTER TABLE order_items ADD COLUMN bundle_id uuid REFERENCES bundles(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'bundle_products'
  ) THEN
    ALTER TABLE order_items ADD COLUMN bundle_products jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Create index for bundle lookups
CREATE INDEX IF NOT EXISTS idx_cart_items_bundle_id ON cart_items(bundle_id);
CREATE INDEX IF NOT EXISTS idx_order_items_bundle_id ON order_items(bundle_id);

-- Function to deduct stock for bundle products when order is completed
CREATE OR REPLACE FUNCTION deduct_bundle_stock(p_order_id uuid)
RETURNS void AS $$
DECLARE
  v_order_item RECORD;
  v_bundle_product RECORD;
BEGIN
  FOR v_order_item IN
    SELECT * FROM order_items WHERE order_id = p_order_id AND bundle_id IS NOT NULL
  LOOP
    FOR v_bundle_product IN
      SELECT * FROM jsonb_to_recordset(v_order_item.bundle_products) 
      AS x(id text, quantity integer)
    LOOP
      UPDATE products
      SET 
        qty_in_stock = GREATEST(0, qty_in_stock - (v_bundle_product.quantity * v_order_item.quantity)),
        total_sold = total_sold + (v_bundle_product.quantity * v_order_item.quantity)
      WHERE id = v_bundle_product.id::uuid;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
