import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { supabase, Product, Category, getSessionId } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import Toast from '../components/Toast';
import { trackPageView, trackProductClick } from '../lib/analytics';
import PageBackground from '../components/PageBackground';
import SEO from '../components/SEO';
import CatalogueHeader from '../components/CatalogueHeader';
import CatalogueFilterBar from '../components/CatalogueFilterBar';
import ProductCard from '../components/ProductCard';
import { cacheManager } from '../lib/cacheManager';
import { useOrigin } from '../hooks/useOrigin';

interface CatalogueProps {
  onNavigate: (page: string, productSlug?: string) => void;
  onCartUpdate?: () => void;
}

interface ProductWithCategories extends Product {
  category_names: string[];
  category_ids: string[];
  qty_in_stock: number | null;
}

export default function Catalogue({ onNavigate, onCartUpdate }: CatalogueProps) {
  const { t } = useLanguage();
  const origin = useOrigin();
  const [structuredData, setStructuredData] = useState<object[]>([]);
  const [products, setProducts] = useState<ProductWithCategories[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [addingToCart, setAddingToCart] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string>('');

  useEffect(() => {
    fetchData();
    trackPageView('/catalogue');
  }, []);

  const fetchData = async () => {
    try {
      const categories = await cacheManager.fetchWithCache(
        'categories',
        'categories_version',
        async () => {
          const { data } = await supabase
            .from('categories')
            .select('*')
            .order('name');
          return data || [];
        }
      );

      setCategories(categories);

      const productsWithCategories = await cacheManager.fetchWithCache(
        'products_catalogue',
        'products_version',
        async () => {
          const { data: productsData } = await supabase
            .from('products')
            .select('*, qty_in_stock')
            .eq('is_active', true)
            .order('name');

          if (!productsData) return [];

          const products: ProductWithCategories[] = await Promise.all(
            productsData.map(async (product) => {
              const { data: productCats } = await supabase
                .from('product_categories')
                .select('category_id')
                .eq('product_id', product.id);

              const categoryIds = productCats?.map(pc => pc.category_id) || [];

              const { data: categoryData } = await supabase
                .from('categories')
                .select('name')
                .in('id', categoryIds);

              return {
                ...product,
                category_names: categoryData?.map(c => c.name) || [],
                category_ids: categoryIds,
              };
            })
          );

          return products;
        }
      );

      setProducts(productsWithCategories);
    } catch (error) {
      console.error('[Catalogue] Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, productName: string, isInStock: boolean) => {
    if (!isInStock) {
      setToastMessage('This product is currently out of stock');
      return;
    }

    setAddingToCart(prev => ({ ...prev, [productId]: true }));

    const sessionId = getSessionId();

    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('session_id', sessionId)
      .eq('product_id', productId)
      .maybeSingle();

    if (existingItem) {
      await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + 1, updated_at: new Date().toISOString() })
        .eq('id', existingItem.id);
    } else {
      await supabase
        .from('cart_items')
        .insert({
          session_id: sessionId,
          product_id: productId,
          quantity: 1,
        });
    }

    setAddingToCart(prev => ({ ...prev, [productId]: false }));
    setToastMessage(`${productName} added to cart`);
    onCartUpdate?.();
  };

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.benefits_summary?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category_ids.includes(selectedCategory);
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const aInStock = a.qty_in_stock && a.qty_in_stock > 0;
      const bInStock = b.qty_in_stock && b.qty_in_stock > 0;

      if (sortBy === 'in-stock') {
        if (aInStock !== bInStock) {
          return bInStock ? 1 : -1;
        }
        return a.name.localeCompare(b.name);
      }

      if (aInStock !== bInStock) {
        return bInStock ? 1 : -1;
      }

      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }

      if (sortBy === 'price') {
        return (a.selling_price || a.price_cad || 0) - (b.selling_price || b.price_cad || 0);
      }

      return 0;
    });

  const getShortDescription = (description: string) => {
    if (!description) return '';
    const sentences = description.split('.');
    return sentences.length > 0 ? sentences[0] + '.' : description;
  };

  useEffect(() => {
    if (origin && !loading) {
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": origin
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Catalogue",
            "item": `${origin}/catalogue`
          }
        ]
      };

      const productListSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": filteredProducts.slice(0, 20).map((product, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "Product",
            "name": product.name,
            "image": product.image_url || `${origin}/ab72c5e3-25b2-4790-8243-cdc880fc0bdc.png`,
            "description": product.benefits_summary || product.short_name,
            "category": product.category_names[0] || "Research Peptides",
            "offers": {
              "@type": "Offer",
              "price": (product.selling_price || product.price_cad || 0).toFixed(2),
              "priceCurrency": "CAD",
              "availability": product.qty_in_stock && product.qty_in_stock > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
              "url": `${origin}/product/${product.slug}`
            }
          }
        }))
      };

      setStructuredData([breadcrumbSchema, productListSchema]);
    }
  }, [origin, loading, filteredProducts]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070b] flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A0E0] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading research catalogue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050608] relative">
      <SEO
        title="Research Peptides Catalogue | Royal Peptides Canada"
        description="Browse our complete catalogue of high-purity research peptides and compounds. Premium quality, fast Canadian shipping, comprehensive research support."
        canonical={origin ? `${origin}/catalogue` : undefined}
        structuredData={structuredData}
      />
      <PageBackground variant="catalogue" />

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      )}

      <div className="pt-20">
        <CatalogueHeader />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <CatalogueFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
          productCount={filteredProducts.length}
        />

        <div className="md:hidden sticky top-16 z-40 bg-[#05070b]/95 backdrop-blur-xl border-y border-white/10 -mx-4 px-4 py-3 mb-6">
          <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
            Categories
          </label>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-[#00A0E0] to-cyan-500 text-white shadow-[0_0_15px_rgba(0,160,224,0.4)]'
                  : 'bg-[#151a26] text-gray-300 border border-white/10'
              }`}
            >
              All ({products.length})
            </button>
            {categories
              .map((category) => ({
                category,
                count: products.filter(p => p.category_ids.includes(category.id)).length
              }))
              .filter(({ count }) => count > 0)
              .map(({ category, count }) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-[#00A0E0] to-cyan-500 text-white shadow-[0_0_15px_rgba(0,160,224,0.4)]'
                      : 'bg-[#151a26] text-gray-300 border border-white/10'
                  }`}
                >
                  {category.name} ({count})
                </button>
              ))}
          </div>
        </div>

        <div className="hidden md:block bg-[#0b0f18]/80 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-8">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Research Categories
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-[#00A0E0] to-cyan-500 text-white shadow-[0_0_20px_rgba(0,160,224,0.5)]'
                  : 'bg-[#151a26] text-gray-300 border border-white/10 hover:border-[#00A0E0]/50 hover:bg-[#151a26]/80'
              }`}
            >
              All Products ({products.length})
            </button>
            {categories
              .map((category) => ({
                category,
                count: products.filter(p => p.category_ids.includes(category.id)).length
              }))
              .filter(({ count }) => count > 0)
              .map(({ category, count }) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-[#00A0E0] to-cyan-500 text-white shadow-[0_0_20px_rgba(0,160,224,0.5)]'
                      : 'bg-[#151a26] text-gray-300 border border-white/10 hover:border-[#00A0E0]/50 hover:bg-[#151a26]/80'
                  }`}
                >
                  {category.name} ({count})
                </button>
              ))}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-300 text-lg font-semibold mb-2">No products found</p>
              <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
              {(searchTerm || selectedCategory !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="mt-4 px-6 py-2 bg-[#00A0E0] text-white rounded-lg hover:bg-[#00A0E0]/90 transition-colors text-sm font-medium"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onNavigate={(page, slug) => {
                  trackProductClick(product.id, product.name);
                  onNavigate(page, slug);
                }}
                onAddToCart={addToCart}
                isAdding={addingToCart[product.id] || false}
              />
            ))}
          </div>
        )}

        <div className="mt-6 md:mt-12 bg-amber-900/10 border border-amber-500/30 rounded-xl md:rounded-2xl p-4 md:p-6 backdrop-blur-sm">
          <div className="flex items-start space-x-3 md:space-x-4">
            <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-amber-400 flex-shrink-0 mt-0.5 md:mt-1" />
            <div>
              <h3 className="font-bold text-amber-200 text-base md:text-lg mb-1 md:mb-2">For Research Purposes Only</h3>
              <p className="text-amber-200/80 leading-relaxed text-sm md:text-base">
                All products are intended solely for <strong>laboratory research by qualified professionals</strong>.
                Not for human or veterinary use. No medical claims are made. By purchasing, you confirm compliance with all applicable regulations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
