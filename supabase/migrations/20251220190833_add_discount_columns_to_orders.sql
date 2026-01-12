/*
  # Add Discount Columns to Orders Table

  1. Changes
    - Add `discount_amount` column to store the dollar amount of discount applied
    - Add `discount_percentage` column to store the percentage of discount (10 or 15)
    - Both columns are optional (nullable) to support orders without discounts

  2. Notes
    - Existing orders will have NULL values for these columns
    - New orders will populate these based on cart subtotal thresholds
    - Discount is calculated before shipping
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'discount_amount'
  ) THEN
    ALTER TABLE orders ADD COLUMN discount_amount decimal(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'discount_percentage'
  ) THEN
    ALTER TABLE orders ADD COLUMN discount_percentage integer DEFAULT 0;
  END IF;
END $$;
