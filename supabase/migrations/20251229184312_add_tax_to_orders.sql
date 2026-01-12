/*
  # Add Tax Calculation to Orders

  1. Changes
    - Add `tax_amount` column to orders table to store calculated taxes
    - Add `tax_rate` column to store the tax rate applied (for reference)
    
  2. Notes
    - Tax amount will be calculated based on subtotal (after discounts) + shipping
    - Existing orders will have NULL tax values (can be recalculated if needed)
*/

DO $$
BEGIN
  -- Add tax_amount column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'tax_amount'
  ) THEN
    ALTER TABLE orders ADD COLUMN tax_amount numeric(10,2) DEFAULT 0;
  END IF;

  -- Add tax_rate column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'tax_rate'
  ) THEN
    ALTER TABLE orders ADD COLUMN tax_rate numeric(5,2) DEFAULT 0;
  END IF;
END $$;