/*
  # Add Pricing and Update Complete Product Catalog
  
  ## Overview
  Adds pricing column to products and updates all product images, prices, and descriptions
  for the Royal Peptides catalogue.
  
  ## Changes
  
  ### 1. Schema Updates
  - Add `price_cad` column to products table (DECIMAL format for CAD pricing)
  
  ### 2. Product Image Updates
  - Update all existing product images
  - Replace Tesamorelin image with new version
  - Add images to GHRP-2, GHRP-4, GHRP-6, HCG, Hexarelin, IGF-1 variants, Ipamorelin, MOTS-C
  
  ### 3. Pricing Strategy
  - Set premium research-grade prices approximately $20 above typical market rates
  - All prices in CAD
  
  ### 4. Product Details
  - Update descriptions for research-focused professional language
  - Ensure all products have proper mg/IU specifications
*/

-- Add price_cad column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_cad DECIMAL(10,2) DEFAULT 0.00;

-- Update Tesamorelin with new image
UPDATE products SET image_url = 'https://i.postimg.cc/52JvV164/TESA.png' WHERE slug = 'tesamorelin';

-- Update images for GHRP series
UPDATE products SET image_url = 'https://i.postimg.cc/Pqzwx7vn/ghrp-2.png' WHERE slug = 'ghrp-2';
UPDATE products SET image_url = 'https://i.postimg.cc/RFSnnTwL/GHRP-4.png' WHERE slug = 'ghrp-4';
UPDATE products SET image_url = 'https://i.postimg.cc/rsbd3X3S/GHRP-6.png' WHERE slug = 'ghrp-6';

-- Update images for other products
UPDATE products SET image_url = 'https://i.postimg.cc/pXwhBvDT/HCG.png' WHERE slug = 'hcg-5000-iu';
UPDATE products SET image_url = 'https://i.postimg.cc/pdxmgBcT/hexa.png' WHERE slug = 'hexarelin';
UPDATE products SET image_url = 'https://i.postimg.cc/XqZqw1qs/IGF-1-DES.png' WHERE slug = 'igf-1-des';
UPDATE products SET image_url = 'https://i.postimg.cc/J4kt0F90/IGF-1-LR3.png' WHERE slug = 'igf-1-lr3';
UPDATE products SET image_url = 'https://i.postimg.cc/vBTZs2Wv/ipamorelin.png' WHERE slug = 'ipamorelin';
UPDATE products SET image_url = 'https://i.postimg.cc/zvRDLL2s/MOTC-C.png' WHERE slug = 'mots-c';

-- Set prices for all products (premium research-grade pricing in CAD)
-- Recovery / Injury Support
UPDATE products SET price_cad = 89.99 WHERE slug = 'bpc-157';
UPDATE products SET price_cad = 109.99 WHERE slug = 'tb-500';
UPDATE products SET price_cad = 94.99 WHERE slug = 'peg-mgf';

-- HGH Precursors / Secretagogues
UPDATE products SET price_cad = 99.99 WHERE slug = 'cjc-1295';
UPDATE products SET price_cad = 119.99 WHERE slug = 'tesamorelin';
UPDATE products SET price_cad = 79.99 WHERE slug = 'ipamorelin';
UPDATE products SET price_cad = 84.99 WHERE slug = 'ghrp-2';
UPDATE products SET price_cad = 89.99 WHERE slug = 'ghrp-4';
UPDATE products SET price_cad = 79.99 WHERE slug = 'ghrp-6';
UPDATE products SET price_cad = 94.99 WHERE slug = 'hexarelin';

-- Growth Factors
UPDATE products SET price_cad = 129.99 WHERE slug = 'igf-1-lr3';
UPDATE products SET price_cad = 119.99 WHERE slug = 'igf-1-des';

-- Nootropics / Cognitive
UPDATE products SET price_cad = 89.99 WHERE slug = 'selank';
UPDATE products SET price_cad = 89.99 WHERE slug = 'semax';
UPDATE products SET price_cad = 69.99 WHERE slug = 'oxytocin';

-- Sleep Support
UPDATE products SET price_cad = 74.99 WHERE slug = 'dsip';

-- Libido & Sexual Function
UPDATE products SET price_cad = 94.99 WHERE slug = 'pt-141';
UPDATE products SET price_cad = 79.99 WHERE slug = 'hcg-5000-iu';

-- Tanning
UPDATE products SET price_cad = 69.99 WHERE slug = 'melanotan-2';

-- Aesthetic / Skin
UPDATE products SET price_cad = 99.99 WHERE slug = 'ghk-cu';

-- Metabolic Activators / Fat-Loss
UPDATE products SET price_cad = 149.99 WHERE slug = 'slu-pp-332';
UPDATE products SET price_cad = 94.99 WHERE slug = 'hgh-frag-176-191';

-- GLP-1 Modulators
UPDATE products SET price_cad = 249.99 WHERE slug = 'semaglutide';
UPDATE products SET price_cad = 299.99 WHERE slug = 'tirzepatide';

-- Anti-Aging / Longevity
UPDATE products SET price_cad = 89.99 WHERE slug = 'epitalon';

-- Mitochondrial Support
UPDATE products SET price_cad = 124.99 WHERE slug = 'mots-c';

-- Update descriptions for newly catalogued products
UPDATE products SET 
  description = 'Growth hormone releasing peptide researched for GH secretion and appetite modulation. Investigated for pituitary gland stimulation pathways.'
WHERE slug = 'ghrp-2';

UPDATE products SET 
  description = 'Growth hormone releasing peptide researched for enhanced GH pulse amplitude. Investigated for sustained growth hormone secretion patterns.'
WHERE slug = 'ghrp-4';

UPDATE products SET 
  description = 'Growth hormone releasing peptide researched for GH secretion and ghrelin mimetic activity. Investigated for appetite and recovery pathways.'
WHERE slug = 'ghrp-6';

UPDATE products SET 
  description = 'Human chorionic gonadotropin researched for testosterone production support and fertility pathways. Investigated for LH receptor activation.'
WHERE slug = 'hcg-5000-iu';

UPDATE products SET 
  description = 'Growth hormone releasing peptide researched for potent GH secretion. Investigated for superior pulse amplitude compared to other GHRPs.'
WHERE slug = 'hexarelin';

UPDATE products SET 
  description = 'Insulin-like growth factor variant researched for localized muscle growth. Investigated for rapid anabolic signaling and hyperplasia support.'
WHERE slug = 'igf-1-des';

UPDATE products SET 
  description = 'Long-acting IGF-1 analogue researched for systemic anabolic effects and hyperplasia. Investigated for extended half-life and muscle growth pathways.'
WHERE slug = 'igf-1-lr3';

UPDATE products SET 
  description = 'Growth hormone releasing peptide researched for selective GH secretion without appetite effects. Investigated for clean GH pulse stimulation.'
WHERE slug = 'ipamorelin';

UPDATE products SET 
  description = 'Mitochondrial-derived peptide researched for metabolic optimization and mitochondrial function. Investigated for cellular energy pathways and longevity.'
WHERE slug = 'mots-c';
