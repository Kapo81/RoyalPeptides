/*
  # Fix promo code validation format string

  1. Changes
    - Fix format() function calls to properly escape percentage signs
*/

-- Fix the validate_promo_code function
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
      'error', 'Minimum subtotal of $' || v_promo.min_subtotal::text || ' required'
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

-- Fix the validate_and_redeem_promo function
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
      'error', 'Promo code has expired'
    );
  END IF;
  
  -- Validate minimum subtotal
  IF p_subtotal < v_promo.min_subtotal THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Minimum subtotal of $' || v_promo.min_subtotal::text || ' required'
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