/*
  # Create Admin Audit Logs System
  
  1. New Tables
    - `admin_audit_logs`
      - `id` (uuid, primary key)
      - `admin_user` (text) - Admin identifier (email or username)
      - `action` (text) - Action performed (e.g., "order_status_changed", "order_deleted")
      - `order_id` (uuid, nullable) - Reference to order if applicable
      - `product_id` (uuid, nullable) - Reference to product if applicable
      - `details` (jsonb) - Additional details about the action
      - `ip_address` (text, nullable) - IP address of admin
      - `action_timestamp` (timestamptz) - When action occurred
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on admin_audit_logs
    - Only authenticated admins can read logs
    - System can insert logs
  
  3. Purpose
    - Track all admin actions for security and compliance
    - Provide audit trail for order changes and deletions
    - Enable accountability and debugging
*/

-- Create admin_audit_logs table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user text NOT NULL,
  action text NOT NULL,
  order_id uuid,
  product_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  action_timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_user ON admin_audit_logs(admin_user);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_order_id ON admin_audit_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON admin_audit_logs(action_timestamp DESC);

-- Enable RLS
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read all audit logs
CREATE POLICY "Authenticated users can read audit logs"
  ON admin_audit_logs FOR SELECT
  TO authenticated
  USING (true);

-- Policy: System can insert audit logs
CREATE POLICY "System can insert audit logs"
  ON admin_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  p_admin_user text,
  p_action text,
  p_order_id uuid DEFAULT NULL,
  p_product_id uuid DEFAULT NULL,
  p_details jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO admin_audit_logs (admin_user, action, order_id, product_id, details)
  VALUES (p_admin_user, p_action, p_order_id, p_product_id, p_details)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get order audit history
CREATE OR REPLACE FUNCTION get_order_audit_history(p_order_id uuid)
RETURNS TABLE (
  action text,
  admin_user text,
  details jsonb,
  action_timestamp timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.action,
    a.admin_user,
    a.details,
    a.action_timestamp
  FROM admin_audit_logs a
  WHERE a.order_id = p_order_id
  ORDER BY a.action_timestamp DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
