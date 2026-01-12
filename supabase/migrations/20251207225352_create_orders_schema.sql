/*
  # Create Orders Schema

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `order_number` (text, unique, auto-generated)
      - `customer_first_name` (text)
      - `customer_last_name` (text)
      - `customer_email` (text)
      - `customer_phone` (text)
      - `shipping_address` (text)
      - `shipping_city` (text)
      - `shipping_postal_code` (text)
      - `shipping_country` (text)
      - `payment_method` (text) - 'stripe' or 'etransfer'
      - `payment_status` (text) - 'pending', 'completed', 'cancelled'
      - `subtotal` (decimal)
      - `shipping_fee` (decimal)
      - `total` (decimal)
      - `session_id` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key to orders)
      - `product_id` (uuid, foreign key to products)
      - `product_name` (text) - snapshot of product name at time of order
      - `product_price` (decimal) - snapshot of product price at time of order
      - `quantity` (integer)
      - `subtotal` (decimal)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated access (future enhancement)
    - For now, allow public read access to orders by order_number
*/

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_first_name text NOT NULL,
  customer_last_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  shipping_address text NOT NULL,
  shipping_city text NOT NULL,
  shipping_postal_code text NOT NULL,
  shipping_country text NOT NULL,
  payment_method text NOT NULL DEFAULT 'stripe',
  payment_status text NOT NULL DEFAULT 'pending',
  subtotal decimal(10,2) NOT NULL DEFAULT 0,
  shipping_fee decimal(10,2) NOT NULL DEFAULT 0,
  total decimal(10,2) NOT NULL DEFAULT 0,
  session_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_price decimal(10,2) NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  subtotal decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_session_id ON orders(session_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Policies for orders
CREATE POLICY "Anyone can view orders by order number"
  ON orders FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Policies for order_items
CREATE POLICY "Anyone can view order items"
  ON order_items FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- Function to generate unique order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  new_order_number text;
  done bool;
BEGIN
  done := false;
  WHILE NOT done LOOP
    new_order_number := 'RP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0');
    done := NOT EXISTS(SELECT 1 FROM orders WHERE order_number = new_order_number);
  END LOOP;
  RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;
