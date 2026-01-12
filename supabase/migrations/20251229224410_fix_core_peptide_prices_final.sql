/*
  # Fix Core Peptide Pricing - Final Update
  
  This migration corrects the pricing for 6 core peptide products by updating
  BOTH selling_price and price_cad fields to ensure consistency across the entire application.
  
  ## Price Updates (CAD)
  - CJC-1295: $69.99
  - GHRP-2: $69.99
  - Hexarelin: $69.99
  - IGF-1 LR3: $89.99
  - TB-500: $69.99
  - IGF-1 DES (1-3): $89.99
  
  ## Technical Details
  - Updates both `selling_price` AND `price_cad` fields
  - Uses slug matching for precise product targeting
  - Frontend displays either field depending on page, so both must match
  - This overrides all previous pricing migrations for these 6 products
*/

-- Update the 4 products priced at $69.99
UPDATE products
SET
  selling_price = 69.99,
  price_cad = 69.99
WHERE slug IN ('cjc-1295', 'ghrp-2', 'hexarelin', 'tb-500');

-- Update the 2 premium products priced at $89.99
UPDATE products
SET
  selling_price = 89.99,
  price_cad = 89.99
WHERE slug IN ('igf-1-lr3', 'igf-1-des');

-- Verify the updates were successful
DO $$
DECLARE
  updated_count INTEGER;
  product_rec RECORD;
BEGIN
  -- Count how many products were found and should be updated
  SELECT COUNT(*) INTO updated_count
  FROM products
  WHERE slug IN ('cjc-1295', 'ghrp-2', 'hexarelin', 'igf-1-lr3', 'tb-500', 'igf-1-des');
  
  IF updated_count = 6 THEN
    RAISE NOTICE '✓ Successfully updated all 6 core peptide products';
    
    -- Show the updated prices for confirmation
    FOR product_rec IN 
      SELECT name, slug, selling_price, price_cad
      FROM products
      WHERE slug IN ('cjc-1295', 'ghrp-2', 'hexarelin', 'igf-1-lr3', 'tb-500', 'igf-1-des')
      ORDER BY name
    LOOP
      RAISE NOTICE '  - % (%): selling_price=$%, price_cad=$%', 
        product_rec.name, product_rec.slug, product_rec.selling_price, product_rec.price_cad;
    END LOOP;
  ELSE
    RAISE WARNING '⚠ Expected 6 products but found %. Check product slugs.', updated_count;
  END IF;
END $$;
