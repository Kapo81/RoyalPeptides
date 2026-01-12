import { useEffect, useState } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, Tag, Ticket, X, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { supabase, Product, CartItem, getSessionId } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { calculateDiscount } from '../lib/discountCalculator';

interface CartProps {
  onNavigate: (page: string, param?: string) => void;
  onCartUpdate: () => void;
}

interface CartItemWithProduct extends CartItem {
  product: Product | null;
}

export default function Cart({ onNavigate, onCartUpdate }: CartProps) {
  const { t } = useLanguage();
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [promoValidating, setPromoValidating] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    const sessionId = getSessionId();

    const { data: items, error } = await supabase
      .from('cart_items')
      .select('*, bundle_id, bundle_name, bundle_price, bundle_products')
      .eq('session_id', sessionId);

    if (error) {
      console.error('Error fetching cart:', error);
      setLoading(false);
      return;
    }

    if (!items || items.length === 0) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    // Fetch products only for non-bundle items
    const productIds = items.filter(item => item.product_id).map(item => item.product_id);
    let products: Product[] = [];

    if (productIds.length > 0) {
      const { data: productsData, error: prodError } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

      if (prodError) {
        console.error('Error fetching products:', prodError);
      } else {
        products = productsData || [];
      }
    }

    const itemsWithProducts = items.map(item => ({
      ...item,
      product: item.product_id ? products.find(p => p.id === item.product_id) || null : null
    }));

    setCartItems(itemsWithProducts);
    setLoading(false);
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    await supabase
      .from('cart_items')
      .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
      .eq('id', itemId);

    await fetchCart();
    onCartUpdate();
  };

  const removeItem = async (itemId: string) => {
    await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    await fetchCart();
    onCartUpdate();
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      if (item.bundle_id && item.bundle_price) {
        // Bundle item
        return sum + (item.bundle_price * item.quantity);
      } else if (item.product) {
        // Regular product item
        return sum + ((item.product.price_cad || item.product.price) * item.quantity);
      }
      return sum;
    }, 0);
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }

    const subtotal = calculateTotal();
    setPromoValidating(true);
    setPromoError('');

    try {
      const { data, error } = await supabase.rpc('validate_promo_code', {
        p_code: promoCode.trim(),
        p_subtotal: subtotal,
      });

      if (error) {
        console.error('Error validating promo code:', error);
        setPromoError('Failed to validate promo code');
        setPromoValidating(false);
        return;
      }

      if (data.valid) {
        setPromoDiscount(data.discount_amount);
        setPromoApplied(true);
        setPromoError('');
      } else {
        let errorMessage = data.error || 'Invalid promo code';
        if (errorMessage.includes('expired') || errorMessage.includes('usage limit')) {
          errorMessage = 'Code fully redeemed (20/20 used)';
        } else if (errorMessage.includes('Minimum subtotal')) {
          errorMessage = 'Requires $300+ subtotal';
        } else if (errorMessage.includes('Invalid')) {
          errorMessage = 'Invalid code';
        }
        setPromoError(errorMessage);
        setPromoDiscount(0);
        setPromoApplied(false);
      }
    } catch (err) {
      console.error('Error applying promo:', err);
      setPromoError('Failed to apply promo code');
      setPromoDiscount(0);
      setPromoApplied(false);
    }

    setPromoValidating(false);
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setPromoDiscount(0);
    setPromoApplied(false);
    setPromoError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center pt-24 sm:pt-28">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A0E0] mx-auto mb-4"></div>
          <p className="text-gray-400">{t('cart.loading')}</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center pt-24 sm:pt-28">
        <div className="text-center px-4">
          <ShoppingBag className="h-20 sm:h-24 w-20 sm:w-24 text-gray-700 mx-auto mb-6" strokeWidth={1} />
          <h2 className="text-xl sm:text-2xl font-light text-white mb-4">{t('cart.empty')}</h2>
          <p className="text-gray-400 mb-8 text-sm sm:text-base">Add some peptides to get started</p>
          <button
            onClick={() => onNavigate('catalogue')}
            className="px-8 py-3 bg-transparent border border-[#00A0E0] text-[#00A0E0] hover:bg-[#00A0E0] hover:text-white transition-all"
          >
            {t('cart.startShopping')}
          </button>
        </div>
      </div>
    );
  }

  const subtotal = calculateTotal();
  const volumeDiscount = calculateDiscount(subtotal);

  // STACKING RULE: Promo codes do NOT stack with automatic volume discounts
  // If promo is applied, volume discount is disabled
  const activeDiscount = promoApplied ? 0 : volumeDiscount.amount;
  const activePromoDiscount = promoApplied ? promoDiscount : 0;
  const discountedSubtotal = subtotal - activeDiscount - activePromoDiscount;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-light text-white mb-4 tracking-tight">{t('cart.title')}</h1>
          <div className="h-px w-32 bg-gradient-to-r from-[#00A0E0] to-transparent"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const isBundle = item.bundle_id !== null;
              const displayName = isBundle ? item.bundle_name : item.product?.name;
              const displayPrice = isBundle ? item.bundle_price : (item.product?.price_cad || item.product?.price);

              return (
                <div
                  key={item.id}
                  className="bg-[#1a1a1a] border border-gray-800 p-6 flex items-center space-x-6"
                >
                  <div
                    onClick={() => !isBundle && item.product && onNavigate('product', item.product.slug)}
                    className={`w-24 h-24 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center ${!isBundle ? 'cursor-pointer' : ''} group`}
                  >
                    {!isBundle && item.product?.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        loading="lazy"
                        className="h-20 w-20 object-contain group-hover:scale-110 transition-transform"
                      />
                    ) : (
                      <img
                        src="/ab72c5e3-25b2-4790-8243-cdc880fc0bdc.png"
                        alt={displayName || 'Product'}
                        className="h-12 w-12 opacity-20 group-hover:opacity-40 transition-opacity"
                      />
                    )}
                  </div>

                  <div className="flex-grow">
                    {isBundle ? (
                      <>
                        <h3 className="text-lg font-light text-white">
                          {displayName}
                        </h3>
                        {item.bundle_products && item.bundle_products.length > 0 && (
                          <p className="text-sm text-gray-400 mt-1">
                            Includes: {item.bundle_products.map((bp: any) => bp.product_name).join(', ')}
                          </p>
                        )}
                        <p className="text-[#00A0E0] mt-2">${displayPrice?.toFixed(2)} CAD</p>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => item.product && onNavigate('product', item.product.slug)}
                          className="text-lg font-light text-white hover:text-[#00A0E0] transition-colors text-left"
                        >
                          {displayName}
                        </button>
                        {item.product?.dosage && (
                          <p className="text-sm text-gray-400 mt-1">{item.product.dosage}</p>
                        )}
                        <p className="text-[#00A0E0] mt-2">${displayPrice?.toFixed(2)} CAD</p>
                      </>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 border border-gray-700 text-gray-400 hover:border-[#00A0E0] hover:text-[#00A0E0] transition-colors flex items-center justify-center"
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    <span className="text-white w-8 text-center">{item.quantity}</span>

                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 border border-gray-700 text-gray-400 hover:border-[#00A0E0] hover:text-[#00A0E0] transition-colors flex items-center justify-center"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-[#1a1a1a] border border-gray-800 p-6 sticky top-24">
              <h2 className="text-xl font-light text-white mb-6">{t('checkout.orderSummary')}</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-400">
                  <span>{t('cart.subtotal')}</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                {!promoApplied && volumeDiscount.applied && (
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-green-400" />
                      <span className="text-gray-400">Volume Discount ({volumeDiscount.percentage}%)</span>
                    </div>
                    <span className="text-green-400 font-medium">-${volumeDiscount.amount.toFixed(2)}</span>
                  </div>
                )}

                {promoApplied && promoDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Ticket className="h-4 w-4 text-[#00A0E0]" />
                      <span className="text-gray-400">Discount ({promoCode})</span>
                    </div>
                    <span className="text-[#00A0E0] font-medium">-${promoDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="bg-gradient-to-br from-[#00A0E0]/5 to-[#11D0FF]/5 rounded-lg p-4 border border-[#00A0E0]/20">
                  <div className="flex items-center space-x-2 mb-3">
                    <Ticket className="h-4 w-4 text-[#00A0E0]" />
                    <span className="text-sm font-medium text-gray-300">Promo Code</span>
                  </div>

                  {!promoApplied ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          placeholder="Enter code"
                          className="flex-1 px-3 py-2 bg-[#050608] border border-white/10 rounded text-white text-sm focus:ring-2 focus:ring-[#00A0E0] focus:border-[#00A0E0] transition-all placeholder:text-gray-600"
                          disabled={promoValidating}
                        />
                        <button
                          type="button"
                          onClick={handleApplyPromo}
                          disabled={promoValidating || !promoCode.trim()}
                          className="px-4 py-2 bg-[#00A0E0] hover:bg-[#007ab8] disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded text-sm font-medium transition-colors"
                        >
                          {promoValidating ? (
                            <div className="flex items-center space-x-1">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              <span>Checking</span>
                            </div>
                          ) : 'Apply'}
                        </button>
                      </div>

                      {promoError && (
                        <div className="flex items-start space-x-2 p-2 bg-red-500/10 border border-red-500/30 rounded">
                          <XCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-red-400">{promoError}</p>
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex items-start space-x-2 text-xs text-gray-500">
                          <AlertCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                          <span>Limited: first 20 orders. Minimum $300+.</span>
                        </div>
                        <div className="flex items-start space-x-2 text-xs text-amber-400/80">
                          <AlertCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                          <span>Promo codes cannot be combined with automatic discounts.</span>
                        </div>
                        {volumeDiscount.applied && volumeDiscount.amount > 0 && (
                          <div className="text-xs text-gray-500 pl-5">
                            Current auto discount: {volumeDiscount.percentage}% (-${volumeDiscount.amount.toFixed(2)})
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-green-500/10 border border-green-500/30 rounded">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                          <span className="text-sm text-green-400 font-medium">Promo applied: -${promoDiscount.toFixed(2)}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemovePromo}
                          className="text-gray-400 hover:text-red-400 transition-colors"
                          title="Remove promo code"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {!promoApplied && !volumeDiscount.applied && subtotal < 300 && (
                  <div className="text-xs text-gray-400 bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                    Add ${(300 - subtotal).toFixed(2)} more to unlock 10% OFF + Free Shipping
                  </div>
                )}

                {!promoApplied && volumeDiscount.applied && volumeDiscount.percentage === 10 && subtotal < 500 && (
                  <div className="text-xs text-gray-400 bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                    Add ${(500 - subtotal).toFixed(2)} more to unlock 15% OFF
                  </div>
                )}

                <div className="flex justify-between text-gray-400">
                  <span>{t('checkout.shippingFee')}</span>
                  <span>Calculated at checkout</span>
                </div>

                <div className="flex justify-between text-gray-400">
                  <span>Taxes</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="h-px bg-gray-800 mb-6"></div>

              <div className="flex justify-between text-xl font-light text-white mb-8">
                <span>Subtotal</span>
                <span className="text-[#00A0E0]">${discountedSubtotal.toFixed(2)}</span>
              </div>

              <p className="text-xs text-gray-400 text-center mb-6">
                Taxes and shipping calculated at checkout
              </p>

              <button
                onClick={() => onNavigate('checkout')}
                className="w-full py-4 bg-[#00A0E0] text-white hover:bg-[#007ab8] transition-colors font-light tracking-wide"
              >
                {t('cart.proceedToCheckout').toUpperCase()}
              </button>

              <button
                onClick={() => onNavigate('catalogue')}
                className="w-full mt-3 py-4 bg-transparent border border-gray-700 text-gray-400 hover:border-[#00A0E0] hover:text-[#00A0E0] transition-all font-light tracking-wide"
              >
                {t('cart.continueShopping').toUpperCase()}
              </button>

              <p className="text-xs text-gray-600 text-center mt-6">
                {t('footer.researchUseWarning')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
