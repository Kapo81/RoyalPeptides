/*
  # Update Inventory Quantities and Pricing
  
  Updates inventory levels and pricing for 15 specific products with current stock quantities.
  Cost prices are calculated as selling price minus $50 markup.
  
  ## Products Updated
  
  | Product | Quantity | Cost Price | Selling Price |
  |---------|----------|------------|---------------|
  | BPC-157 | 1 | $40 | $90 |
  | CJC-1295 | 33 | $40 | $90 |
  | DSIP | 1 | $40 | $90 |
  | Follistatin 344 | 1 | $60 | $110 |
  | GHRP-2 | 7 | $40 | $90 |
  | GHRP-6 | 3 | $40 | $90 |
  | HCG 5000IU | 16 | $40 | $90 |
  | Hexarelin | 3 | $40 | $90 |
  | IGF-1 LR3 | 10 | $50 | $100 |
  | Melanotan II | 9 | $40 | $90 |
  | PEG MGF | 4 | $50 | $100 |
  | SLU-PP-332 | 1 | $50 | $100 |
  | Semaglutide | 7 | $40 | $90 |
  | TB-500 | 1 | $40 | $90 |
  | Tesofensine | 1 | $40 | $90 |
  
  ## Notes
  - Stock levels are set to exact quantities provided
  - Products with 0 quantity will be marked as out of stock automatically
  - Prices include $50 markup on cost
*/

-- Update BPC-157
UPDATE products
SET 
  qty_in_stock = 1,
  cost_price = 40,
  selling_price = 90,
  price_cad = 90
WHERE name ILIKE '%BPC-157%' OR name ILIKE '%BPC 157%';

-- Update CJC-1295
UPDATE products
SET 
  qty_in_stock = 33,
  cost_price = 40,
  selling_price = 90,
  price_cad = 90
WHERE name ILIKE '%CJC-1295%' OR name ILIKE '%CJC 1295%';

-- Update DSIP
UPDATE products
SET 
  qty_in_stock = 1,
  cost_price = 40,
  selling_price = 90,
  price_cad = 90
WHERE name ILIKE '%DSIP%';

-- Update Follistatin 344
UPDATE products
SET 
  qty_in_stock = 1,
  cost_price = 60,
  selling_price = 110,
  price_cad = 110
WHERE name ILIKE '%Follistatin%344%' OR name ILIKE '%Follistatin-344%';

-- Update GHRP-2
UPDATE products
SET 
  qty_in_stock = 7,
  cost_price = 40,
  selling_price = 90,
  price_cad = 90
WHERE name ILIKE '%GHRP-2%' OR name ILIKE '%GHRP 2%';

-- Update GHRP-6
UPDATE products
SET 
  qty_in_stock = 3,
  cost_price = 40,
  selling_price = 90,
  price_cad = 90
WHERE name ILIKE '%GHRP-6%' OR name ILIKE '%GHRP 6%';

-- Update HCG 5000IU
UPDATE products
SET 
  qty_in_stock = 16,
  cost_price = 40,
  selling_price = 90,
  price_cad = 90
WHERE name ILIKE '%HCG%5000%' OR name ILIKE '%HCG 5000%';

-- Update Hexarelin
UPDATE products
SET 
  qty_in_stock = 3,
  cost_price = 40,
  selling_price = 90,
  price_cad = 90
WHERE name ILIKE '%Hexarelin%';

-- Update IGF-1 LR3
UPDATE products
SET 
  qty_in_stock = 10,
  cost_price = 50,
  selling_price = 100,
  price_cad = 100
WHERE name ILIKE '%IGF-1%LR3%' OR name ILIKE '%IGF 1%LR3%' OR name ILIKE '%IGF-1 LR3%';

-- Update Melanotan II
UPDATE products
SET 
  qty_in_stock = 9,
  cost_price = 40,
  selling_price = 90,
  price_cad = 90
WHERE name ILIKE '%Melanotan%II%' OR name ILIKE '%Melanotan 2%' OR name ILIKE '%MT-II%' OR name ILIKE '%MT2%';

-- Update PEG MGF
UPDATE products
SET 
  qty_in_stock = 4,
  cost_price = 50,
  selling_price = 100,
  price_cad = 100
WHERE name ILIKE '%PEG%MGF%' OR name ILIKE '%PEG-MGF%';

-- Update SLU-PP-332
UPDATE products
SET 
  qty_in_stock = 1,
  cost_price = 50,
  selling_price = 100,
  price_cad = 100
WHERE name ILIKE '%SLU-PP-332%' OR name ILIKE '%SLU PP 332%' OR name ILIKE '%SLUPP332%';

-- Update Semaglutide
UPDATE products
SET 
  qty_in_stock = 7,
  cost_price = 40,
  selling_price = 90,
  price_cad = 90
WHERE name ILIKE '%Semaglutide%';

-- Update TB-500
UPDATE products
SET 
  qty_in_stock = 1,
  cost_price = 40,
  selling_price = 90,
  price_cad = 90
WHERE name ILIKE '%TB-500%' OR name ILIKE '%TB 500%' OR name ILIKE '%TB500%';

-- Update Tesofensine
UPDATE products
SET 
  qty_in_stock = 1,
  cost_price = 40,
  selling_price = 90,
  price_cad = 90
WHERE name ILIKE '%Tesofensine%';

-- Set all other products not in the list to 0 stock
UPDATE products
SET qty_in_stock = 0
WHERE name NOT ILIKE '%BPC-157%'
  AND name NOT ILIKE '%BPC 157%'
  AND name NOT ILIKE '%CJC-1295%'
  AND name NOT ILIKE '%CJC 1295%'
  AND name NOT ILIKE '%DSIP%'
  AND name NOT ILIKE '%Follistatin%344%'
  AND name NOT ILIKE '%Follistatin-344%'
  AND name NOT ILIKE '%GHRP-2%'
  AND name NOT ILIKE '%GHRP 2%'
  AND name NOT ILIKE '%GHRP-6%'
  AND name NOT ILIKE '%GHRP 6%'
  AND name NOT ILIKE '%HCG%5000%'
  AND name NOT ILIKE '%HCG 5000%'
  AND name NOT ILIKE '%Hexarelin%'
  AND name NOT ILIKE '%IGF-1%LR3%'
  AND name NOT ILIKE '%IGF 1%LR3%'
  AND name NOT ILIKE '%IGF-1 LR3%'
  AND name NOT ILIKE '%Melanotan%II%'
  AND name NOT ILIKE '%Melanotan 2%'
  AND name NOT ILIKE '%MT-II%'
  AND name NOT ILIKE '%MT2%'
  AND name NOT ILIKE '%PEG%MGF%'
  AND name NOT ILIKE '%PEG-MGF%'
  AND name NOT ILIKE '%SLU-PP-332%'
  AND name NOT ILIKE '%SLU PP 332%'
  AND name NOT ILIKE '%SLUPP332%'
  AND name NOT ILIKE '%Semaglutide%'
  AND name NOT ILIKE '%TB-500%'
  AND name NOT ILIKE '%TB 500%'
  AND name NOT ILIKE '%TB500%'
  AND name NOT ILIKE '%Tesofensine%';
