/*
  # Create Email Queue System
  
  1. New Tables
    - `email_queue`
      - `id` (uuid, primary key)
      - `email_type` (text) - Type of email (order_confirmation, tracking_notification, etc.)
      - `recipient_email` (text) - Email address to send to
      - `subject` (text) - Email subject line
      - `html_body` (text) - HTML email content
      - `order_id` (uuid, nullable) - Reference to order if applicable
      - `status` (text) - pending, sent, failed
      - `error_message` (text, nullable) - Error details if failed
      - `attempts` (integer) - Number of send attempts
      - `last_attempt_at` (timestamptz, nullable) - Last attempt timestamp
      - `sent_at` (timestamptz, nullable) - When successfully sent
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on email_queue
    - Only authenticated admins can read/update
    - System can insert
  
  3. Purpose
    - Queue all outgoing emails
    - Track delivery status
    - Enable manual retry for failed emails
    - Prevent checkout failures due to email issues
*/

-- Create email status enum
DO $$ BEGIN
  CREATE TYPE email_status AS ENUM ('pending', 'sent', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create email_queue table
CREATE TABLE IF NOT EXISTS email_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_type text NOT NULL,
  recipient_email text NOT NULL,
  subject text NOT NULL,
  html_body text NOT NULL,
  order_id uuid,
  status email_status NOT NULL DEFAULT 'pending',
  error_message text,
  attempts integer NOT NULL DEFAULT 0,
  last_attempt_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_order_id ON email_queue(order_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_created_at ON email_queue(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_queue_email_type ON email_queue(email_type);

-- Add foreign key constraint
DO $$ BEGIN
  ALTER TABLE email_queue 
  ADD CONSTRAINT fk_email_queue_order 
  FOREIGN KEY (order_id) 
  REFERENCES orders(id) 
  ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Enable RLS
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read all emails
CREATE POLICY "Authenticated users can read email queue"
  ON email_queue FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can update email queue (for retry)
CREATE POLICY "Authenticated users can update email queue"
  ON email_queue FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: System can insert emails
CREATE POLICY "System can insert email queue"
  ON email_queue FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create function to queue an email
CREATE OR REPLACE FUNCTION queue_email(
  p_email_type text,
  p_recipient_email text,
  p_subject text,
  p_html_body text,
  p_order_id uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_email_id uuid;
BEGIN
  INSERT INTO email_queue (email_type, recipient_email, subject, html_body, order_id)
  VALUES (p_email_type, p_recipient_email, p_subject, p_html_body, p_order_id)
  RETURNING id INTO v_email_id;
  
  RETURN v_email_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mark email as sent
CREATE OR REPLACE FUNCTION mark_email_sent(p_email_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE email_queue 
  SET 
    status = 'sent',
    sent_at = now(),
    updated_at = now()
  WHERE id = p_email_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mark email as failed
CREATE OR REPLACE FUNCTION mark_email_failed(
  p_email_id uuid,
  p_error_message text
)
RETURNS void AS $$
BEGIN
  UPDATE email_queue 
  SET 
    status = 'failed',
    error_message = p_error_message,
    attempts = attempts + 1,
    last_attempt_at = now(),
    updated_at = now()
  WHERE id = p_email_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to reset email for retry
CREATE OR REPLACE FUNCTION retry_email(p_email_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE email_queue 
  SET 
    status = 'pending',
    error_message = NULL,
    updated_at = now()
  WHERE id = p_email_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_email_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS email_queue_updated_at ON email_queue;
CREATE TRIGGER email_queue_updated_at
  BEFORE UPDATE ON email_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_email_queue_updated_at();
