import { useState } from 'react';
import { Info } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function HeroPromoPills() {
  const [showTooltip, setShowTooltip] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const promos = [
    {
      discount: '10% OFF',
      threshold: '$300+ orders',
      shipping: 'Free shipping in Canada',
    },
    {
      discount: '15% OFF',
      threshold: '$500+ orders',
      shipping: 'Free shipping in Canada',
    },
  ];

  return (
    <div className={`w-full max-w-2xl ${prefersReducedMotion ? '' : 'animate-fade-up-delayed'}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-medium text-gray-300">Limited Offers</span>
        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
            className="p-1 rounded-full hover:bg-white/5 transition-colors"
            aria-label="Discount and shipping information"
          >
            <Info className="h-4 w-4 text-gray-400" />
          </button>

          {showTooltip && (
            <div className="absolute left-0 top-full mt-2 w-64 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-3 text-xs text-gray-300 z-50 shadow-xl">
              Discount applies worldwide. Free shipping is Canada-only.
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {promos.map((promo, index) => (
          <div
            key={index}
            className={`relative flex-1 group ${
              prefersReducedMotion ? '' : 'hover:scale-[1.02] transition-transform duration-300'
            }`}
          >
            <div
              className="relative bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-[#00A0E0]/12 p-4 overflow-hidden"
              style={{
                boxShadow: '0 4px 24px rgba(0, 160, 224, 0.08)',
              }}
            >
              {!prefersReducedMotion && (
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{
                    background:
                      'linear-gradient(110deg, transparent 0%, rgba(0, 160, 224, 0.1) 45%, rgba(17, 208, 255, 0.15) 50%, rgba(0, 160, 224, 0.1) 55%, transparent 100%)',
                    animation: 'sheen 10s ease-in-out infinite',
                    animationDelay: `${index * 2}s`,
                  }}
                />
              )}

              <div className="relative z-10">
                <div className="text-2xl font-bold text-white mb-1">{promo.discount}</div>
                <div className="text-sm text-gray-300 mb-2">{promo.threshold}</div>
                <div className="text-xs text-[#00A0E0]/80 font-medium">{promo.shipping}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 text-center mt-3">
        Discounts applied automatically at checkout
      </p>
    </div>
  );
}
