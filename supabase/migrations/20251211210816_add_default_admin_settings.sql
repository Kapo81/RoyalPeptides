/*
  # Add Default Admin Settings
  
  1. Updates
    - Insert default admin settings if none exist
    - Set standard shipping thresholds and costs
  
  2. Values
    - Business Name: Royal Peptides
    - Support Email: support@royalpeptides.com
    - Currency: CAD
    - Free Shipping Canada: $300
    - Free Shipping International: $500
    - Base Shipping Cost: $15
*/

-- Insert default settings only if table is empty
INSERT INTO admin_settings (
  business_name,
  support_email,
  currency,
  shipping_free_threshold_canada,
  shipping_free_threshold_international,
  shipping_base_cost
)
SELECT
  'Royal Peptides',
  'support@royalpeptides.com',
  'CAD',
  300.00,
  500.00,
  15.00
WHERE NOT EXISTS (
  SELECT 1 FROM admin_settings LIMIT 1
);
