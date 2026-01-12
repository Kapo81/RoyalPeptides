/*
  # Set Exact Inventory Quantities
  
  1. Updates
    - Set specific stock quantities for available products
    - Set all other products to stock = 0 and out of stock
    - Ensure pricing is cost_price + $50
    - Update product status based on stock levels
  
  2. Product List with Stock
    - BPC-157: 1 unit, cost $40
    - CJC-1295: 33 units, cost $40
    - DSIP: 1 unit, cost $40
    - Follistatin 344: 1 unit, cost $60
    - GHRP-2: 7 units, cost $40
    - GHRP-6: 3 units, cost $40
    - HCG 5000 IU: 16 units, cost $40
    - Hexarelin: 3 units, cost $40
    - IGF-1 LR3: 10 units, cost $50
    - Melanotan II: 9 units, cost $40
    - PEG MGF: 4 units, cost $50
    - SLU-PP-332: 1 unit, cost $50 (bottle)
    - Semaglutide: 7 units, cost $40
    - TB-500: 1 unit, cost $40
    - Tesofensine: 1 unit, cost $40 (bottle)
*/

-- First, set all products to out of stock (default state)
UPDATE products
SET 
  qty_in_stock = 0,
  is_in_stock = false,
  total_sold = COALESCE(total_sold, 0)
WHERE TRUE;

-- Update specific products with current inventory
UPDATE products SET qty_in_stock = 1, cost_price = 40, selling_price = 90, is_in_stock = true WHERE name = 'BPC-157';
UPDATE products SET qty_in_stock = 33, cost_price = 40, selling_price = 90, is_in_stock = true WHERE name = 'CJC-1295';
UPDATE products SET qty_in_stock = 1, cost_price = 40, selling_price = 90, is_in_stock = true WHERE name = 'DSIP';
UPDATE products SET qty_in_stock = 1, cost_price = 60, selling_price = 110, is_in_stock = true WHERE name = 'Follistatin 344';
UPDATE products SET qty_in_stock = 7, cost_price = 40, selling_price = 90, is_in_stock = true WHERE name = 'GHRP-2';
UPDATE products SET qty_in_stock = 3, cost_price = 40, selling_price = 90, is_in_stock = true WHERE name = 'GHRP-6';
UPDATE products SET qty_in_stock = 16, cost_price = 40, selling_price = 90, is_in_stock = true WHERE name = 'HCG 5000 IU';
UPDATE products SET qty_in_stock = 3, cost_price = 40, selling_price = 90, is_in_stock = true WHERE name = 'Hexarelin';
UPDATE products SET qty_in_stock = 10, cost_price = 50, selling_price = 100, is_in_stock = true WHERE name = 'IGF-1 LR3';
UPDATE products SET qty_in_stock = 9, cost_price = 40, selling_price = 90, is_in_stock = true WHERE name = 'Melanotan II';
UPDATE products SET qty_in_stock = 4, cost_price = 50, selling_price = 100, is_in_stock = true WHERE name = 'PEG MGF';
UPDATE products SET qty_in_stock = 1, cost_price = 50, selling_price = 100, is_in_stock = true WHERE name = 'SLU-PP-332';
UPDATE products SET qty_in_stock = 7, cost_price = 40, selling_price = 90, is_in_stock = true WHERE name = 'Semaglutide';
UPDATE products SET qty_in_stock = 1, cost_price = 40, selling_price = 90, is_in_stock = true WHERE name = 'TB-500';
UPDATE products SET qty_in_stock = 1, cost_price = 40, selling_price = 90, is_in_stock = true WHERE name = 'Tesofensine';

-- Create or replace function to automatically update product stock status
CREATE OR REPLACE FUNCTION update_product_stock_status()
RETURNS trigger AS $$
BEGIN
  IF NEW.qty_in_stock > 0 THEN
    NEW.is_in_stock := true;
  ELSE
    NEW.is_in_stock := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update stock status when quantity changes
DROP TRIGGER IF EXISTS trigger_update_product_stock_status ON products;
CREATE TRIGGER trigger_update_product_stock_status
  BEFORE UPDATE OF qty_in_stock ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_product_stock_status();
