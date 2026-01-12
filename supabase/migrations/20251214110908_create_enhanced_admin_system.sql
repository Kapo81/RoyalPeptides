/*
  # Enhanced Admin System - Complete Infrastructure

  1. New Tables
    - `customers` - Customer profiles and history
    - `admin_activity_log` - Audit trail for all admin actions
    - `inventory_adjustments` - Stock adjustment history
    - `email_templates` - Customizable email templates
    - Enhanced `admin_settings` with new fields

  2. Features Added
    - Customer management
    - Activity logging
    - Inventory history tracking
    - Email template management
    - Inventory deduction settings (on paid vs shipped)
    - Stock alert thresholds

  3. Security
    - All tables have RLS enabled
    - Anonymous access allowed (admin auth at app level)
*/

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  total_orders integer DEFAULT 0,
  total_spent numeric DEFAULT 0,
  notes text DEFAULT '',
  tags text[] DEFAULT '{}'::text[]
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous access to customers"
  ON customers FOR ALL
  USING (true)
  WITH CHECK (true);

-- Admin activity log
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_username text NOT NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous access to admin_activity_log"
  ON admin_activity_log FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON admin_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_admin ON admin_activity_log(admin_username);

-- Inventory adjustments table
CREATE TABLE IF NOT EXISTS inventory_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  admin_username text NOT NULL,
  adjustment_type text NOT NULL,
  quantity_change integer NOT NULL,
  quantity_before integer NOT NULL,
  quantity_after integer NOT NULL,
  reason text NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE inventory_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous access to inventory_adjustments"
  ON inventory_adjustments FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_product ON inventory_adjustments(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_created ON inventory_adjustments(created_at DESC);

-- Email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key text UNIQUE NOT NULL,
  template_name text NOT NULL,
  subject text NOT NULL,
  body_html text NOT NULL,
  body_text text NOT NULL,
  variables text[] DEFAULT '{}'::text[],
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous access to email_templates"
  ON email_templates FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert default email templates
INSERT INTO email_templates (template_key, template_name, subject, body_html, body_text, variables)
VALUES 
  (
    'order_received',
    'Order Received',
    'Order Confirmation - {{order_number}}',
    '<h1>Thank you for your order!</h1><p>We have received your order <strong>{{order_number}}</strong>.</p><p>Total: ${{total}}</p><p>We will notify you once payment is confirmed and your order is being prepared.</p>',
    'Thank you for your order! We have received your order {{order_number}}. Total: ${{total}}. We will notify you once payment is confirmed and your order is being prepared.',
    ARRAY['order_number', 'total', 'customer_name']
  ),
  (
    'payment_confirmed',
    'Payment Confirmed',
    'Payment Confirmed - Order {{order_number}}',
    '<h1>Payment Confirmed</h1><p>Your payment for order <strong>{{order_number}}</strong> has been confirmed.</p><p>We are now preparing your shipment. You will receive tracking information once your order ships.</p>',
    'Payment Confirmed. Your payment for order {{order_number}} has been confirmed. We are now preparing your shipment.',
    ARRAY['order_number', 'customer_name']
  ),
  (
    'order_shipped',
    'Order Shipped',
    'Your Order Has Shipped - {{order_number}}',
    '<h1>Your Order Has Shipped!</h1><p>Order <strong>{{order_number}}</strong> has been shipped.</p><p><strong>Tracking Information:</strong></p><p>Carrier: {{carrier}}</p><p>Tracking Number: {{tracking_number}}</p>',
    'Your Order Has Shipped! Order {{order_number}} has been shipped. Carrier: {{carrier}}. Tracking Number: {{tracking_number}}.',
    ARRAY['order_number', 'carrier', 'tracking_number', 'customer_name']
  )
ON CONFLICT (template_key) DO NOTHING;

-- Enhanced admin settings
DO $$ 
BEGIN
  -- Add new columns to admin_settings if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_settings' AND column_name = 'inventory_deduction_trigger') THEN
    ALTER TABLE admin_settings ADD COLUMN inventory_deduction_trigger text DEFAULT 'paid';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_settings' AND column_name = 'low_stock_threshold') THEN
    ALTER TABLE admin_settings ADD COLUMN low_stock_threshold integer DEFAULT 5;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_settings' AND column_name = 'session_timeout_minutes') THEN
    ALTER TABLE admin_settings ADD COLUMN session_timeout_minutes integer DEFAULT 240;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_settings' AND column_name = 'enable_activity_log') THEN
    ALTER TABLE admin_settings ADD COLUMN enable_activity_log boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_settings' AND column_name = 'tax_enabled') THEN
    ALTER TABLE admin_settings ADD COLUMN tax_enabled boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_settings' AND column_name = 'tax_rate_percent') THEN
    ALTER TABLE admin_settings ADD COLUMN tax_rate_percent numeric DEFAULT 13.0;
  END IF;
END $$;

-- Update existing admin_settings record
UPDATE admin_settings 
SET 
  inventory_deduction_trigger = 'paid',
  low_stock_threshold = 5,
  session_timeout_minutes = 240,
  enable_activity_log = true
WHERE id = (SELECT id FROM admin_settings LIMIT 1);

-- Function to log admin activity
CREATE OR REPLACE FUNCTION log_admin_activity(
  p_admin_username text,
  p_action text,
  p_entity_type text DEFAULT NULL,
  p_entity_id uuid DEFAULT NULL,
  p_details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO admin_activity_log (admin_username, action, entity_type, entity_id, details)
  VALUES (p_admin_username, p_action, p_entity_type, p_entity_id, p_details);
END;
$$;

-- Function to track inventory adjustments
CREATE OR REPLACE FUNCTION record_inventory_adjustment(
  p_product_id uuid,
  p_admin_username text,
  p_adjustment_type text,
  p_quantity_change integer,
  p_reason text,
  p_notes text DEFAULT ''
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_qty_before integer;
  v_qty_after integer;
BEGIN
  -- Get current quantity
  SELECT qty_in_stock INTO v_qty_before FROM products WHERE id = p_product_id;
  
  -- Calculate new quantity
  v_qty_after := v_qty_before + p_quantity_change;
  
  -- Update product quantity
  UPDATE products SET qty_in_stock = v_qty_after WHERE id = p_product_id;
  
  -- Record adjustment
  INSERT INTO inventory_adjustments (
    product_id, admin_username, adjustment_type, quantity_change,
    quantity_before, quantity_after, reason, notes
  ) VALUES (
    p_product_id, p_admin_username, p_adjustment_type, p_quantity_change,
    v_qty_before, v_qty_after, p_reason, p_notes
  );
END;
$$;

-- Function to get customer order history
CREATE OR REPLACE FUNCTION get_customer_orders(p_email text)
RETURNS TABLE (
  order_id uuid,
  order_number text,
  created_at timestamptz,
  total numeric,
  payment_status text,
  fulfillment_status text
)
LANGUAGE sql
AS $$
  SELECT id, order_number, created_at, total, payment_status, fulfillment_status
  FROM orders
  WHERE customer_email = p_email
  ORDER BY created_at DESC;
$$;

-- Function to update customer totals
CREATE OR REPLACE FUNCTION update_customer_totals()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update or insert customer record
  INSERT INTO customers (email, first_name, last_name, phone)
  VALUES (NEW.customer_email, NEW.customer_first_name, NEW.customer_last_name, NEW.customer_phone)
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    updated_at = now();
  
  -- Update totals
  UPDATE customers SET
    total_orders = (SELECT COUNT(*) FROM orders WHERE customer_email = NEW.customer_email AND payment_status = 'paid'),
    total_spent = (SELECT COALESCE(SUM(total), 0) FROM orders WHERE customer_email = NEW.customer_email AND payment_status = 'paid')
  WHERE email = NEW.customer_email;
  
  RETURN NEW;
END;
$$;

-- Trigger to update customer totals on order changes
DROP TRIGGER IF EXISTS trigger_update_customer_totals ON orders;
CREATE TRIGGER trigger_update_customer_totals
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_totals();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_created ON customers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
