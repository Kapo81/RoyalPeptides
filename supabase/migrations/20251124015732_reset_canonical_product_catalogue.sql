/*
  # Reset Product Catalogue with Canonical 20-Product List

  1. Changes
    - Drop all existing products and categories
    - Add short_name and dosage fields to products table
    - Insert 6 canonical categories with proper naming
    - Insert exact 20 products with correct categorization
    - Link products to categories via product_categories junction table
  
  2. Categories Created
    - Précurseur HGH (5 products)
    - Growth Factor (2 products)
    - Aesthetic (2 products)
    - Fertility & Test Booster (1 product)
    - Fat Burner / Myostatin Inhibitor (7 products)
    - Recovery / Injury / Sleep (3 products)
  
  3. Products
    All 20 products with exact names, dosages, categories, and image URLs as specified
  
  4. Security
    - Maintains existing RLS policies
*/

-- Add new fields to products table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'short_name'
  ) THEN
    ALTER TABLE products ADD COLUMN short_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'dosage'
  ) THEN
    ALTER TABLE products ADD COLUMN dosage text;
  END IF;
END $$;

-- Clear existing data
DELETE FROM product_categories;
DELETE FROM products;
DELETE FROM categories;

-- Insert 6 canonical categories
INSERT INTO categories (id, name, name_en, slug, description) VALUES
  (gen_random_uuid(), 'Précurseur HGH', 'HGH Precursor', 'precurseur-hgh', 'Growth hormone releasing peptides for research applications'),
  (gen_random_uuid(), 'Growth Factor', 'Growth Factor', 'growth-factor', 'Advanced growth factor peptides for laboratory studies'),
  (gen_random_uuid(), 'Aesthetic', 'Aesthetic', 'aesthetic', 'Peptides for aesthetic research applications'),
  (gen_random_uuid(), 'Fertility & Test Booster', 'Fertility & Test Booster', 'fertility-test-booster', 'Hormonal support peptides for research'),
  (gen_random_uuid(), 'Fat Burner / Myostatin Inhibitor', 'Fat Burner / Myostatin Inhibitor', 'fat-burner-myostatin-inhibitor', 'Metabolic and myostatin research peptides'),
  (gen_random_uuid(), 'Recovery / Injury / Sleep', 'Recovery / Injury / Sleep', 'recovery-injury-sleep', 'Regenerative and restorative research peptides');

