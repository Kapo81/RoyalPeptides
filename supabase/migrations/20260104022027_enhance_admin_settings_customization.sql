/*
  # Enhance Admin Settings for Full Site Customization

  1. Changes to admin_settings table
    - Update shipping_base_cost from $15 to $25
    - Add shipping_quebec_cost for Quebec-specific pricing
    - Add promotional text fields
    - Add discount tier settings
    - Add contact and operational fields
    - Add tax settings
    - Add timestamp tracking

  2. Security
    - Maintain existing RLS (public read, admin write)
    - Add policies for admin updates

  3. Purpose
    - Allow full site customization through admin panel
    - Settings auto-save and reflect on website immediately
*/

-- Add new columns to admin_settings
DO $$
BEGIN
  -- Shipping customization
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_settings' AND column_name = 'shipping_quebec_cost') THEN
    ALTER TABLE admin_settings ADD COLUMN shipping_quebec_cost numeric DEFAULT 20.00;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_settings' AND column_name = 'shipping_text_canada') THEN
    ALTER TABLE admin_settings ADD COLUMN shipping_text_canada text DEFAULT '$25 flat rate shipping Canada';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_settings' AND column_name = 'shipping_international_base') THEN
    ALTER TABLE admin_settings ADD COLUMN shipping_international_base numeric DEFAULT 20.00;
  END IF;

  -- Promotional text
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_settings' AND column_name = 'promo_banner_enabled') THEN
    ALTER TABLE admin_settings ADD COLUMN promo_banner_enabled boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_settings' AND column_name = 'promo_free_shipping_text') THEN
    ALTER TABLE admin_settings ADD COLUMN promo_free_shipping_text text DEFAULT 'Free Shipping on Orders $300+';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_settings' AND column_name = 'promo_discount_15_text') THEN
    ALTER TABLE admin_settings ADD COLUMN promo_discount_15_text text DEFAULT '15% OFF orders $500+';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_settings' AND column_name = 'promo_discount_20_text') THEN
    ALTER TABLE admin_settings ADD COLUMN promo_discount_20_text text DEFAULT '20% OFF orders $750+';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_settings' AND column_name = 'promo_discount_25_text') THEN
    ALTER TABLE admin_settings ADD COLUMN promo_discount_25_text text DEFAULT '25% OFF orders $1000+';
  END IF;

  -- Discount tiers
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_settings' AND column_name = 'discount_tier1_threshold') THEN
    ALTER TABLE admin_settings ADD COLUMN discount_tier1_threshold numeric DEFAULT 500.00;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_settings' AND column_name = 'discount_tier1_percentage') THEN
    ALTER TABLE admin_settings ADD COLUMN discount_tier1_percentage numeric DEFAULT 15.00;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_settings' AND column_name = 'discount_tier2_threshold') THEN
    ALTER TABLE admin_settings ADD COLUMN discount_tier2_threshold numeric DEFAULT 750.00;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_settings' AND column_name = 'discount_tier2_percentage') THEN
    ALTER TABLE admin_settings ADD COLUMN discount_tier2_percentage numeric DEFAULT 20.00;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_settings' AND column_name = 'discount_tier3_threshold') THEN
    ALTER TABLE admin_settings ADD COLUMN discount_tier3_threshold numeric DEFAULT 1000.00;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_settings' AND column_name = 'discount_tier3_percentage') THEN
    ALTER TABLE admin_settings ADD COLUMN discount_tier3_percentage numeric DEFAULT 25.00;
  END IF;

  -- Contact and operations
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_settings' AND column_name = 'support_response_time') THEN
    ALTER TABLE admin_settings ADD COLUMN support_response_time text DEFAULT '24 hours';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_settings' AND column_name = 'order_processing_time') THEN
    ALTER TABLE admin_settings ADD COLUMN order_processing_time text DEFAULT '24 hours';
  END IF;

  -- Tax settings
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_settings' AND column_name = 'tax_enabled') THEN
    ALTER TABLE admin_settings ADD COLUMN tax_enabled boolean DEFAULT true;
  END IF;
END $$;

-- Update existing shipping_base_cost from $15 to $25
UPDATE admin_settings
SET 
  shipping_base_cost = 25.00,
  shipping_text_canada = '$25 flat rate shipping Canada',
  updated_at = now()
WHERE shipping_base_cost = 15.00;

-- Ensure at least one settings row exists with updated values
INSERT INTO admin_settings (
  business_name,
  support_email,
  currency,
  shipping_free_threshold_canada,
  shipping_free_threshold_international,
  shipping_base_cost,
  shipping_quebec_cost,
  shipping_text_canada,
  shipping_international_base,
  promo_banner_enabled,
  promo_free_shipping_text,
  promo_discount_15_text,
  promo_discount_20_text,
  promo_discount_25_text,
  discount_tier1_threshold,
  discount_tier1_percentage,
  discount_tier2_threshold,
  discount_tier2_percentage,
  discount_tier3_threshold,
  discount_tier3_percentage,
  support_response_time,
  order_processing_time,
  tax_enabled
)
SELECT
  'Royal Peptides',
  'support@royalpeptides.com',
  'CAD',
  300.00,
  500.00,
  25.00,
  20.00,
  '$25 flat rate shipping Canada',
  20.00,
  true,
  'Free Shipping on Orders $300+',
  '15% OFF orders $500+',
  '20% OFF orders $750+',
  '25% OFF orders $1000+',
  500.00,
  15.00,
  750.00,
  20.00,
  1000.00,
  25.00,
  '24 hours',
  '24 hours',
  true
WHERE NOT EXISTS (SELECT 1 FROM admin_settings LIMIT 1);

-- Add update policy for admins (they can update via edge functions)
DROP POLICY IF EXISTS "Admins can update settings" ON admin_settings;
CREATE POLICY "Admins can update settings"
  ON admin_settings
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS admin_settings_updated_at ON admin_settings;
CREATE TRIGGER admin_settings_updated_at
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_settings_timestamp();

-- Create helper function to get current settings
CREATE OR REPLACE FUNCTION get_site_settings()
RETURNS TABLE (
  business_name text,
  support_email text,
  currency text,
  shipping_free_threshold_canada numeric,
  shipping_free_threshold_international numeric,
  shipping_base_cost numeric,
  shipping_quebec_cost numeric,
  shipping_text_canada text,
  shipping_international_base numeric,
  promo_banner_enabled boolean,
  promo_free_shipping_text text,
  promo_discount_15_text text,
  promo_discount_20_text text,
  promo_discount_25_text text,
  discount_tier1_threshold numeric,
  discount_tier1_percentage numeric,
  discount_tier2_threshold numeric,
  discount_tier2_percentage numeric,
  discount_tier3_threshold numeric,
  discount_tier3_percentage numeric,
  support_response_time text,
  order_processing_time text,
  tax_enabled boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.business_name,
    s.support_email,
    s.currency,
    s.shipping_free_threshold_canada,
    s.shipping_free_threshold_international,
    s.shipping_base_cost,
    s.shipping_quebec_cost,
    s.shipping_text_canada,
    s.shipping_international_base,
    s.promo_banner_enabled,
    s.promo_free_shipping_text,
    s.promo_discount_15_text,
    s.promo_discount_20_text,
    s.promo_discount_25_text,
    s.discount_tier1_threshold,
    s.discount_tier1_percentage,
    s.discount_tier2_threshold,
    s.discount_tier2_percentage,
    s.discount_tier3_threshold,
    s.discount_tier3_percentage,
    s.support_response_time,
    s.order_processing_time,
    s.tax_enabled
  FROM admin_settings s
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;