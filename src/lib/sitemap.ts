import { supabase } from './supabase';

interface SitemapURL {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

export async function generateSitemap(baseUrl: string): Promise<string> {
  const currentDate = new Date().toISOString().split('T')[0];

  const urls: SitemapURL[] = [
    {
      loc: baseUrl,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '1.0'
    },
    {
      loc: `${baseUrl}/catalogue`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '0.9'
    },
    {
      loc: `${baseUrl}/stacks`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.9'
    },
    {
      loc: `${baseUrl}/shop`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '0.8'
    },
    {
      loc: `${baseUrl}/about`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.7'
    },
    {
      loc: `${baseUrl}/shipping`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.7'
    },
    {
      loc: `${baseUrl}/legal`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.5'
    }
  ];

  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('is_active', true)
    .order('name');

  if (products) {
    products.forEach((product) => {
      urls.push({
        loc: `${baseUrl}/product/${product.slug}`,
        lastmod: product.updated_at ? new Date(product.updated_at).toISOString().split('T')[0] : currentDate,
        changefreq: 'weekly',
        priority: '0.8'
      });
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return xml;
}

export function downloadSitemap(xml: string) {
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sitemap.xml';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
