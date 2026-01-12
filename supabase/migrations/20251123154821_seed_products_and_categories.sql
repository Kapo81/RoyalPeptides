/*
  # Seed Products and Categories Data

  1. Categories
    - Précurseurs GH (GH Precursors)
    - Amplificateurs (GH Amplifiers)
    - Esthétique (Aesthetic)
    - Fertility & Testosterone Boosters
    - Fat Burner / Mitochondrial / Metabolic

  2. Products
    - All 20 peptide products listed

  3. Product-Category relationships
*/

INSERT INTO categories (name, name_en, slug) VALUES
  ('Précurseurs GH', 'GH Precursors', 'gh-precursors'),
  ('Amplificateurs', 'GH Amplifiers', 'gh-amplifiers'),
  ('Esthétique', 'Aesthetic', 'aesthetic'),
  ('Fertility & Testosterone', 'Fertility & Testosterone Boosters', 'fertility-testosterone'),
  ('Fat Burner / Métabolique', 'Fat Burner / Mitochondrial / Metabolic', 'fat-burner-metabolic')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, purity, storage) VALUES
  ('HCG 5000IU', 'hcg-5000iu', 'Human Chorionic Gonadotropin for fertility and testosterone research', '>98% research grade', 'Store at 2-8°C. Protect from light.'),
  ('CJC-1295', 'cjc-1295', 'Growth hormone releasing hormone analog for peptide research', '>98% research grade', 'Store at -20°C. Protect from light.'),
  ('Melanotan 2', 'melanotan-2', 'Synthetic peptide for melanogenesis research', '>98% research grade', 'Store at -20°C. Protect from light.'),
  ('ACE-031', 'ace-031', 'Myostatin inhibitor for muscle growth research', '>98% research grade', 'Store at -20°C. Protect from light.'),
  ('DSIP', 'dsip', 'Delta sleep-inducing peptide for sleep research', '>98% research grade', 'Store at -20°C. Protect from light.'),
  ('Tirzepatide', 'tirzepatide', 'Dual GIP/GLP-1 receptor agonist for metabolic research', '>98% research grade', 'Store at 2-8°C. Protect from light.'),
  ('Follistatin 344', 'follistatin-344', 'Myostatin antagonist for muscle research', '>98% research grade', 'Store at -20°C. Protect from light.'),
  ('GHK-Cu', 'ghk-cu', 'Copper peptide for tissue repair and aesthetic research', '>98% research grade', 'Store at -20°C. Protect from light.'),
  ('Hexarelin', 'hexarelin', 'Growth hormone secretagogue for GH research', '>98% research grade', 'Store at -20°C. Protect from light.'),
  ('PEG-MGF', 'peg-mgf', 'Pegylated mechano growth factor for muscle research', '>98% research grade', 'Store at -20°C. Protect from light.'),
  ('IGF-1 LR3', 'igf-1-lr3', 'Long-acting insulin-like growth factor for research', '>98% research grade', 'Store at -20°C. Protect from light.'),
  ('CJC-1295 DAC', 'cjc-1295-dac', 'Extended release GHRH analog for peptide research', '>98% research grade', 'Store at -20°C. Protect from light.'),
  ('Semaglutide', 'semaglutide', 'GLP-1 receptor agonist for metabolic research', '>98% research grade', 'Store at 2-8°C. Protect from light.'),
  ('Oxytocin', 'oxytocin', 'Peptide hormone for behavioral research', '>98% research grade', 'Store at -20°C. Protect from light.'),
  ('BPC-157', 'bpc-157', 'Body protection compound for healing research', '>98% research grade', 'Store at -20°C. Protect from light.'),
  ('GHRP-6', 'ghrp-6', 'Growth hormone releasing peptide for GH research', '>98% research grade', 'Store at -20°C. Protect from light.'),
  ('GHRP-2', 'ghrp-2', 'Growth hormone releasing peptide for GH research', '>98% research grade', 'Store at -20°C. Protect from light.'),
  ('TB-500', 'tb-500', 'Thymosin Beta-4 fragment for tissue repair research', '>98% research grade', 'Store at -20°C. Protect from light.'),
  ('Ipamorelin', 'ipamorelin', 'Selective growth hormone secretagogue for GH research', '>98% research grade', 'Store at -20°C. Protect from light.'),
  ('HGH Frag 176-191', 'hgh-frag-176-191', 'Growth hormone fragment for fat metabolism research', '>98% research grade', 'Store at -20°C. Protect from light.'),
  ('MOTS-C', 'mots-c', 'Mitochondrial peptide for metabolic research', '>98% research grade', 'Store at -20°C. Protect from light.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE p.slug = 'ghrp-2' AND c.slug = 'gh-precursors'
ON CONFLICT DO NOTHING;

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE p.slug = 'ghrp-6' AND c.slug = 'gh-precursors'
ON CONFLICT DO NOTHING;

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE p.slug = 'hexarelin' AND c.slug = 'gh-precursors'
ON CONFLICT DO NOTHING;

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE p.slug = 'ipamorelin' AND c.slug = 'gh-precursors'
ON CONFLICT DO NOTHING;

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE p.slug = 'cjc-1295' AND c.slug = 'gh-amplifiers'
ON CONFLICT DO NOTHING;

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE p.slug = 'cjc-1295-dac' AND c.slug = 'gh-amplifiers'
ON CONFLICT DO NOTHING;

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE p.slug = 'melanotan-2' AND c.slug = 'aesthetic'
ON CONFLICT DO NOTHING;

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE p.slug = 'ghk-cu' AND c.slug = 'aesthetic'
ON CONFLICT DO NOTHING;

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE p.slug = 'tb-500' AND c.slug = 'aesthetic'
ON CONFLICT DO NOTHING;

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE p.slug = 'bpc-157' AND c.slug = 'aesthetic'
ON CONFLICT DO NOTHING;

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE p.slug = 'hcg-5000iu' AND c.slug = 'fertility-testosterone'
ON CONFLICT DO NOTHING;

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE p.slug = 'mots-c' AND c.slug = 'fat-burner-metabolic'
ON CONFLICT DO NOTHING;

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE p.slug = 'hgh-frag-176-191' AND c.slug = 'fat-burner-metabolic'
ON CONFLICT DO NOTHING;

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE p.slug = 'tirzepatide' AND c.slug = 'fat-burner-metabolic'
ON CONFLICT DO NOTHING;

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE p.slug = 'semaglutide' AND c.slug = 'fat-burner-metabolic'
ON CONFLICT DO NOTHING;