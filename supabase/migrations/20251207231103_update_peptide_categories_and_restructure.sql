/*
  # Update Peptide Categories for Clearer Navigation

  ## Overview
  This migration updates specific peptide categorizations and creates a simplified structure:
  - Melanotan 2: Tanning only (separate from GLP-1)
  - GHK-Cu: Added to Aesthetic Regeneration
  - Frag 176-191: Fat Burner / Metabolic Activator
  - MOTS-C: Mitochondrial Optimizer (not nootropic)
  - IGF-1 LR3: Added Recovery benefits

  ## New Category Structure (8 Categories)
  1. Growth Factors & Recovery - IGF-1 LR3, PEG-MGF, MGF
  2. HGH Amplifiers - CJC-1295, Tesamorelin
  3. Recovery / Injury Repair - BPC-157, TB-500, GHK-Cu, SLU-PP-332
  4. Tanning - Melanotan II
  5. GLP-1 Modulators - Semaglutide, Tirzepatide
  6. Sleep Management - DSIP, Epitalon
  7. Mitochondrial Optimizers - MOTS-C
  8. Aesthetic Regeneration - GHK-Cu Cosmetic, Frag 176-191

  ## Changes Made
  - Separated Tanning from GLP-1 Modulators
  - Moved MOTS-C to dedicated Mitochondrial category
  - Updated IGF-1 LR3 description to include recovery
  - Clarified Frag 176-191 as fat burner/metabolic activator
*/

-- Clear existing category assignments
TRUNCATE TABLE product_categories CASCADE;
TRUNCATE TABLE categories CASCADE;

-- Insert refined categories
INSERT INTO categories (name, name_en, slug, description) VALUES
  ('Facteurs de Croissance et Récupération', 'Growth Factors & Recovery', 'growth-factors-recovery', 'Peptides promoting muscle growth, hyperplasia, and accelerated recovery'),
  ('Amplificateurs HGH', 'HGH Amplifiers', 'hgh-amplifiers', 'Growth hormone releasing peptides that stimulate natural GH production'),
  ('Récupération / Réparation des Blessures', 'Recovery / Injury Repair', 'recovery-injury-repair', 'Therapeutic peptides for tissue healing, injury recovery, and performance enhancement'),
  ('Bronzage', 'Tanning', 'tanning', 'Melanin production and natural tanning agents'),
  ('Modulateurs GLP-1', 'GLP-1 Modulators', 'glp1-modulators', 'Appetite control and metabolic regulation for weight management'),
  ('Gestion du Sommeil', 'Sleep Management', 'sleep-management', 'Peptides promoting deep sleep and regulating circadian rhythm'),
  ('Optimisateurs Mitochondriaux', 'Mitochondrial Optimizers', 'mitochondrial-optimizers', 'Mitochondrial function enhancement and cellular energy optimization'),
  ('Régénération Esthétique', 'Aesthetic Regeneration', 'aesthetic-regeneration', 'Cosmetic regeneration, skin rejuvenation, and metabolic fat burning');

-- Update IGF-1 LR3 to include recovery benefits
UPDATE products 
SET description = 'IGF-1 LR3 (Insulin-like Growth Factor 1 Long R3) is a modified version of IGF-1 with enhanced stability and longer half-life. Research shows it promotes hyperplasia (new muscle cell formation), supports muscle protein synthesis, and accelerates recovery. Benefits: Enhanced muscle cell proliferation • Improved nitrogen retention • Accelerated recovery and tissue repair • Increased nutrient partitioning for lean mass'
WHERE slug = 'igf-1-lr3';

-- Update Frag 176-191 description to emphasize fat burning
UPDATE products
SET description = 'Frag 176-191 is a modified fragment of human growth hormone specifically designed as a fat burner and metabolic activator. It selectively targets adipose tissue without affecting blood sugar levels. Benefits: Selective fat burning without blood sugar impact • Enhanced lipolysis in adipose tissue • Improved body composition and definition • Metabolic activation without insulin sensitivity issues'
WHERE slug = 'frag-176-191';

