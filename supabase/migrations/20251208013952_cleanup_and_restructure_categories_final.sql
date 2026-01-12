/*
  # Cleanup and Restructure Categories - Final Version
  
  ## Overview
  Removes duplicate categories and restructures with final English names.
  
  ## Changes
  - Remove duplicate categories
  - Keep only one of each category type with proper names
  - Reassign all products correctly
*/

-- Clear all product-category assignments first
DELETE FROM product_categories;

-- Delete duplicate/unused categories
DELETE FROM categories WHERE slug IN (
  'glp1-incretin-modulators',
  'glp1-metabolic',
  'growth-factors',
  'hgh-amplifiers-ghrp-ghrh',
  'metabolic-activators-fat-loss',
  'mitochondrial-support',
  'nootropics-mood',
  'sleep-support'
);

-- Update remaining categories with final names
UPDATE categories SET 
  name = 'HGH Precursors',
  name_en = 'HGH Precursors',
  description = 'Growth hormone precursors and secretagogues for pituitary research'
WHERE slug = 'hgh-precursors-secretagogues';

UPDATE categories SET 
  name = 'Growth Factors',
  name_en = 'Growth Factors',
  description = 'IGF-1 variants and growth factor research peptides'
WHERE slug = 'growth-factors-hyperplasia';

UPDATE categories SET 
  name = 'Metabolic Activators',
  name_en = 'Metabolic Activators',
  description = 'Fat-burning, metabolic optimization and GLP-1 research peptides'
WHERE slug = 'metabolic-fat-burning';

UPDATE categories SET 
  name = 'Nootropics',
  name_en = 'Nootropics',
  description = 'Cognitive enhancement and neuroprotection research peptides'
WHERE slug = 'nootropics-cognitive';

UPDATE categories SET 
  name = 'Sleep Regulation',
  name_en = 'Sleep Regulation',
  description = 'Sleep architecture and circadian rhythm research peptides'
WHERE slug = 'sleep-modulation';

UPDATE categories SET 
  name = 'Recovery / Injury',
  name_en = 'Recovery / Injury',
  description = 'Tissue repair and injury recovery research peptides'
WHERE slug = 'recovery-injury';

UPDATE categories SET 
  name = 'Anti-Aging / Longevity',
  name_en = 'Anti-Aging / Longevity',
  description = 'Telomere and longevity research peptides'
WHERE slug = 'anti-aging-longevity';

UPDATE categories SET 
  name = 'Libido & Sexual Response',
  name_en = 'Libido & Sexual Response',
  description = 'Sexual function and hormone research peptides'
WHERE slug = 'libido-sexual-function';

UPDATE categories SET 
  name = 'Tanning',
  name_en = 'Tanning',
  description = 'Melanin and pigmentation research peptides'
WHERE slug = 'tanning-pigmentation';

UPDATE categories SET 
  name = 'Cosmetic / Dermal Regeneration',
  name_en = 'Cosmetic / Dermal Regeneration',
  description = 'Skin health and dermal regeneration research peptides'
WHERE slug = 'aesthetic-skin-hair';

-- Helper function
CREATE OR REPLACE FUNCTION assign_product_cat(product_slug TEXT, category_slug TEXT)
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

-- HGH Precursors
SELECT assign_product_cat('cjc-1295', 'hgh-precursors-secretagogues');
SELECT assign_product_cat('ghrp-2', 'hgh-precursors-secretagogues');
SELECT assign_product_cat('ghrp-4', 'hgh-precursors-secretagogues');
SELECT assign_product_cat('ghrp-6', 'hgh-precursors-secretagogues');
SELECT assign_product_cat('hexarelin', 'hgh-precursors-secretagogues');
SELECT assign_product_cat('ipamorelin', 'hgh-precursors-secretagogues');
SELECT assign_product_cat('tesamorelin', 'hgh-precursors-secretagogues');
SELECT assign_product_cat('mots-c', 'hgh-precursors-secretagogues');
SELECT assign_product_cat('tb-500', 'hgh-precursors-secretagogues');

-- Growth Factors
SELECT assign_product_cat('peg-mgf', 'growth-factors-hyperplasia');
SELECT assign_product_cat('igf-1-lr3', 'growth-factors-hyperplasia');
SELECT assign_product_cat('igf-1-des', 'growth-factors-hyperplasia');

-- Metabolic Activators
SELECT assign_product_cat('slu-pp-332', 'metabolic-fat-burning');
SELECT assign_product_cat('hgh-frag-176-191', 'metabolic-fat-burning');
SELECT assign_product_cat('semaglutide', 'metabolic-fat-burning');
SELECT assign_product_cat('tirzepatide', 'metabolic-fat-burning');

-- Tanning
SELECT assign_product_cat('melanotan-2', 'tanning-pigmentation');

-- Nootropics
SELECT assign_product_cat('oxytocin', 'nootropics-cognitive');
SELECT assign_product_cat('selank', 'nootropics-cognitive');
SELECT assign_product_cat('semax', 'nootropics-cognitive');

-- Sleep Regulation
SELECT assign_product_cat('dsip', 'sleep-modulation');

-- Recovery / Injury
SELECT assign_product_cat('bpc-157', 'recovery-injury');
SELECT assign_product_cat('tb-500', 'recovery-injury');

-- Anti-Aging / Longevity
SELECT assign_product_cat('epitalon', 'anti-aging-longevity');

-- Libido & Sexual Response
SELECT assign_product_cat('pt-141', 'libido-sexual-function');
SELECT assign_product_cat('hcg-5000-iu', 'libido-sexual-function');

-- Cosmetic / Dermal Regeneration
SELECT assign_product_cat('ghk-cu', 'aesthetic-skin-hair');

-- Clean up
DROP FUNCTION IF EXISTS assign_product_cat;
