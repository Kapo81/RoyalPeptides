/*
  # Update Complete Peptide Catalogue

  1. Changes
    - Clear existing data
    - Add complete original peptide list (21 peptides)
    - Add French category names
    - Set pricing and product details

  2. Categories (French)
    - Precurseur GH
    - Amplificateur
    - Esthétique
    - Fertility & Test Booster
    - Fat Burner / Mitochondrial
    - Recovery / Repair
    - Peptide Regulators / Hormonal

  3. Products
    All 21 original peptides with proper categorization
*/

DELETE FROM product_categories;
DELETE FROM products;
DELETE FROM categories;

INSERT INTO categories (name, name_en, slug) VALUES
  ('Precurseur GH', 'GH Precursor', 'precurseur-gh'),
  ('Amplificateur', 'Amplifier', 'amplificateur'),
  ('Esthétique', 'Aesthetic', 'esthetique'),
  ('Fertility & Test Booster', 'Fertility & Test Booster', 'fertility-test-booster'),
  ('Fat Burner / Mitochondrial', 'Fat Burner / Mitochondrial', 'fat-burner-mitochondrial'),
  ('Recovery / Repair', 'Recovery / Repair', 'recovery-repair'),
  ('Peptide Regulators / Hormonal', 'Peptide Regulators / Hormonal', 'peptide-regulators-hormonal');

INSERT INTO products (name, slug, description, purity, storage, price, featured) VALUES
  ('HCG 5000IU', 'hcg-5000iu', 'Human Chorionic Gonadotropin for fertility research and hormonal studies.', '>98%', '2-8°C', 89.99, true),
  ('CJC-1295', 'cjc-1295', 'Growth hormone releasing hormone analog for extended GH elevation.', '>98%', '-20°C', 54.99, true),
  ('MELANOTAN 2', 'melanotan-2', 'Synthetic peptide analog for melanogenesis research.', '>98%', '-20°C', 34.99, false),
  ('ACE-031', 'ace-031', 'Myostatin inhibitor for muscle growth research applications.', '>98%', '-20°C', 149.99, false),
  ('DSIP', 'dsip', 'Delta sleep-inducing peptide for sleep research studies.', '>98%', '-20°C', 39.99, false),
  ('TIRZEPATIDE', 'tirzepatide', 'Dual GIP/GLP-1 receptor agonist for metabolic research.', '>98%', '2-8°C', 199.99, true),
  ('FOLLISTATIN 344', 'follistatin-344', 'Myostatin antagonist peptide for muscle development research.', '>98%', '-20°C', 159.99, false),
  ('GHK-CU', 'ghk-cu', 'Copper peptide complex for tissue repair and regeneration studies.', '>98%', '-20°C', 44.99, false),
  ('HEXARELIN', 'hexarelin', 'Potent growth hormone secretagogue with cardioprotective properties.', '>98%', '-20°C', 44.99, false),
  ('PEG-MGF', 'peg-mgf', 'Pegylated mechano growth factor for muscle recovery research.', '>98%', '-20°C', 69.99, false),
  ('IGF-1 LR3', 'igf-1-lr3', 'Long-acting insulin-like growth factor for anabolic research.', '>98%', '-20°C', 79.99, true),
  ('CJC-1295 (No-DAC)', 'cjc-1295-no-dac', 'Modified GHRH for pulsatile growth hormone release.', '>98%', '-20°C', 44.99, false),
  ('SEMAGLUTIDE', 'semaglutide', 'GLP-1 receptor agonist for appetite and metabolic regulation research.', '>98%', '2-8°C', 249.99, true),
  ('OXYTOCIN', 'oxytocin', 'Peptide hormone for behavioral and social bonding research.', '>98%', '-20°C', 29.99, false),
  ('BPC-157', 'bpc-157', 'Body Protection Compound for tissue healing and repair research.', '>98%', '-20°C', 49.99, true),
  ('GHRP-6', 'ghrp-6', 'Growth hormone releasing peptide with appetite stimulation effects.', '>98%', '-20°C', 34.99, false),
  ('GHRP-2', 'ghrp-2', 'Growth hormone secretagogue with moderate ghrelin activity.', '>98%', '-20°C', 34.99, false),
  ('TB-500', 'tb-500', 'Thymosin Beta-4 for tissue regeneration and healing research.', '>98%', '-20°C', 69.99, true),
  ('IPAMORELIN', 'ipamorelin', 'Selective growth hormone secretagogue with minimal side effects.', '>98%', '-20°C', 39.99, false),
  ('HGH FRAG 176-191', 'hgh-frag-176-191', 'Growth hormone fragment for fat metabolism research.', '>98%', '-20°C', 44.99, false),
  ('MOTS-C', 'mots-c', 'Mitochondrial-derived peptide for metabolic and longevity research.', '>98%', '-20°C', 89.99, false);

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'ghrp-2' AND c.slug = 'precurseur-gh';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'ghrp-6' AND c.slug = 'precurseur-gh';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'hexarelin' AND c.slug = 'precurseur-gh';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'ipamorelin' AND c.slug = 'precurseur-gh';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'cjc-1295' AND c.slug = 'amplificateur';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'peg-mgf' AND c.slug = 'amplificateur';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'igf-1-lr3' AND c.slug = 'amplificateur';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'melanotan-2' AND c.slug = 'esthetique';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'ghk-cu' AND c.slug = 'esthetique';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'tb-500' AND c.slug = 'esthetique';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'hcg-5000iu' AND c.slug = 'fertility-test-booster';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'mots-c' AND c.slug = 'fat-burner-mitochondrial';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'hgh-frag-176-191' AND c.slug = 'fat-burner-mitochondrial';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'tirzepatide' AND c.slug = 'fat-burner-mitochondrial';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'semaglutide' AND c.slug = 'fat-burner-mitochondrial';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'bpc-157' AND c.slug = 'recovery-repair';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'tb-500' AND c.slug = 'recovery-repair';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'dsip' AND c.slug = 'recovery-repair';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'oxytocin' AND c.slug = 'peptide-regulators-hormonal';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'ace-031' AND c.slug = 'peptide-regulators-hormonal';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'follistatin-344' AND c.slug = 'peptide-regulators-hormonal';