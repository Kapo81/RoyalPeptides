/*
  # Rebuild Catalogue with English Categories
  
  ## Overview
  Complete catalogue restructure with 11 English research-focused categories
  and expanded product library including GHRPs, IGF variants, nootropics and more.
  
  ## Changes
  
  ### 1. Category Structure (English)
  - HGH Amplifiers / GHRP & GHRH
  - Growth Factors
  - Metabolic Activators / Fat-Loss
  - Recovery / Injury
  - Aesthetic / Skin & Hair
  - Libido & Sexual Function
  - Nootropics & Mood
  - Sleep Support
  - Anti-Aging / Longevity
  - Mitochondrial Support
  - GLP-1 & Incretin Modulators
  
  ### 2. Product Additions
  - GHRP-2, GHRP-4, GHRP-6, Ipamorelin, Hexarelin
  - IGF-1 DES
  - HCG 5000 IU, PT-141
  - Semax, Selank
  
  ### 3. Updates
  - All descriptions rewritten for research context
  - Remove duplicate GHK-Cu entry
  - Proper category assignments including cross-listings
*/

-- Clear existing associations
DELETE FROM product_categories;
DELETE FROM categories;

-- Create English category structure
INSERT INTO categories (id, name, name_en, slug, description, created_at) VALUES
(gen_random_uuid(), 'HGH Amplifiers / GHRP & GHRH', 'HGH Amplifiers / GHRP & GHRH', 'hgh-amplifiers-ghrp-ghrh', 'Growth hormone releasing peptides that stimulate natural GH production and pulsatile secretion', now()),
(gen_random_uuid(), 'Growth Factors', 'Growth Factors', 'growth-factors', 'IGF-1 analogs and mechano growth factors for muscle hypertrophy and hyperplasia research', now()),
(gen_random_uuid(), 'Metabolic Activators / Fat-Loss', 'Metabolic Activators / Fat-Loss', 'metabolic-activators-fat-loss', 'Experimental compounds researched for metabolic activation, lipolysis and body composition', now()),
(gen_random_uuid(), 'Recovery / Injury', 'Recovery / Injury', 'recovery-injury', 'Peptides investigated for soft-tissue repair, wound healing and injury recovery', now()),
(gen_random_uuid(), 'Aesthetic / Skin & Hair', 'Aesthetic / Skin & Hair', 'aesthetic-skin-hair', 'Copper peptides and compounds researched for collagen, skin regeneration and cosmetic applications', now()),
(gen_random_uuid(), 'Libido & Sexual Function', 'Libido & Sexual Function', 'libido-sexual-function', 'Peptides and hormones studied for libido enhancement, arousal and reproductive function', now()),
(gen_random_uuid(), 'Nootropics & Mood', 'Nootropics & Mood', 'nootropics-mood', 'Neuropeptides researched for cognitive enhancement, focus, mood regulation and neuroprotection', now()),
(gen_random_uuid(), 'Sleep Support', 'Sleep Support', 'sleep-support', 'Peptides investigated for sleep regulation, circadian rhythm and stress management', now()),
(gen_random_uuid(), 'Anti-Aging / Longevity', 'Anti-Aging / Longevity', 'anti-aging-longevity', 'Telomerase-related and longevity peptides researched for aging and endocrine modulation', now()),
(gen_random_uuid(), 'Mitochondrial Support', 'Mitochondrial Support', 'mitochondrial-support', 'Mitochondrial peptides researched for metabolic flexibility and cellular energy optimization', now()),
(gen_random_uuid(), 'GLP-1 & Incretin Modulators', 'GLP-1 & Incretin Modulators', 'glp1-incretin-modulators', 'GLP-1 and dual GIP/GLP-1 agonists researched for appetite control and glucose regulation', now());

-- Remove duplicate
DELETE FROM products WHERE name = 'GHK-Cu (Cosmetic)';

-- Update existing products
UPDATE products SET 
  description = 'CJC-1295 is a GHRH analog researched for increasing endogenous growth hormone release and extending GH pulse duration.',
  benefits_summary = '• Extended growth hormone release duration
• Investigated for anabolic effects
• Research focus on body composition
• GHRH receptor agonist with prolonged half-life'
WHERE name = 'CJC-1295';

UPDATE products SET 
  description = 'Tesamorelin is a GHRH analog researched for targeting visceral adipose tissue while promoting natural GH secretion.',
  benefits_summary = '• Researched for visceral fat reduction
