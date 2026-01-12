interface BioEnergySignatureProps {
  intensity?: 'minimal' | 'subtle' | 'off';
}

export default function BioEnergySignature({ intensity = 'subtle' }: BioEnergySignatureProps) {
  if (intensity === 'off') return null;

  const particleCount = intensity === 'minimal' ? 10 : 18;
  const particles = Array.from({ length: particleCount }, (_, i) => i);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bio-energy-container">
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: intensity === 'minimal' ? 0.25 : 0.45 }}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <radialGradient id="particle-gradient-1">
            <stop offset="0%" stopColor="rgba(0, 160, 224, 0.5)" />
            <stop offset="40%" stopColor="rgba(17, 208, 255, 0.3)" />
            <stop offset="70%" stopColor="rgba(0, 160, 224, 0.15)" />
            <stop offset="100%" stopColor="rgba(0, 160, 224, 0)" />
          </radialGradient>

          <radialGradient id="particle-gradient-2">
            <stop offset="0%" stopColor="rgba(100, 200, 255, 0.45)" />
            <stop offset="40%" stopColor="rgba(17, 208, 255, 0.28)" />
            <stop offset="70%" stopColor="rgba(0, 160, 224, 0.12)" />
            <stop offset="100%" stopColor="rgba(0, 160, 224, 0)" />
          </radialGradient>

          <radialGradient id="particle-gradient-3">
            <stop offset="0%" stopColor="rgba(180, 220, 255, 0.48)" />
            <stop offset="40%" stopColor="rgba(100, 180, 255, 0.3)" />
            <stop offset="70%" stopColor="rgba(0, 160, 224, 0.14)" />
            <stop offset="100%" stopColor="rgba(0, 160, 224, 0)" />
          </radialGradient>
        </defs>

        {particles.map((i) => {
          const size = 35 + (i % 3) * 15;
          const startX = (i * 7) % 100;
          const startY = (i * 10) % 100;
          const gradient = `particle-gradient-${(i % 3) + 1}`;
          const duration = 22 + (i % 5) * 5;
          const delay = -(i * 3);

          return (
            <g key={i} className="bio-particle">
              <circle
                cx={`${startX}%`}
                cy={`${startY}%`}
                r={size}
                fill={`url(#${gradient})`}
                filter="url(#glow)"
                style={{
                  animation: `bio-float-${i % 4} ${duration}s ease-in-out infinite ${delay}s`,
                  transformOrigin: 'center',
                }}
              >
                <animate
                  attributeName="opacity"
                  values="0.35;0.65;0.45;0.7;0.35"
                  dur={`${duration * 0.8}s`}
                  repeatCount="indefinite"
                />
              </circle>

              <circle
                cx={`${startX}%`}
                cy={`${startY}%`}
                r={size * 0.65}
                fill="none"
                stroke="rgba(180, 220, 255, 0.2)"
                strokeWidth="1"
                style={{
                  animation: `bio-pulse ${duration * 0.6}s ease-in-out infinite ${delay}s`,
                  transformOrigin: 'center',
                }}
              />
            </g>
          );
        })}

        {intensity === 'subtle' && particles.slice(0, 6).map((i) => {
          const startX = (i * 20 + 10) % 90;
          const startY = (i * 15 + 5) % 90;
          const endX = (startX + 30) % 90;
          const endY = (startY + 25) % 90;
          const duration = 28 + i * 4;

          return (
            <line
              key={`connection-${i}`}
              x1={`${startX}%`}
              y1={`${startY}%`}
              x2={`${endX}%`}
              y2={`${endY}%`}
              stroke="rgba(0, 160, 224, 0.12)"
              strokeWidth="1"
              strokeDasharray="4 8"
              style={{
                animation: `bio-connection ${duration}s linear infinite`,
              }}
            >
              <animate
                attributeName="opacity"
                values="0.05;0.35;0.05"
                dur={`${duration}s`}
                repeatCount="indefinite"
              />
            </line>
          );
        })}
      </svg>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .bio-energy-container * {
            animation: none !important;
          }
        }

        @keyframes bio-float-0 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -25px) scale(1.06);
          }
          50% {
            transform: translate(-12px, -40px) scale(0.94);
          }
          75% {
            transform: translate(-22px, -18px) scale(1.03);
          }
        }

        @keyframes bio-float-1 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(-22px, 28px) scale(1.08);
          }
          66% {
            transform: translate(15px, 35px) scale(0.92);
          }
        }

        @keyframes bio-float-2 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          30% {
            transform: translate(25px, 22px) scale(0.96);
          }
          60% {
            transform: translate(-18px, -28px) scale(1.07);
          }
        }

        @keyframes bio-float-3 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          40% {
            transform: translate(-16px, -32px) scale(1.05);
          }
          80% {
            transform: translate(24px, 26px) scale(0.95);
          }
        }

        @keyframes bio-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.35;
          }
        }

        @keyframes bio-connection {
          0%, 100% {
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dashoffset: 24;
          }
        }

        @media (max-width: 768px) {
          .bio-energy-container svg {
            opacity: 0.22 !important;
          }
        }
      `}</style>
    </div>
  );
}
