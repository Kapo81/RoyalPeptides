/*
  # Add Admin Support and Shipping Status
  
  1. Changes to Orders Table
    - Add `shipping_status` column with values: 'pending', 'paid', 'shipped'
    - Add index for shipping_status for better filtering
  
  2. Security Updates
    - Add UPDATE policies for admin users
    - Admin users are identified by 'is_admin' flag in auth.raw_app_meta_data
    - Only admins can update orders and order_items
  
  3. Notes
    - Admin users must have `is_admin: true` in their app_metadata
    - This can be set manually in Supabase dashboard or via admin API
*/

-- Add shipping_status column to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'shipping_status'
  ) THEN
    ALTER TABLE orders ADD COLUMN shipping_status text NOT NULL DEFAULT 'pending';
  END IF;
END $$;

-- Create index for shipping_status
CREATE INDEX IF NOT EXISTS idx_orders_shipping_status ON orders(shipping_status);

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean,
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add UPDATE policy for orders (admin only)
CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Add UPDATE policy for order_items (admin only)
CREATE POLICY "Admins can update order items"
  ON order_items FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Add DELETE policy for orders (admin only)
CREATE POLICY "Admins can delete orders"
  ON orders FOR DELETE
  TO authenticated
  USING (is_admin());

-- Add DELETE policy for order_items (admin only)
CREATE POLICY "Admins can delete order items"
  ON order_items FOR DELETE
  TO authenticated
  USING (is_admin());