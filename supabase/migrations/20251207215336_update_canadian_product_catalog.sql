/*
  # Update to Canadian Product Catalog - 17 Products & 8 Categories

  1. Categories (8 total)
    - HGH Amplifier
    - Growth Factor
    - Recovery / Injury / Healing
    - Mitochondrial Health
    - GLP-1 Modulator / Fat Loss
    - Aesthetic / Beauty
    - Anti-Aging / Sleep
    - Tanning

  2. Products (17 total with updated dosages)
    - BPC-157 (5mg) - Recovery/Injury/Healing
    - CJC-1295 (5mg) - HGH Amplifier
    - DSIP (2mg) - Recovery/Injury/Sleep
    - GHK-Cu (100mg) - Aesthetic/Beauty
    - HGH Frag 176-191 (5mg) - Fat Burner
    - IGF-1 LR3 (1mg) - Growth Factor
    - Melanotan 2 (10mg) - Tanning
    - MOTS-C (10mg) - Mitochondrial Health
    - PEG-MGF (2mg) - Growth Factor & Recovery
    - Semaglutide (10mg) - GLP-1 Modulator/Fat Loss
    - Tirzepatide (10mg) - GLP-1 Modulator/Fat Loss
    - TB-500 (10mg) - Recovery/Injury/Healing
    - Oxytocin (10mg) - Recovery/Mood
    - Tesamorelin (5mg) - HGH Amplifier
    - MGF (2mg) - Growth Factor
    - SLU-PP-332 (5mg) - Performance/Fat Loss
    - Epitalon (10mg) - Anti-Aging/Sleep

  3. Security
    - Maintains existing RLS policies
*/

-- Clear existing data
DELETE FROM product_categories;
DELETE FROM products;
DELETE FROM categories;

-- Insert 8 new categories
INSERT INTO categories (id, name, name_en, slug, description) VALUES
  (gen_random_uuid(), 'Amplificateur HGH', 'HGH Amplifier', 'hgh-amplifier', 'Growth hormone amplification peptides for enhanced endogenous production'),
  (gen_random_uuid(), 'Facteur de Croissance', 'Growth Factor', 'growth-factor', 'Advanced growth factor peptides for muscle development and cellular proliferation'),
  (gen_random_uuid(), 'Récupération / Blessure / Guérison', 'Recovery / Injury / Healing', 'recovery-injury-healing', 'Regenerative peptides for accelerated tissue repair and recovery'),
  (gen_random_uuid(), 'Santé Mitochondriale', 'Mitochondrial Health', 'mitochondrial-health', 'Mitochondrial optimization peptides for cellular energy and metabolic function'),
  (gen_random_uuid(), 'Modulateur GLP-1 / Perte de Graisse', 'GLP-1 Modulator / Fat Loss', 'glp1-modulator-fat-loss', 'GLP-1 receptor agonists for metabolic regulation and weight management'),
  (gen_random_uuid(), 'Esthétique / Beauté', 'Aesthetic / Beauty', 'aesthetic-beauty', 'Cosmetic peptides for skin, hair, and aesthetic enhancement'),
  (gen_random_uuid(), 'Anti-Âge / Sommeil', 'Anti-Aging / Sleep', 'anti-aging-sleep', 'Longevity and sleep-regulating peptides for cellular rejuvenation'),
  (gen_random_uuid(), 'Bronzage', 'Tanning', 'tanning', 'Melanocyte-stimulating peptides for enhanced pigmentation');

