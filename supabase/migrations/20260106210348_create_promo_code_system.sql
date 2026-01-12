/*
  # Create Promo Code System with Race Condition Protection

  1. New Tables
    - `promo_codes`
      - `code` (text, primary key) - Promo code identifier (case-insensitive)
      - `discount_type` (text) - Type of discount: 'fixed' or 'percent'
      - `discount_value` (numeric) - Amount or percentage off
      - `min_subtotal` (numeric) - Minimum cart subtotal required
      - `max_uses` (integer) - Maximum number of times code can be used
      - `uses_count` (integer) - Current number of uses (default 0)
      - `is_active` (boolean) - Whether code is currently active
      - `starts_at` (timestamp) - Optional start date
      - `ends_at` (timestamp) - Optional end date
      - `created_at` (timestamp) - When code was created

    - `promo_redemptions`
      - `id` (uuid, primary key) - Unique identifier
      - `code` (text) - Reference to promo code
      - `order_id` (uuid) - Reference to order
      - `order_number` (text) - Order number for reference
      - `discount_amount` (numeric) - Amount discounted
      - `redeemed_at` (timestamp) - When redemption occurred

  2. Updates to Existing Tables
    - Add `promo_code` to orders table
    - Add `promo_discount` to orders table

  3. Security
    - Enable RLS on both tables
    - Public read access for validation
    - Only system can insert/update

  4. Atomic Redemption Function
    - Server-side function to validate and redeem codes atomically
    - Prevents race conditions using database-level locking
*/

-- Create promo_codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  code text PRIMARY KEY,
  discount_type text NOT NULL CHECK (discount_type IN ('fixed', 'percent')),
  discount_value numeric NOT NULL CHECK (discount_value > 0),
  min_subtotal numeric NOT NULL DEFAULT 0,
  max_uses integer NOT NULL CHECK (max_uses > 0),
  uses_count integer NOT NULL DEFAULT 0 CHECK (uses_count >= 0),
  is_active boolean NOT NULL DEFAULT true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create promo_redemptions table
CREATE TABLE IF NOT EXISTS promo_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  order_id uuid NOT NULL,
  order_number text NOT NULL,
  discount_amount numeric NOT NULL,
  redeemed_at timestamptz NOT NULL DEFAULT now()
);

-- Add promo fields to orders table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'promo_code'
  ) THEN
    ALTER TABLE orders ADD COLUMN promo_code text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'promo_discount'
  ) THEN
    ALTER TABLE orders ADD COLUMN promo_discount numeric DEFAULT 0;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_promo_redemptions_code ON promo_redemptions(code);
