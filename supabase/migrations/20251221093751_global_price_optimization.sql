/*
  # Global Price Optimization - Conversion Balance

  1. Price Adjustments
    - Reduce all peptide prices by $10
    - Exception: IGF-1 DES and IGF-1 LR3 remain unchanged
    - Special rule: Any peptide priced above $100 set to $69.99 (except IGF-1 DES/LR3)
    - All prices formatted to .99 ending for psychological pricing

  2. Bundle Adjustments
    - "Cognitive Performance & Mood Stack" reduced to $189.99 (was $229.99)
    - All other bundles remain at current pricing (still provide good value)

  3. Products Capped at $69.99
    - MOTS-C (was $124.99)
    - Retatrutide (was $150.00)
    - Tesamorelin (was $119.99)
    - Tirzepatide (was $299.99)

  4. Unchanged Premium Items
    - IGF-1 DES: $119.99
    - IGF-1 LR3: $100.00

  Result: Competitive, impulse-friendly pricing maintaining premium positioning for specialty items
*/

-- Update all products with $10 reduction, formatted to .99
UPDATE products SET selling_price = 79.99, price_cad = 79.99 WHERE name = 'BPC-157';
UPDATE products SET selling_price = 79.99, price_cad = 79.99 WHERE name = 'CJC-1295';
UPDATE products SET selling_price = 79.99, price_cad = 79.99 WHERE name = 'DSIP';
UPDATE products SET selling_price = 79.99, price_cad = 79.99 WHERE name = 'Epitalon';
UPDATE products SET selling_price = 89.99, price_cad = 89.99 WHERE name = 'GHK-Cu';
UPDATE products SET selling_price = 79.99, price_cad = 79.99 WHERE name = 'GHRP-2';
UPDATE products SET selling_price = 79.99, price_cad = 79.99 WHERE name = 'GHRP-6';
UPDATE products SET selling_price = 79.99, price_cad = 79.99 WHERE name = 'HCG 5000 IU';
UPDATE products SET selling_price = 79.99, price_cad = 79.99 WHERE name = 'Hexarelin';
UPDATE products SET selling_price = 84.99, price_cad = 84.99 WHERE name = 'HGH Frag 176-191';
-- IGF-1 DES remains unchanged at $119.99 (exception)
-- IGF-1 LR3 remains unchanged at $100.00 (exception)
UPDATE products SET selling_price = 69.99, price_cad = 69.99 WHERE name = 'Ipamorelin';
UPDATE products SET selling_price = 79.99, price_cad = 79.99 WHERE name = 'Melanotan II';
UPDATE products SET selling_price = 69.99, price_cad = 69.99 WHERE name = 'MOTS-C'; -- Capped at $69.99 (was >$100)
UPDATE products SET selling_price = 79.99, price_cad = 79.99 WHERE name = 'NAD+ (Nicotinamide Adenine Dinucleotide)';
UPDATE products SET selling_price = 59.99, price_cad = 59.99 WHERE name = 'Oxytocin';
UPDATE products SET selling_price = 89.99, price_cad = 89.99 WHERE name = 'PEG-MGF';
UPDATE products SET selling_price = 84.99, price_cad = 84.99 WHERE name = 'PT-141 (Bremelanotide)';
UPDATE products SET selling_price = 69.99, price_cad = 69.99 WHERE name = 'Retatrutide'; -- Capped at $69.99 (was >$100)
UPDATE products SET selling_price = 79.99, price_cad = 79.99 WHERE name = 'Selank';
UPDATE products SET selling_price = 79.99, price_cad = 79.99 WHERE name = 'Semaglutide';
UPDATE products SET selling_price = 79.99, price_cad = 79.99 WHERE name = 'Semax';
UPDATE products SET selling_price = 89.99, price_cad = 89.99 WHERE name = 'SLU-PP-332';
UPDATE products SET selling_price = 79.99, price_cad = 79.99 WHERE name = 'TB-500';
UPDATE products SET selling_price = 69.99, price_cad = 69.99 WHERE name = 'Tesamorelin'; -- Capped at $69.99 (was >$100)
UPDATE products SET selling_price = 69.99, price_cad = 69.99 WHERE name = 'Tirzepatide'; -- Capped at $69.99 (was >$100)

-- Adjust bundle pricing to maintain value proposition
UPDATE bundles SET fixed_price = 189.99 WHERE name = 'Cognitive Performance & Mood Stack';