-- Insert 17 products with correct dosages
INSERT INTO products (id, name, short_name, dosage, slug, description, purity, storage, price, image_url, image_detail_url, featured) VALUES
  -- Recovery / Injury / Healing
  (gen_random_uuid(), 'BPC-157', 'BPC-157', '5 mg', 'bpc-157', 'Body Protection Compound-157 is a pentadecapeptide used in laboratory research for tissue repair mechanisms, wound healing, and cellular regeneration. Studies focus on tendon, ligament, and muscle recovery processes.', '≥98%', 'Store lyophilised at -20°C. After reconstitution, store at 2-8°C for up to 30 days.', 44.99, 'https://i.postimg.cc/Y9HMZcvG/BPC-(2).png', 'https://i.postimg.cc/Y9HMZcvG/BPC-(2).png', true),
  
  (gen_random_uuid(), 'TB-500', 'TB-500', '10 mg', 'tb-500', 'Thymosin Beta-4 fragment is a research peptide used in studies investigating tissue repair, cellular migration, angiogenesis, and wound healing processes. Research examines its role in injury recovery and inflammation modulation.', '≥98%', 'Store lyophilised at -20°C. After reconstitution, store at 2-8°C for up to 30 days.', 54.99, null, null, true),
  
  (gen_random_uuid(), 'DSIP', 'DSIP', '2 mg', 'dsip', 'Delta Sleep-Inducing Peptide is used in research examining sleep regulation mechanisms, circadian rhythm pathways, and stress response. Studies investigate its effects on sleep architecture and neurological function.', '≥98%', 'Store lyophilised at -20°C. After reconstitution, store at 2-8°C for up to 30 days.', 34.99, 'https://i.postimg.cc/SKzxH7V1/DSIp-2-Modifie.png', 'https://i.postimg.cc/SKzxH7V1/DSIp-2-Modifie.png', false),
  
  (gen_random_uuid(), 'Oxytocin', 'Oxytocin', '10 mg', 'oxytocin', 'Oxytocin is a neuropeptide used in research examining social bonding, stress regulation, mood modulation, and neuroplasticity. Laboratory studies investigate its effects on emotional processing and recovery.', '≥98%', 'Store lyophilised at -20°C. After reconstitution, store at 2-8°C for up to 30 days.', 39.99, null, null, false),
  
  -- HGH Amplifier
  (gen_random_uuid(), 'CJC-1295', 'CJC-1295', '5 mg', 'cjc-1295', 'CJC-1295 is a synthetic peptide analogue used in research studies examining growth hormone amplification, metabolic processes, and pulsatile secretion patterns. Research focuses on endogenous GH optimization.', '≥98%', 'Store lyophilised at -20°C. After reconstitution, store at 2-8°C for up to 30 days.', 39.99, 'https://i.postimg.cc/c1cLqJMd/cjc-1.png', 'https://i.postimg.cc/c1cLqJMd/cjc-1.png', true),
  
  (gen_random_uuid(), 'Tesamorelin', 'Tesamorelin', '5 mg', 'tesamorelin', 'Tesamorelin is a growth hormone-releasing hormone analogue used in research examining lipolysis, body composition, and metabolic regulation. Studies investigate its effects on visceral adipose tissue and GH amplification.', '≥98%', 'Store lyophilised at -20°C. After reconstitution, store at 2-8°C for up to 30 days.', 59.99, null, null, false),
  
  -- Growth Factor
  (gen_random_uuid(), 'IGF-1 LR3', 'IGF-1 LR3', '1 mg', 'igf-1-lr3', 'Insulin-like Growth Factor-1 Long R3 is a research peptide used in studies examining cellular growth pathways, hyperplasia, metabolic regulation, and muscle protein synthesis. A potent hyperplasia agent in laboratory research.', '≥98%', 'Store lyophilised at -20°C. After reconstitution, store at 2-8°C for up to 30 days.', 54.99, 'https://i.postimg.cc/5NR11QHx/IGF-1-(2).png', 'https://i.postimg.cc/5NR11QHx/IGF-1-(2).png', true),
  
  (gen_random_uuid(), 'PEG-MGF', 'PEG-MGF', '2 mg', 'peg-mgf', 'Pegylated Mechano Growth Factor is a variant of IGF-1 used in research exploring muscle tissue development, cellular repair mechanisms, and recovery. Studies examine both growth factor and recovery properties.', '≥98%', 'Store lyophilised at -20°C. After reconstitution, store at 2-8°C for up to 30 days.', 49.99, null, null, false),
  
  (gen_random_uuid(), 'MGF', 'MGF', '2 mg', 'mgf', 'Mechano Growth Factor is an IGF-1 splice variant used in laboratory research investigating muscle satellite cell activation, hypertrophy mechanisms, and cellular proliferation pathways.', '≥98%', 'Store lyophilised at -20°C. After reconstitution, store at 2-8°C for up to 30 days.', 45.99, null, null, false),
  
  -- GLP-1 Modulator / Fat Loss
  (gen_random_uuid(), 'Semaglutide', 'Semaglutide', '10 mg', 'semaglutide', 'Semaglutide is a GLP-1 receptor agonist peptide used in research examining metabolic regulation, appetite control mechanisms, glucose homeostasis, and fat oxidation processes.', '≥98%', 'Store lyophilised at -20°C. After reconstitution, store at 2-8°C for up to 30 days.', 64.99, null, null, true),
  
  (gen_random_uuid(), 'Tirzepatide', 'Tirzepatide', '10 mg', 'tirzepatide', 'Tirzepatide is a dual GIP/GLP-1 receptor agonist used in laboratory research investigating metabolic pathways, glucose regulation, and energy expenditure. Studies examine fat loss mechanisms.', '≥98%', 'Store lyophilised at -20°C. After reconstitution, store at 2-8°C for up to 30 days.', 69.99, null, null, true),
  
  (gen_random_uuid(), 'HGH Frag 176-191', 'HGH Frag 176-191', '5 mg', 'hgh-frag-176-191', 'Human Growth Hormone Fragment 176-191 is a modified amino acid sequence used in research examining lipolysis, fat metabolism, and energy expenditure without affecting insulin sensitivity.', '≥98%', 'Store lyophilised at -20°C. After reconstitution, store at 2-8°C for up to 30 days.', 39.99, null, null, false),
  
  (gen_random_uuid(), 'SLU-PP-332', 'SLU-PP-332', '5 mg', 'slu-pp-332', 'SLU-PP-332 is a novel research compound used in studies investigating exercise mimetics, mitochondrial function, metabolic performance enhancement, and fat oxidation pathways.', '≥98%', 'Store lyophilised at -20°C. After reconstitution, store at 2-8°C for up to 30 days.', 79.99, null, null, false),
  
  -- Mitochondrial Health
  (gen_random_uuid(), 'MOTS-C', 'MOTS-C', '10 mg', 'mots-c', 'MOTS-C is a mitochondrial-derived peptide used in research examining cellular energy optimization, metabolic regulation, insulin sensitivity, and mitochondrial biogenesis pathways.', '≥98%', 'Store lyophilised at -20°C. After reconstitution, store at 2-8°C for up to 30 days.', 46.99, null, null, false),
  
  -- Aesthetic / Beauty
  (gen_random_uuid(), 'GHK-Cu', 'GHK-Cu', '100 mg', 'ghk-cu', 'Copper peptide GHK-Cu is used in research investigating collagen synthesis, tissue remodeling, wound healing, hair follicle stimulation, and skin rejuvenation mechanisms.', '≥98%', 'Store lyophilised at -20°C. After reconstitution, store at 2-8°C for up to 30 days.', 44.99, null, null, false),
  
  -- Tanning
  (gen_random_uuid(), 'Melanotan 2', 'Melanotan 2', '10 mg', 'melanotan-2', 'Melanotan 2 is a synthetic peptide analogue used in research examining melanocortin receptor pathways, melanogenesis, and pigmentation mechanisms for tanning research.', '≥98%', 'Store lyophilised at -20°C. After reconstitution, store at 2-8°C for up to 30 days.', 34.99, null, null, false),
  
  -- Anti-Aging / Sleep
  (gen_random_uuid(), 'Epitalon', 'Epitalon', '10 mg', 'epitalon', 'Epitalon is a tetrapeptide used in research examining telomerase activation, cellular senescence, circadian rhythm regulation, melatonin production, and longevity mechanisms.', '≥98%', 'Store lyophilised at -20°C. After reconstitution, store at 2-8°C for up to 30 days.', 42.99, null, null, false);

