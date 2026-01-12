/*
  # Update Category Structure and Product Assignments
  
  ## Overview
  Reorganizes categories for improved navigation and SEO, assigns all products
  to their correct categories based on research focus.
  
  ## Changes
  
  ### 1. Category Updates
  - Rename and reorganize existing categories
  - Add new categories where needed
  - Update category descriptions for clarity
  
  ### 2. Product Category Assignments
  - Clear all existing assignments
  - Reassign products to correct categories
  - Support multiple categories per product where appropriate
  
  ### 3. Category Structure
  - HGH Precursors / Secretagogues
  - Growth Factors & Hyperplasia
  - Nootropics / Cognitive Modulators
  - Sleep Modulation
  - Recovery / Injury Support
  - Libido & Sexual Function
  - Tanning / Pigmentation
  - Aesthetic / Skin
  - Metabolic Activators / Fat-Burning
  - GLP-1 Modulators / Metabolic Peptides
  - Anti-Aging / Longevity
*/

-- Create/Update categories
INSERT INTO categories (id, name, name_en, slug, description, created_at)
VALUES 
  (gen_random_uuid(), 'HGH Precursors / Secretagogues', 'HGH Precursors / Secretagogues', 'hgh-precursors-secretagogues', 
   'Peptides researched for growth hormone secretion and pituitary stimulation', now()),
  (gen_random_uuid(), 'Growth Factors & Hyperplasia', 'Growth Factors & Hyperplasia', 'growth-factors-hyperplasia', 
   'Peptides researched for anabolic signaling, hyperplasia and tissue growth pathways', now()),
  (gen_random_uuid(), 'Nootropics / Cognitive Modulators', 'Nootropics / Cognitive Modulators', 'nootropics-cognitive', 
   'Peptides researched for cognitive enhancement, focus and neuroprotection', now()),
  (gen_random_uuid(), 'Sleep Modulation', 'Sleep Modulation', 'sleep-modulation', 
   'Peptides researched for sleep architecture and circadian rhythm regulation', now()),
  (gen_random_uuid(), 'Metabolic Activators / Fat-Burning', 'Metabolic Activators / Fat-Burning', 'metabolic-fat-burning', 
   'Peptides researched for lipolysis, energy expenditure and body composition', now()),
  (gen_random_uuid(), 'GLP-1 Modulators / Metabolic Peptides', 'GLP-1 Modulators / Metabolic Peptides', 'glp1-metabolic', 
   'Peptides researched for incretin pathways, appetite control and glucose regulation', now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  name_en = EXCLUDED.name_en,
  description = EXCLUDED.description;

-- Clear existing product_categories assignments to rebuild cleanly
DELETE FROM product_categories;

-- Helper function to assign products to categories
CREATE OR REPLACE FUNCTION assign_product_to_category(product_slug TEXT, category_slug TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO product_categories (product_id, category_id)
  SELECT p.id, c.id
  FROM products p
  CROSS JOIN categories c
  WHERE p.slug = product_slug AND c.slug = category_slug
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- HGH Precursors / Secretagogues
SELECT assign_product_to_category('cjc-1295', 'hgh-precursors-secretagogues');
SELECT assign_product_to_category('tesamorelin', 'hgh-precursors-secretagogues');
SELECT assign_product_to_category('ipamorelin', 'hgh-precursors-secretagogues');
SELECT assign_product_to_category('mots-c', 'hgh-precursors-secretagogues');
SELECT assign_product_to_category('ghrp-2', 'hgh-precursors-secretagogues');
SELECT assign_product_to_category('ghrp-4', 'hgh-precursors-secretagogues');
SELECT assign_product_to_category('ghrp-6', 'hgh-precursors-secretagogues');
SELECT assign_product_to_category('hexarelin', 'hgh-precursors-secretagogues');

-- Growth Factors & Hyperplasia
SELECT assign_product_to_category('igf-1-lr3', 'growth-factors-hyperplasia');
SELECT assign_product_to_category('igf-1-des', 'growth-factors-hyperplasia');
SELECT assign_product_to_category('peg-mgf', 'growth-factors-hyperplasia');

-- Nootropics / Cognitive Modulators
SELECT assign_product_to_category('selank', 'nootropics-cognitive');
SELECT assign_product_to_category('semax', 'nootropics-cognitive');
SELECT assign_product_to_category('oxytocin', 'nootropics-cognitive');

-- Sleep Modulation
SELECT assign_product_to_category('dsip', 'sleep-modulation');

-- Recovery / Injury Support
SELECT assign_product_to_category('bpc-157', 'recovery-injury');
SELECT assign_product_to_category('tb-500', 'recovery-injury');
SELECT assign_product_to_category('peg-mgf', 'recovery-injury');

-- Libido & Sexual Function
SELECT assign_product_to_category('pt-141', 'libido-sexual-function');
SELECT assign_product_to_category('hcg-5000-iu', 'libido-sexual-function');

-- Tanning / Pigmentation
SELECT assign_product_to_category('melanotan-2', 'tanning-pigmentation');

-- Aesthetic / Skin
SELECT assign_product_to_category('ghk-cu', 'aesthetic-skin-hair');

-- Metabolic Activators / Fat-Burning
SELECT assign_product_to_category('slu-pp-332', 'metabolic-fat-burning');
SELECT assign_product_to_category('hgh-frag-176-191', 'metabolic-fat-burning');

-- GLP-1 Modulators / Metabolic Peptides
SELECT assign_product_to_category('semaglutide', 'glp1-metabolic');
SELECT assign_product_to_category('tirzepatide', 'glp1-metabolic');

-- Anti-Aging / Longevity
SELECT assign_product_to_category('epitalon', 'anti-aging-longevity');

-- Clean up helper function
DROP FUNCTION IF EXISTS assign_product_to_category;
