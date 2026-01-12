import { useReducedMotion } from '../hooks/useReducedMotion';

interface HeroFeaturedStripProps {
  products: Array<{
    id: string;
    name: string;
    image_url: string | null;
  }>;
  onNavigate: (page: string, productSlug?: string) => void;
}

export default function HeroFeaturedStrip({ products, onNavigate }: HeroFeaturedStripProps) {
  const prefersReducedMotion = useReducedMotion();

  const featuredProducts = products.filter(p => p.image_url).slice(0, 4);

  if (featuredProducts.length === 0) {
    return null;
  }

  return (
    <div className={`w-full max-w-2xl hidden sm:block ${prefersReducedMotion ? '' : 'animate-fade-in'}`}>
      <div className="text-xs text-gray-500 mb-2 font-medium">Featured in Catalogue</div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2">
        {featuredProducts.map((product, index) => (
          <button
            key={product.id}
            onClick={() => onNavigate('catalogue')}
            className={`group flex items-center gap-2 bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 hover:bg-white/[0.06] hover:border-[#00A0E0]/30 transition-all duration-300 snap-start flex-shrink-0 ${
              prefersReducedMotion ? '' : 'hover:scale-105'
            }`}
            style={{
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <div className="w-10 h-10 rounded-md overflow-hidden bg-white/5 flex-shrink-0">
              <img
                src={product.image_url!}
                alt=""
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>

            <span className="text-sm text-gray-300 group-hover:text-white transition-colors duration-300 truncate max-w-[120px]">
              {product.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
