/*
  # Add PayPal Payment Fields

  1. Changes
    - Add paypal_order_id column to orders table
    - Add paypal_capture_id column to orders table
    - Add payment_provider column to track which provider was used

  2. Purpose
    - Support PayPal as alternative payment gateway
    - Track PayPal transaction IDs for reconciliation
    - Enable switching between payment providers

  3. Security
    - No RLS changes needed (inherits from orders table)
*/

-- Add PayPal tracking fields to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS paypal_order_id text,
ADD COLUMN IF NOT EXISTS paypal_capture_id text,
ADD COLUMN IF NOT EXISTS payment_provider text DEFAULT 'stripe' CHECK (payment_provider IN ('stripe', 'paypal', 'etransfer'));

-- Update existing orders to have payment_provider set
UPDATE orders 
SET payment_provider = CASE 
  WHEN payment_method = 'etransfer' THEN 'etransfer'
  WHEN stripe_session_id IS NOT NULL THEN 'stripe'
  ELSE 'stripe'
END
WHERE payment_provider IS NULL;

-- Create index for PayPal order lookups
CREATE INDEX IF NOT EXISTS idx_orders_paypal_order_id ON orders(paypal_order_id) WHERE paypal_order_id IS NOT NULL;

-- Add comment
COMMENT ON COLUMN orders.paypal_order_id IS 'PayPal Order ID for tracking PayPal transactions';
COMMENT ON COLUMN orders.paypal_capture_id IS 'PayPal Capture ID when payment is completed';
COMMENT ON COLUMN orders.payment_provider IS 'Payment gateway used: stripe, paypal, or etransfer';
