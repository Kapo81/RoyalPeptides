/*
  # Admin Authentication System
  
  1. New Tables
    - `admin_credentials`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `password_hash` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `admin_sessions`
      - `id` (uuid, primary key)
      - `session_token` (text, unique)
      - `admin_username` (text)
      - `expires_at` (timestamp)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on both tables
    - No public access (admin only via edge functions)
  
  3. Initial Data
    - Create default admin credentials (Royal4781 / Kilo5456**)
*/

-- Create admin_credentials table
CREATE TABLE IF NOT EXISTS admin_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admin_sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token text UNIQUE NOT NULL,
  admin_username text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- No public policies - only edge functions can access
-- This prevents any client-side access

-- Insert default admin credentials
-- Password: Kilo5456** (in production, this should be properly hashed)
INSERT INTO admin_credentials (username, password_hash)
VALUES ('Royal4781', 'Kilo5456**')
ON CONFLICT (username) DO NOTHING;

-- Create function to validate admin session
CREATE OR REPLACE FUNCTION validate_admin_session(token text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_sessions
    WHERE session_token = token
    AND expires_at > now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_admin_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM admin_sessions
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