-- Link products to categories
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM products p, categories c
WHERE 
  (p.slug = 'bpc-157' AND c.slug = 'recovery-injury-healing') OR
  (p.slug = 'tb-500' AND c.slug = 'recovery-injury-healing') OR
  (p.slug = 'dsip' AND c.slug = 'recovery-injury-healing') OR
  (p.slug = 'oxytocin' AND c.slug = 'recovery-injury-healing') OR
  (p.slug = 'cjc-1295' AND c.slug = 'hgh-amplifier') OR
  (p.slug = 'tesamorelin' AND c.slug = 'hgh-amplifier') OR
  (p.slug = 'igf-1-lr3' AND c.slug = 'growth-factor') OR
  (p.slug = 'peg-mgf' AND c.slug = 'growth-factor') OR
  (p.slug = 'mgf' AND c.slug = 'growth-factor') OR
  (p.slug = 'semaglutide' AND c.slug = 'glp1-modulator-fat-loss') OR
  (p.slug = 'tirzepatide' AND c.slug = 'glp1-modulator-fat-loss') OR
  (p.slug = 'hgh-frag-176-191' AND c.slug = 'glp1-modulator-fat-loss') OR
  (p.slug = 'slu-pp-332' AND c.slug = 'glp1-modulator-fat-loss') OR
  (p.slug = 'mots-c' AND c.slug = 'mitochondrial-health') OR
  (p.slug = 'ghk-cu' AND c.slug = 'aesthetic-beauty') OR
  (p.slug = 'melanotan-2' AND c.slug = 'tanning') OR
  (p.slug = 'epitalon' AND c.slug = 'anti-aging-sleep');