• Natural GH secretion without desensitization
• Investigated for lipid profile improvements
• Studied for cognitive benefits'
WHERE name = 'Tesamorelin';

UPDATE products SET 
  description = 'IGF-1 LR3 is a long-acting IGF-1 analog researched for muscle growth and hyperplasia models.',
  benefits_summary = '• Researched for muscle hypertrophy
• Extended half-life vs native IGF-1
• Investigated for satellite cell activation
• Studied for anabolic pathways'
WHERE name = 'IGF-1 LR3';

UPDATE products SET 
  description = 'PEG-MGF is researched for muscle repair and satellite cell activation following mechanical stress.',
  benefits_summary = '• Researched for muscle repair
• Investigated for satellite cell activation
• Studied for injury recovery
• Extended half-life due to pegylation'
WHERE name = 'PEG-MGF';

UPDATE products SET 
  description = 'MGF is a splice variant of IGF-1 researched for local muscle repair following mechanical damage.',
  benefits_summary = '• Researched for muscle repair mechanisms
• Investigated after mechanical stress
• Studied for satellite cell activation
• Local tissue repair focus'
WHERE name = 'MGF';

UPDATE products SET 
  description = 'SLU-PP-332 is a novel ERRα agonist researched for enhancing mitochondrial function and oxidative capacity.',
  benefits_summary = '• Researched for metabolic activation
• Investigated for endurance capacity
• Studied for mitochondrial biogenesis
• Potential neuroprotective effects'
WHERE name = 'SLU-PP-332';

UPDATE products SET 
  name = 'HGH Frag 176-191',
  slug = 'hgh-frag-176-191',
  description = 'HGH Fragment 176-191 is researched for lipolytic activity without affecting insulin sensitivity.',
  benefits_summary = '• Researched for targeted lipolysis
• Investigated for fat-loss mechanisms
• No effect on glucose or IGF-1
• Studied for body composition'
WHERE name = 'Frag 176-191' OR slug = 'frag-176-191';

UPDATE products SET 
  description = 'BPC-157 is researched for tissue repair across multiple organ systems including gut, tendon and muscle.',
  benefits_summary = '• Researched for wound healing
• Investigated for tendon repair
• Studied for gut protection
• Angiogenic effects in models'
WHERE name = 'BPC-157';

UPDATE products SET 
  description = 'TB-500 is researched for cellular migration, tissue repair and angiogenesis.',
  benefits_summary = '• Researched for tissue regeneration
• Investigated for injury recovery
• Studied for angiogenesis
• Flexibility improvements in models'
WHERE name = 'TB-500';

UPDATE products SET 
  description = 'GHK-Cu is researched for tissue remodeling, collagen synthesis and wound healing.',
  benefits_summary = '• Researched for collagen production
• Investigated for wound healing
• Studied for skin and hair regeneration
• Antioxidant effects in models'
WHERE name = 'GHK-Cu';

UPDATE products SET 
  description = 'Oxytocin is researched for social bonding, trust, mood regulation and stress response.',
  benefits_summary = '• Researched for social cognition
• Investigated for anxiety reduction
• Studied for mood regulation
• Social behavior research applications'
WHERE name = 'Oxytocin';

UPDATE products SET 
  description = 'DSIP is researched for sleep regulation, circadian rhythm modulation and stress management.',
  benefits_summary = '• Researched for sleep quality
• Investigated for circadian rhythm
• Studied for stress modulation
• Potential anxiolytic-like effects'
WHERE name = 'DSIP';

UPDATE products SET 
  description = 'Epitalon is researched for longevity, circadian rhythm regulation and endocrine function.',
  benefits_summary = '• Researched for telomerase activation
• Investigated for longevity mechanisms
• Studied for circadian rhythm
• Endocrine modulation in models'
WHERE name = 'Epitalon';

UPDATE products SET 
  description = 'MOTS-C is researched for metabolic flexibility, insulin sensitivity and cellular energy optimization.',
  benefits_summary = '• Researched for mitochondrial function
• Investigated for metabolic flexibility
• Studied for exercise mimetic effects
• Cellular energy optimization'
WHERE name = 'MOTS-C';

UPDATE products SET 
  description = 'Semaglutide is researched for appetite regulation, glucose control and weight management.',
  benefits_summary = '• Researched for appetite regulation
