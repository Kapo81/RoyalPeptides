/*
  # Add Benefits Summary Column to Products

  ## Overview
  Adds a dedicated benefits_summary column to store structured benefits information
  for display on product detail pages.

  ## Changes
  1. Add benefits_summary text column to products table
  2. Update all existing products with extracted benefits from descriptions
  3. Benefits are stored as bullet-pointed text for easy rendering

  ## Notes
  - Benefits are extracted from existing product descriptions
  - Formatted as clean bullet points for frontend display
*/

-- Add benefits_summary column
ALTER TABLE products ADD COLUMN IF NOT EXISTS benefits_summary text;

-- Update products with extracted benefits
UPDATE products SET benefits_summary = '• Enhanced muscle cell proliferation and hyperplasia
• Improved nitrogen retention and protein synthesis
• Accelerated recovery between training sessions
• Increased nutrient partitioning for lean mass development'
WHERE slug = 'igf-1-lr3';

UPDATE products SET benefits_summary = '• Accelerated muscle repair post-exercise
• Enhanced satellite cell activation for growth
• Improved tissue regeneration capacity
• Synergistic effects with other growth factors'
WHERE slug = 'peg-mgf';

UPDATE products SET benefits_summary = '• Rapid muscle fiber repair after damage
• Satellite cell proliferation and activation
• Enhanced recovery post-exercise
• Localized growth factor effects at injection site'
WHERE slug = 'mgf';

UPDATE products SET benefits_summary = '• Increased natural growth hormone production
• Improved body composition and lean mass
• Enhanced recovery and sleep quality
• Synergistic effects when combined with GHRP peptides'
WHERE slug = 'cjc-1295';

UPDATE products SET benefits_summary = '• Reduction in visceral abdominal fat
• Improved lipid profiles and cardiovascular health
• Enhanced cognitive function and mental clarity
• Natural GH secretion without receptor desensitization'
WHERE slug = 'tesamorelin';

UPDATE products SET benefits_summary = '• Accelerated tendon and ligament healing
• Enhanced gut health and mucosal repair
• Improved joint recovery and mobility
• Systemic anti-inflammatory effects throughout body'
WHERE slug = 'bpc-157';

UPDATE products SET benefits_summary = '• Enhanced wound healing and tissue regeneration
• Improved flexibility and reduced inflammation
• Accelerated recovery from injuries
• Cardiovascular protective effects'
WHERE slug = 'tb-500';

UPDATE products SET benefits_summary = '• Enhanced collagen and elastin production
• Accelerated wound healing and tissue repair
• Powerful antioxidant and anti-inflammatory effects
• Improved skin, hair, and connective tissue regeneration'
WHERE slug = 'ghk-cu';

UPDATE products SET benefits_summary = '• Increased oxidative capacity and endurance performance
• Enhanced mitochondrial biogenesis and function
• Improved metabolic efficiency and energy utilization
• Potential neuroprotective effects'
WHERE slug = 'slu-pp-332';

UPDATE products SET benefits_summary = '• Enhanced melanin production and natural tanning response
• Reduced UV damage risk through natural pigmentation
• Appetite suppression effects via MC4R activation
• Increased libido and sexual function'
WHERE slug = 'melanotan-2';

UPDATE products SET benefits_summary = '• Significant appetite reduction and sustained weight loss
• Improved glycemic control and insulin sensitivity
• Cardiovascular protective effects
• Long-lasting metabolic benefits'
WHERE slug = 'semaglutide';

UPDATE products SET benefits_summary = '• Enhanced weight loss beyond GLP-1 agonists alone
• Dual-action appetite and glucose control
• Improved lipid metabolism and cardiovascular health
• Superior metabolic benefits compared to single-action compounds'
WHERE slug = 'tirzepatide';

UPDATE products SET benefits_summary = '• Enhanced delta wave sleep and sleep quality
• Reduced stress hormones and cortisol levels
• Improved circadian rhythm regulation
• Neuroprotective effects and mental recovery'
WHERE slug = 'dsip';

UPDATE products SET benefits_summary = '• Enhanced telomere lengthening and cellular longevity
• Improved melatonin production and sleep cycles
• Powerful anti-aging effects at cellular level
• Immune system support and regulation'
WHERE slug = 'epitalon';

UPDATE products SET benefits_summary = '• Improved insulin sensitivity and glucose metabolism
• Enhanced mitochondrial function and cellular energy
• Increased endurance and physical performance capacity
• Metabolic age reversal effects'
WHERE slug = 'mots-c';

UPDATE products SET benefits_summary = '• Dramatic reduction in fine lines and wrinkles
• Enhanced skin firmness and elasticity
• Hair growth stimulation and increased thickness
• Comprehensive anti-aging skin remodeling'
WHERE slug = 'ghk-cu-cosmetic';

UPDATE products SET benefits_summary = '• Enhanced social cognition and emotional regulation
• Reduced anxiety and stress response
• Improved mood and overall well-being
• Benefits for social behavioral research and bonding'
WHERE slug = 'oxytocin';

UPDATE products SET benefits_summary = '• Selective fat burning without blood sugar impact
• Enhanced lipolysis in adipose tissue
• Improved body composition and definition
• No negative impact on insulin sensitivity'
WHERE slug = 'frag-176-191';
