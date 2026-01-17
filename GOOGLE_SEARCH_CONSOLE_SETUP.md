# Google Search Console Setup Guide

## Complete SEO Implementation for Royal Peptides Canada

This guide will walk you through setting up Google Search Console and getting your website properly indexed by Google.

---

## SEO Changes Implemented

### 1. URL Routing System
- Each page now has its own unique URL
- Browser back/forward buttons work correctly
- All pages are crawlable by Google:
  - Homepage: `https://royalpeptides.ca/`
  - Catalogue: `https://royalpeptides.ca/catalogue`
  - Stacks: `https://royalpeptides.ca/stacks`
  - Shop: `https://royalpeptides.ca/shop`
  - About: `https://royalpeptides.ca/about`
  - Shipping: `https://royalpeptides.ca/shipping`
  - Legal: `https://royalpeptides.ca/legal`
  - Products: `https://royalpeptides.ca/product/{slug}`

### 2. Sitemap.xml Created
- Complete XML sitemap with all pages and products
- Located at: `https://royalpeptides.ca/sitemap.xml`
- Includes 36 URLs (7 static pages + 29 products)
- Auto-generated with priority and change frequency

### 3. Structured Data (Schema.org)
- **Organization Schema** on homepage
- **WebSite Schema** on homepage
- **Product Schema** on all product pages with:
  - Price in CAD
  - Availability status
  - Product images
  - SKU information
- **BreadcrumbList Schema** on product pages
- **CollectionPage Schema** on Stacks page

### 4. Enhanced Meta Tags
- Proper robots meta tags
- Geographic targeting (Canada)
- Complete Open Graph tags with absolute URLs
- Twitter Card meta tags
- Canonical URLs on all pages
- Author and site name metadata

---

## Google Search Console Setup

### Step 1: Sign in to Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Sign in with your Google account
3. Click "Add Property"

### Step 2: Add Your Website

Choose **URL prefix** property type:
- Enter: `https://royalpeptides.ca`
- Click "Continue"

### Step 3: Verify Ownership

**Method 1: HTML Tag (Recommended)**

1. Google will provide an HTML meta tag like:
   ```html
   <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />
   ```

2. Add this tag to your `index.html` file in the `<head>` section:
   - Open `/tmp/cc-agent/60606460/project/index.html`
   - Add the verification tag after the other meta tags
   - Deploy the updated site to Netlify
   - Return to Google Search Console and click "Verify"

**Alternative Method: Netlify DNS Verification**

1. If you have access to your domain's DNS settings through Netlify:
   - Choose "Domain name provider" verification method
   - Add the TXT record provided by Google to your DNS settings
   - Wait a few minutes and click "Verify"

### Step 4: Submit Your Sitemap

Once verified:

1. In Google Search Console, go to **Sitemaps** (left sidebar)
2. Enter: `sitemap.xml`
3. Click "Submit"
4. Google will start crawling your sitemap

You should see:
- Status: Success
- Discovered URLs: 36

### Step 5: Request Indexing for Key Pages

Speed up the indexing process:

1. Go to **URL Inspection** tool
2. Enter each key URL and click "Request Indexing":
   - `https://royalpeptides.ca/`
   - `https://royalpeptides.ca/catalogue`
   - `https://royalpeptides.ca/stacks`
   - `https://royalpeptides.ca/product/bpc-157`
   - `https://royalpeptides.ca/product/semaglutide`
   - `https://royalpeptides.ca/product/cjc-1295`

3. Google allows ~10 manual indexing requests per day

### Step 6: Set Target Country

1. Go to **Settings** (left sidebar)
2. Scroll to "Geographic target"
3. Select "Canada" as your target country

---

## Monitoring and Maintenance

### What to Monitor in Search Console

1. **Coverage Report**
   - Check for any crawl errors
   - Ensure all pages are indexed
   - Fix any "Excluded" pages

2. **Performance Report**
   - Track impressions and clicks
   - Monitor which keywords drive traffic
   - Identify top-performing pages

3. **Enhancement Reports**
   - Check "Products" for Product schema validation
   - Ensure all structured data is error-free

4. **Mobile Usability**
   - Verify site works well on mobile devices
   - Fix any mobile usability issues

### Expected Timeline

- **24-48 hours**: Sitemap processed, initial crawl begins
- **1 week**: Homepage and key pages indexed
- **2-4 weeks**: All product pages indexed
- **4-8 weeks**: Start seeing organic search traffic

### Ongoing SEO Best Practices

1. **Update Sitemap When Adding Products**
   - Regenerate sitemap when products are added/updated
   - The sitemap is static, so you may need to regenerate it periodically

2. **Monitor Core Web Vitals**
   - Check page speed regularly
   - Optimize images if needed
   - Monitor loading performance

3. **Create Quality Content**
   - Add detailed product descriptions
   - Write informative blog posts about peptide research
   - Update FAQs regularly

4. **Build Backlinks**
   - Get listed in relevant directories
   - Partner with research institutions
   - Guest post on related websites

---

## Troubleshooting

### Sitemap Not Found
- Verify `https://royalpeptides.ca/sitemap.xml` loads correctly
- Check that the file was deployed to Netlify
- Clear your browser cache and try again

### Pages Not Indexing
- Check `robots.txt` isn't blocking pages
- Verify canonical URLs are correct
- Ensure no `noindex` meta tags on pages
- Use URL Inspection tool to see Google's view

### Structured Data Errors
- Use [Google's Rich Results Test](https://search.google.com/test/rich-results)
- Test individual product pages
- Fix any validation errors

### Low Rankings
- Build high-quality backlinks
- Improve content quality and depth
- Focus on long-tail keywords
- Optimize meta descriptions for CTR

---

## Additional Tools

### 1. Google Analytics 4
- Set up GA4 for detailed traffic analytics
- Track conversions and user behavior
- Monitor which products are most viewed

### 2. Bing Webmaster Tools
- Also submit sitemap to Bing
- Similar process to Google Search Console
- Captures 5-10% additional search traffic

### 3. Schema Markup Validator
- Use [Schema.org Validator](https://validator.schema.org/)
- Test structured data implementation
- Ensure no errors in JSON-LD

---

## Need Help?

If you encounter issues:
1. Check the Coverage report in Search Console
2. Use the URL Inspection tool to see how Google views your pages
3. Review the [Google Search Central documentation](https://developers.google.com/search/docs)

---

## Summary

Your website now has:
- Proper URL structure for each page
- Complete XML sitemap
- Rich structured data for better search results
- Optimized meta tags and Open Graph data
- All technical SEO foundations in place

After following this guide, your website should be fully discoverable by Google and start appearing in search results within 2-4 weeks.
