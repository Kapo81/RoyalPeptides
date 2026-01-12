/*
  # Update Product Catalogue with New Peptides

  1. Changes
    - Clear existing products and categories
    - Add new focused product list with scientific descriptions
    - Update pricing for each product
    - Mark featured products

  2. New Products
    - BPC-157
    - TB-500
    - CJC-1295 + Ipamorelin
    - MK-677
    - Semaglutide
    - AOD-9604
    - IGF-1 LR3
    - Melanotan II
    - PT-141
    - Epitalon
*/

DELETE FROM product_categories;
DELETE FROM products;
DELETE FROM categories;

INSERT INTO categories (name, name_en, slug) VALUES
  ('Recovery & Repair', 'Recovery & Repair', 'recovery-repair'),
  ('Growth & Performance', 'Growth & Performance', 'growth-performance'),
  ('Metabolic & Weight', 'Metabolic & Weight', 'metabolic-weight'),
  ('Aesthetic & Wellness', 'Aesthetic & Wellness', 'aesthetic-wellness'),
  ('Longevity & Research', 'Longevity & Research', 'longevity-research');

INSERT INTO products (name, slug, description, purity, storage, price, featured) VALUES
  (
    'BPC-157',
    'bpc-157',
    'Peptide supporting tissue repair, recovery, and inflammation modulation.',
    '>98% research grade',
    'Store at -20°C. Protect from light.',
    149.99,
    true
  ),
  (
    'TB-500',
    'tb-500',
    'Supports recovery, mobility, and cellular regeneration.',
    '>98% research grade',
    'Store at -20°C. Protect from light.',
    179.99,
    true
  ),
  (
    'CJC-1295 + Ipamorelin',
    'cjc-1295-ipamorelin',
    'Blend promoting growth hormone release, recovery, sleep quality.',
    '>98% research grade',
    'Store at -20°C. Protect from light.',
    199.99,
    true
  ),
  (
    'MK-677',
    'mk-677',
    'Non-peptide GH secretagogue increasing GH/IGF-1 levels.',
    '>98% research grade',
    'Store at -20°C. Protect from light.',
    129.99,
    false
  ),
  (
    'Semaglutide',
    'semaglutide',
    'GLP-1 agonist supporting appetite control and metabolic balance.',
    '>98% research grade',
    'Store at 2-8°C. Protect from light.',
    249.99,
    true
  ),
  (
    'AOD-9604',
    'aod-9604',
    'Fat-metabolism fragment peptide supporting weight management.',
    '>98% research grade',
    'Store at -20°C. Protect from light.',
    159.99,
    false
  ),
  (
    'IGF-1 LR3',
    'igf-1-lr3',
    'Potent growth-factor analogue supporting muscle and performance.',
    '>98% research grade',
    'Store at -20°C. Protect from light.',
    189.99,
    false
  ),
  (
    'Melanotan II',
    'melanotan-2',
    'Peptide promoting melanogenesis and enhanced tanning response.',
    '>98% research grade',
    'Store at -20°C. Protect from light.',
    119.99,
    false
  ),
  (
    'PT-141',
    'pt-141',
    'Peptide supporting libido and sexual response.',
    '>98% research grade',
    'Store at -20°C. Protect from light.',
    139.99,
    false
  ),
  (
    'Epitalon',
    'epitalon',
    'Telomere-support peptide associated with longevity research.',
    '>98% research grade',
    'Store at -20°C. Protect from light.',
    169.99,
    true
  );

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE p.slug = 'bpc-157' AND c.slug = 'recovery-repair';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE p.slug = 'tb-500' AND c.slug = 'recovery-repair';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE p.slug = 'cjc-1295-ipamorelin' AND c.slug = 'growth-performance';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE p.slug = 'mk-677' AND c.slug = 'growth-performance';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE p.slug = 'semaglutide' AND c.slug = 'metabolic-weight';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE p.slug = 'aod-9604' AND c.slug = 'metabolic-weight';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE p.slug = 'igf-1-lr3' AND c.slug = 'growth-performance';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE p.slug = 'melanotan-2' AND c.slug = 'aesthetic-wellness';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE p.slug = 'pt-141' AND c.slug = 'aesthetic-wellness';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c
WHERE p.slug = 'epitalon' AND c.slug = 'longevity-research';