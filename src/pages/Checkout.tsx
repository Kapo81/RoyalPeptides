import { useEffect, useState } from 'react';
import { ArrowLeft, Package, AlertTriangle, Mail, Truck, Tag, Shield, Ticket, X, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { supabase, Product, getSessionId } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { getShippingInfo, CANADIAN_PROVINCES } from '../lib/shippingCalculator';
import { calculateDiscount } from '../lib/discountCalculator';
import { calculateTax } from '../lib/taxCalculator';

interface CheckoutProps {
  onNavigate: (page: string, orderNumber?: string) => void;
}

interface CartItemWithProduct {
  id: string;
  quantity: number;
  product: Product | null;
  bundle_id: string | null;
  bundle_name: string | null;
  bundle_price: number | null;
  bundle_products: any[];
}

export default function Checkout({ onNavigate }: CheckoutProps) {
  const { t } = useLanguage();
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [paymentMethod] = useState<'etransfer'>('etransfer');
  const [error, setError] = useState<string | null>(null);

  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [promoValidating, setPromoValidating] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: 'ON',
    postalCode: '',
    country: 'Canada',
  });

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    const sessionId = getSessionId();

    const { data: cartData, error } = await supabase
      .from('cart_items')
      .select('id, quantity, product_id, bundle_id, bundle_name, bundle_price, bundle_products')
      .eq('session_id', sessionId);

    if (error) {
      console.error('Error fetching cart:', error);
      setLoading(false);
      return;
    }

    if (!cartData || cartData.length === 0) {
      setLoading(false);
      return;
    }

    // Fetch products only for non-bundle items
    const productIds = cartData.filter(item => item.product_id).map(item => item.product_id);
    let productsData: Product[] = [];

    if (productIds.length > 0) {
      const { data } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);
      productsData = data || [];
    }

    const itemsWithProducts = cartData.map(item => ({
      id: item.id,
      quantity: item.quantity,
      product: item.product_id ? productsData.find(p => p.id === item.product_id) || null : null,
      bundle_id: item.bundle_id,
      bundle_name: item.bundle_name,
      bundle_price: item.bundle_price,
      bundle_products: item.bundle_products || [],
    }));

    setCartItems(itemsWithProducts);
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }

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

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      if (item.bundle_id && item.bundle_price) {
        // Bundle item
        return sum + item.bundle_price * item.quantity;
      } else if (item.product) {
        // Regular product item
        return sum + (item.product.price_cad || item.product.price) * item.quantity;
      }
      return sum;
    }, 0);
  };

  const getTotalVials = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const subtotal = calculateSubtotal();
  const volumeDiscount = calculateDiscount(subtotal);

  // STACKING RULE: Promo codes do NOT stack with automatic volume discounts
  // If promo is applied, volume discount is disabled
  const activeDiscount = promoApplied ? 0 : volumeDiscount.amount;
  const activePromoDiscount = promoApplied ? promoDiscount : 0;
  const discountedSubtotal = subtotal - activeDiscount - activePromoDiscount;

  const shippingInfo = getShippingInfo(
    getTotalVials(),
    formData.province,
    subtotal,
    formData.country !== 'Canada'
  );

  const shippingFee = shippingInfo.cost;
  const taxableAmount = discountedSubtotal + shippingFee;
  const taxInfo = calculateTax(taxableAmount, formData.country === 'Canada' ? formData.province : undefined);
  const total = taxableAmount + taxInfo.total;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptTerms) {
      setError('Please accept the terms and conditions to proceed.');
      return;
    }

    setError(null);
    setProcessing(true);

    try {
      const sessionId = getSessionId();
      const subtotal = calculateSubtotal();
      const discount = calculateDiscount(subtotal);
      const discountedSubtotal = subtotal - discount.amount - promoDiscount;
      const taxableAmount = discountedSubtotal + shippingFee;
      const taxInfo = calculateTax(taxableAmount, formData.country === 'Canada' ? formData.province : undefined);
      const orderTotal = taxableAmount + taxInfo.total;

      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
      const randomDigits = String(Math.floor(Math.random() * 100000)).padStart(5, '0');
      const orderNumber: string = `RP-${dateStr}-${randomDigits}`;

      // Create order in database for both payment methods
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_first_name: formData.firstName,
          customer_last_name: formData.lastName,
          customer_email: formData.email,
          customer_phone: formData.phone,
          shipping_address: formData.address,
          shipping_city: formData.city,
          shipping_postal_code: formData.postalCode,
          shipping_province: formData.province,
          shipping_country: formData.country,
          payment_method: paymentMethod,
          payment_provider: paymentMethod,
          payment_status: 'pending',
          fulfillment_status: 'pending',
          subtotal: subtotal,
          discount_amount: discount.amount,
          discount_percentage: discount.percentage,
          promo_discount: promoDiscount,
          promo_code: promoApplied ? promoCode.trim() : null,
          shipping_fee: shippingFee,
          tax_amount: taxInfo.total,
          tax_rate: taxInfo.rate,
          total: orderTotal,
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        setError('Failed to create order. Please check your information and try again.');
        setProcessing(false);
        return;
      }

      // Atomically redeem promo code if one was applied
      if (promoApplied && promoCode.trim()) {
        try {
          const { data: redemptionData, error: redemptionError } = await supabase.rpc('validate_and_redeem_promo', {
            p_code: promoCode.trim(),
            p_subtotal: subtotal,
            p_order_id: orderData.id,
            p_order_number: orderNumber,
          });

          if (redemptionError || !redemptionData?.success) {
            console.error('Promo redemption failed:', redemptionError || redemptionData);
            // Promo code failed to redeem - update order to remove promo discount
            const updatedTotal = orderTotal + promoDiscount;
            await supabase
              .from('orders')
              .update({
                promo_code: null,
                promo_discount: 0,
                total: updatedTotal,
              })
              .eq('id', orderData.id);

            setError(
              `Order placed successfully, but promo code could not be applied: ${redemptionData?.error || 'Unknown error'}. ` +
              `Your total has been adjusted to $${updatedTotal.toFixed(2)}.`
            );
          } else {
            console.log('Promo code redeemed successfully:', redemptionData);
          }
        } catch (promoErr) {
          console.error('Unexpected error redeeming promo:', promoErr);
          // Continue with order anyway
        }
      }

      const orderItemsData = cartItems.map(item => {
        if (item.bundle_id) {
          return {
            order_id: orderData.id,
            product_id: null,
            bundle_id: item.bundle_id,
            quantity: item.quantity,
            price: item.bundle_price || 0,
          };
        } else {
          return {
            order_id: orderData.id,
            product_id: item.product?.id || null,
            bundle_id: null,
            quantity: item.quantity,
            price: item.product ? (item.product.price_cad || item.product.price) : 0,
          };
        }
      });

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
      }

      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        console.log('[Checkout] Sending order email notification:', orderData.id);
        const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            order_id: orderData.id,
          }),
        });

        const emailResult = await emailResponse.json();
        if (emailResult.email_sent) {
          console.log('[Checkout] Order email sent successfully');
        } else {
          console.log('[Checkout] Order email queued for retry:', emailResult.email_id);
        }
      } catch (emailError) {
        console.error('[Checkout] Error sending order email (non-blocking):', emailError);
      }

      await supabase
        .from('cart_items')
        .delete()
        .eq('session_id', sessionId);

      setProcessing(false);
      onNavigate('order-confirmation', orderNumber);
    } catch (error) {
      console.error('Error processing order:', error);
      setError('Failed to process order. Please try again or contact support if the issue persists.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050608] flex items-center justify-center pt-24 sm:pt-28">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A0E0] mx-auto mb-4"></div>
          <p className="text-gray-400">{t('cart.loading')}</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#050608] pt-24 sm:pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-8 sm:py-16">
            <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">{t('cart.empty')}</h2>
            <button
              onClick={() => onNavigate('catalogue')}
              className="px-8 py-3 bg-gradient-to-r from-[#00A0E0] to-[#11D0FF] text-white rounded-lg font-medium hover:shadow-[0_0_20px_rgba(0,160,224,0.5)] transition-all"
            >
              {t('cart.startShopping')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050608] pt-24 sm:pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => onNavigate('cart')}
          className="flex items-center space-x-2 text-[#00A0E0] hover:text-[#11D0FF] mb-6 sm:mb-8 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>{t('checkout.backToCart')}</span>
        </button>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8 sm:mb-12">{t('checkout.title')}</h1>

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 mb-8">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="h-6 w-6 text-red-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold text-red-400 mb-2">Order Error</h3>
                <p className="text-red-100/90 text-sm leading-relaxed mb-4">
                  {error}
                </p>
                <button
                  onClick={() => setError(null)}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-lg text-sm font-medium transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-gradient-to-br from-[#0B0D12] to-[#050608] border border-white/10 rounded-xl p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-white mb-6">{t('checkout.contactInfo')}</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('checkout.firstName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#050608] border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#00A0E0] focus:border-[#00A0E0] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('checkout.lastName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#050608] border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#00A0E0] focus:border-[#00A0E0] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('checkout.email')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#050608] border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#00A0E0] focus:border-[#00A0E0] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('checkout.phone')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#050608] border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#00A0E0] focus:border-[#00A0E0] transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#0B0D12] to-[#050608] border border-white/10 rounded-xl p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-white mb-6">{t('checkout.shippingAddress')}</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('checkout.address')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#050608] border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#00A0E0] focus:border-[#00A0E0] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="country"
                    required
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#050608] border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#00A0E0] focus:border-[#00A0E0] transition-all"
                  >
                    <option value="Canada">Canada</option>
                    <option value="International">International</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('checkout.city')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#050608] border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#00A0E0] focus:border-[#00A0E0] transition-all"
                    />
                  </div>

                  {formData.country === 'Canada' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Province <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="province"
                        required
                        value={formData.province}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#050608] border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#00A0E0] focus:border-[#00A0E0] transition-all"
                      >
                        {CANADIAN_PROVINCES.map(province => (
                          <option key={province.code} value={province.code}>
                            {province.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('checkout.postalCode')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      required
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#050608] border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#00A0E0] focus:border-[#00A0E0] transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#0B0D12] to-[#050608] border border-white/10 rounded-xl p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Payment Method</h2>

              <div className="p-6 rounded-xl bg-gradient-to-br from-[#00A0E0]/10 to-[#11D0FF]/10 border border-[#00A0E0]/30">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="p-3 rounded-xl bg-[#00A0E0]/20 border border-[#00A0E0]/50">
                    <Mail className="h-8 w-8 text-[#00A0E0]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-white">
                      Interac e-Transfer
                    </h3>
                    <p className="text-sm text-gray-400">Canada only</p>
                  </div>
                </div>

                <div className="bg-[#050608] border border-white/10 rounded-lg p-4">
                  <p className="text-sm text-gray-300 text-center">
                    Complete payment instructions will be provided after you place your order
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-gray-400">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span>Secure Canadian payment processing</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <AlertTriangle className="h-6 w-6 text-amber-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-amber-400 mb-2">{t('checkout.compliance')}</h3>
                  <p className="text-amber-100/90 text-sm leading-relaxed mb-4">
                    {t('checkout.complianceText')}
                  </p>
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-amber-500/50 bg-amber-900/30 text-[#00A0E0] focus:ring-[#00A0E0]"
                      required
                    />
                    <span className="text-amber-100 text-sm">{t('checkout.accept')}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-[#0B0D12] to-[#050608] border border-white/10 rounded-xl p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-white mb-6">{t('checkout.orderSummary')}</h2>

              <div className="space-y-4 mb-6">
                {cartItems.map((item) => {
                  const isBundle = item.bundle_id !== null;
                  const displayName = isBundle ? item.bundle_name : item.product?.name;
                  const displayPrice = isBundle
                    ? (item.bundle_price || 0) * item.quantity
                    : item.product ? ((item.product.price_cad || item.product.price) * item.quantity) : 0;

                  return (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-300">
                        {displayName} x {item.quantity}
                      </span>
                      <span className="text-white font-medium">
                        ${displayPrice.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{t('cart.subtotal')}</span>
                  <span className="text-white">${subtotal.toFixed(2)}</span>
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
                          className="flex-1 px-3 py-2 bg-[#050608] border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:ring-[#00A0E0] focus:border-[#00A0E0] transition-all placeholder:text-gray-600"
                          disabled={promoValidating}
                        />
                        <button
                          type="button"
                          onClick={handleApplyPromo}
                          disabled={promoValidating || !promoCode.trim()}
                          className="px-4 py-2 bg-[#00A0E0] hover:bg-[#007ab8] disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
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

                <div className="bg-gradient-to-br from-[#00A0E0]/10 to-[#11D0FF]/10 rounded-lg p-3 border border-[#00A0E0]/30">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <div className="flex items-center space-x-2">
                      <Truck className="h-4 w-4 text-[#00A0E0]" />
                      <span className="text-gray-300">Shipping</span>
                    </div>
                    <span className={`font-semibold ${shippingInfo.isFree ? 'text-green-400' : 'text-white'}`}>
                      {shippingInfo.isFree ? 'FREE' : `$${shippingFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 space-y-1">
                    <p>{shippingInfo.method}</p>
                    <p className="text-[#00A0E0]">
                      Estimated delivery: {shippingInfo.estimatedDays} business days
                    </p>
                  </div>
                </div>

                {!shippingInfo.isFree && subtotal < 300 && formData.country === 'Canada' && (
                  <div className="text-xs text-gray-400 bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                    Add ${(300 - subtotal).toFixed(2)} more for FREE shipping
                  </div>
                )}

                {!volumeDiscount.applied && subtotal < 300 && (
                  <div className="text-xs text-gray-400 bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                    Add ${(300 - subtotal).toFixed(2)} more to unlock 10% OFF
                  </div>
                )}

                <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-lg p-3 border border-white/10">
                  <div className="space-y-2">
                    {taxInfo.gst > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">GST (5%)</span>
                        <span className="text-white">${taxInfo.gst.toFixed(2)}</span>
                      </div>
                    )}
                    {taxInfo.qst > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">QST (9.975%)</span>
                        <span className="text-white">${taxInfo.qst.toFixed(2)}</span>
                      </div>
                    )}
                    {taxInfo.pst > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">PST ({((taxInfo.pst / taxableAmount) * 100).toFixed(1)}%)</span>
                        <span className="text-white">${taxInfo.pst.toFixed(2)}</span>
                      </div>
                    )}
                    {taxInfo.hst > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">HST ({(taxInfo.rate * 100).toFixed(0)}%)</span>
                        <span className="text-white">${taxInfo.hst.toFixed(2)}</span>
                      </div>
                    )}
                    {(taxInfo.gst > 0 || taxInfo.qst > 0 || taxInfo.pst > 0) && (
                      <div className="pt-2 border-t border-white/10">
                        <div className="flex justify-between items-center text-sm font-semibold">
                          <span className="text-gray-300">Total Taxes</span>
                          <span className="text-white">${taxInfo.total.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  {formData.country === 'Canada' && formData.province && (
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      {formData.province} tax rates applied
                    </p>
                  )}
                </div>

                <div className="flex justify-between text-lg font-bold border-t border-white/10 pt-3">
                  <span className="text-white">{t('checkout.orderTotal')}</span>
                  <span className="text-[#00A0E0]">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 mb-4 p-4 bg-gradient-to-br from-[#00A0E0]/10 to-[#11D0FF]/10 rounded-lg border border-[#00A0E0]/30 text-center">
                <p className="text-sm font-semibold text-[#00A0E0] mb-2">Made & Shipped from Canada</p>
                <p className="text-xs text-gray-400">
                  Premium research peptides processed and shipped from Canadian facilities
                </p>
              </div>

              <button
                type="submit"
                disabled={processing || !acceptTerms}
                className="w-full py-4 bg-gradient-to-r from-[#00A0E0] to-[#11D0FF] text-white rounded-lg font-bold text-lg hover:shadow-[0_0_30px_rgba(0,160,224,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? t('checkout.processing') : t('checkout.placeOrder')}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                {t('footer.researchUseWarning')}
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
