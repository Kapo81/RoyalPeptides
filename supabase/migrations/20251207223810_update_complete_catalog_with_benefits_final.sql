/*
  # Complete Product Catalog Update with Benefits & Correct Dosages

  ## Overview
  This migration updates the entire Royal Peptides catalog with:
  - Corrected dosage values for all products (IGF-1 LR3: 1mg, TB-500: 10mg, etc.)
  - Reorganized categories with proper naming
  - Enhanced product descriptions with bullet-point benefits
  - Removed incorrect "Myostatin Inhibitor" labels
  - Proper categorization using product_categories junction table

  ## New Categories (9 total)
  1. Growth Factors - IGF-1 LR3 (1mg), PEG-MGF (2mg), MGF (2mg)
  2. HGH Precursors / GH Amplifiers - CJC-1295 (5mg), Tesamorelin (2mg)
  3. Recovery / Injury / Performance Repair - BPC-157, TB-500 (10mg), GHK-Cu (100mg), SLU-PP-332 (5mg)
  4. Metabolic & Tanning Modulators - Melanotan II (10mg), Semaglutide, Tirzepatide
  5. Sleep / Circadian Reset - DSIP (2mg), Epitalon
  6. Metabolic / Mitochondria Boosters - MOTS-C (10mg)
  7. Peptide Aesthetics - GHK-Cu (100mg) Cosmetic
  8. Appetite / Mood & Nootropic - Oxytocin (10mg)
  9. Fat Loss Modulators - Frag 176-191 (5mg)

  ## Key Corrections
  - IGF-1 LR3: Now 1 mg (was incorrect before)
  - TB-500: Confirmed 10 mg
  - GHK-Cu: 100 mg with blue bottle image
  - Melanotan II: Moved to Tanning category (removed "Aesthetic")
  - DSIP: Moved to Sleep category
  - Oxytocin: Moved to Nootropic category
  - MOTS-C: Removed "Myostatin Inhibitor" label
  - Frag 176-191: Removed "Myostatin" label, kept Fat Loss only
*/

-- Clear existing data
TRUNCATE TABLE cart_items CASCADE;
TRUNCATE TABLE product_categories CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE categories CASCADE;

-- Insert updated categories with both English and French names
INSERT INTO categories (name, name_en, slug, description) VALUES
  ('Facteurs de Croissance', 'Growth Factors', 'growth-factors', 'Peptides promoting hyperplasia and muscle cell growth through IGF pathways'),
  ('Précurseurs HGH / Amplificateurs GH', 'HGH Precursors / GH Amplifiers', 'hgh-amplifiers', 'Growth hormone releasing peptides that stimulate natural GH production'),
  ('Récupération / Blessures / Réparation', 'Recovery / Injury / Performance Repair', 'recovery-repair', 'Therapeutic peptides for tissue healing, injury recovery, and performance enhancement'),
  ('Modulateurs Métaboliques et Bronzage', 'Metabolic & Tanning Modulators', 'metabolic-tanning', 'Compounds regulating metabolism, body composition, and melanin production'),
  ('Sommeil / Réinitialisation Circadienne', 'Sleep / Circadian Reset', 'sleep-circadian', 'Peptides promoting deep sleep and regulating circadian rhythm'),
  ('Stimulants Mitochondriaux', 'Metabolic / Mitochondria Boosters', 'mitochondrial-health', 'Peptides enhancing mitochondrial function and cellular energy production'),
  ('Esthétique Peptidique', 'Peptide Aesthetics', 'aesthetic-beauty', 'Cosmetic regeneration peptides for skin, hair, and anti-aging'),
  ('Appétit / Humeur & Nootropique', 'Appetite / Mood & Nootropic', 'nootropic-mood', 'Cognitive enhancement and mood-regulating peptides'),
  ('Modulateurs de Perte de Graisse', 'Fat Loss Modulators', 'fat-loss', 'Peptides targeting fat metabolism and body composition');

-- Insert products with enhanced descriptions
DO $$
DECLARE
  v_product_id uuid;
  v_category_id uuid;