• Investigated for glucose control
• Studied for weight management
• Cardiovascular benefits in models'
WHERE name = 'Semaglutide';

UPDATE products SET 
  description = 'Tirzepatide is researched for enhanced weight loss and glycemic control via dual GIP/GLP-1 activation.',
  benefits_summary = '• Researched for dual incretin activation
• Investigated for weight management
• Studied for glucose regulation
• Synergistic GIP/GLP-1 effects'
WHERE name = 'Tirzepatide';

-- Add new products
INSERT INTO products (id, name, short_name, slug, dosage, purity, description, benefits_summary, storage, price, created_at)
SELECT 
  gen_random_uuid(), 'GHRP-2', 'GHRP2', 'ghrp-2', '5 mg', '>98%',
  'GHRP-2 is researched for stimulating pituitary GH secretion and modulating hunger pathways.',
  '• Researched for GH pulse stimulation
• Investigated for pituitary GH release
• Studied for appetite modulation
• Potential GHRH synergy', 
  'Store lyophilized at -20°C. Once reconstituted, store at 2-8°C for up to 30 days.', 89.99, now()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'ghrp-2');

INSERT INTO products (id, name, short_name, slug, dosage, purity, description, benefits_summary, storage, price, created_at)
SELECT 
  gen_random_uuid(), 'GHRP-4', 'GHRP4', 'ghrp-4', '5 mg', '>98%',
  'GHRP-4 is researched for GH release and ghrelin receptor activity.',
  '• Researched for growth hormone secretion
• Investigated for hunger signaling
• Studied for ghrelin receptor agonism
• Potential metabolic effects',
  'Store lyophilized at -20°C. Once reconstituted, store at 2-8°C for up to 30 days.', 89.99, now()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'ghrp-4');

INSERT INTO products (id, name, short_name, slug, dosage, purity, description, benefits_summary, storage, price, created_at)
SELECT 
  gen_random_uuid(), 'GHRP-6', 'GHRP6', 'ghrp-6', '5 mg', '>98%',
  'GHRP-6 is a classic GHRP researched for pituitary GH secretion and appetite stimulation.',
  '• Researched for GH release stimulation
• Investigated for appetite effects
• Studied for pituitary GH pulses
• Extensive research history',
  'Store lyophilized at -20°C. Once reconstituted, store at 2-8°C for up to 30 days.', 89.99, now()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'ghrp-6');

INSERT INTO products (id, name, short_name, slug, dosage, purity, description, benefits_summary, storage, price, created_at)
SELECT 
  gen_random_uuid(), 'Ipamorelin', 'IPA', 'ipamorelin', '5 mg', '>98%',
  'Ipamorelin is researched for selective GH release with minimal effects on prolactin and cortisol.',
  '• Researched for selective GH secretion
• Minimal prolactin/cortisol effects
• Investigated for clean GH pulses
• Favorable side-effect profile',
  'Store lyophilized at -20°C. Once reconstituted, store at 2-8°C for up to 30 days.', 99.99, now()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'ipamorelin');

INSERT INTO products (id, name, short_name, slug, dosage, purity, description, benefits_summary, storage, price, created_at)
SELECT 
  gen_random_uuid(), 'Hexarelin', 'HEX', 'hexarelin', '2 mg', '>98%',
  'Hexarelin is researched for potent GH pulse stimulation and cardioprotective properties.',
  '• Researched for potent GH stimulation
• Investigated for cardioprotective effects
• Studied for ghrelin receptor super-agonism
• Desensitization patterns documented',
  'Store lyophilized at -20°C. Once reconstituted, store at 2-8°C for up to 30 days.', 79.99, now()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'hexarelin');

INSERT INTO products (id, name, short_name, slug, dosage, purity, description, benefits_summary, storage, price, created_at)
SELECT 
  gen_random_uuid(), 'IGF-1 DES (1-3)', 'IGF-DES', 'igf-1-des', '1 mg', '>98%',
  'IGF-1 DES is researched for enhanced potency and reduced IGFBP binding.',
  '• Researched for enhanced IGF-1 activation
• Investigated for local tissue growth
• Studied for reduced IGFBP binding
• Short half-life for site-specific use',
  'Store lyophilized at -20°C. Once reconstituted, store at 2-8°C for up to 7 days.', 149.99, now()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'igf-1-des');

