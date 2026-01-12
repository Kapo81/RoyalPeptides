/*
  # Update Core Peptide Pricing - December 2024

  This migration sets the official Canadian pricing for our core peptide products.
  All prices are in CAD and reflect the current market positioning.

  ## Price Updates (CAD)
  - CJC-1295: $69.99
  - GHRP-2: $69.99
  - Hexarelin: $69.99
  - IGF-1 LR3: $89.99
  - TB-500: $69.99
  - IGF-1 DES: $89.99

  ## Notes
  - These prices will display consistently across all pages (catalogue, product detail, cart, checkout, admin)
  - The application uses `price_cad` as the primary price field for Canadian customers
  - Bundle pricing and discount calculations use these base prices
*/

-- Update core peptide prices to official December 2024 pricing
-- Update BOTH selling_price and price_cad to ensure consistency across all pages
UPDATE products
SET
  selling_price = 69.99,
  price_cad = 69.99
WHERE slug IN ('cjc-1295', 'ghrp-2', 'hexarelin', 'tb-500');

UPDATE products
SET
  selling_price = 89.99,
  price_cad = 89.99
WHERE slug IN ('igf-1-lr3', 'igf-1-des');

-- Verify the updates
DO $$
DECLARE
  product_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO product_count
  FROM products
  WHERE slug IN ('cjc-1295', 'ghrp-2', 'hexarelin', 'igf-1-lr3', 'tb-500', 'igf-1-des');
  
  IF product_count = 6 THEN
    RAISE NOTICE 'Successfully verified all 6 core peptide products';
  ELSE
    RAISE WARNING 'Expected 6 products but found %', product_count;
  END IF;
END $$;
