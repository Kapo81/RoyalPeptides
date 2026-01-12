/*
  # Add Product Images and Update Data

  1. Changes
    - Add image_url column to products table
    - Update products with actual image URLs
    - Update product descriptions for research context
    - Ensure all 6 featured products have their images

  2. Products with Images
    - HCG 5000 IU: https://i.postimg.cc/JhysMW4L/HCG.png
    - DSIP: https://i.postimg.cc/SKzxH7V1/DSIp-2-Modifie.png
    - ACE-031: https://i.postimg.cc/rsqy06cq/ace031.png
    - CJC-1295: https://i.postimg.cc/c1cLqJMd/cjc-1.png
    - BPC-157: https://i.postimg.cc/Y9HMZcvG/BPC-(2).png
    - IGF-1 LR3: https://i.postimg.cc/5NR11QHx/IGF-1-(2).png
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE products ADD COLUMN image_url text;
  END IF;
END $$;

UPDATE products SET image_url = 'https://i.postimg.cc/JhysMW4L/HCG.png'
WHERE slug = 'hcg-5000iu';

UPDATE products SET image_url = 'https://i.postimg.cc/SKzxH7V1/DSIp-2-Modifie.png'
WHERE slug = 'dsip';

UPDATE products SET image_url = 'https://i.postimg.cc/rsqy06cq/ace031.png'
WHERE slug = 'ace-031';

UPDATE products SET image_url = 'https://i.postimg.cc/c1cLqJMd/cjc-1.png'
WHERE slug = 'cjc-1295';

UPDATE products SET image_url = 'https://i.postimg.cc/Y9HMZcvG/BPC-(2).png'
WHERE slug = 'bpc-157';

UPDATE products SET image_url = 'https://i.postimg.cc/5NR11QHx/IGF-1-(2).png'
WHERE slug = 'igf-1-lr3';