BEGIN
  -- Growth Factors Category
  SELECT id INTO v_category_id FROM categories WHERE slug = 'growth-factors';
  
  INSERT INTO products (name, short_name, dosage, slug, description, price, image_url, purity, storage) 
  VALUES ('IGF-1 LR3', 'IGF-1 LR3', '1 mg', 'igf-1-lr3',
    'IGF-1 LR3 (Insulin-like Growth Factor 1 Long R3) is a modified version of IGF-1 with enhanced stability and longer half-life. Research shows it promotes hyperplasia (new muscle cell formation) and supports muscle protein synthesis. Benefits: Enhanced muscle cell proliferation • Improved nitrogen retention • Accelerated recovery • Increased nutrient partitioning for lean mass',
    89.99, NULL, '>98%', 'Store lyophilized at -20°C. After reconstitution, store at 2-8°C for up to 14 days.')
  RETURNING id INTO v_product_id;
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);
  
  INSERT INTO products (name, short_name, dosage, slug, description, price, image_url, purity, storage) 
  VALUES ('PEG-MGF', 'PEG-MGF', '2 mg', 'peg-mgf',
    'PEG-MGF (Pegylated Mechano Growth Factor) is a modified form of MGF with extended half-life. It activates muscle stem cells and promotes recovery. Benefits: Accelerated muscle repair • Enhanced satellite cell activation • Improved tissue regeneration • Synergistic effects with growth factors',
    94.99, NULL, '>98%', 'Store lyophilized at -20°C. After reconstitution, store at 2-8°C for up to 14 days.')
  RETURNING id INTO v_product_id;
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);
  
  INSERT INTO products (name, short_name, dosage, slug, description, price, image_url, purity, storage) 
  VALUES ('MGF', 'MGF', '2 mg', 'mgf',
    'MGF (Mechano Growth Factor) is a splice variant of IGF-1 crucial for muscle repair and growth. Benefits: Rapid muscle fiber repair • Satellite cell proliferation • Enhanced recovery post-exercise • Localized growth factor effects',
    84.99, NULL, '>98%', 'Store lyophilized at -20°C. After reconstitution, store at 2-8°C for up to 7 days.')
  RETURNING id INTO v_product_id;
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);

  -- HGH Amplifiers Category
  SELECT id INTO v_category_id FROM categories WHERE slug = 'hgh-amplifiers';
  
  INSERT INTO products (name, short_name, dosage, slug, description, price, image_url, purity, storage) 
  VALUES ('CJC-1295', 'CJC-1295', '5 mg', 'cjc-1295',
    'CJC-1295 is a GHRH analog that stimulates natural GH production. Benefits: Increased growth hormone levels • Improved body composition • Enhanced recovery and sleep quality • Synergistic effects with GHRP peptides',
    79.99, NULL, '>99%', 'Store lyophilized at -20°C. After reconstitution, store at 2-8°C for up to 30 days.')
  RETURNING id INTO v_product_id;
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);
  
  INSERT INTO products (name, short_name, dosage, slug, description, price, image_url, purity, storage) 
  VALUES ('Tesamorelin', 'Tesamorelin', '2 mg', 'tesamorelin',
    'Tesamorelin is a GHRH analog targeting visceral adipose tissue while promoting GH release. Benefits: Reduction in abdominal fat • Improved lipid profiles • Enhanced cognitive function • Natural GH secretion without desensitization',
    119.99, NULL, '>98%', 'Store lyophilized at -20°C. After reconstitution, store at 2-8°C for up to 14 days.')
  RETURNING id INTO v_product_id;
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);

  -- Recovery / Repair Category
  SELECT id INTO v_category_id FROM categories WHERE slug = 'recovery-repair';
  
  INSERT INTO products (name, short_name, dosage, slug, description, price, image_url, purity, storage) 
  VALUES ('BPC-157', 'BPC-157', '5 mg', 'bpc-157',
    'BPC-157 (Body Protection Compound) is derived from a protective protein in gastric juice. Research demonstrates powerful healing properties. Benefits: Accelerated tendon and ligament healing • Enhanced gut health and mucosal repair • Improved joint recovery • Systemic anti-inflammatory effects',
    74.99, NULL, '>99%', 'Store lyophilized at -20°C. After reconstitution, store at 2-8°C for up to 30 days.')
  RETURNING id INTO v_product_id;
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);
  
  INSERT INTO products (name, short_name, dosage, slug, description, price, image_url, purity, storage) 
  VALUES ('TB-500', 'TB-500', '10 mg', 'tb-500',
    'TB-500 (Thymosin Beta-4) is a naturally occurring peptide promoting cellular migration and tissue repair. Benefits: Enhanced wound healing and regeneration • Improved flexibility and reduced inflammation • Accelerated injury recovery • Cardiovascular protective effects',
    89.99, NULL, '>98%', 'Store lyophilized at -20°C. After reconstitution, store at 2-8°C for up to 30 days.')
  RETURNING id INTO v_product_id;
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);
  
  INSERT INTO products (name, short_name, dosage, slug, description, price, image_url, purity, storage) 
  VALUES ('GHK-Cu', 'GHK-Cu', '100 mg', 'ghk-cu',
    'GHK-Cu (Copper Peptide) is a naturally occurring copper complex with profound tissue remodeling properties. Benefits: Enhanced collagen and elastin production • Accelerated wound healing • Powerful antioxidant effects • Improved skin, hair, and tissue regeneration',
    99.99, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80', '>95%', 'Store lyophilized at -20°C. After reconstitution, store at 2-8°C for up to 21 days.')
  RETURNING id INTO v_product_id;
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);
  
  INSERT INTO products (name, short_name, dosage, slug, description, price, image_url, purity, storage) 
  VALUES ('SLU-PP-332', 'SLU-PP-332', '5 mg', 'slu-pp-332',
    'SLU-PP-332 is a novel ERRα agonist enhancing mitochondrial function and endurance capacity. Benefits: Increased oxidative capacity and endurance • Enhanced mitochondrial biogenesis • Improved metabolic efficiency • Potential neuroprotective effects',
    149.99, NULL, '>98%', 'Store lyophilized at -20°C. After reconstitution, store at 2-8°C for up to 14 days.')
  RETURNING id INTO v_product_id;
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);

  -- Metabolic & Tanning Category
  SELECT id INTO v_category_id FROM categories WHERE slug = 'metabolic-tanning';
  
  INSERT INTO products (name, short_name, dosage, slug, description, price, image_url, purity, storage) 
  VALUES ('Melanotan II', 'MT2', '10 mg', 'melanotan-2',
    'Melanotan II is a synthetic α-MSH analog that induces melanogenesis (tanning agent). Benefits: Enhanced melanin production and tanning response • Reduced UV damage risk through natural pigmentation • Appetite suppression effects • Increased libido through MC4R activation',
    64.99, NULL, '>99%', 'Store lyophilized at -20°C. After reconstitution, store at 2-8°C for up to 30 days.')
  RETURNING id INTO v_product_id;
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);
  
  INSERT INTO products (name, short_name, dosage, slug, description, price, image_url, purity, storage) 
  VALUES ('Semaglutide', 'Semaglutide', '10 mg', 'semaglutide',
    'Semaglutide is a GLP-1 receptor agonist regulating appetite and glucose metabolism. Benefits: Significant appetite reduction and weight loss • Improved glycemic control and insulin sensitivity • Cardiovascular protective effects • Sustained metabolic benefits',
    179.99, NULL, '>98%', 'Store lyophilized at -20°C. After reconstitution, store at 2-8°C for up to 56 days.')
  RETURNING id INTO v_product_id;
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);
  
  INSERT INTO products (name, short_name, dosage, slug, description, price, image_url, purity, storage) 
  VALUES ('Tirzepatide', 'Tirzepatide', '10 mg', 'tirzepatide',
    'Tirzepatide is a dual GIP/GLP-1 receptor agonist with superior metabolic effects. Benefits: Enhanced weight loss beyond GLP-1 alone • Dual-action appetite and glucose control • Improved lipid metabolism • Powerful cardiovascular benefits',
    199.99, NULL, '>98%', 'Store lyophilized at -20°C. After reconstitution, store at 2-8°C for up to 56 days.')
  RETURNING id INTO v_product_id;
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);

  -- Sleep / Circadian Category
  SELECT id INTO v_category_id FROM categories WHERE slug = 'sleep-circadian';
  
  INSERT INTO products (name, short_name, dosage, slug, description, price, image_url, purity, storage) 
  VALUES ('DSIP', 'DSIP', '2 mg', 'dsip',
    'DSIP (Delta Sleep-Inducing Peptide) is a neuropeptide promoting deep, restorative sleep. Benefits: Enhanced delta wave sleep and sleep quality • Reduced stress and cortisol levels • Improved circadian rhythm regulation • Neuroprotective effects',
    69.99, NULL, '>98%', 'Store lyophilized at -20°C. After reconstitution, store at 2-8°C for up to 14 days.')
  RETURNING id INTO v_product_id;
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);
  
  INSERT INTO products (name, short_name, dosage, slug, description, price, image_url, purity, storage) 
  VALUES ('Epitalon', 'Epitalon', '10 mg', 'epitalon',
    'Epitalon is a tetrapeptide activating telomerase and regulating the pineal gland. Benefits: Enhanced telomere lengthening and cellular longevity • Improved melatonin production and sleep cycles • Powerful anti-aging effects • Immune system support',
    84.99, NULL, '>98%', 'Store lyophilized at -20°C. After reconstitution, store at 2-8°C for up to 21 days.')
  RETURNING id INTO v_product_id;
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);

  -- Mitochondrial Boosters Category
  SELECT id INTO v_category_id FROM categories WHERE slug = 'mitochondrial-health';
  
  INSERT INTO products (name, short_name, dosage, slug, description, price, image_url, purity, storage) 
  VALUES ('MOTS-C', 'MOTS-C', '10 mg', 'mots-c',
    'MOTS-C is a mitochondrial-derived peptide enhancing metabolic function and exercise capacity. Benefits: Improved insulin sensitivity and glucose metabolism • Enhanced mitochondrial function and cellular energy • Increased endurance and physical performance • Metabolic age reversal effects',
    129.99, NULL, '>98%', 'Store lyophilized at -20°C. After reconstitution, store at 2-8°C for up to 21 days.')
  RETURNING id INTO v_product_id;
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);

  -- Aesthetic Category
  SELECT id INTO v_category_id FROM categories WHERE slug = 'aesthetic-beauty';
  
  INSERT INTO products (name, short_name, dosage, slug, description, price, image_url, purity, storage) 
  VALUES ('GHK-Cu (Cosmetic)', 'GHK-Cu', '100 mg', 'ghk-cu-cosmetic',
    'GHK-Cu for aesthetic applications - the gold standard in cosmetic peptide regeneration. Benefits: Dramatic reduction in fine lines and wrinkles • Enhanced skin firmness and elasticity • Hair growth stimulation and thickness • Comprehensive anti-aging skin remodeling',
    99.99, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80', '>95%', 'Store lyophilized at -20°C. After reconstitution, store at 2-8°C for up to 21 days.')
  RETURNING id INTO v_product_id;
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);

  -- Nootropic Category
  SELECT id INTO v_category_id FROM categories WHERE slug = 'nootropic-mood';
  
  INSERT INTO products (name, short_name, dosage, slug, description, price, image_url, purity, storage) 
  VALUES ('Oxytocin', 'Oxytocin', '10 mg', 'oxytocin',
    'Oxytocin is a neuropeptide modulating social bonding, mood, and stress response. Benefits: Enhanced social cognition and emotional regulation • Reduced anxiety and stress response • Improved mood and well-being • Benefits for social behavioral research',
    79.99, NULL, '>98%', 'Store lyophilized at -20°C. After reconstitution, store at 2-8°C for up to 14 days.')
  RETURNING id INTO v_product_id;
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);

  -- Fat Loss Category
  SELECT id INTO v_category_id FROM categories WHERE slug = 'fat-loss';
  
  INSERT INTO products (name, short_name, dosage, slug, description, price, image_url, purity, storage) 
  VALUES ('Frag 176-191', 'Frag 176-191', '5 mg', 'frag-176-191',
    'Frag 176-191 is a modified fragment of human growth hormone specifically targeting fat metabolism. Benefits: Selective fat burning without affecting blood sugar • Enhanced lipolysis in adipose tissue • Improved body composition • No impact on insulin sensitivity',
    74.99, NULL, '>98%', 'Store lyophilized at -20°C. After reconstitution, store at 2-8°C for up to 21 days.')
  RETURNING id INTO v_product_id;
  INSERT INTO product_categories (product_id, category_id) VALUES (v_product_id, v_category_id);
  
END $$;
