/*
  # Add Stripe fields to orders table

  1. Changes
    - Add `stripe_session_id` column to store Stripe Checkout Session ID
    - Add `stripe_payment_intent` column to store Stripe Payment Intent ID
    - These fields link orders to Stripe payment records for reconciliation
  
  2. Notes
    - Both fields are nullable since orders can use e-transfer payment method
    - Used by webhook to update order payment status after successful Stripe payment
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'stripe_session_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN stripe_session_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'stripe_payment_intent'
  ) THEN
    ALTER TABLE orders ADD COLUMN stripe_payment_intent text;
  END IF;
END $$;
