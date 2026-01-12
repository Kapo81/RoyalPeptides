/*
  # Inventory Update: Remove GHRP-4 and Add NAD+
  
  1. Changes
    - Remove GHRP-4 product from catalogue
    - Remove all associated data (cart items, bundle products, categories)
    - Add NAD+ (Nicotinamide Adenine Dinucleotide) product
    - Assign NAD+ to appropriate categories
  
  2. Security
    - Maintains existing RLS policies
    - No permission changes required
*/

-- Remove GHRP-4 from all related tables
DELETE FROM cart_items WHERE product_id = 'c0ed3311-427c-41fc-9213-fe9ef44f07dc';
DELETE FROM bundle_products WHERE product_id = 'c0ed3311-427c-41fc-9213-fe9ef44f07dc';
DELETE FROM product_categories WHERE product_id = 'c0ed3311-427c-41fc-9213-fe9ef44f07dc';
DELETE FROM products WHERE id = 'c0ed3311-427c-41fc-9213-fe9ef44f07dc';

-- Add NAD+ product
INSERT INTO products (
  id,
  name,
  short_name,
  slug,
  description,
  benefits_summary,
  dosage,
  form,
  price_cad,
  cost_price,
  selling_price,
  image_url,
  qty_in_stock,
  low_stock_threshold,
  is_in_stock,
  featured
) VALUES (
  gen_random_uuid(),
  'NAD+ (Nicotinamide Adenine Dinucleotide)',
  'NAD+',
  'nad-plus',
  'High-purity NAD+ supplied strictly for laboratory and research applications. NAD+ is a naturally occurring coenzyme involved in cellular energy metabolism and redox reactions, widely studied in biochemical and cellular research models. Form: Lyophilized powder. Storage: Store refrigerated or frozen. Protect from light. Reconstitute only in sterile laboratory conditions. Compliance Notice: For research purposes only. Not for human or veterinary use.',
  'Cellular energy metabolism research, redox reaction studies, mitochondrial function analysis',
  '250mg',
  'Lyophilized Powder',
  89.99,
  35.00,
  89.99,
  'https://images.pexels.com/photos/3938023/pexels-photo-3938023.jpeg?auto=compress&cs=tinysrgb&w=400',
  50,
  10,
  true,
  true
);

-- Get the category IDs for NAD+ (Wellness & Longevity, Anti-Aging)
DO $$
DECLARE
  nad_product_id UUID;
  wellness_category_id UUID;
  antiaging_category_id UUID;
BEGIN
  -- Get NAD+ product ID
  SELECT id INTO nad_product_id FROM products WHERE slug = 'nad-plus';
  
  -- Get category IDs
  SELECT id INTO wellness_category_id FROM categories WHERE slug = 'wellness' LIMIT 1;
  SELECT id INTO antiaging_category_id FROM categories WHERE slug = 'anti-aging' LIMIT 1;
  
  -- Assign NAD+ to categories
  IF nad_product_id IS NOT NULL AND wellness_category_id IS NOT NULL THEN
    INSERT INTO product_categories (product_id, category_id)
    VALUES (nad_product_id, wellness_category_id);
  END IF;
  
  IF nad_product_id IS NOT NULL AND antiaging_category_id IS NOT NULL THEN
    INSERT INTO product_categories (product_id, category_id)
    VALUES (nad_product_id, antiaging_category_id);
  END IF;
END $$;
