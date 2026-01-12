/*
  # Set Inventory for Specified Products

  Updates the 15 specified products with:
  - cost_price
  - selling_price (cost_price + $50)
  - qty_in_stock
  - form (vial or bottle)
  - is_in_stock (auto-calculated)

  Product List:
  1. BPC-157 — vial — cost $40 → price $90 — stock: 1
  2. CJC-1295 — vial — cost $40 → price $90 — stock: 33
  3. DSIP — vial — cost $40 → price $90 — stock: 1
  4. Follistatin 344 — vial — cost $60 → price $110 — stock: 1
  5. GHRP-2 — vial — cost $40 → price $90 — stock: 7
  6. GHRP-6 — vial — cost $40 → price $90 — stock: 3
  7. HCG 5000 IU — vial — cost $40 → price $90 — stock: 16
  8. Hexarelin — vial — cost $40 → price $90 — stock: 3
  9. IGF-1 LR3 — vial — cost $50 → price $100 — stock: 10
  10. Melanotan II — vial — cost $40 → price $90 — stock: 9
  11. PEG MGF — vial — cost $50 → price $100 — stock: 4
  12. SLU-PP-332 — bottle — cost $50 → price $100 — stock: 1
  13. Semaglutide — vial — cost $40 → price $90 — stock: 7
  14. TB-500 — vial — cost $40 → price $90 — stock: 1
  15. Tesofensine — bottle — cost $40 → price $90 — stock: 1
*/

-- Set all existing products to out of stock by default
UPDATE products
SET 
  qty_in_stock = 0,
  is_in_stock = false,
  cost_price = COALESCE(cost_price, 40),
  selling_price = COALESCE(selling_price, 90),
  form = COALESCE(form, 'vial')
WHERE cost_price = 0 OR selling_price = 0;

-- BPC-157
UPDATE products
SET 
  cost_price = 40,
  selling_price = 90,
  qty_in_stock = 1,
  form = 'vial',
  is_in_stock = true,
  price_cad = 90,
  price = 90
WHERE name ILIKE '%BPC-157%' OR slug ILIKE '%bpc-157%';

-- CJC-1295
UPDATE products
SET 
  cost_price = 40,
  selling_price = 90,
  qty_in_stock = 33,
  form = 'vial',
  is_in_stock = true,
  price_cad = 90,
  price = 90
WHERE (name ILIKE '%CJC-1295%' OR slug ILIKE '%cjc-1295%') AND name NOT ILIKE '%DAC%';

-- DSIP
UPDATE products
SET 
  cost_price = 40,
  selling_price = 90,
  qty_in_stock = 1,
  form = 'vial',
  is_in_stock = true,
  price_cad = 90,
  price = 90
WHERE name ILIKE '%DSIP%' OR slug ILIKE '%dsip%';

-- Follistatin 344
UPDATE products
SET 
  cost_price = 60,
  selling_price = 110,
  qty_in_stock = 1,
  form = 'vial',
  is_in_stock = true,
  price_cad = 110,
  price = 110
WHERE name ILIKE '%Follistatin%' AND name ILIKE '%344%';

-- GHRP-2
UPDATE products
SET 
  cost_price = 40,
  selling_price = 90,
  qty_in_stock = 7,
  form = 'vial',
  is_in_stock = true,
  price_cad = 90,
  price = 90
WHERE name ILIKE '%GHRP-2%' OR slug ILIKE '%ghrp-2%';

-- GHRP-6
UPDATE products
SET 
  cost_price = 40,
  selling_price = 90,
  qty_in_stock = 3,
  form = 'vial',
  is_in_stock = true,
  price_cad = 90,
  price = 90
WHERE name ILIKE '%GHRP-6%' OR slug ILIKE '%ghrp-6%';

-- HCG 5000 IU
UPDATE products
SET 
  cost_price = 40,
  selling_price = 90,
  qty_in_stock = 16,
  form = 'vial',
  is_in_stock = true,
  price_cad = 90,
  price = 90
WHERE name ILIKE '%HCG%' OR slug ILIKE '%hcg%';

-- Hexarelin
UPDATE products
SET 
  cost_price = 40,
  selling_price = 90,
  qty_in_stock = 3,
  form = 'vial',
  is_in_stock = true,
  price_cad = 90,
  price = 90
WHERE name ILIKE '%Hexarelin%' OR slug ILIKE '%hexarelin%';

-- IGF-1 LR3
UPDATE products
SET 
  cost_price = 50,
  selling_price = 100,
  qty_in_stock = 10,
  form = 'vial',
  is_in_stock = true,
  price_cad = 100,
  price = 100
WHERE name ILIKE '%IGF%' AND (name ILIKE '%LR3%' OR name ILIKE '%LR-3%');

-- Melanotan II
UPDATE products
SET 
  cost_price = 40,
  selling_price = 90,
  qty_in_stock = 9,
  form = 'vial',
  is_in_stock = true,
  price_cad = 90,
  price = 90
WHERE name ILIKE '%Melanotan%' AND (name ILIKE '%II%' OR name ILIKE '%2%');

-- PEG MGF
UPDATE products
SET 
  cost_price = 50,
  selling_price = 100,
  qty_in_stock = 4,
  form = 'vial',
  is_in_stock = true,
  price_cad = 100,
  price = 100
WHERE name ILIKE '%PEG%' AND name ILIKE '%MGF%';

-- SLU-PP-332
UPDATE products
SET 
  cost_price = 50,
  selling_price = 100,
  qty_in_stock = 1,
  form = 'bottle',
  is_in_stock = true,
  price_cad = 100,
  price = 100
WHERE name ILIKE '%SLU-PP-332%' OR slug ILIKE '%slu-pp-332%';

-- Semaglutide
UPDATE products
SET 
  cost_price = 40,
  selling_price = 90,
  qty_in_stock = 7,
  form = 'vial',
  is_in_stock = true,
  price_cad = 90,
  price = 90
WHERE name ILIKE '%Semaglutide%' OR slug ILIKE '%semaglutide%';

-- TB-500
UPDATE products
SET 
  cost_price = 40,
  selling_price = 90,
  qty_in_stock = 1,
  form = 'vial',
  is_in_stock = true,
  price_cad = 90,
  price = 90
WHERE name ILIKE '%TB-500%' OR name ILIKE '%TB500%' OR slug ILIKE '%tb-500%';

-- Tesofensine
UPDATE products
SET 
  cost_price = 40,
  selling_price = 90,
  qty_in_stock = 1,
  form = 'bottle',
  is_in_stock = true,
  price_cad = 90,
  price = 90
WHERE name ILIKE '%Tesofensine%' OR slug ILIKE '%tesofensine%';
