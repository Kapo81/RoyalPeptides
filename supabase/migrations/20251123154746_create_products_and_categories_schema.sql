/*
  # Create Products and Categories Schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `name_en` (text)
      - `slug` (text, unique)
      - `created_at` (timestamptz)
    
    - `products`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `slug` (text, unique)
      - `description` (text)
      - `purity` (text)
      - `storage` (text)
      - `created_at` (timestamptz)
    
    - `product_categories`
      - `product_id` (uuid, foreign key)
      - `category_id` (uuid, foreign key)
      - Primary key on (product_id, category_id)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access (research catalog is public)
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  name_en text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  purity text DEFAULT '>98% research grade',
  storage text DEFAULT 'Store at -20°C. Protect from light.',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_categories (
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Product categories are viewable by everyone"
  ON product_categories FOR SELECT
  TO anon
  USING (true);