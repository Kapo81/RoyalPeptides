/*
  # Seed Bundle Stacks

  1. Inserts predefined bundles
    - Joint & Tissue Recovery Stack
    - Metabolic Activation Stack
    - Cognitive Performance & Mood Stack
    - Sleep & Longevity Stack
    - Tanning & Libido Stack

  2. Links products to bundles
    - Uses product slugs to find and link products
*/

-- Insert bundles
INSERT INTO bundles (name, slug, description, discount_percentage, is_active, display_order) VALUES
(
  'Joint & Tissue Recovery Stack',
  'joint-tissue-recovery',
  'Stack designed for accelerated recovery, soft tissue support, and intense training blocks. Ideal for athletes and active individuals.',
  15,
  true,
  1
),
(
  'Metabolic Activation Stack',
  'metabolic-activation',
  'For users focused on body composition, fat-loss phases, and metabolic activation. Supports enhanced energy expenditure.',
  15,
  true,
  2
),
(
  'Cognitive Performance & Mood Stack',
  'cognitive-performance-mood',
  'For focus, stress management and social ease — a nootropic & mood support combo. Perfect for mental clarity.',
  15,
  true,
  3
),
(
  'Sleep & Longevity Stack',
  'sleep-longevity',
  'Sleep-oriented and anti-aging research stack for deep rest and long-term optimization. Supports recovery and cellular health.',
  15,
  true,
  4
),
(
  'Tanning & Libido Stack',
  'tanning-libido',
  'For tanning protocols and libido support in a single, cost-effective combo. Popular for cosmetic and wellness research.',
  12,
  true,
  5
)
ON CONFLICT (slug) DO NOTHING;

-- Link products to Joint & Tissue Recovery Stack
DO $$
DECLARE
  v_bundle_id uuid;
  v_product_id uuid;
BEGIN
  SELECT id INTO v_bundle_id FROM bundles WHERE slug = 'joint-tissue-recovery';
  
  IF v_bundle_id IS NOT NULL THEN
    -- BPC-157
    SELECT id INTO v_product_id FROM products WHERE slug = 'bpc-157' LIMIT 1;
    IF v_product_id IS NOT NULL THEN
      INSERT INTO bundle_products (bundle_id, product_id, quantity)
      VALUES (v_bundle_id, v_product_id, 1)
      ON CONFLICT (bundle_id, product_id) DO NOTHING;
    END IF;

    -- TB-500
    SELECT id INTO v_product_id FROM products WHERE slug = 'tb-500' LIMIT 1;
    IF v_product_id IS NOT NULL THEN
      INSERT INTO bundle_products (bundle_id, product_id, quantity)
      VALUES (v_bundle_id, v_product_id, 1)
      ON CONFLICT (bundle_id, product_id) DO NOTHING;
    END IF;

    -- PEG-MGF
    SELECT id INTO v_product_id FROM products WHERE slug = 'peg-mgf' LIMIT 1;
    IF v_product_id IS NOT NULL THEN
      INSERT INTO bundle_products (bundle_id, product_id, quantity)
      VALUES (v_bundle_id, v_product_id, 1)
      ON CONFLICT (bundle_id, product_id) DO NOTHING;
    END IF;
  END IF;
END $$;

-- Link products to Metabolic Activation Stack
DO $$
DECLARE
  v_bundle_id uuid;
  v_product_id uuid;
BEGIN
  SELECT id INTO v_bundle_id FROM bundles WHERE slug = 'metabolic-activation';
  
  IF v_bundle_id IS NOT NULL THEN
    -- HGH Frag 176-191
    SELECT id INTO v_product_id FROM products WHERE slug LIKE '%frag%176%' OR slug LIKE '%fragment%176%' LIMIT 1;
    IF v_product_id IS NOT NULL THEN
      INSERT INTO bundle_products (bundle_id, product_id, quantity)
      VALUES (v_bundle_id, v_product_id, 1)
      ON CONFLICT (bundle_id, product_id) DO NOTHING;
    END IF;

    -- SLU-PP-332
    SELECT id INTO v_product_id FROM products WHERE slug LIKE '%slu-pp%' OR name ILIKE '%slu-pp%' LIMIT 1;
    IF v_product_id IS NOT NULL THEN
      INSERT INTO bundle_products (bundle_id, product_id, quantity)
      VALUES (v_bundle_id, v_product_id, 1)
      ON CONFLICT (bundle_id, product_id) DO NOTHING;
    END IF;

    -- MOTS-C
    SELECT id INTO v_product_id FROM products WHERE slug LIKE '%mots%' OR name ILIKE '%mots%' LIMIT 1;
    IF v_product_id IS NOT NULL THEN
      INSERT INTO bundle_products (bundle_id, product_id, quantity)
      VALUES (v_bundle_id, v_product_id, 1)
      ON CONFLICT (bundle_id, product_id) DO NOTHING;
    END IF;
  END IF;
