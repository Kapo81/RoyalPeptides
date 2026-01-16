/*
  # Add AOD-9604 5MG and Update 5 Amino 1 Mq Image

  1. Changes
    - Update image_url for 5 Amino 1 Mq product
    - Add new AOD-9604 5MG product with complete details
  
  2. New Product Details
    - AOD-9604 5MG (peptide for fat metabolism research)
    - Price: $89.98 CAD
    - Image: https://i.postimg.cc/nL1JpcGn/AOD.png
    - Stock: 10 units
    - Form: vial
*/

-- Update 5 Amino 1 Mq image
UPDATE products 
SET 
  image_url = 'https://i.postimg.cc/cLwWkcKM/5AMINO.png',
  image_detail_url = 'https://i.postimg.cc/cLwWkcKM/5AMINO.png',
  updated_at = now()
WHERE slug = '5-amino-1-mq';

-- Add AOD-9604 5MG product
INSERT INTO products (
  name,
  slug,
  description,
  purity,
  storage,
  price,
  price_cad,
  image_url,
  image_detail_url,
  featured,
  short_name,
  dosage,
  benefits_summary,
  qty_in_stock,
  low_stock_threshold,
  is_in_stock,
  cost_price,
  selling_price,
  form,
  is_active,
  created_at,
  updated_at
) VALUES (
  'AOD-9604',
  'aod-9604',
  'Modified fragment of human growth hormone (hGH 176-191) researched for lipolytic activity without affecting insulin sensitivity. Investigated for selective fat metabolism and body composition modulation.',
  '>98% research grade',
  'Store at -20°C. Protect from light.',
  99.99,
  89.98,
  'https://i.postimg.cc/nL1JpcGn/AOD.png',
  'https://i.postimg.cc/nL1JpcGn/AOD.png',
  false,
  'AOD-9604',
  '5 Mg',
  '• Researched for lipolytic activity
• Investigated for fat metabolism
• Studied without insulin effects
• Body composition research focus',
  10,
  5,
  true,
  40.00,
  89.98,
  'vial',
  true,
  now(),
  now()
) ON CONFLICT (slug) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  image_detail_url = EXCLUDED.image_detail_url,
  price_cad = EXCLUDED.price_cad,
  description = EXCLUDED.description,
  benefits_summary = EXCLUDED.benefits_summary,
  updated_at = now();
