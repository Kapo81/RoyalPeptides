/*
  # Update Order Number Format to Include CA

  1. Changes
    - Update the `generate_order_number()` function to include "CA" in the order number
    - New format: RP-CA-YYYYMMDD-XXXX (e.g., RP-CA-20250207-0174)
    - Old format: RP-YYYYMMDD-XXXX
    
  2. Notes
    - This creates a Canadian-specific order number format
    - The CA identifier distinguishes Canadian orders
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS generate_order_number();

-- Recreate the function with the new format
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  new_order_number text;
  done bool;
BEGIN
  done := false;
  WHILE NOT done LOOP
    new_order_number := 'RP-CA-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0');
    done := NOT EXISTS(SELECT 1 FROM orders WHERE order_number = new_order_number);
  END LOOP;
  RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;
