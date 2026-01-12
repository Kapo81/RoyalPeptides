/*
  # Add GHK-CU and Retatrutide Products (Out of Stock)

  1. New Categories
    - `Esthetic` - For cosmetic/aesthetic peptides
    - `GLP-1 Modulators` - For weight management and metabolic peptides

  2. New Products
    - **GHK-CU (100mg)**
      - Category: Esthetic
      - Status: OUT OF STOCK (qty_in_stock = 0)
      - Image: https://i.postimg.cc/TwK9G3rG/width-533.png
      - Form: vial
      - Pricing: cost_price $50, selling_price $100
    
    - **Retatrutide (10mg)**
      - Category: GLP-1 Modulators
      - Status: OUT OF STOCK (qty_in_stock = 0)
      - Image: https://i.postimg.cc/nrmphk3Q/BPC-157-(4).png
      - Form: vial
      - Pricing: cost_price $100, selling_price $150

  3. Behavior
    - Both products appear in public catalogue with "Out of Stock" badge
    - Out-of-stock products sorted last in category listings
    - Add to Cart disabled automatically
    - Admin can edit inventory quantities from admin panel
    - All changes persist across page refreshes

  4. Security
    - Products use existing RLS policies
    - Public can view, only authenticated users can modify
*/

-- Create Esthetic category
INSERT INTO categories (id, name, name_en, slug, description)
VALUES (
  gen_random_uuid(),
  'Esthetic',
  'Esthetic',
  'esthetic',
  'Cosmetic and aesthetic enhancement peptides for skin, hair, and appearance'
)
ON CONFLICT (slug) DO NOTHING;

-- Create GLP-1 Modulators category
INSERT INTO categories (id, name, name_en, slug, description)
VALUES (
  gen_random_uuid(),
  'GLP-1 Modulators',
  'GLP-1 Modulators',
  'glp-1-modulators',
  'Advanced weight management and metabolic peptides targeting GLP-1 receptors'
)
ON CONFLICT (slug) DO NOTHING;

-- Insert GHK-CU product (OUT OF STOCK)
INSERT INTO products (
  id,
  name,
  slug,
  description,
  dosage,
  form,
  cost_price,
  selling_price,
  qty_in_stock,
  qty_sold,
  is_in_stock,
  image_url
)
VALUES (
  gen_random_uuid(),
  'GHK-CU',
  'ghk-cu',
  'GHK-CU (Copper Peptide) is a naturally occurring copper complex known for its powerful regenerative and anti-aging properties. This peptide promotes collagen synthesis, enhances skin elasticity, improves wound healing, and supports hair follicle growth. Widely studied for its ability to restore youthful appearance and repair damaged tissue.',
  '100mg',
  'vial',
  50.00,
  100.00,
  0,
  0,
  false,
  'https://i.postimg.cc/TwK9G3rG/width-533.png'
)
ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  dosage = EXCLUDED.dosage,
  image_url = EXCLUDED.image_url,
  cost_price = EXCLUDED.cost_price,
  selling_price = EXCLUDED.selling_price,
  qty_in_stock = 0,
  is_in_stock = false;

-- Insert Retatrutide product (OUT OF STOCK)
INSERT INTO products (
  id,
  name,
  slug,
  description,
  dosage,
  form,
  cost_price,
  selling_price,
  qty_in_stock,
  qty_sold,
  is_in_stock,
  image_url
)
VALUES (
  gen_random_uuid(),
  'Retatrutide',
  'retatrutide',
  'Retatrutide is a cutting-edge triple agonist peptide targeting GIP, GLP-1, and glucagon receptors. This revolutionary compound demonstrates superior efficacy in weight management, metabolic optimization, and glucose regulation. Clinical studies show significant improvements in body composition and insulin sensitivity.',
  '10mg',
  'vial',
  100.00,
  150.00,
  0,
  0,
  false,
  'https://i.postimg.cc/nrmphk3Q/BPC-157-(4).png'
)
ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  dosage = EXCLUDED.dosage,
  image_url = EXCLUDED.image_url,
  cost_price = EXCLUDED.cost_price,
  selling_price = EXCLUDED.selling_price,
  qty_in_stock = 0,
  is_in_stock = false;

-- Link GHK-CU to Esthetic category
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM products p
CROSS JOIN categories c
WHERE p.slug = 'ghk-cu' AND c.slug = 'esthetic'
ON CONFLICT (product_id, category_id) DO NOTHING;

-- Link Retatrutide to GLP-1 Modulators category
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM products p
CROSS JOIN categories c
WHERE p.slug = 'retatrutide' AND c.slug = 'glp-1-modulators'
ON CONFLICT (product_id, category_id) DO NOTHING;