CREATE INDEX IF NOT EXISTS idx_promo_redemptions_order ON promo_redemptions(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_promo_code ON orders(promo_code) WHERE promo_code IS NOT NULL;

-- Enable RLS
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for promo_codes
CREATE POLICY "Anyone can read active promo codes"
  ON promo_codes FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Only service role can insert promo codes"
  ON promo_codes FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Only service role can update promo codes"
  ON promo_codes FOR UPDATE
  TO service_role
  USING (true);

-- RLS Policies for promo_redemptions
CREATE POLICY "Only service role can read redemptions"
  ON promo_redemptions FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Only service role can insert redemptions"
  ON promo_redemptions FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Atomic promo code validation and redemption function
CREATE OR REPLACE FUNCTION validate_and_redeem_promo(
  p_code text,
  p_subtotal numeric,
  p_order_id uuid,
  p_order_number text
) RETURNS jsonb AS $$
DECLARE
  v_promo promo_codes%ROWTYPE;
  v_discount_amount numeric;
  v_now timestamptz := now();
BEGIN
  -- Normalize code to lowercase for case-insensitive comparison
  p_code := lower(trim(p_code));
  
  -- Lock the promo code row for update to prevent race conditions
  SELECT * INTO v_promo
  FROM promo_codes
  WHERE lower(code) = p_code
  FOR UPDATE;
  
  -- Validate promo code exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid promo code'
    );
  END IF;
  
  -- Validate promo code is active
  IF NOT v_promo.is_active THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Promo code is not active'
    );
  END IF;
  
  -- Validate start date
  IF v_promo.starts_at IS NOT NULL AND v_now < v_promo.starts_at THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Promo code not yet valid'
    );
  END IF;
  
  -- Validate end date
  IF v_promo.ends_at IS NOT NULL AND v_now > v_promo.ends_at THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Promo code has expired'
    );
  END IF;
  
  -- Validate usage limit
  IF v_promo.uses_count >= v_promo.max_uses THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Promo code has reached its usage limit'
    );
  END IF;
  
  -- Validate minimum subtotal
  IF p_subtotal < v_promo.min_subtotal THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', format('Minimum subtotal of $%.2f required', v_promo.min_subtotal)
    );
  END IF;
  
  -- Calculate discount amount
  IF v_promo.discount_type = 'fixed' THEN
    v_discount_amount := v_promo.discount_value;
  ELSE
    v_discount_amount := (p_subtotal * v_promo.discount_value / 100);
  END IF;
  
  -- Ensure discount doesn't exceed subtotal
  IF v_discount_amount > p_subtotal THEN
    v_discount_amount := p_subtotal;
  END IF;
  
  -- Increment usage count
  UPDATE promo_codes
  SET uses_count = uses_count + 1
  WHERE lower(code) = p_code;
  
  -- Record redemption
  INSERT INTO promo_redemptions (code, order_id, order_number, discount_amount)
  VALUES (v_promo.code, p_order_id, p_order_number, v_discount_amount);
  
  -- Return success with discount details
  RETURN jsonb_build_object(
    'success', true,
    'code', v_promo.code,
    'discount_amount', v_discount_amount,
    'discount_type', v_promo.discount_type,
    'remaining_uses', v_promo.max_uses - v_promo.uses_count - 1
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Failed to process promo code'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate promo code without redeeming (for UI preview)
CREATE OR REPLACE FUNCTION validate_promo_code(
  p_code text,
  p_subtotal numeric
) RETURNS jsonb AS $$
DECLARE
  v_promo promo_codes%ROWTYPE;
  v_discount_amount numeric;
  v_now timestamptz := now();
BEGIN
  -- Normalize code to lowercase
  p_code := lower(trim(p_code));
  
  -- Get promo code
  SELECT * INTO v_promo
  FROM promo_codes
  WHERE lower(code) = p_code;
  
  -- Validate exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Invalid promo code'
    );
  END IF;
  
  -- Validate active
  IF NOT v_promo.is_active THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Promo code is not active'
    );
  END IF;
  
  -- Validate dates
  IF v_promo.starts_at IS NOT NULL AND v_now < v_promo.starts_at THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Promo code not yet valid'
    );
  END IF;
  
  IF v_promo.ends_at IS NOT NULL AND v_now > v_promo.ends_at THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Promo code has expired'
    );
  END IF;
  
  -- Validate usage limit
  IF v_promo.uses_count >= v_promo.max_uses THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Promo code has expired'
    );
  END IF;
  
  -- Validate minimum subtotal
  IF p_subtotal < v_promo.min_subtotal THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', format('Minimum subtotal of $%.2f required', v_promo.min_subtotal)
    );
  END IF;
  
  -- Calculate discount
  IF v_promo.discount_type = 'fixed' THEN
    v_discount_amount := v_promo.discount_value;
  ELSE
    v_discount_amount := (p_subtotal * v_promo.discount_value / 100);
  END IF;
  
  IF v_discount_amount > p_subtotal THEN
    v_discount_amount := p_subtotal;
  END IF;
  
  -- Return validation result
  RETURN jsonb_build_object(
    'valid', true,
    'code', v_promo.code,
    'discount_amount', v_discount_amount,
    'discount_type', v_promo.discount_type,
    'min_subtotal', v_promo.min_subtotal,
    'remaining_uses', v_promo.max_uses - v_promo.uses_count
  );
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed the New2026 promo code
INSERT INTO promo_codes (
  code,
  discount_type,
  discount_value,
  min_subtotal,
  max_uses,
  uses_count,
  is_active
) VALUES (
  'New2026',
  'fixed',
  50,
  300,
  20,
  0,
  true
)
ON CONFLICT (code) DO UPDATE SET
  discount_type = EXCLUDED.discount_type,
  discount_value = EXCLUDED.discount_value,
  min_subtotal = EXCLUDED.min_subtotal,
  max_uses = EXCLUDED.max_uses,
  is_active = EXCLUDED.is_active;