-- Insert 20 canonical products
INSERT INTO products (id, name, short_name, dosage, slug, description, purity, storage, price, image_url, image_detail_url, featured) VALUES
  (gen_random_uuid(), 'HCG 5000IU', 'HCG', '5000 IU', 'hcg-5000iu', 'Human Chorionic Gonadotropin is a research peptide used in laboratory studies investigating hormonal pathways and reproductive biology.', '≥98%', 'Store lyophilised at -20°C. After reconstitution, store at 2-8°C for up to 30 days.', 49.99, 'https://i.postimg.cc/JhysMW4L/HCG.png', 'https://i.postimg.cc/JhysMW4L/HCG.png', true),
  (gen_random_uuid(), 'CJC-1295', 'CJC-1295', '2 mg', 'cjc-1295', 'CJC-1295 is a synthetic peptide analogue used in research studies examining growth hormone regulation and metabolic processes.', '≥98%', 'Store lyophilised at -20°C. After reconstitution, store at 2-8°C for up to 30 days.', 39.99, 'https://i.postimg.cc/c1cLqJMd/cjc-1.png', 'https://i.postimg.cc/c1cLqJMd/cjc-1.png', true),
  (gen_random_uuid(), 'BPC-157', 'BPC-157', '10 mg', 'bpc-157', 'Body Protection Compound-157 is a pentadecapeptide used in laboratory research investigating tissue repair mechanisms and cellular regeneration.', '≥98%', 'Store lyophilised at -20°C. After reconstitution, store at 2-8°C for up to 30 days.', 44.99, 'https://i.postimg.cc/Y9HMZcvG/BPC-(2).png', 'https://i.postimg.cc/Y9HMZcvG/BPC-(2).png', true),
  (gen_random_uuid(), 'IGF-1 LR3', 'IGF-1 LR3', '1 mg', 'igf-1-lr3', 'Insulin-like Growth Factor-1 Long R3 is a research peptide used in studies examining cellular growth pathways and metabolic regulation.', '≥98%', 'Store lyophilised at -20°C. After reconstitution, store at 2-8°C for up to 30 days.', 54.99, 'https://i.postimg.cc/5NR11QHx/IGF-1-(2).png', 'https://i.postimg.cc/5NR11QHx/IGF-1-(2).png', true),
  (gen_random_uuid(), 'PEG-MGF (IGF-1 Ec)', 'PEG-MGF', '1 mg', 'peg-mgf', 'Pegylated Mechano Growth Factor is a variant of IGF-1 used in research exploring muscle tissue development and cellular repair mechanisms.', '≥98%', 'Store lyophilised at -20°C. After reconstitution, store at 2-8°C for up to 30 days.', 49.99, null, null, false),
  (gen_random_uuid(), 'ACE-031', 'ACE-031', '1 mg', 'ace-031', 'ACE-031 is a research compound used in laboratory studies investigating myostatin inhibition and muscle growth pathways.', '≥98%', 'Store lyophilised at -20°C. After reconstitution, store at 2-8°C for up to 30 days.', 59.99, 'https://i.postimg.cc/rsqy06cq/ace031.png', 'https://i.postimg.cc/rsqy06cq/ace031.png', true),
  (gen_random_uuid(), 'DSIP', 'DSIP', '5 mg', 'dsip', 'Delta Sleep-Inducing Peptide is used in research examining sleep regulation mechanisms and circadian rhythm pathways.', '≥98%', 'Store lyophilised at -20°C. After reconstitution, store at 2-8°C for up to 30 days.', 34.99, 'https://i.postimg.cc/SKzxH7V1/DSIp-2-Modifie.png', 'https://i.postimg.cc/SKzxH7V1/DSIp-2-Modifie.png', false),
  (gen_random_uuid(), 'TB-500', 'TB-500', '5 mg', 'tb-500', 'Thymosin Beta-4 fragment is a research peptide used in studies investigating tissue repair, cellular migration, and wound healing processes.', '≥98%', 'Store lyophilised at -20°C. After reconstitution, store at 2-8°C for up to 30 days.', 42.99, null, null, false),
  (gen_random_uuid(), 'GHRP-2', 'GHRP-2', '5 mg', 'ghrp-2', 'Growth Hormone Releasing Peptide-2 is used in laboratory research examining growth hormone secretion and metabolic regulation.', '≥98%', 'Store lyophilised at -20°C. After reconstitution, store at 2-8°C for up to 30 days.', 32.99, null, null, false),
  (gen_random_uuid(), 'GHRP-6', 'GHRP-6', '5 mg', 'ghrp-6', 'Growth Hormone Releasing Peptide-6 is a synthetic hexapeptide used in research studies investigating pituitary function and hormone release.', '≥98%', 'Store lyophilised at -20°C. After reconstitution, store at 2-8°C for up to 30 days.', 32.99, null, null, false),
  (gen_random_uuid(), 'Hexarelin', 'Hexarelin', '2 mg', 'hexarelin', 'Hexarelin is a synthetic growth hormone secretagogue used in research examining cardiac function and growth hormone pathways.', '≥98%', 'Store lyophilised at -20°C. After reconstitution, store at 2-8°C for up to 30 days.', 36.99, null, null, false),
  (gen_random_uuid(), 'Ipamorelin', 'Ipamorelin', '5 mg', 'ipamorelin', 'Ipamorelin is a pentapeptide used in laboratory studies investigating selective growth hormone release and metabolic processes.', '≥98%', 'Store lyophilised at -20°C. After reconstitution, store at 2-8°C for up to 30 days.', 38.99, null, null, false),
  (gen_random_uuid(), 'Melanotan 2', 'Melanotan 2', '10 mg', 'melanotan-2', 'Melanotan 2 is a synthetic peptide analogue used in research examining melanocortin receptor pathways and pigmentation mechanisms.', '≥98%', 'Store lyophilised at -20°C. After reconstitution, store at 2-8°C for up to 30 days.', 29.99, null, null, false),
  (gen_random_uuid(), 'GHK-Cu', 'GHK-Cu', '5 mg', 'ghk-cu', 'Copper peptide GHK-Cu is used in research investigating tissue remodeling, wound healing, and cellular signaling pathways.', '≥98%', 'Store lyophilised at -20°C. After reconstitution, store at 2-8°C for up to 30 days.', 34.99, null, null, false),
  (gen_random_uuid(), 'MOTS-C', 'MOTS-C', '10 mg', 'mots-c', 'MOTS-C is a mitochondrial-derived peptide used in research examining metabolic regulation and cellular energy pathways.', '≥98%', 'Store lyophilised at -20°C. After reconstitution, store at 2-8°C for up to 30 days.', 46.99, null, null, false),
  (gen_random_uuid(), 'HGH Frag 176-191', 'HGH Frag 176-191', '5 mg', 'hgh-frag-176-191', 'Human Growth Hormone Fragment 176-191 is a modified form of amino acids used in research examining metabolic processes and fat oxidation.', '≥98%', 'Store lyophilised at -20°C. After reconstitution, store at 2-8°C for up to 30 days.', 39.99, null, null, false),
  (gen_random_uuid(), 'Tirzepatide', 'Tirzepatide', '5 mg', 'tirzepatide', 'Tirzepatide is a dual GIP/GLP-1 receptor agonist used in laboratory research investigating metabolic pathways and glucose regulation.', '≥98%', 'Store lyophilised at -20°C. After reconstitution, store at 2-8°C for up to 30 days.', 52.99, null, null, false),
  (gen_random_uuid(), 'Semaglutide', 'Semaglutide', '5 mg', 'semaglutide', 'Semaglutide is a GLP-1 receptor agonist peptide used in research examining metabolic regulation and appetite control mechanisms.', '≥98%', 'Store lyophilised at -20°C. After reconstitution, store at 2-8°C for up to 30 days.', 49.99, null, null, false),
  (gen_random_uuid(), 'Follistatin 344', 'Follistatin 344', '1 mg', 'follistatin-344', 'Follistatin 344 is a research peptide used in studies investigating myostatin inhibition and muscle growth regulation pathways.', '≥98%', 'Store lyophilised at -20°C. After reconstitution, store at 2-8°C for up to 30 days.', 64.99, null, null, false),
  (gen_random_uuid(), 'GDF-8', 'GDF-8', '1 mg', 'gdf-8', 'Growth Differentiation Factor-8 (Myostatin) is used in laboratory research examining muscle growth regulation and cellular differentiation.', '≥98%', 'Store lyophilised at -20°C. After reconstitution, store at 2-8°C for up to 30 days.', 62.99, null, null, false);

