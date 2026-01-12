import { useReducedMotion } from '../hooks/useReducedMotion';

interface BrandValuesTickerProps {
  values: string[];
}

export default function BrandValuesTicker({ values }: BrandValuesTickerProps) {
  const prefersReducedMotion = useReducedMotion();

  const doubledValues = [...values, ...values];

  return (
    <div className="relative overflow-hidden py-4 border-y border-white/10 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent">
      <div className="absolute inset-0 bg-gradient-to-r from-[#050608] via-transparent to-[#050608] pointer-events-none z-10" />

      <div
        className={`flex gap-8 ${prefersReducedMotion ? '' : 'animate-scroll'}`}
        style={{
          width: prefersReducedMotion ? 'auto' : 'max-content',
        }}
      >
        {(prefersReducedMotion ? values : doubledValues).map((value, index) => (
          <div
            key={index}
            className="flex items-center gap-3 flex-shrink-0"
          >
            <span className="text-sm font-medium text-gray-300 whitespace-nowrap">
              {value}
            </span>
            {index < (prefersReducedMotion ? values.length - 1 : doubledValues.length - 1) && (
              <span className="text-[#00A0E0]">•</span>
            )}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-scroll {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
