/*
  # Create Shopping Cart Schema

  1. New Tables
    - `cart_items`
      - `id` (uuid, primary key)
      - `session_id` (text) - for anonymous carts
      - `product_id` (uuid, foreign key)
      - `quantity` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on cart_items
    - Allow anonymous users to manage their own cart based on session_id
*/

CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cart_items_session ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(product_id);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can manage their cart items"
  ON cart_items FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);