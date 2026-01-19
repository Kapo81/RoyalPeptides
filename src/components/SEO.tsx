import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  structuredData?: object | object[];
}

function sanitizeRouteKey(pathname: string): string {
  return pathname.replace(/\//g, '-').replace(/^-/, '') || 'home';
}

export default function SEO({
  title,
  description,
  canonical,
  ogType = 'website',
  ogImage = '/canada-logo.png',
  structuredData
}: SEOProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const routeKey = sanitizeRouteKey(window.location.pathname);

    document.title = title;

    const metaTags = [
      { name: 'description', content: description, id: `seo-meta-description-${routeKey}` },
      { property: 'og:title', content: title, id: `seo-og-title-${routeKey}` },
      { property: 'og:description', content: description, id: `seo-og-description-${routeKey}` },
      { property: 'og:type', content: ogType, id: `seo-og-type-${routeKey}` },
      { property: 'og:image', content: ogImage, id: `seo-og-image-${routeKey}` },
      { name: 'twitter:card', content: 'summary_large_image', id: `seo-twitter-card-${routeKey}` },
      { name: 'twitter:title', content: title, id: `seo-twitter-title-${routeKey}` },
      { name: 'twitter:description', content: description, id: `seo-twitter-description-${routeKey}` },
    ];

    metaTags.forEach(({ name, property, content, id }) => {
      document.getElementById(id)?.remove();

      const element = document.createElement('meta');
      element.id = id;
      if (name) element.setAttribute('name', name);
      if (property) element.setAttribute('property', property);
      element.setAttribute('content', content);
      document.head.appendChild(element);
    });

    if (canonical) {
      const canonicalId = `seo-canonical-${routeKey}`;
      document.getElementById(canonicalId)?.remove();

      const linkElement = document.createElement('link');
      linkElement.id = canonicalId;
      linkElement.rel = 'canonical';
      linkElement.href = canonical;
      document.head.appendChild(linkElement);
    }

    if (structuredData) {
      const schemas = Array.isArray(structuredData) ? structuredData : [structuredData];

      schemas.forEach((schema, index) => {
        if (schema) {
          const scriptId = `seo-jsonld-${routeKey}-${index}`;
          document.getElementById(scriptId)?.remove();

          const scriptElement = document.createElement('script');
          scriptElement.id = scriptId;
          scriptElement.type = 'application/ld+json';
          scriptElement.textContent = JSON.stringify(schema);
          document.head.appendChild(scriptElement);
        }
      });
    }

    return () => {
      metaTags.forEach(({ id }) => {
        document.getElementById(id)?.remove();
      });

      if (canonical) {
        document.getElementById(`seo-canonical-${routeKey}`)?.remove();
      }

      if (structuredData) {
        const schemas = Array.isArray(structuredData) ? structuredData : [structuredData];
        schemas.forEach((_, index) => {
          document.getElementById(`seo-jsonld-${routeKey}-${index}`)?.remove();
        });
      }
    };
  }, [title, description, canonical, ogType, ogImage, structuredData]);

  return null;
}
