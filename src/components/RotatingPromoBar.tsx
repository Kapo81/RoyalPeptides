import { useEffect, useState } from 'react';

const PROMOS = [
  {
    text: 'Orders over $300 qualify for additional research advantages',
    keywords: 'research peptides Canada free shipping lab grade peptides'
  },
  {
    text: 'Complimentary Canadian shipping on qualifying orders',
    keywords: 'research peptides Canada premium order free shipping'
  }
];

export default function RotatingPromoBar() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % PROMOS.length);
        setIsTransitioning(false);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const currentPromo = PROMOS[currentIndex];

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-[#0B0D12]/98 via-[#050608]/98 to-[#0B0D12]/98 backdrop-blur-md border-b border-white/5">
      <div className="relative h-10 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0093D0]/3 to-transparent" />

        <div
          className={`transition-all duration-300 ${
            isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
          }`}
        >
          <p className="text-xs md:text-sm font-normal text-gray-300 tracking-wide">
            {currentPromo.text}
          </p>
        </div>

        <span className="sr-only">{currentPromo.keywords}</span>
      </div>
    </div>
  );
}
