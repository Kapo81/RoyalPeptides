/*
  # Add Fixed Bundle Pricing

  1. Changes
    - Add `fixed_price` column to bundles table for premium psychological pricing
    - Update `get_all_bundles` function to prioritize fixed_price over calculated discount
    - Set fixed prices for all bundles following the pattern: ends in .99, divisible by 5 before .99

  2. Bundle Pricing
    - Cognitive Performance & Mood Stack: $234.99 (was ~$229.97 with 8% discount)
    - Joint & Tissue Recovery Stack: $254.99 (was ~$254.80 with 9% discount)
    - Metabolic Activation Stack: $284.99 (was ~$284.78 with 11% discount)
    - Sleep & Longevity Stack: $164.99 (was ~$161.99 with 10% discount)
    - Tanning & Libido Stack: $254.99 (was ~$252.99 with 8% discount)

  3. Notes
    - Fixed prices maintain similar margins as percentage-based discounts
    - All prices follow psychological pricing pattern: divisible by 5, ending in .99
    - Discounts still stored for reference but fixed_price takes precedence
*/

-- Add fixed_price column to bundles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bundles' AND column_name = 'fixed_price'
  ) THEN
    ALTER TABLE bundles ADD COLUMN fixed_price NUMERIC(10,2) DEFAULT NULL;
  END IF;
END $$;

-- Set fixed prices for all bundles
UPDATE bundles SET fixed_price = 234.99 WHERE slug = 'cognitive-performance-mood';
UPDATE bundles SET fixed_price = 254.99 WHERE slug = 'joint-tissue-recovery';
UPDATE bundles SET fixed_price = 284.99 WHERE slug = 'metabolic-activation';
UPDATE bundles SET fixed_price = 164.99 WHERE slug = 'sleep-longevity';
UPDATE bundles SET fixed_price = 254.99 WHERE slug = 'tanning-libido';

-- Update get_all_bundles function to use fixed_price
CREATE OR REPLACE FUNCTION get_all_bundles()
RETURNS TABLE (
  bundle_id uuid,
  bundle_name text,
  bundle_slug text,
  bundle_description text,
  discount_percentage numeric,
  image_url text,
  display_order int,
  products jsonb,
  total_price numeric,
  discounted_price numeric,
  savings numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.name,
    b.slug,
    b.description,
    b.discount_percentage,
    b.image_url,
    b.display_order,
    jsonb_agg(
      jsonb_build_object(
        'id', p.id,
        'name', p.name,
        'slug', p.slug,
        'price', COALESCE(p.price_cad, p.price),
        'quantity', bp.quantity,
        'image_url', p.image_url
      )
    ) as products,
    SUM(COALESCE(p.price_cad, p.price) * bp.quantity) as total_price,
    CASE 
      WHEN b.fixed_price IS NOT NULL THEN b.fixed_price
      ELSE ROUND(SUM(COALESCE(p.price_cad, p.price) * bp.quantity) * (1 - b.discount_percentage / 100), 2)
    END as discounted_price,
    CASE 
      WHEN b.fixed_price IS NOT NULL THEN SUM(COALESCE(p.price_cad, p.price) * bp.quantity) - b.fixed_price
      ELSE ROUND(SUM(COALESCE(p.price_cad, p.price) * bp.quantity) * (b.discount_percentage / 100), 2)
    END as savings
  FROM bundles b
  JOIN bundle_products bp ON bp.bundle_id = b.id
  JOIN products p ON p.id = bp.product_id
  WHERE b.is_active = true
  GROUP BY b.id, b.name, b.slug, b.description, b.discount_percentage, b.image_url, b.display_order, b.fixed_price
  ORDER BY b.display_order ASC, b.name ASC;
END;
$$ LANGUAGE plpgsql;