import { useState, useEffect } from 'react';
import { CheckCircle, Gift, TrendingUp } from 'lucide-react';
import { supabase, getSessionId } from '../lib/supabase';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface DiscountProgressProps {
  className?: string;
}

export default function DiscountProgress({ className = '' }: DiscountProgressProps) {
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    fetchCartTotal();

    const interval = setInterval(fetchCartTotal, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchCartTotal = async () => {
    const sessionId = getSessionId();

    const { data: cartItems } = await supabase
      .from('cart_items')
      .select('*, products:product_id(*)')
      .eq('session_id', sessionId);

    if (cartItems) {
      let total = 0;
      cartItems.forEach(item => {
        if (item.bundle_price) {
          total += item.bundle_price * item.quantity;
        } else if (item.products) {
          total += item.products.selling_price * item.quantity;
        }
      });
      setCartTotal(total);
    }

    setLoading(false);
  };

  const threshold1 = 300;
  const threshold2 = 500;

  const progress = Math.min((cartTotal / threshold2) * 100, 100);
  const remainingTo300 = Math.max(threshold1 - cartTotal, 0);
  const remainingTo500 = Math.max(threshold2 - cartTotal, 0);

  const isUnlocked300 = cartTotal >= threshold1;
  const isUnlocked500 = cartTotal >= threshold2;

  if (loading) {
    return null;
  }

  return (
    <div
      className={`bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl p-4 md:p-6 ${
        prefersReducedMotion ? '' : 'animate-fade-in'
      } ${className}`}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-gradient-to-br from-[#00A0E0]/20 to-[#00A0E0]/5 rounded-lg border border-[#00A0E0]/30">
          <Gift className="h-4 w-4 text-[#00A0E0]" />
        </div>
        <h3 className="text-sm md:text-base font-bold text-white">Unlock Discounts</h3>
      </div>

      <div className="relative h-3 bg-white/5 rounded-full overflow-hidden mb-4">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#00A0E0] to-[#11D0FF] rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_ease-in-out_infinite]" />
        </div>

        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white/30"
          style={{ left: `${(threshold1 / threshold2) * 100}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full border-2 border-[#0B0D12]" />
        </div>

        <div className="absolute top-0 bottom-0 right-0 w-0.5 bg-white/30">
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full border-2 border-[#0B0D12]" />
        </div>
      </div>

      <div className="space-y-3">
        <div
          className={`flex items-start gap-2 p-3 rounded-lg border transition-all ${
            isUnlocked300
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-white/5 border-white/10'
          }`}
        >
          <CheckCircle
            className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
              isUnlocked300 ? 'text-green-400' : 'text-gray-500'
            }`}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className={`text-sm font-semibold ${isUnlocked300 ? 'text-green-300' : 'text-white'}`}>
                10% OFF
              </span>
              <span className="text-xs text-gray-400">at ${threshold1}+</span>
            </div>
            {!isUnlocked300 && remainingTo300 > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                ${remainingTo300.toFixed(2)} away
              </p>
            )}
            {isUnlocked300 && (
              <p className="text-xs text-green-400 mt-1">Unlocked ✓</p>
            )}
          </div>
        </div>

        <div
          className={`flex items-start gap-2 p-3 rounded-lg border transition-all ${
            isUnlocked500
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-white/5 border-white/10'
          }`}
        >
          <CheckCircle
            className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
              isUnlocked500 ? 'text-green-400' : 'text-gray-500'
            }`}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className={`text-sm font-semibold ${isUnlocked500 ? 'text-green-300' : 'text-white'}`}>
                15% OFF
              </span>
              <span className="text-xs text-gray-400">at ${threshold2}+</span>
            </div>
            {!isUnlocked500 && remainingTo500 > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                ${remainingTo500.toFixed(2)} away
              </p>
            )}
            {isUnlocked500 && (
              <p className="text-xs text-green-400 mt-1">Unlocked ✓</p>
            )}
          </div>
        </div>
      </div>

      {cartTotal > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Current Cart</span>
            <span className="text-white font-semibold">${cartTotal.toFixed(2)}</span>
          </div>
        </div>
      )}

      <p className="text-[10px] text-gray-500 mt-3 text-center leading-relaxed">
        Discounts applied automatically at checkout
      </p>
    </div>
  );
}
