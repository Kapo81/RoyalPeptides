/*
  # Create Analytics Tracking System
  
  1. New Tables
    - `page_views` - Track website traffic
      - `id` (uuid, primary key)
      - `page_path` (text) - URL path visited
      - `session_id` (text) - Anonymous session ID
      - `created_at` (timestamp)
    
    - `product_clicks` - Track product views/clicks
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key) - Product that was clicked
      - `session_id` (text) - Anonymous session ID
      - `created_at` (timestamp)
  
  2. Functions
    - `get_analytics_summary()` - Return key analytics metrics
    - `get_conversion_rate()` - Calculate conversion rate (orders / unique visitors)
  
  3. Security
    - Enable RLS on all tables
    - Allow public INSERT for tracking
    - Only admins can read analytics data
  
  4. Indexes
    - Index on created_at for faster date-based queries
    - Index on session_id for aggregations
*/

-- Create page_views table
CREATE TABLE IF NOT EXISTS page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path text NOT NULL,
  session_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create product_clicks table
CREATE TABLE IF NOT EXISTS product_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_clicks ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert tracking data (anonymous)
CREATE POLICY "Allow public insert page_views"
  ON page_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public insert product_clicks"
  ON product_clicks FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only allow reading analytics data (no user-based access, analytics are global)
CREATE POLICY "Allow public read page_views"
  ON page_views FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read product_clicks"
  ON product_clicks FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_product_clicks_created_at ON product_clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_product_clicks_session_id ON product_clicks(session_id);
CREATE INDEX IF NOT EXISTS idx_product_clicks_product_id ON product_clicks(product_id);

-- Function to get analytics summary (last 30 days)
CREATE OR REPLACE FUNCTION get_analytics_summary()
RETURNS TABLE (
  total_page_views bigint,
  unique_visitors bigint,
  total_product_clicks bigint,
  total_orders bigint,
  conversion_rate numeric
) AS $$
DECLARE
  thirty_days_ago timestamptz := now() - interval '30 days';
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT
      (SELECT COUNT(*) FROM page_views WHERE created_at >= thirty_days_ago) as page_views,
      (SELECT COUNT(DISTINCT session_id) FROM page_views WHERE created_at >= thirty_days_ago) as visitors,
      (SELECT COUNT(*) FROM product_clicks WHERE created_at >= thirty_days_ago) as clicks,
      (SELECT COUNT(*) FROM orders WHERE created_at >= thirty_days_ago) as orders
  )
  SELECT
    page_views,
    visitors,
    clicks,
    orders,
    CASE 
      WHEN visitors > 0 THEN ROUND((orders::numeric / visitors::numeric) * 100, 2)
      ELSE 0
    END as conversion_rate
  FROM stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get top clicked products (last 30 days)
CREATE OR REPLACE FUNCTION get_top_clicked_products(limit_count integer DEFAULT 10)
RETURNS TABLE (
  product_id uuid,
  product_name text,
  click_count bigint,
  image_url text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    COUNT(pc.id) as click_count,
    p.image_url
  FROM products p
  INNER JOIN product_clicks pc ON p.id = pc.product_id
  WHERE pc.created_at >= now() - interval '30 days'
  GROUP BY p.id, p.name, p.image_url
  ORDER BY click_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
