/*
  # Update Product Images and Add Tanning Category
  
  ## Overview
  Updates all product images with specific vial renders, corrects Tesamorelin dosage,
  and creates Tanning category for Melanotan II.
  
  ## Changes
  
  ### 1. Product Image Updates
  - BPC-157: Add vial image
  - TB-500: Add vial image
  - PEG-MGF: Add vial image
  - CJC-1295: Add vial image
  - Tesamorelin: Add vial image and correct dosage to 5mg
  - DSIP: Add vial image
  - GHK-Cu: Replace with new vial image
  - HGH Frag 176-191: Add vial image
  - Semaglutide: Add vial image
  - Tirzepatide: Add vial image
  - SLU-PP-332: Add vial image
  - Melanotan II: Add vial image
  - Oxytocin: Add vial image
  - Selank: Add vial image
  - Semax: Add vial image
  - PT-141: Add vial image
  - Epitalon: Add vial image
  
  ### 2. Category Updates
  - Create "Tanning / Pigmentation" category
  - Assign Melanotan II to Tanning category
  
  ### 3. Dosage Corrections
  - Tesamorelin: Update from 2mg to 5mg
*/

-- Update product images
UPDATE products SET image_url = 'https://i.postimg.cc/Tw4JcSdy/BPC-157-(1).png' WHERE slug = 'bpc-157';
UPDATE products SET image_url = 'https://i.postimg.cc/mkSM55Rn/TB-500.png' WHERE slug = 'tb-500';
UPDATE products SET image_url = 'https://i.postimg.cc/8cdBVCd3/PEG-MGF.png' WHERE slug = 'peg-mgf';
UPDATE products SET image_url = 'https://i.postimg.cc/rFSY8Vy7/cjc-vrais.png' WHERE slug = 'cjc-1295';
UPDATE products SET 
  image_url = 'https://i.postimg.cc/PfbmJPZL/TESAMORELIN.png',
  dosage = '5 mg'
WHERE slug = 'tesamorelin';
UPDATE products SET image_url = 'https://i.postimg.cc/13s7XkfG/DSIP.png' WHERE slug = 'dsip';
UPDATE products SET image_url = 'https://i.postimg.cc/DZ9BTD9h/GHK-CU.png' WHERE slug = 'ghk-cu';
UPDATE products SET image_url = 'https://i.postimg.cc/zvTpX7Nd/hgh-frag191.png' WHERE slug = 'hgh-frag-176-191';
UPDATE products SET image_url = 'https://i.postimg.cc/kggNkq26/SEMAGLUTIDE.png' WHERE slug = 'semaglutide';
UPDATE products SET image_url = 'https://i.postimg.cc/KvZtMxr9/Tirzapetide.png' WHERE slug = 'tirzepatide';
UPDATE products SET image_url = 'https://i.postimg.cc/cHwfQJbb/slu-pp-332.png' WHERE slug = 'slu-pp-332';
UPDATE products SET image_url = 'https://i.postimg.cc/HsCBvq0t/MELANOTAN-II.png' WHERE slug = 'melanotan-2';
UPDATE products SET image_url = 'https://i.postimg.cc/wBPkXZTF/OXYTOCIN.png' WHERE slug = 'oxytocin';
UPDATE products SET image_url = 'https://i.postimg.cc/FsZgW7Hm/selank.png' WHERE slug = 'selank';
UPDATE products SET image_url = 'https://i.postimg.cc/fb3cRCjJ/SEMAX.png' WHERE slug = 'semax';
UPDATE products SET image_url = 'https://i.postimg.cc/kX9vvx9T/PT-141.png' WHERE slug = 'pt-141';
UPDATE products SET image_url = 'https://i.postimg.cc/W18Wk5kK/EPITALOn.png' WHERE slug = 'epitalon';

