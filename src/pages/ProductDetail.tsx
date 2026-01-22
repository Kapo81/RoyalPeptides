import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft, Package, Droplet, Activity, ShoppingCart, ChevronDown, ChevronUp, TrendingUp, Clock, Truck } from 'lucide-react';
import { supabase, Product, Category, getSessionId } from '../lib/supabase';
import MobileBottomNav from '../components/MobileBottomNav';
import ShippingCalculator from '../components/ShippingCalculator';
import { trackPageView, trackProductClick } from '../lib/analytics';
import PageBackground from '../components/PageBackground';
import SEO from '../components/SEO';
import { useOrigin } from '../hooks/useOrigin';

interface ProductDetailProps {
  productSlug: string;
  onNavigate: (page: string) => void;
  onCartUpdate?: () => void;
}

export default function ProductDetail({ productSlug, onNavigate, onCartUpdate }: ProductDetailProps) {
  const origin = useOrigin();
  const [structuredData, setStructuredData] = useState<object[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('benefits');
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetchProductDetails();
    fetchCartCount();
  }, [productSlug]);

  useEffect(() => {
    if (origin && product) {
      const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": product.image_url,
        "description": product.description || product.benefits_summary || "Research peptide for laboratory use",
        "sku": product.slug,
        "offers": {
          "@type": "Offer",
          "url": `${origin}/product/${product.slug}`,
          "priceCurrency": "CAD",
          "price": product.selling_price || product.price_cad,
          "availability": product.qty_in_stock && product.qty_in_stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
        }
      };

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
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": product.name,
            "item": `${origin}/product/${product.slug}`
          }
        ]
      };

      setStructuredData([productSchema, breadcrumbSchema]);
    }
  }, [origin, product]);

  const fetchCartCount = async () => {
    const sessionId = getSessionId();
    const { data, error } = await supabase
      .from('cart_items')
      .select('quantity')
      .eq('session_id', sessionId);

    if (!error && data) {
      const total = data.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(total);
    }
  };

  const fetchProductDetails = async () => {
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('slug', productSlug)
      .maybeSingle();

    if (productError || !productData) {
      console.error('Error fetching product:', productError);
      setLoading(false);
      return;
    }

    trackPageView(`/product/${productSlug}`);
    trackProductClick(productData.id, productData.name);

    setProduct(productData);

    const { data: productCats } = await supabase
      .from('product_categories')
      .select('category_id')
      .eq('product_id', productData.id)
      .limit(1)
      .maybeSingle();

    if (productCats?.category_id) {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('*')
        .eq('id', productCats.category_id)
        .maybeSingle();

      if (categoryData) {
        setCategory(categoryData);
      }
    }

    setLoading(false);
  };

  const addToCart = async () => {
    if (!product || !product.qty_in_stock || product.qty_in_stock === 0) return;

    setAddingToCart(true);

    const sessionId = getSessionId();

    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('session_id', sessionId)
      .eq('product_id', product.id)
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
          product_id: product.id,
          quantity: 1,
        });
    }

    setAddingToCart(false);
    await fetchCartCount();
    onCartUpdate?.();
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EFEFF3] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A0E0] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#EFEFF3] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <button
            onClick={() => onNavigate('catalogue')}
            className="text-[#00A0E0] hover:text-[#0088c7] font-medium"
          >
            Return to Catalogue
          </button>
        </div>
      </div>
    );
  }

  const isLowStock = product && product.qty_in_stock && product.qty_in_stock > 0 && product.qty_in_stock <= 5;
  const isInStock = product && product.qty_in_stock && product.qty_in_stock > 0;

  return (
    <div className="min-h-screen bg-[#05070b] pt-20 pb-24 md:pb-16">
      {product && (
        <SEO
          title={`${product.name} | Research Peptides Canada`}
          description={product.benefits_summary || product.description?.substring(0, 160) || `${product.name} research peptide for laboratory use`}
          canonical={origin ? `${origin}/product/${product.slug}` : undefined}
          ogType="product"
          ogImage={product.image_url || undefined}
          structuredData={structuredData}
        />
      )}
      <PageBackground variant="product" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0b0f18]/95 backdrop-blur-sm rounded-lg md:rounded-2xl shadow-sm overflow-hidden border border-white/10">
          <div className="p-4 sm:p-8 md:p-12">
            <nav className="hidden md:flex text-sm text-gray-400 mb-8 items-center space-x-2">
              <button
                onClick={() => onNavigate('home')}
                className="hover:text-[#00A0E0] transition-colors"
              >
                Home
              </button>
              <span>›</span>
              {category && (
                <>
                  <span className="hover:text-[#00A0E0] transition-colors cursor-pointer">
                    {category.name}
                  </span>
                  <span>›</span>
                </>
              )}
              <span className="text-white font-medium">{product.name}</span>
            </nav>

            {product.image_url && (
              <div className="mb-6 md:mb-8 flex justify-center">
                <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md">
                  <div className="relative w-full aspect-square bg-gradient-to-b from-[#0B0D12] to-[#050608] rounded-xl overflow-hidden border border-white/10">
                    <img
                      src={product.image_url}
                      alt={`${product.name} ${product.dosage} research peptide vial`}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-contain p-8 md:p-12"
                      style={{ display: 'block' }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6 md:mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-3 md:mb-4 tracking-tight">
                {product.name}
              </h1>

              {category && (
                <div className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-[#00A0E0]/10 border border-[#00A0E0]/30 rounded-full mb-3 md:mb-4">
                  <span className="text-xs md:text-sm text-[#00A0E0] font-semibold tracking-wide">
                    {category.name}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 md:gap-6 mt-3 md:mt-4 text-xs md:text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-[#00A0E0]" />
                  <span>{product.dosage}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Droplet className="h-4 w-4 text-[#00A0E0]" />
                  <span>Purity: {product.purity}</span>
                </div>
                <div className="inline-flex items-center px-2 md:px-3 py-1 md:py-1.5 bg-gradient-to-br from-[#0B0D12] to-[#050608] rounded-lg border border-white/10">
                  <span className="text-xs md:text-sm font-semibold text-[#00A0E0]">Canadian</span>
                </div>
              </div>

              <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-white/10">
                <div className="flex items-baseline justify-between mb-4">
                  <span className="text-3xl md:text-4xl font-bold text-white">
                    ${product.price_cad?.toFixed(2) || '0.00'}
                  </span>
                  <span className="text-sm md:text-base text-gray-400">CAD</span>
                </div>

                {isLowStock && (
                  <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 rounded-lg p-3 md:p-4 mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-orange-400" />
                      <span className="text-sm md:text-base font-semibold text-orange-300">Limited Inventory</span>
                    </div>
                    <p className="text-xs md:text-sm text-orange-200">
                      <span className="font-bold">{product.qty_in_stock} units</span> remaining in current batch.
                    </p>
                  </div>
                )}

                {isInStock && (
                  <div className="bg-gradient-to-r from-[#00A0E0]/5 to-cyan-500/5 border border-[#00A0E0]/20 rounded-lg p-3 md:p-4 mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Truck className="h-4 w-4 md:h-5 md:w-5 text-[#00A0E0]" />
                      <span className="text-sm md:text-base font-semibold text-gray-200">Fulfillment Information</span>
                    </div>
                    <div className="text-xs md:text-sm text-gray-300 space-y-1">
                      <p>Ships within 24-48 business hours</p>
                      {(product.price_cad || product.price) >= 300 && (
                        <p className="text-[#00A0E0] font-medium">
                          Qualifies for complimentary shipping + 10% research incentive
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 md:space-y-6">
              <div className="bg-[#111622]/80 backdrop-blur-sm rounded-lg md:rounded-xl border border-white/10 p-4 md:p-6">
                <h2 className="text-lg md:text-2xl font-bold text-white mb-3 md:mb-4">Overview</h2>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-4 md:mb-6">
                  {product.description || `High-purity, lyophilized peptide manufactured under controlled laboratory conditions. Each batch is quality-verified for consistency, stability, and research integrity.`}
                </p>

                <h3 className="text-base md:text-xl font-semibold text-white mb-3">Key Characteristics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 mb-4 md:mb-6">
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-[#00A0E0] rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-300 text-xs md:text-sm">Lyophilized for stability</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-[#00A0E0] rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-300 text-xs md:text-sm">Individually sealed vial</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-[#00A0E0] rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-300 text-xs md:text-sm">Inventory-tracked in real-time</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-[#00A0E0] rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-300 text-xs md:text-sm">Discreet fulfillment</span>
                  </div>
                </div>

                <div className="bg-[#0b0f18]/80 border border-[#00A0E0]/20 rounded-lg p-3 md:p-4">
                  <h4 className="text-sm md:text-base font-semibold text-white mb-2">Research Use Notice</h4>
                  <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
                    This product is intended for research and laboratory use only. Not for human consumption or veterinary applications.
                  </p>
                </div>
              </div>

              {product.benefits_summary && (
                <div className="bg-[#111622]/80 backdrop-blur-sm rounded-lg md:rounded-xl border border-white/10 overflow-hidden">
                  <button
                    onClick={() => toggleSection('benefits')}
                    className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <Activity className="h-5 w-5 md:h-6 md:w-6 text-[#00A0E0]" />
                      <h2 className="text-base md:text-2xl font-bold text-white text-left">Research Applications</h2>
                    </div>
                    {expandedSection === 'benefits' ? (
                      <ChevronUp className="h-5 w-5 text-[#00A0E0] flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {expandedSection === 'benefits' && (
                    <div className="px-4 pb-4 md:px-6 md:pb-6 space-y-2 md:space-y-3 animate-[fadeInDown_0.3s_ease-out]">
                      {product.benefits_summary.split('\n').filter(line => line.trim()).map((benefit, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#00A0E0] rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-gray-300 text-xs md:text-base leading-relaxed">{benefit.replace('•', '').trim()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="bg-[#111622]/80 backdrop-blur-sm rounded-lg md:rounded-xl border border-white/10 overflow-hidden">
                <button
                  onClick={() => toggleSection('mechanism')}
                  className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <span className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-[#00A0E0] to-[#11D0FF] text-white rounded-full flex items-center justify-center text-xs md:text-sm font-bold flex-shrink-0">2</span>
                    <h2 className="text-base md:text-2xl font-bold text-white text-left">Mechanism & Benefits</h2>
                  </div>
                  {expandedSection === 'mechanism' ? (
                    <ChevronUp className="h-5 w-5 text-[#00A0E0] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {expandedSection === 'mechanism' && (
                  <div className="px-4 pb-4 md:px-6 md:pb-6 space-y-3 md:space-y-4 animate-[fadeInDown_0.3s_ease-out]">
                    <div className="flex items-start space-x-3">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#00A0E0] rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-semibold text-white text-xs md:text-base">Classification</p>
                        <p className="text-gray-400 text-xs md:text-sm">{category?.name || 'Research Peptide'}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#00A0E0] rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-semibold text-white text-xs md:text-base">Administration Route</p>
                        <p className="text-gray-400 text-xs md:text-sm">SUBCUTANEOUS or INTRAMUSCULAR (Research use only)</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#00A0E0] rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-semibold text-white text-xs md:text-base">Format</p>
                        <p className="text-gray-400 text-xs md:text-sm">{product.dosage} lyophilised powder</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-[#111622]/80 backdrop-blur-sm rounded-lg md:rounded-xl border border-white/10 overflow-hidden">
                <button
                  onClick={() => toggleSection('dosage')}
                  className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <span className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-[#00A0E0] to-[#11D0FF] text-white rounded-full flex items-center justify-center text-xs md:text-sm font-bold flex-shrink-0">3</span>
                    <h2 className="text-base md:text-2xl font-bold text-white text-left">Storage & Dosage Info</h2>
                  </div>
                  {expandedSection === 'dosage' ? (
                    <ChevronUp className="h-5 w-5 text-[#00A0E0] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {expandedSection === 'dosage' && (
                  <div className="px-4 pb-4 md:px-6 md:pb-6 animate-[fadeInDown_0.3s_ease-out]">
                    <div className="bg-[#0b0f18] rounded-lg p-4 md:p-6 border border-[#00A0E0]/20">
                      <p className="text-gray-300 text-xs md:text-base leading-relaxed mb-3 md:mb-4">
                        <strong className="text-white">Typical Vial Content:</strong> {product.dosage} lyophilised powder
                      </p>
                      <p className="text-gray-300 text-xs md:text-base leading-relaxed mb-3 md:mb-4">
                        <strong className="text-white">Storage:</strong> {product.storage}
                      </p>
                      <p className="text-xs md:text-sm text-gray-400 italic">
                        Note: Dosing information is provided for research purposes only. This product is not intended for human or veterinary use.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 md:mt-8">
              <ShippingCalculator
                vialCount={1}
                productPrice={product.price_cad || product.price}
              />
            </div>

            <div className="hidden md:flex mt-6 md:mt-8 justify-center">
              <button
                onClick={addToCart}
                disabled={addingToCart || !product.qty_in_stock || product.qty_in_stock === 0}
                className={`group relative px-8 md:px-12 py-3 md:py-4 text-white rounded-lg font-semibold tracking-wide transition-all duration-500 overflow-hidden flex items-center space-x-3 ${
                  !product.qty_in_stock || product.qty_in_stock === 0
                    ? 'bg-gray-700 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-[#00A0E0] to-[#11D0FF] shadow-[0_0_30px_rgba(0,160,224,0.4)] hover:shadow-[0_0_50px_rgba(0,160,224,0.8)] hover:scale-105'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {(!product.qty_in_stock || product.qty_in_stock === 0) ? null : (
                  <div className="absolute inset-0 bg-gradient-to-r from-[#11D0FF] to-[#00A0E0] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                )}
                <ShoppingCart className="h-5 w-5 relative z-10" />
                <span className="relative z-10">
                  {!product.qty_in_stock || product.qty_in_stock === 0
                    ? 'Out of Stock'
                    : addingToCart
                    ? 'Adding to Cart...'
                    : 'Add to Cart'}
                </span>
                {product.qty_in_stock && product.qty_in_stock > 0 && (
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                )}
              </button>
            </div>

            <div className="mt-6 md:mt-12 bg-amber-900/20 border border-amber-500/30 rounded-lg p-4 md:p-6">
              <div className="flex items-start space-x-3 md:space-x-4">
                <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-amber-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-amber-200 text-sm md:text-lg mb-1 md:mb-2">Important Notice</h3>
                  <p className="text-amber-200/90 leading-relaxed text-xs md:text-base">
                    <strong>For Research Purposes Only.</strong> This product is not for human or veterinary use.
                    No medical claims are made. Intended solely for laboratory research by qualified professionals.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 md:mt-8 text-center">
              <button
                onClick={() => onNavigate('catalogue')}
                className="inline-flex items-center space-x-2 text-[#00A0E0] hover:text-cyan-400 font-semibold text-sm md:text-lg transition-colors group"
              >
                <ArrowLeft className="h-4 w-4 md:h-5 md:w-5 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Catalogue</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <MobileBottomNav
        currentPage="product"
        onNavigate={onNavigate}
        cartCount={cartCount}
        showAddToCart={true}
        onAddToCart={addToCart}
        addingToCart={addingToCart}
        isOutOfStock={!product.qty_in_stock || product.qty_in_stock === 0}
      />
    </div>
  );
}
