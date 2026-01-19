import { useEffect, useState } from 'react';
import { ShoppingCart, Check, CheckCircle, XCircle } from 'lucide-react';
import { supabase, Product, getSessionId } from '../lib/supabase';
import VialPlaceholder from '../components/VialPlaceholder';
import SEO from '../components/SEO';
import { useOrigin } from '../hooks/useOrigin';

interface ShopProps {
  onNavigate: (page: string, productSlug?: string) => void;
  onCartUpdate: () => void;
}

interface ProductWithStock extends Product {
  qty_in_stock: number | null;
}

export default function Shop({ onNavigate, onCartUpdate }: ShopProps) {
  const origin = useOrigin();
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*, qty_in_stock')
      .order('name');

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const addToCart = async (product: ProductWithStock) => {
    if (!product.qty_in_stock || product.qty_in_stock === 0) {
      return;
    }

    setAddingToCart(product.id);
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
        .update({
          quantity: existingItem.quantity + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.id);
    } else {
      await supabase
        .from('cart_items')
        .insert({
          session_id: sessionId,
          product_id: product.id,
          quantity: 1
        });
    }

    setAddedItems(prev => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }, 2000);

    setAddingToCart(null);
    onCartUpdate();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A0E0] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <SEO
        title="Shop Research Peptides | Royal Peptides Canada"
        description="Browse and buy high-purity research peptides online. Premium quality compounds for laboratory use with fast Canadian shipping and real-time inventory tracking."
        canonical={origin ? `${origin}/shop` : undefined}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light text-white mb-4 tracking-tight">
            Shop Premium Peptides
          </h1>
          <div className="h-px w-48 mx-auto bg-gradient-to-r from-transparent via-[#00A0E0] to-transparent"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => {
            const isInStock = product.qty_in_stock && product.qty_in_stock > 0;
            const price = (product.selling_price || product.price_cad || 0).toFixed(2);

            return (
              <div
                key={product.id}
                className={`bg-[#1a1a1a] border border-gray-800 rounded-xl hover:border-[#00A0E0]/50 transition-all duration-300 group flex flex-col ${
                  !isInStock ? 'opacity-60' : ''
                }`}
              >
                <div
                  onClick={() => onNavigate('product', product.slug)}
                  className="cursor-pointer relative"
                >
                  <div className="absolute top-2 right-2 z-20">
                    {isInStock ? (
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 border border-green-500/50 rounded-full backdrop-blur-sm">
                        <CheckCircle className="h-3 w-3 text-green-400" />
                        <span className="text-xs font-semibold text-green-300 hidden md:inline">In Stock</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 border border-red-500/50 rounded-full backdrop-blur-sm">
                        <XCircle className="h-3 w-3 text-red-400" />
                        <span className="text-xs font-semibold text-red-300">Out of Stock</span>
                      </div>
                    )}
                  </div>

                  <div className={`aspect-square bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-6 relative overflow-hidden ${
                    !isInStock ? 'after:absolute after:inset-0 after:bg-black/40 after:z-10' : ''
                  }`}>
                    <div className="absolute inset-0 bg-gradient-radial from-[#00A0E0]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-contain relative z-10"
                      />
                    ) : (
                      <div className="relative z-10">
                        <VialPlaceholder shortName={product.short_name} />
                      </div>
                    )}
                  </div>

                  <div className="p-3 md:p-4">
                    <h3 className="text-sm md:text-base font-bold text-white mb-2 group-hover:text-[#00A0E0] transition-colors line-clamp-2">
                      {product.name}
                    </h3>

                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-lg md:text-xl font-bold text-white">
                        ${price}
                      </span>
                      <span className="text-xs text-gray-400">CAD</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 md:p-4 pt-0 mt-auto">
                  <button
                    onClick={() => addToCart(product)}
                    disabled={addingToCart === product.id || !isInStock}
                    className={`w-full py-3 text-sm font-semibold rounded-lg transition-all touch-manipulation flex items-center justify-center gap-2 ${
                      addedItems.has(product.id)
                        ? 'bg-green-600 border-green-600 text-white'
                        : isInStock
                          ? 'bg-gradient-to-r from-[#00A0E0] to-cyan-500 text-white hover:shadow-[0_0_20px_rgba(0,160,224,0.4)] active:scale-95'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    } disabled:opacity-50`}
                  >
                    {addedItems.has(product.id) ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Added</span>
                      </>
                    ) : addingToCart === product.id ? (
                      <span>Adding...</span>
                    ) : !isInStock ? (
                      <span>Out of Stock</span>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