END $$;

-- Link products to Cognitive Performance & Mood Stack
DO $$
DECLARE
  v_bundle_id uuid;
  v_product_id uuid;
BEGIN
  SELECT id INTO v_bundle_id FROM bundles WHERE slug = 'cognitive-performance-mood';
  
  IF v_bundle_id IS NOT NULL THEN
    -- Semax
    SELECT id INTO v_product_id FROM products WHERE slug LIKE '%semax%' AND slug NOT LIKE '%selank%' LIMIT 1;
    IF v_product_id IS NOT NULL THEN
      INSERT INTO bundle_products (bundle_id, product_id, quantity)
      VALUES (v_bundle_id, v_product_id, 1)
      ON CONFLICT (bundle_id, product_id) DO NOTHING;
    END IF;

    -- Selank
    SELECT id INTO v_product_id FROM products WHERE slug LIKE '%selank%' LIMIT 1;
    IF v_product_id IS NOT NULL THEN
      INSERT INTO bundle_products (bundle_id, product_id, quantity)
      VALUES (v_bundle_id, v_product_id, 1)
      ON CONFLICT (bundle_id, product_id) DO NOTHING;
    END IF;

    -- Oxytocin
    SELECT id INTO v_product_id FROM products WHERE slug LIKE '%oxytocin%' LIMIT 1;
    IF v_product_id IS NOT NULL THEN
      INSERT INTO bundle_products (bundle_id, product_id, quantity)
      VALUES (v_bundle_id, v_product_id, 1)
      ON CONFLICT (bundle_id, product_id) DO NOTHING;
    END IF;
  END IF;
END $$;

-- Link products to Sleep & Longevity Stack
DO $$
DECLARE
  v_bundle_id uuid;
  v_product_id uuid;
BEGIN
  SELECT id INTO v_bundle_id FROM bundles WHERE slug = 'sleep-longevity';
  
  IF v_bundle_id IS NOT NULL THEN
    -- DSIP
    SELECT id INTO v_product_id FROM products WHERE slug LIKE '%dsip%' OR name ILIKE '%dsip%' LIMIT 1;
    IF v_product_id IS NOT NULL THEN
      INSERT INTO bundle_products (bundle_id, product_id, quantity)
      VALUES (v_bundle_id, v_product_id, 1)
      ON CONFLICT (bundle_id, product_id) DO NOTHING;
    END IF;

    -- Epitalon
    SELECT id INTO v_product_id FROM products WHERE slug LIKE '%epitalon%' OR slug LIKE '%epithalon%' LIMIT 1;
    IF v_product_id IS NOT NULL THEN
      INSERT INTO bundle_products (bundle_id, product_id, quantity)
      VALUES (v_bundle_id, v_product_id, 1)
      ON CONFLICT (bundle_id, product_id) DO NOTHING;
    END IF;
  END IF;
END $$;

-- Link products to Tanning & Libido Stack
DO $$
DECLARE
  v_bundle_id uuid;
  v_product_id uuid;
BEGIN
  SELECT id INTO v_bundle_id FROM bundles WHERE slug = 'tanning-libido';
  
  IF v_bundle_id IS NOT NULL THEN
    -- Melanotan II
    SELECT id INTO v_product_id FROM products WHERE slug LIKE '%melanotan%ii%' OR slug LIKE '%melanotan-2%' OR name ILIKE '%melanotan ii%' LIMIT 1;
    IF v_product_id IS NOT NULL THEN
      INSERT INTO bundle_products (bundle_id, product_id, quantity)
      VALUES (v_bundle_id, v_product_id, 1)
      ON CONFLICT (bundle_id, product_id) DO NOTHING;
    END IF;

    -- PT-141
    SELECT id INTO v_product_id FROM products WHERE slug LIKE '%pt-141%' OR slug LIKE '%pt141%' OR name ILIKE '%pt-141%' LIMIT 1;
    IF v_product_id IS NOT NULL THEN
      INSERT INTO bundle_products (bundle_id, product_id, quantity)
      VALUES (v_bundle_id, v_product_id, 1)
      ON CONFLICT (bundle_id, product_id) DO NOTHING;
    END IF;

    -- HCG (optional)
    SELECT id INTO v_product_id FROM products WHERE slug LIKE '%hcg%' AND slug NOT LIKE '%hgh%' LIMIT 1;
    IF v_product_id IS NOT NULL THEN
      INSERT INTO bundle_products (bundle_id, product_id, quantity)
      VALUES (v_bundle_id, v_product_id, 1)
      ON CONFLICT (bundle_id, product_id) DO NOTHING;
    END IF;
  END IF;
END $$;
