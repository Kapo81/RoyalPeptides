import { LucideIcon } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface ProcessStep {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface ReturnProcessTimelineProps {
  steps: ProcessStep[];
}

export default function ReturnProcessTimeline({ steps }: ReturnProcessTimelineProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isLast = index === steps.length - 1;

        return (
          <div key={index} className="relative">
            <div className="flex gap-4">
              <div className="relative flex flex-col items-center">
                <div className="relative z-10 p-3 bg-gradient-to-br from-[#00A0E0]/20 to-[#00A0E0]/5 rounded-full border border-[#00A0E0]/30">
                  <Icon className="h-5 w-5 text-[#00A0E0]" strokeWidth={1.5} />
                </div>
                {!isLast && (
                  <div className="absolute top-12 bottom-0 w-0.5 bg-gradient-to-b from-[#00A0E0]/30 to-transparent" />
                )}
              </div>

              <div className={`flex-1 pb-8 ${isLast ? '' : 'border-b border-white/5'}`}>
                <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-4 border border-white/10 group hover:border-[#00A0E0]/30 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-[#00A0E0] bg-[#00A0E0]/10 px-2 py-0.5 rounded">
                      Step {index + 1}
                    </span>
                    <h3 className="font-semibold text-white group-hover:text-[#00A0E0] transition-colors">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
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
