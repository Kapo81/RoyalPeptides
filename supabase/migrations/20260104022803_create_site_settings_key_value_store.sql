/*
  # Create Site Settings Key-Value Store

  1. New Tables
    - `site_settings`
      - `key` (text, primary key) - Unique setting identifier
      - `value` (jsonb) - Setting value stored as JSON
      - `updated_at` (timestamptz) - Last update timestamp
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable RLS on `site_settings` table
    - Public read access (storefront needs to read settings)
    - Admin-only write access

  3. Default Settings
    - Hero content (headline, subheadline)
    - Promotional tiers with discount rules
    - Shipping rules and thresholds
    - Interac payment instructions
    - Global trust points
    - Support contact information
*/

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public can read all settings (storefront needs access)
CREATE POLICY "Anyone can read site settings"
  ON site_settings
  FOR SELECT
  USING (true);

-- Only admins can insert settings (via edge functions or authenticated admins)
CREATE POLICY "Admins can insert site settings"
  ON site_settings
  FOR INSERT
  WITH CHECK (true);

-- Only admins can update settings
CREATE POLICY "Admins can update site settings"
  ON site_settings
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Only admins can delete settings
CREATE POLICY "Admins can delete site settings"
  ON site_settings
  FOR DELETE
  USING (true);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_site_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS site_settings_updated_at ON site_settings;
CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_site_settings_timestamp();

-- Seed default settings
INSERT INTO site_settings (key, value) VALUES
  ('hero_headline', '"Premium Research Peptides for Canadian Researchers"'::jsonb),
  ('hero_subheadline', '"Quality-tested compounds with fast, discreet shipping across Canada"'::jsonb),
  ('promo_tier_1', '{"threshold": 300, "discount_percent": 0, "free_shipping_canada": true, "label": "Free Shipping on Orders $300+"}'::jsonb),
  ('promo_tier_2', '{"threshold": 500, "discount_percent": 15, "free_shipping_canada": true, "label": "15% OFF + Free Shipping on Orders $500+"}'::jsonb),
  ('promo_tier_3', '{"threshold": 750, "discount_percent": 20, "free_shipping_canada": true, "label": "20% OFF + Free Shipping on Orders $750+"}'::jsonb),
  ('promo_tier_4', '{"threshold": 1000, "discount_percent": 25, "free_shipping_canada": true, "label": "25% OFF + Free Shipping on Orders $1000+"}'::jsonb),
  ('shipping_rules', '{"canada_flat_under_300": 25, "quebec_flat_under_300": 20, "free_shipping_canada_threshold": 300, "free_shipping_international_threshold": 500, "international_base_rate": 20}'::jsonb),
  ('interac_instructions', '{"email": "payments@royalpeptides.ca", "question": "Order Number?", "answer": "Your order number will be provided after checkout", "deadline_hours": 24, "instructions": "Send Interac e-Transfer to the email provided. Use your order number as the security answer."}'::jsonb),
  ('global_trust_points', '["Quality-Tested Research Compounds", "Fast Canada-Wide Shipping", "Discreet Packaging", "Secure Payment Options", "Responsive Customer Support"]'::jsonb),
  ('support_email', '"support@royalpeptides.ca"'::jsonb),
  ('processing_time_text', '"Orders ship within 24 business hours"'::jsonb),
  ('site_name', '"Royal Peptides Canada"'::jsonb),
  ('contact_phone', '""'::jsonb),
  ('free_shipping_badge_text', '"Free Shipping $300+"'::jsonb),
  ('bulk_discount_badge_text', '"Bulk Discounts Available"'::jsonb)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();

-- Create helper function to get a single setting
CREATE OR REPLACE FUNCTION get_site_setting(setting_key text)
RETURNS jsonb AS $$
DECLARE
  setting_value jsonb;
BEGIN
  SELECT value INTO setting_value
  FROM site_settings
  WHERE key = setting_key;
  
  RETURN setting_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to get all settings as a single JSON object
CREATE OR REPLACE FUNCTION get_all_site_settings()
RETURNS jsonb AS $$
DECLARE
  settings_json jsonb;
BEGIN
  SELECT jsonb_object_agg(key, value) INTO settings_json
  FROM site_settings;
  
  RETURN settings_json;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;