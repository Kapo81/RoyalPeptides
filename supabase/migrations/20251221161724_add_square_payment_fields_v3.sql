/*
  # Add Square Payment Fields and Remove PayPal

  1. Changes
    - Add square_payment_id column to orders table
    - Add square_order_id column to orders table
    - Add square_checkout_id column to orders table
    - Update payment_provider enum to replace paypal with square
    - Remove paypal_order_id and paypal_capture_id columns

  2. Purpose
    - Support Square as primary payment gateway (replacing PayPal)
    - Track Square transaction IDs for reconciliation
    - Maintain Stripe as dormant option (not shown in UI)
    - Support e-transfer option

  3. Security
    - No RLS changes needed (inherits from orders table)
*/

-- Drop PayPal indexes first
DROP INDEX IF EXISTS idx_orders_paypal_order_id;

-- Add Square tracking fields to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS square_payment_id text,
ADD COLUMN IF NOT EXISTS square_order_id text,
ADD COLUMN IF NOT EXISTS square_checkout_id text;

-- Drop the old payment_provider constraint
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_payment_provider_check;

-- Update existing paypal orders to square (now that constraint is removed)
UPDATE orders 
SET payment_provider = 'square'
WHERE payment_provider = 'paypal';

-- Add new constraint with square instead of paypal
ALTER TABLE orders 
ADD CONSTRAINT orders_payment_provider_check 
CHECK (payment_provider IN ('stripe', 'square', 'etransfer'));

-- Set default to square for new orders
ALTER TABLE orders 
ALTER COLUMN payment_provider SET DEFAULT 'square';

-- Remove PayPal columns (after data is migrated)
ALTER TABLE orders 
DROP COLUMN IF EXISTS paypal_order_id,
DROP COLUMN IF EXISTS paypal_capture_id;

-- Create index for Square payment lookups
CREATE INDEX IF NOT EXISTS idx_orders_square_payment_id ON orders(square_payment_id) WHERE square_payment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_square_order_id ON orders(square_order_id) WHERE square_order_id IS NOT NULL;

-- Add comments
COMMENT ON COLUMN orders.square_payment_id IS 'Square Payment ID for tracking Square transactions';
COMMENT ON COLUMN orders.square_order_id IS 'Square Order ID when payment is completed';
COMMENT ON COLUMN orders.square_checkout_id IS 'Square Checkout ID for tracking checkout sessions';
COMMENT ON COLUMN orders.payment_provider IS 'Payment gateway used: square (primary), stripe (dormant), or etransfer';
