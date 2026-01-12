/*
  # Add Stock Deduction and Analytics Tracking

  1. New Features
    - Automatic stock deduction when orders are created
    - Track total units sold per product
    - Website analytics tracking (page views, product views)
    - Real-time activity tracking

  2. New Tables
    - `analytics_events`
      - Tracks all website events (page views, product views, add to cart)
      - Includes timestamp, event type, user session, and metadata
    
  3. Triggers
    - Automatically deduct stock when order_items are created
    - Update total_sold count for products

  4. Security
    - Analytics can be inserted by anyone (for tracking)
    - Only admins can view analytics data
    - Stock deduction happens automatically via triggers
*/

-- Add total_sold column to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'total_sold'
  ) THEN
    ALTER TABLE products ADD COLUMN total_sold integer DEFAULT 0;
  END IF;
END $$;

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  session_id text,
  product_id uuid REFERENCES products(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert analytics events (for tracking)
CREATE POLICY "Anyone can insert analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (true);

-- Only admins can read analytics
CREATE POLICY "Admins can read analytics"
  ON analytics_events FOR SELECT
  TO authenticated
  USING (is_admin());

-- Create index for analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_product_id ON analytics_events(product_id);

-- Function to deduct stock when order items are created
CREATE OR REPLACE FUNCTION deduct_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET 
    stock_quantity = GREATEST(stock_quantity - NEW.quantity, 0),
    total_sold = total_sold + NEW.quantity
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically deduct stock
DROP TRIGGER IF EXISTS trigger_deduct_stock ON order_items;
CREATE TRIGGER trigger_deduct_stock
  AFTER INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION deduct_product_stock();

-- Function to get analytics summary
CREATE OR REPLACE FUNCTION get_analytics_summary(days_back integer DEFAULT 30)
RETURNS TABLE (
  total_visitors bigint,
  total_page_views bigint,
  total_product_views bigint,
  total_add_to_carts bigint,
  top_products jsonb
) AS $$
BEGIN
  RETURN QUERY
  WITH event_counts AS (
    SELECT
      COUNT(DISTINCT session_id) as visitors,
      COUNT(*) FILTER (WHERE event_type = 'page_view') as page_views,
      COUNT(*) FILTER (WHERE event_type = 'product_view') as product_views,
      COUNT(*) FILTER (WHERE event_type = 'add_to_cart') as add_to_carts
    FROM analytics_events
    WHERE created_at >= now() - (days_back || ' days')::interval
  ),
  top_prods AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'product_id', p.id,
        'product_name', p.name,
        'view_count', view_count
      )
    ) as products
    FROM (
      SELECT 
        product_id,
        COUNT(*) as view_count
      FROM analytics_events
      WHERE event_type = 'product_view'
        AND created_at >= now() - (days_back || ' days')::interval
        AND product_id IS NOT NULL
      GROUP BY product_id
      ORDER BY view_count DESC
      LIMIT 10
    ) views
    JOIN products p ON p.id = views.product_id
  )
  SELECT 
    ec.visitors,
    ec.page_views,
    ec.product_views,
    ec.add_to_carts,
    COALESCE(tp.products, '[]'::jsonb)
  FROM event_counts ec
  CROSS JOIN top_prods tp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
