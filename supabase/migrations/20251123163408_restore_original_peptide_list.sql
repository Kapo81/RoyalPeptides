/*
  # Restore Original Peptide List

  1. Changes
    - Clear existing products and categories
    - Add original 20+ peptide list
    - Add original categories
    - Set pricing for all products

  2. Products
    - BPC-157
    - TB-500 (Thymosin Beta-4)
    - Ipamorelin
    - CJC-1295 (DAC)
    - CJC-1295 (No DAC)
    - GHRP-2
    - GHRP-6
    - Hexarelin
    - Sermorelin
    - Tesamorelin
    - IGF-1 LR3
    - IGF-1 DES
    - HGH Fragment 176-191
    - AOD-9604
    - Melanotan II
    - PT-141 (Bremelanotide)
    - Selank
    - Semax
    - Epithalon
    - GHK-Cu
    - Thymosin Alpha-1
    - LL-37
    - Gonadorelin
    - Kisspeptin-10
*/

DELETE FROM product_categories;
DELETE FROM products;
DELETE FROM categories;

INSERT INTO categories (name, name_en, slug) VALUES
  ('Growth Hormone', 'Growth Hormone', 'growth-hormone'),
  ('Recovery & Healing', 'Recovery & Healing', 'recovery-healing'),
  ('Peptide Hormones', 'Peptide Hormones', 'peptide-hormones'),
  ('Aesthetic', 'Aesthetic', 'aesthetic'),
  ('Cognitive', 'Cognitive', 'cognitive'),
  ('Immune Support', 'Immune Support', 'immune-support');

INSERT INTO products (name, slug, description, purity, storage, price, featured) VALUES
  ('BPC-157', 'bpc-157', 'Body Protection Compound promotes healing of muscles, tendons, and ligaments.', '>98%', '-20°C', 49.99, true),
  ('TB-500 (Thymosin Beta-4)', 'tb-500', 'Promotes healing, new blood vessel development, and reduces inflammation.', '>98%', '-20°C', 69.99, true),
  ('Ipamorelin', 'ipamorelin', 'Selective growth hormone secretagogue with minimal side effects.', '>98%', '-20°C', 39.99, false),
  ('CJC-1295 (DAC)', 'cjc-1295-dac', 'Long-acting GHRH analog for sustained GH release.', '>98%', '-20°C', 54.99, false),
  ('CJC-1295 (No DAC)', 'cjc-1295-no-dac', 'Modified GHRH for pulsatile GH release.', '>98%', '-20°C', 44.99, false),
  ('GHRP-2', 'ghrp-2', 'Growth hormone releasing peptide with moderate ghrelin activity.', '>98%', '-20°C', 34.99, false),
  ('GHRP-6', 'ghrp-6', 'Potent GH releaser with appetite stimulation effects.', '>98%', '-20°C', 34.99, false),
  ('Hexarelin', 'hexarelin', 'Powerful growth hormone secretagogue and cardioprotective peptide.', '>98%', '-20°C', 44.99, false),
  ('Sermorelin', 'sermorelin', 'GHRH analog for natural growth hormone production.', '>98%', '-20°C', 39.99, false),
  ('Tesamorelin', 'tesamorelin', 'Synthetic GHRH for reducing visceral adipose tissue.', '>98%', '-20°C', 89.99, false),
  ('IGF-1 LR3', 'igf-1-lr3', 'Long-acting insulin-like growth factor for muscle growth.', '>98%', '-20°C', 79.99, true),
  ('IGF-1 DES', 'igf-1-des', 'Potent, localized IGF-1 variant for muscle development.', '>98%', '-20°C', 74.99, false),
  ('HGH Fragment 176-191', 'hgh-fragment-176-191', 'Fat loss fragment of human growth hormone.', '>98%', '-20°C', 44.99, false),
  ('AOD-9604', 'aod-9604', 'Modified HGH fragment for fat metabolism.', '>98%', '-20°C', 49.99, false),
  ('Melanotan II', 'melanotan-ii', 'Synthetic peptide for tanning and appetite suppression.', '>98%', '-20°C', 34.99, false),
  ('PT-141 (Bremelanotide)', 'pt-141', 'Melanocortin receptor agonist for sexual dysfunction.', '>98%', '-20°C', 44.99, false),
  ('Selank', 'selank', 'Anxiolytic peptide for stress and cognitive enhancement.', '>98%', '-20°C', 39.99, false),
  ('Semax', 'semax', 'Nootropic peptide for cognitive function and neuroprotection.', '>98%', '-20°C', 39.99, true),
  ('Epithalon', 'epithalon', 'Telomerase activator peptide for longevity and anti-aging.', '>98%', '-20°C', 54.99, true),
  ('GHK-Cu', 'ghk-cu', 'Copper peptide for skin regeneration and anti-aging.', '>98%', '-20°C', 44.99, false),
  ('Thymosin Alpha-1', 'thymosin-alpha-1', 'Immune-modulating peptide for enhanced immune function.', '>98%', '-20°C', 64.99, false),
  ('LL-37', 'll-37', 'Antimicrobial peptide with immune support properties.', '>98%', '-20°C', 59.99, false),
  ('Gonadorelin', 'gonadorelin', 'GnRH analog for natural testosterone production.', '>98%', '-20°C', 39.99, false),
  ('Kisspeptin-10', 'kisspeptin-10', 'Peptide hormone for reproductive health and hormone balance.', '>98%', '-20°C', 49.99, false);

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'bpc-157' AND c.slug = 'recovery-healing';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'tb-500' AND c.slug = 'recovery-healing';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'ipamorelin' AND c.slug = 'growth-hormone';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'cjc-1295-dac' AND c.slug = 'growth-hormone';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'cjc-1295-no-dac' AND c.slug = 'growth-hormone';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'ghrp-2' AND c.slug = 'growth-hormone';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'ghrp-6' AND c.slug = 'growth-hormone';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'hexarelin' AND c.slug = 'growth-hormone';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'sermorelin' AND c.slug = 'growth-hormone';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'tesamorelin' AND c.slug = 'growth-hormone';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'igf-1-lr3' AND c.slug = 'growth-hormone';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'igf-1-des' AND c.slug = 'growth-hormone';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'hgh-fragment-176-191' AND c.slug = 'growth-hormone';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'aod-9604' AND c.slug = 'growth-hormone';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'melanotan-ii' AND c.slug = 'aesthetic';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'pt-141' AND c.slug = 'peptide-hormones';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'selank' AND c.slug = 'cognitive';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'semax' AND c.slug = 'cognitive';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'epithalon' AND c.slug = 'recovery-healing';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'ghk-cu' AND c.slug = 'aesthetic';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'thymosin-alpha-1' AND c.slug = 'immune-support';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'll-37' AND c.slug = 'immune-support';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'gonadorelin' AND c.slug = 'peptide-hormones';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'kisspeptin-10' AND c.slug = 'peptide-hormones';