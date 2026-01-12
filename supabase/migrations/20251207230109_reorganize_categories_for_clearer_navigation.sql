/*
  # Reorganize Categories for Clearer User Navigation

  ## Overview
  This migration restructures the product catalog with simplified, user-friendly category names
  and reassigns all products to the new structure.

  ## New Category Structure (7 Categories)
  1. Growth Factors - IGF-1 LR3, PEG-MGF, MGF
  2. HGH Amplifiers - CJC-1295, Tesamorelin
  3. Recovery / Injury Repair - BPC-157, TB-500, GHK-Cu, SLU-PP-332
  4. Tanning & GLP-1 Modulators - Melanotan II, Semaglutide, Tirzepatide
  5. Sleep Management - DSIP, Epitalon
  6. Nootropics & Mood - Oxytocin, MOTS-C (moved here for cognitive benefits)
  7. Aesthetic Regeneration - GHK-Cu Cosmetic, Frag 176-191 (moved here)

  ## Changes Made
  - Simplified category names for better user understanding
  - Consolidated "Metabolic / Mitochondria Boosters" into other categories
  - Moved MOTS-C to Nootropics & Mood (cognitive/metabolic benefits)
  - Moved Frag 176-191 to Aesthetic Regeneration (body composition)
  - Removed "Fat Loss Modulators" as separate category
  - Updated category descriptions for clarity
*/

-- Clear existing category assignments
TRUNCATE TABLE product_categories CASCADE;
TRUNCATE TABLE categories CASCADE;

-- Insert new simplified categories
INSERT INTO categories (name, name_en, slug, description) VALUES
  ('Facteurs de Croissance', 'Growth Factors', 'growth-factors', 'Peptides promoting hyperplasia and muscle cell growth through IGF pathways'),
  ('Amplificateurs HGH', 'HGH Amplifiers', 'hgh-amplifiers', 'Growth hormone releasing peptides that stimulate natural GH production'),
  ('Récupération / Réparation des Blessures', 'Recovery / Injury Repair', 'recovery-injury-repair', 'Therapeutic peptides for tissue healing, injury recovery, and performance enhancement'),
  ('Bronzage et Modulateurs GLP-1', 'Tanning & GLP-1 Modulators', 'tanning-glp1-modulators', 'Tanning agents and metabolic compounds for weight management and body composition'),
  ('Gestion du Sommeil', 'Sleep Management', 'sleep-management', 'Peptides promoting deep sleep and regulating circadian rhythm'),
  ('Nootropiques et Humeur', 'Nootropics & Mood', 'nootropics-mood', 'Cognitive enhancement, mood regulation, and metabolic optimization peptides'),
  ('Régénération Esthétique', 'Aesthetic Regeneration', 'aesthetic-regeneration', 'Cosmetic regeneration peptides for skin, hair, anti-aging, and body composition');

-- Reassign all products to new categories
DO $$
DECLARE
  v_product_id uuid;
  v_category_id uuid;
BEGIN
  -- Growth Factors
  SELECT id INTO v_category_id FROM categories WHERE slug = 'growth-factors';
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

  -- Tanning & GLP-1 Modulators
  SELECT id INTO v_category_id FROM categories WHERE slug = 'tanning-glp1-modulators';
  SELECT id INTO v_product_id FROM products WHERE slug = 'melanotan-2';
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);
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

  -- Nootropics & Mood (including MOTS-C for cognitive/metabolic benefits)
  SELECT id INTO v_category_id FROM categories WHERE slug = 'nootropics-mood';
  SELECT id INTO v_product_id FROM products WHERE slug = 'oxytocin';
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);
  SELECT id INTO v_product_id FROM products WHERE slug = 'mots-c';
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);

  -- Aesthetic Regeneration (including Frag 176-191 for body composition)
  SELECT id INTO v_category_id FROM categories WHERE slug = 'aesthetic-regeneration';
  SELECT id INTO v_product_id FROM products WHERE slug = 'ghk-cu-cosmetic';
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);
  SELECT id INTO v_product_id FROM products WHERE slug = 'frag-176-191';
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);

END $$;
