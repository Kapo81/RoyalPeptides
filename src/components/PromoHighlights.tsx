import { Gift, ChevronRight } from 'lucide-react';

interface PromoHighlightsProps {
  onNavigate: (page: string) => void;
}

export default function PromoHighlights({ onNavigate }: PromoHighlightsProps) {
  const promos = [
    {
      title: '10% OFF Orders $300+',
      description: 'Discount applies worldwide. Free shipping applies in Canada only.',
      page: 'catalogue',
    },
    {
      title: '15% OFF Orders $500+',
      description: 'Discount applies worldwide. Free shipping applies in Canada only.',
      page: 'stacks',
    },
  ];

  return (
    <div className="inline-flex flex-col gap-3 w-full max-w-md">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-gradient-to-br from-[#0093D0]/10 to-[#0093D0]/5 rounded-md border border-[#0093D0]/20">
          <Gift className="h-4 w-4 text-[#0093D0]" strokeWidth={1.5} />
        </div>
        <span className="text-sm font-medium text-gray-200 tracking-wide">
          Limited Offers
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        {promos.map((promo, index) => (
          <button
            key={index}
            onClick={() => onNavigate(promo.page)}
            className="group bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-sm rounded-lg border border-white/[0.08] hover:border-[#0093D0]/30 p-3.5 sm:p-4 text-left transition-all duration-300 hover:translate-x-1 sm:hover:translate-y-[-2px] sm:hover:translate-x-0 hover:shadow-[0_8px_24px_rgba(0,147,208,0.15)] sm:flex-1"
          >
            <div className="flex items-start justify-between gap-2 sm:gap-3 mb-1.5 sm:mb-2">
              <h3 className="text-sm sm:text-base font-semibold text-white group-hover:text-[#0093D0] transition-colors duration-300">
                {promo.title}
              </h3>
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-[#0093D0] transition-colors duration-300 flex-shrink-0 opacity-0 group-hover:opacity-100" />
            </div>
            <p className="text-[11px] sm:text-xs text-gray-400 leading-relaxed">
              {promo.description}
            </p>
          </button>
        ))}
      </div>

      <p className="text-[10px] text-gray-500 text-center leading-relaxed pt-1">
        Discounts applied automatically at checkout.
      </p>
    </div>
  );
}
