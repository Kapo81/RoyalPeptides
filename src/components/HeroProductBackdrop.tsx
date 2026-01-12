import { useReducedMotion } from '../hooks/useReducedMotion';

interface HeroProductBackdropProps {
  products: Array<{
    id: string;
    image_url: string | null;
    name: string;
  }>;
}

export default function HeroProductBackdrop({ products }: HeroProductBackdropProps) {
  const prefersReducedMotion = useReducedMotion();

  const validProducts = products.filter(p => p.image_url);

  if (validProducts.length === 0) {
    return null;
  }

  const positions = [
    { top: '8%', right: '12%', delay: '0s', duration: '18s' },
    { top: '25%', right: '5%', delay: '2s', duration: '15s' },
    { top: '45%', right: '8%', delay: '4s', duration: '20s' },
    { top: '68%', right: '15%', delay: '1s', duration: '17s' },
    { top: '15%', left: '8%', delay: '3s', duration: '16s' },
    { top: '55%', left: '5%', delay: '5s', duration: '19s' },
    { bottom: '12%', left: '12%', delay: '2s', duration: '14s' },
    { top: '35%', left: '15%', delay: '6s', duration: '21s' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#020305]/20 to-[#020305]/40" />

      {validProducts.slice(0, 8).map((product, index) => {
        const position = positions[index] || positions[0];

        return (
          <div
            key={product.id}
            className={`absolute w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 ${
              prefersReducedMotion ? '' : 'animate-hero-drift'
            }`}
            style={{
              ...position,
              animationDuration: position.duration,
              animationDelay: position.delay,
              mask: 'radial-gradient(circle, black 30%, transparent 75%)',
              WebkitMask: 'radial-gradient(circle, black 30%, transparent 75%)',
            }}
          >
            <img
              src={product.image_url!}
              alt=""
              className="w-full h-full object-contain"
              style={{
                opacity: 0.12,
                filter: 'blur(2px) grayscale(40%)',
                boxShadow: '0 8px 32px rgba(0, 160, 224, 0.1)',
              }}
              loading="lazy"
            />
          </div>
        );
      })}

      <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feBlend mode="multiply" in="SourceGraphic" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
    </div>
  );
}