-- Link products to categories
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM products p, categories c
WHERE 
  (p.slug = 'hcg-5000iu' AND c.slug = 'fertility-test-booster') OR
  (p.slug = 'cjc-1295' AND c.slug = 'precurseur-hgh') OR
  (p.slug = 'bpc-157' AND c.slug = 'recovery-injury-sleep') OR
  (p.slug = 'igf-1-lr3' AND c.slug = 'growth-factor') OR
  (p.slug = 'peg-mgf' AND c.slug = 'growth-factor') OR
  (p.slug = 'ace-031' AND c.slug = 'fat-burner-myostatin-inhibitor') OR
  (p.slug = 'dsip' AND c.slug = 'recovery-injury-sleep') OR
  (p.slug = 'tb-500' AND c.slug = 'recovery-injury-sleep') OR
  (p.slug = 'ghrp-2' AND c.slug = 'precurseur-hgh') OR
  (p.slug = 'ghrp-6' AND c.slug = 'precurseur-hgh') OR
  (p.slug = 'hexarelin' AND c.slug = 'precurseur-hgh') OR
  (p.slug = 'ipamorelin' AND c.slug = 'precurseur-hgh') OR
  (p.slug = 'melanotan-2' AND c.slug = 'aesthetic') OR
  (p.slug = 'ghk-cu' AND c.slug = 'aesthetic') OR
  (p.slug = 'mots-c' AND c.slug = 'fat-burner-myostatin-inhibitor') OR
  (p.slug = 'hgh-frag-176-191' AND c.slug = 'fat-burner-myostatin-inhibitor') OR
  (p.slug = 'tirzepatide' AND c.slug = 'fat-burner-myostatin-inhibitor') OR
  (p.slug = 'semaglutide' AND c.slug = 'fat-burner-myostatin-inhibitor') OR
  (p.slug = 'follistatin-344' AND c.slug = 'fat-burner-myostatin-inhibitor') OR
  (p.slug = 'gdf-8' AND c.slug = 'fat-burner-myostatin-inhibitor');