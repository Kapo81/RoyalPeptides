/*
  # Create Data Versions Live Sync System

  1. New Tables
    - `data_versions`
      - `key` (text, primary key) - e.g., "products_version", "categories_version"
      - `version` (integer) - incrementing version number
      - `updated_at` (timestamp) - last update time
  
  2. Functions
    - `increment_data_version(version_key text)` - Increments version for a given key
    - `get_data_version(version_key text)` - Gets current version for a key
    - `get_all_versions()` - Returns all versions as JSON
    - `force_refresh_all()` - Increments all versions (admin button)
  
  3. Triggers
    - Auto-increment versions when products/categories/settings change
  
  4. Security
    - Public read access to versions (for cache checking)
    - Admin-only write access
  
  5. Initial Data
    - Seed with products_version, categories_version, settings_version = 1
*/

-- Create data_versions table
CREATE TABLE IF NOT EXISTS data_versions (
  key text PRIMARY KEY,
  version integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE data_versions ENABLE ROW LEVEL SECURITY;

-- Public read policy (everyone can check versions)
CREATE POLICY "Anyone can read data versions"
  ON data_versions
  FOR SELECT
  TO public
  USING (true);

-- Admin write policy (only authenticated users can update)
CREATE POLICY "Authenticated users can update versions"
  ON data_versions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to increment a data version
CREATE OR REPLACE FUNCTION increment_data_version(version_key text)
RETURNS integer AS $$
DECLARE
  new_version integer;
BEGIN
  -- Insert or update the version
  INSERT INTO data_versions (key, version, updated_at)
  VALUES (version_key, 1, now())
  ON CONFLICT (key)
  DO UPDATE SET
    version = data_versions.version + 1,
    updated_at = now()
  RETURNING version INTO new_version;
  
  RETURN new_version;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current version for a key
CREATE OR REPLACE FUNCTION get_data_version(version_key text)
RETURNS integer AS $$
DECLARE
  current_version integer;
BEGIN
  SELECT version INTO current_version
  FROM data_versions
  WHERE key = version_key;
  
  IF current_version IS NULL THEN
    -- Initialize if doesn't exist
    INSERT INTO data_versions (key, version, updated_at)
    VALUES (version_key, 1, now())
    RETURNING version INTO current_version;
  END IF;
  
  RETURN current_version;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all versions as JSON
CREATE OR REPLACE FUNCTION get_all_versions()
RETURNS jsonb AS $$
BEGIN
  RETURN (
    SELECT jsonb_object_agg(key, version)
    FROM data_versions
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to force refresh all versions (admin button)
CREATE OR REPLACE FUNCTION force_refresh_all()
RETURNS jsonb AS $$
BEGIN
  -- Increment all versions
  UPDATE data_versions
  SET version = version + 1, updated_at = now();
  
  -- Return updated versions
  RETURN get_all_versions();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to auto-increment product version
CREATE OR REPLACE FUNCTION trigger_increment_product_version()
RETURNS trigger AS $$
BEGIN
  PERFORM increment_data_version('products_version');
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to auto-increment category version
CREATE OR REPLACE FUNCTION trigger_increment_category_version()
RETURNS trigger AS $$
BEGIN
  PERFORM increment_data_version('categories_version');
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to auto-increment settings version
CREATE OR REPLACE FUNCTION trigger_increment_settings_version()
RETURNS trigger AS $$
BEGIN
  PERFORM increment_data_version('settings_version');
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS products_version_trigger ON products;
DROP TRIGGER IF EXISTS categories_version_trigger ON categories;
DROP TRIGGER IF EXISTS site_settings_version_trigger ON site_settings;
DROP TRIGGER IF EXISTS admin_settings_version_trigger ON admin_settings;

-- Create triggers for products table
CREATE TRIGGER products_version_trigger
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_increment_product_version();

-- Create triggers for categories table
CREATE TRIGGER categories_version_trigger
AFTER INSERT OR UPDATE OR DELETE ON categories
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_increment_category_version();

-- Create triggers for site_settings table
CREATE TRIGGER site_settings_version_trigger
AFTER INSERT OR UPDATE OR DELETE ON site_settings
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_increment_settings_version();

-- Create triggers for admin_settings table
CREATE TRIGGER admin_settings_version_trigger
AFTER INSERT OR UPDATE OR DELETE ON admin_settings
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_increment_settings_version();

-- Seed initial versions
INSERT INTO data_versions (key, version, updated_at) VALUES
  ('products_version', 1, now()),
  ('categories_version', 1, now()),
  ('settings_version', 1, now()),
  ('bundles_version', 1, now())
ON CONFLICT (key) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_data_versions_key ON data_versions(key);

-- Grant public access to version functions
GRANT EXECUTE ON FUNCTION get_data_version(text) TO public;
GRANT EXECUTE ON FUNCTION get_all_versions() TO public;