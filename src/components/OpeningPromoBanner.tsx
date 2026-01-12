import { Sparkles } from 'lucide-react';

export default function OpeningPromoBanner() {
  return (
    <div className="animate-[fadeIn_1s_ease-out_0.6s_both] w-full max-w-3xl mb-6 md:mb-8">
      <div className="relative group">
        <div
          className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-teal-400/25 to-cyan-500/20 rounded-2xl blur-xl
                     animate-[pulse_3s_ease-in-out_infinite] opacity-60 group-hover:opacity-80 transition-opacity duration-500"
        />

        <div className="relative backdrop-blur-xl bg-gradient-to-br from-cyan-950/40 via-teal-950/50 to-cyan-900/40
                       border border-cyan-400/30 rounded-2xl overflow-hidden
                       shadow-[0_8px_32px_rgba(0,255,255,0.15)] hover:shadow-[0_8px_40px_rgba(0,255,255,0.25)]
                       transition-all duration-500">

          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent
                       animate-[shimmer_3s_ease-in-out_infinite]"
            style={{
              backgroundSize: '200% 100%',
            }}
          />

          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-teal-400/10 to-transparent opacity-40" />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-cyan-400/10 to-transparent opacity-30" />

          <div className="relative px-4 py-4 md:px-8 md:py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6">

              <div className="flex items-start md:items-center gap-3 md:gap-4">
                <div className="flex-shrink-0 mt-0.5 md:mt-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-cyan-400/30 rounded-lg blur-md animate-[pulse_2s_ease-in-out_infinite]" />
                    <div className="relative bg-gradient-to-br from-cyan-400/20 to-teal-400/20 p-2 md:p-2.5 rounded-lg
                                  border border-cyan-400/40 backdrop-blur-sm">
                      <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-cyan-300" />
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h3 className="text-sm md:text-base font-semibold text-cyan-100 tracking-wide">
                      Grand Opening Offer
                    </h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] md:text-xs font-medium
                                   bg-gradient-to-r from-teal-400/20 to-cyan-400/20 text-cyan-200
                                   border border-cyan-400/30 backdrop-blur-sm">
                      Opening Promotion
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <p className="text-xl md:text-3xl font-bold bg-gradient-to-r from-cyan-200 via-teal-100 to-cyan-300
                                bg-clip-text text-transparent tracking-tight">
                      $50 OFF — First 25 Orders
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 text-left md:text-right pl-11 md:pl-0">
                <p className="text-xs md:text-sm text-cyan-100/90 font-medium mb-0.5">
                  On orders of $300+
                </p>
                <p className="text-[10px] md:text-xs text-cyan-200/70 italic">
                  Limited opening promotion
                </p>
              </div>

            </div>
          </div>

          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-400/40 to-transparent" />
        </div>
      </div>
    </div>
  );
}