-- Create Tanning / Pigmentation category
INSERT INTO categories (id, name, name_en, slug, description, created_at)
SELECT 
  gen_random_uuid(),
  'Tanning / Pigmentation',
  'Tanning / Pigmentation',
  'tanning-pigmentation',
  'Peptides researched for melanogenesis stimulation and tanning response',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE slug = 'tanning-pigmentation'
);

-- Assign Melanotan II to Tanning category
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM products p
CROSS JOIN categories c
WHERE p.slug = 'melanotan-2'
AND c.slug = 'tanning-pigmentation'
AND NOT EXISTS (
  SELECT 1 FROM product_categories pc2
  WHERE pc2.product_id = p.id AND pc2.category_id = c.id
);

-- Update product descriptions for consistency
UPDATE products SET 
  description = 'Peptide studied for tissue repair, tendon support and recovery optimization. Researched for accelerated wound healing and gastrointestinal protection.'
WHERE slug = 'bpc-157';

UPDATE products SET 
  description = 'Thymosin beta-4 analogue researched for enhanced recovery and soft-tissue healing. Investigated for injury recovery mechanisms and tissue regeneration.'
WHERE slug = 'tb-500';

UPDATE products SET 
  description = 'Mechano growth factor analogue studied for localized muscle repair and recovery. Researched for satellite cell activation following mechanical stress.'
WHERE slug = 'peg-mgf';

UPDATE products SET 
  description = 'GHRH analogue researched for pulse-based growth hormone release. Investigated for endogenous GH secretion and anabolic effects.'
WHERE slug = 'cjc-1295';

UPDATE products SET 
  description = 'GHRH peptide studied for targeted growth hormone secretion and body composition. Researched for visceral adipose tissue reduction.'
WHERE slug = 'tesamorelin';

UPDATE products SET 
  description = 'Delta Sleep-Inducing Peptide researched for sleep architecture and stress modulation. Investigated for circadian rhythm regulation.'
WHERE slug = 'dsip';

UPDATE products SET 
  description = 'Copper peptide studied for skin appearance, collagen support and rejuvenation. Researched for wound healing and tissue remodeling.'
WHERE slug = 'ghk-cu';

UPDATE products SET 
  description = 'Fragment peptide researched for fat-metabolism and body-composition pathways. Investigated for lipolytic activity without affecting insulin sensitivity.'
WHERE slug = 'hgh-frag-176-191';

UPDATE products SET 
  description = 'GLP-1 analogue studied for appetite control and glucose regulation. Researched for satiety pathways and weight management.'
WHERE slug = 'semaglutide';

UPDATE products SET 
  description = 'Dual-path peptide researched for metabolic balance and weight management. Investigated for enhanced incretin co-agonist synergy.'
WHERE slug = 'tirzepatide';

UPDATE products SET 
  description = 'Experimental metabolic activator studied for energy expenditure and fat-burning pathways. Researched for mitochondrial function enhancement.'
WHERE slug = 'slu-pp-332';

UPDATE products SET 
  description = 'Peptide researched for stimulation of melanogenesis and tanning response. Investigated for melanocortin receptor activation.'
WHERE slug = 'melanotan-2';

UPDATE products SET 
  description = 'Neuropeptide studied for social bonding, trust signaling and emotional response. Researched for anxiolytic-like effects and mood regulation.'
WHERE slug = 'oxytocin';

UPDATE products SET 
  description = 'Peptide researched for focus, stress modulation and cognitive performance. Investigated for anxiolytic-like effects without sedation.'
WHERE slug = 'selank';

UPDATE products SET 
  description = 'Peptide analogue studied for neuroprotection, focus and mental clarity. Researched for cognitive enhancement and BDNF modulation.'
WHERE slug = 'semax';

UPDATE products SET 
  description = 'Melanocortin peptide researched for sexual function and libido support. Investigated for central nervous system activation pathways.'
WHERE slug = 'pt-141';

UPDATE products SET 
  description = 'Tetrapeptide studied in relation to telomeres, aging processes and cellular longevity. Researched for telomerase activation and anti-aging mechanisms.'
WHERE slug = 'epitalon';
