import { Gift, Check } from 'lucide-react';

export default function PromotionCard() {
  return (
    <section
      className="relative bg-gradient-to-br from-[#0a141e]/65 via-[#0a1420]/65 to-[#0a141e]/65 backdrop-blur-xl rounded-2xl border border-[#0093D0]/30 shadow-[0_8px_32px_rgba(0,147,208,0.15)] p-5 md:p-6 animate-[fadeIn_0.8s_ease-out_0.6s_both]"
      aria-label="Promotions"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#0093D0]/5 to-transparent rounded-2xl" />
      <div className="absolute inset-0 rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="h-5 w-5 text-[#0093D0]" />
          <h3 className="text-lg md:text-xl font-bold text-white">
            Limited Research Offers
          </h3>
        </div>

        <div className="space-y-3">
          <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-4 border border-white/20 hover:border-[#0093D0]/40 transition-all">
            <h4 className="text-base md:text-lg font-bold text-white mb-2">
              10% OFF — Canada Only
            </h4>
            <p className="text-sm text-gray-300 font-medium mb-3">
              Orders $300 CAD+
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#0093D0] flex-shrink-0" />
                <span className="text-xs md:text-sm text-gray-300">Free Canada Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#0093D0] flex-shrink-0" />
                <span className="text-xs md:text-sm text-gray-300">Automatically applied at checkout</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-4 border border-white/20 hover:border-[#0093D0]/40 transition-all">
            <h4 className="text-base md:text-lg font-bold text-white mb-2">
              15% OFF — Canada Only
            </h4>
            <p className="text-sm text-gray-300 font-medium mb-3">
              Orders $500 CAD+
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#0093D0] flex-shrink-0" />
                <span className="text-xs md:text-sm text-gray-300">Free Canada Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#0093D0] flex-shrink-0" />
                <span className="text-xs md:text-sm text-gray-300">Automatically applied at checkout</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10">
          <p className="text-xs text-gray-400 text-center">
            Discounts applied automatically • No codes required
          </p>
        </div>
      </div>
    </section>
  );
}