-- Update MOTS-C description to focus on mitochondrial optimization
UPDATE products
SET description = 'MOTS-C is a mitochondrial-derived peptide that functions as a powerful mitochondrial optimizer, enhancing cellular energy production and metabolic efficiency. Benefits: Improved insulin sensitivity and glucose metabolism • Enhanced mitochondrial function and cellular energy • Increased endurance and physical performance capacity • Metabolic age reversal and longevity effects'
WHERE slug = 'mots-c';

-- Reassign all products to new categories
DO $$
DECLARE
  v_product_id uuid;
  v_category_id uuid;
BEGIN
  -- Growth Factors & Recovery
  SELECT id INTO v_category_id FROM categories WHERE slug = 'growth-factors-recovery';
  SELECT id INTO v_product_id FROM products WHERE slug = 'igf-1-lr3';
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);
  SELECT id INTO v_product_id FROM products WHERE slug = 'peg-mgf';
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);
  SELECT id INTO v_product_id FROM products WHERE slug = 'mgf';
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);

  -- HGH Amplifiers
  SELECT id INTO v_category_id FROM categories WHERE slug = 'hgh-amplifiers';
  SELECT id INTO v_product_id FROM products WHERE slug = 'cjc-1295';
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);
  SELECT id INTO v_product_id FROM products WHERE slug = 'tesamorelin';
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);

  -- Recovery / Injury Repair
  SELECT id INTO v_category_id FROM categories WHERE slug = 'recovery-injury-repair';
  SELECT id INTO v_product_id FROM products WHERE slug = 'bpc-157';
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);
  SELECT id INTO v_product_id FROM products WHERE slug = 'tb-500';
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);
  SELECT id INTO v_product_id FROM products WHERE slug = 'ghk-cu';
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);
  SELECT id INTO v_product_id FROM products WHERE slug = 'slu-pp-332';
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);

  -- Tanning (Melanotan II only)
  SELECT id INTO v_category_id FROM categories WHERE slug = 'tanning';
  SELECT id INTO v_product_id FROM products WHERE slug = 'melanotan-2';
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);

  -- GLP-1 Modulators
  SELECT id INTO v_category_id FROM categories WHERE slug = 'glp1-modulators';
  SELECT id INTO v_product_id FROM products WHERE slug = 'semaglutide';
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);
  SELECT id INTO v_product_id FROM products WHERE slug = 'tirzepatide';
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);

  -- Sleep Management
  SELECT id INTO v_category_id FROM categories WHERE slug = 'sleep-management';
  SELECT id INTO v_product_id FROM products WHERE slug = 'dsip';
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);
  SELECT id INTO v_product_id FROM products WHERE slug = 'epitalon';
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);

  -- Mitochondrial Optimizers (MOTS-C only)
  SELECT id INTO v_category_id FROM categories WHERE slug = 'mitochondrial-optimizers';
  SELECT id INTO v_product_id FROM products WHERE slug = 'mots-c';
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);

  -- Aesthetic Regeneration (GHK-Cu Cosmetic and Frag 176-191)
  SELECT id INTO v_category_id FROM categories WHERE slug = 'aesthetic-regeneration';
  SELECT id INTO v_product_id FROM products WHERE slug = 'ghk-cu-cosmetic';
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);
  SELECT id INTO v_product_id FROM products WHERE slug = 'frag-176-191';
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);
  
  -- Note: Oxytocin has been removed from the catalog as per the new structure

END $$;

-- Update benefits summaries to match new categorizations
UPDATE products SET benefits_summary = '• Enhanced muscle cell proliferation and hyperplasia
• Improved nitrogen retention and protein synthesis
• Accelerated recovery and tissue repair
• Increased nutrient partitioning for lean mass development'
WHERE slug = 'igf-1-lr3';

UPDATE products SET benefits_summary = '• Selective fat burning without blood sugar impact
• Enhanced lipolysis in adipose tissue
• Improved body composition and definition
• Metabolic activation without insulin sensitivity issues'
WHERE slug = 'frag-176-191';

UPDATE products SET benefits_summary = '• Improved insulin sensitivity and glucose metabolism
• Enhanced mitochondrial function and cellular energy production
• Increased endurance and physical performance capacity
• Metabolic age reversal and longevity effects'
WHERE slug = 'mots-c';
