/*
  # Fix Admin Analytics and Inventory RPC Functions
  
  1. Updates
    - Fix `get_analytics_summary` to return correct field names matching frontend
    - Add missing fields: checkout_starts, orders_completed, conversion_rate
    - Change field names to match frontend expectations:
      - total_visitors → total_visits
      - total_product_views → product_clicks
      - total_add_to_carts → add_to_cart_events
  
  2. Purpose
    - Ensure AdminAnalytics page displays data correctly
    - Fix blank screen issue on analytics page
*/

-- Drop and recreate the analytics summary function with correct return fields
DROP FUNCTION IF EXISTS get_analytics_summary(integer);

CREATE OR REPLACE FUNCTION get_analytics_summary(days_back integer DEFAULT 30)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  total_sessions bigint;
  total_views bigint;
  total_clicks bigint;
  total_add_to_cart bigint;
  total_checkouts bigint;
  total_orders bigint;
  conv_rate numeric;
  top_prods jsonb;
BEGIN
  -- Get event counts
  SELECT
    COUNT(DISTINCT session_id),
    COUNT(*) FILTER (WHERE event_type = 'page_view'),
    COUNT(*) FILTER (WHERE event_type = 'product_click'),
    COUNT(*) FILTER (WHERE event_type = 'add_to_cart'),
    COUNT(*) FILTER (WHERE event_type = 'checkout_start'),
    COUNT(*) FILTER (WHERE event_type = 'order_complete')
  INTO
    total_sessions,
    total_views,
    total_clicks,
    total_add_to_cart,
    total_checkouts,
    total_orders
  FROM analytics_events
  WHERE created_at >= now() - (days_back || ' days')::interval;
  
  -- Calculate conversion rate
  IF total_sessions > 0 THEN
    conv_rate := ROUND((total_orders::numeric / total_sessions::numeric) * 100, 2);
  ELSE
    conv_rate := 0;
  END IF;
  
  -- Get top products
  SELECT jsonb_agg(
    jsonb_build_object(
      'product_name', product_name,
      'clicks', click_count
    ) ORDER BY click_count DESC
  )
  INTO top_prods
  FROM (
    SELECT 
      product_name,
      COUNT(*) as click_count
    FROM analytics_events
    WHERE event_type IN ('product_click', 'product_view')
      AND product_name IS NOT NULL
      AND created_at >= now() - (days_back || ' days')::interval
    GROUP BY product_name
    ORDER BY click_count DESC
    LIMIT 10
  ) t;
  
  -- Build result object
  result := jsonb_build_object(
    'total_visits', COALESCE(total_sessions, 0),
    'total_page_views', COALESCE(total_views, 0),
    'product_clicks', COALESCE(total_clicks, 0),
    'add_to_cart_events', COALESCE(total_add_to_cart, 0),
    'checkout_starts', COALESCE(total_checkouts, 0),
    'orders_completed', COALESCE(total_orders, 0),
    'conversion_rate', COALESCE(conv_rate, 0),
    'top_products', COALESCE(top_prods, '[]'::jsonb)
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;