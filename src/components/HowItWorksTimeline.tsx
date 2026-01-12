import { LucideIcon } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface TimelineStep {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface HowItWorksTimelineProps {
  steps: TimelineStep[];
}

export default function HowItWorksTimeline({ steps }: HowItWorksTimelineProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 relative">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isLast = index === steps.length - 1;

        return (
          <div key={index} className="relative">
            {!isLast && (
              <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 -translate-x-1/2 z-0">
                <div className="h-full bg-gradient-to-r from-[#00A0E0]/40 via-[#00A0E0]/20 to-transparent" />
              </div>
            )}

            <div className={`relative z-10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-[#00A0E0]/50 transition-all duration-500 group h-full ${
              prefersReducedMotion ? '' : 'hover:-translate-y-1'
            }`}>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#00A0E0]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative p-4 bg-gradient-to-br from-[#00A0E0]/20 to-[#00A0E0]/5 rounded-full border border-[#00A0E0]/30 group-hover:scale-110 transition-transform duration-500">
                    <Icon className="h-8 w-8 text-[#00A0E0]" strokeWidth={1.5} />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#00A0E0]/10 rounded-full flex items-center justify-center border border-[#00A0E0]/30">
                    <span className="text-xs font-bold text-[#00A0E0]">{index + 1}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#00A0E0] transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