INSERT INTO products (id, name, short_name, slug, dosage, purity, description, benefits_summary, storage, price, created_at)
SELECT 
  gen_random_uuid(), 'HCG 5000 IU', 'HCG', 'hcg-5000-iu', '5000 IU', '>99%',
  'HCG is researched for LH receptor activation, testosterone production and fertility support.',
  '• Researched for LH mimicry
• Investigated for testosterone production
• Studied for testicular function
• PCT and endocrine modulation',
  'Store lyophilized at 2-8°C. Once reconstituted, store refrigerated for up to 30 days.', 79.99, now()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'hcg-5000-iu');

INSERT INTO products (id, name, short_name, slug, dosage, purity, description, benefits_summary, storage, price, created_at)
SELECT 
  gen_random_uuid(), 'PT-141 (Bremelanotide)', 'PT141', 'pt-141', '10 mg', '>98%',
  'PT-141 is researched for libido enhancement via central nervous system melanocortin pathways.',
  '• Researched for libido mechanisms
• Investigated for CNS activation
• Studied for MC3R/MC4R agonism
• Non-vascular sexual function approach',
  'Store lyophilized at -20°C. Once reconstituted, store at 2-8°C for up to 30 days.', 119.99, now()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'pt-141');

INSERT INTO products (id, name, short_name, slug, dosage, purity, description, benefits_summary, storage, price, created_at)
SELECT 
  gen_random_uuid(), 'Semax', 'SEMAX', 'semax', '5 mg', '>98%',
  'Semax is researched for cognitive enhancement, focus and neuroprotection.',
  '• Researched for cognitive enhancement
• Investigated for neuroprotection
• Studied for BDNF and NGF modulation
• Memory and learning pathways',
  'Store lyophilized at -20°C. Once reconstituted, store at 2-8°C for up to 30 days.', 99.99, now()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'semax');

INSERT INTO products (id, name, short_name, slug, dosage, purity, description, benefits_summary, storage, price, created_at)
SELECT 
  gen_random_uuid(), 'Selank', 'SELANK', 'selank', '5 mg', '>98%',
  'Selank is researched for anxiolytic-like effects, mood regulation and stress resilience.',
  '• Researched for anxiolytic effects
• Investigated for mood regulation
• Studied for GABA and serotonin modulation
• Cognitive function without sedation',
  'Store lyophilized at -20°C. Once reconstituted, store at 2-8°C for up to 30 days.', 99.99, now()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'selank');

-- Create category associations
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p CROSS JOIN categories c
WHERE c.slug = 'hgh-amplifiers-ghrp-ghrh'
AND p.slug IN ('cjc-1295', 'ghrp-2', 'ghrp-4', 'ghrp-6', 'ipamorelin', 'hexarelin', 'tesamorelin');

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p CROSS JOIN categories c
WHERE c.slug = 'growth-factors'
AND p.slug IN ('igf-1-lr3', 'igf-1-des', 'peg-mgf', 'mgf');

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p CROSS JOIN categories c
WHERE c.slug = 'metabolic-activators-fat-loss'
AND p.slug IN ('slu-pp-332', 'hgh-frag-176-191');

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p CROSS JOIN categories c
WHERE c.slug = 'recovery-injury'
AND p.slug IN ('bpc-157', 'tb-500', 'peg-mgf');

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p CROSS JOIN categories c
WHERE c.slug = 'aesthetic-skin-hair'
AND p.slug IN ('ghk-cu');

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p CROSS JOIN categories c
WHERE c.slug = 'libido-sexual-function'
AND p.slug IN ('hcg-5000-iu', 'pt-141');

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p CROSS JOIN categories c
WHERE c.slug = 'nootropics-mood'
AND p.slug IN ('oxytocin', 'semax', 'selank');

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p CROSS JOIN categories c
WHERE c.slug = 'sleep-support'
AND p.slug IN ('dsip');

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p CROSS JOIN categories c
WHERE c.slug = 'anti-aging-longevity'
AND p.slug IN ('epitalon');

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p CROSS JOIN categories c
WHERE c.slug = 'mitochondrial-support'
AND p.slug IN ('mots-c');

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p CROSS JOIN categories c
WHERE c.slug = 'glp1-incretin-modulators'
AND p.slug IN ('semaglutide', 'tirzepatide');
