import { Lock, Truck, FlaskConical, MapPin, Gift } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function CatalogueHeader() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className={`relative bg-gradient-to-b from-[#050608] via-[#0B0D12] to-[#050608] py-12 md:py-16 border-b border-white/10 overflow-hidden ${prefersReducedMotion ? '' : 'animate-fade-in'}`}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,_rgba(0,160,224,0.06)_0%,_transparent_70%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-6 md:mb-8">
          <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight ${prefersReducedMotion ? '' : 'animate-[fadeInUp_0.8s_ease-out_0.2s_both]'}`}>
            Peptide Catalogue
          </h1>

          <p className={`text-sm md:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed ${prefersReducedMotion ? '' : 'animate-[fadeInUp_0.8s_ease-out_0.3s_both]'}`}>
            Premium compounds with fast availability checks and streamlined ordering.
          </p>
        </div>

        <div className={`flex flex-wrap items-center justify-center gap-4 md:gap-8 py-4 mb-4 ${prefersReducedMotion ? '' : 'animate-[fadeInUp_0.8s_ease-out_0.4s_both]'}`}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#00A0E0]/10 rounded-lg border border-[#00A0E0]/30">
              <Lock className="h-3.5 w-3.5 md:h-4 md:w-4 text-[#00A0E0]" />
            </div>
            <span className="text-xs md:text-sm text-gray-300 font-medium">Secure Checkout</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#00A0E0]/10 rounded-lg border border-[#00A0E0]/30">
              <FlaskConical className="h-3.5 w-3.5 md:h-4 md:w-4 text-[#00A0E0]" />
            </div>
            <span className="text-xs md:text-sm text-gray-300 font-medium">Inventory-tracked</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#00A0E0]/10 rounded-lg border border-[#00A0E0]/30">
              <Truck className="h-3.5 w-3.5 md:h-4 md:w-4 text-[#00A0E0]" />
            </div>
            <span className="text-xs md:text-sm text-gray-300 font-medium">Discreet Packaging</span>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <div className="p-1.5 bg-[#00A0E0]/10 rounded-lg border border-[#00A0E0]/30">
              <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 text-[#00A0E0]" />
            </div>
            <span className="text-xs md:text-sm text-gray-300 font-medium">Canada Shipping</span>
          </div>
        </div>

        <div className={`flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl max-w-2xl mx-auto ${prefersReducedMotion ? '' : 'animate-[fadeInUp_0.8s_ease-out_0.5s_both]'}`}>
          <Gift className="h-4 w-4 text-green-400 flex-shrink-0" />
          <p className="text-xs md:text-sm text-green-300 font-medium text-center">
            <span className="font-bold">10% OFF $300+</span>
            <span className="mx-2 text-green-500">•</span>
            <span className="font-bold">15% OFF $500+</span>
            <span className="mx-2 text-green-500 hidden sm:inline">•</span>
            <span className="text-green-400 hidden sm:inline">Applied automatically at checkout</span>
          </p>
        </div>
      </div>
    </section>
  );
}
