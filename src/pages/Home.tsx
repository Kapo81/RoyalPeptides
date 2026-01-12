import { useEffect, useState } from 'react';
import { FlaskConical, Shield, Package, Truck, MessageCircle, Globe, Award, Zap, Activity, Brain, ChevronRight, Sparkles, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import SEO from '../components/SEO';
import RotatingPromoBar from '../components/RotatingPromoBar';
import TrustStrip from '../components/TrustStrip';
import HeroPromoPills from '../components/HeroPromoPills';
import HeroFeaturedStrip from '../components/HeroFeaturedStrip';
import HeroFAQ from '../components/HeroFAQ';
import OpeningPromoBanner from '../components/OpeningPromoBanner';
import { useHeroProducts } from '../hooks/useHeroProducts';

interface HomeProps {
  onNavigate: (page: string, productSlug?: string) => void;
  onCartUpdate: () => void;
}

interface Bundle {
  bundle_id: string;
  bundle_name: string;
  bundle_slug: string;
  bundle_description: string;
  discount_percentage: number;
  products: any[];
  total_price: number;
  discounted_price: number;
  savings: number;
}

export default function Home({ onNavigate, onCartUpdate }: HomeProps) {
  const { t } = useLanguage();
  const { settings: siteSettings } = useSiteSettings();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const { products: heroProducts } = useHeroProducts();

  useEffect(() => {
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    const { data, error } = await supabase
      .rpc('get_all_bundles');

    if (!error && data) {
      setBundles(data.slice(0, 3));
    }
    setLoading(false);
  };

  const categories = [
    {
      title: 'Recovery & Injury',
      description: 'Tissue repair and healing support',
      icon: Activity,
      slug: 'recovery-injury'
    },
    {
      title: 'Metabolic Activation',
      description: 'Body composition and fat metabolism',
      icon: Zap,
      slug: 'metabolic'
    },
    {
      title: 'Cognitive Enhancement',
      description: 'Focus, mood and mental clarity',
      icon: Brain,
      slug: 'nootropics'
    },
    {
      title: 'Wellness & Longevity',
      description: 'Sleep, aging and optimization',
      icon: Shield,
      slug: 'wellness'
    }
  ];

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Royal Peptides Canada",
    "url": window.location.origin,
    "logo": `${window.location.origin}/canada-logo.png`,
    "sameAs": []
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Royal Peptides Canada",
    "url": window.location.origin,
    "description": "Premium research peptides and compounds for scientific study in Canada"
  };

  return (
    <div className="min-h-screen bg-[#050608]">
      <SEO
        title="Research Peptides Canada | Premium Quality Research Compounds"
        description="High-purity research peptides and compounds for laboratory use. Discreet Canadian shipping, inventory tracked, high-purity pharmaceutical-grade peptides."
        canonical={window.location.origin}
        structuredData={[organizationSchema, websiteSchema]}
      />
      <RotatingPromoBar />
      <section className="relative min-h-[65vh] md:min-h-[72vh] lg:min-h-[80vh] flex items-center justify-center overflow-hidden pt-20 md:pt-24">
        <div className="absolute inset-0 bg-[#020305]" />

        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://i.postimg.cc/7hbwfYPS/763da268-30db-46fd-be61-b3ec8b9ee725.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        <div className="absolute inset-0 bg-black/65 md:bg-black/60" />

        <div className="absolute inset-0 bg-gradient-to-t from-[#0093D0]/25 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(0,147,208,0.30)_0%,_transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(0,147,208,0.25)_0%,_transparent_50%)]" />

        <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="molecule-grid" x="0" y="0" width="150" height="150" patternUnits="userSpaceOnUse">
              <circle cx="25" cy="25" r="2" fill="#00A0E0" />
              <circle cx="75" cy="50" r="2" fill="#00A0E0" />
              <circle cx="125" cy="30" r="2" fill="#00A0E0" />
              <circle cx="90" cy="100" r="2" fill="#00A0E0" />
              <line x1="25" y1="25" x2="75" y2="50" stroke="#00A0E0" strokeWidth="0.5" opacity="0.5" />
              <line x1="75" y1="50" x2="125" y2="30" stroke="#00A0E0" strokeWidth="0.5" opacity="0.5" />
              <line x1="75" y1="50" x2="90" y2="100" stroke="#00A0E0" strokeWidth="0.5" opacity="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#molecule-grid)" />
        </svg>

        <div className="absolute inset-0 bg-gradient-to-b from-[#020305]/30 via-transparent to-[#020305]/50" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
          <div className="grid grid-cols-1 gap-6 md:gap-8">
            <div className="text-center lg:text-left max-w-4xl mx-auto lg:mx-0">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white/5 border border-white/10 rounded-lg mb-4 md:mb-6 animate-[fadeInDown_0.8s_ease-out]">
                <Globe className="h-3 w-3 md:h-4 md:w-4 text-gray-400" />
                <span className="text-xs md:text-sm text-gray-300 font-medium">Canada-Based Operations</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight animate-[fadeInUp_0.8s_ease-out_0.2s_both]">
                {siteSettings?.hero_headline || 'Premium Research Peptides for Canadian Researchers'}
              </h1>

              <h2 className="text-base md:text-lg lg:text-xl text-gray-300 mb-6 leading-relaxed animate-[fadeInUp_0.8s_ease-out_0.4s_both] font-normal">
                {siteSettings?.hero_subheadline || 'Quality-tested compounds with fast, discreet shipping across Canada'}
              </h2>

              <div className="flex justify-center lg:justify-start">
                <OpeningPromoBanner />
              </div>

              <div className="mb-6 md:mb-8 flex justify-center lg:justify-start">
                <HeroPromoPills />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start mb-4 md:mb-6 animate-[fadeInUp_0.8s_ease-out_0.5s_both]">
                <button
                  onClick={() => onNavigate('catalogue')}
                  className="group relative px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-[#00A0E0] to-[#11D0FF] text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,160,224,0.5)] hover:translate-y-[-2px] overflow-hidden text-sm md:text-base"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    View Peptide Catalogue
                    <ChevronRight className="h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>

                <button
                  onClick={() => onNavigate('stacks')}
                  className="px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-white/15 to-white/10 backdrop-blur-md text-white border border-white/30 rounded-lg font-semibold hover:bg-white/20 hover:border-white/40 hover:shadow-[0_8px_30px_rgba(255,255,255,0.15)] hover:translate-y-[-2px] transition-all duration-300 text-sm md:text-base"
                >
                  Research Stacks
                </button>
              </div>

              <div className="flex justify-center lg:justify-start mb-4">
                <HeroFeaturedStrip products={heroProducts} onNavigate={onNavigate} />
              </div>

              <div className="max-w-2xl mx-auto lg:mx-0 animate-[fadeInUp_0.8s_ease-out_0.6s_both]">
                <TrustStrip />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 md:h-32 bg-gradient-to-t from-[#050608] to-transparent pointer-events-none" />
      </section>

      <section className="py-12 md:py-20 lg:py-24 bg-gradient-to-b from-[#050608] via-[#0B0D12] to-[#050608] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(0,160,224,0.05)_0%,_transparent_70%)]" />

        <svg className="absolute inset-0 w-full h-full opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="lab-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="1.5" fill="#00A0E0" />
              <circle cx="90" cy="70" r="1.5" fill="#00A0E0" />
              <circle cx="150" cy="50" r="1.5" fill="#00A0E0" />
              <line x1="30" y1="30" x2="90" y2="70" stroke="#00A0E0" strokeWidth="0.3" />
              <line x1="90" y1="70" x2="150" y2="50" stroke="#00A0E0" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#lab-pattern)" />
        </svg>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-center gap-6 md:gap-12 py-6 md:py-8 mb-12 md:mb-16 border-y border-white/10">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-[#00A0E0]" />
              <span className="text-sm md:text-base text-gray-300 font-medium">Inventory Tracked</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-[#00A0E0]" />
              <span className="text-sm md:text-base text-gray-300 font-medium">Ships from Canada</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-[#00A0E0]" />
              <span className="text-sm md:text-base text-gray-300 font-medium">Lab-Grade Research Compounds</span>
            </div>
          </div>

          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4">Operational Standards</h2>
            <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto">Precision manufacturing, transparent operations, reliable fulfillment</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-12 md:mb-16">
            <div className="group bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-4 md:p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
              <div className="flex justify-center mb-3 md:mb-4">
                <div className="p-2 md:p-3 bg-white/5 rounded-lg border border-white/10">
                  <FlaskConical className="h-5 w-5 md:h-7 md:w-7 text-gray-300" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="font-semibold text-white text-sm md:text-lg mb-1 md:mb-2 text-center">
                High-Purity Lyophilized
              </h3>
              <p className="text-xs md:text-sm text-gray-500 text-center leading-relaxed">
                Pharmaceutical-grade compounds with documented handling
              </p>
            </div>

            <div className="group bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-4 md:p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
              <div className="flex justify-center mb-3 md:mb-4">
                <div className="p-2 md:p-3 bg-white/5 rounded-lg border border-white/10">
                  <Package className="h-5 w-5 md:h-7 md:w-7 text-gray-300" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="font-semibold text-white text-sm md:text-lg mb-1 md:mb-2 text-center">
                Discreet Fulfillment
              </h3>
              <p className="text-xs md:text-sm text-gray-500 text-center leading-relaxed">
                Unmarked packaging with manual tracking notification
              </p>
            </div>

            <div className="group bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-4 md:p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
              <div className="flex justify-center mb-3 md:mb-4">
                <div className="p-2 md:p-3 bg-white/5 rounded-lg border border-white/10">
                  <Shield className="h-5 w-5 md:h-7 md:w-7 text-gray-300" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="font-semibold text-white text-sm md:text-lg mb-1 md:mb-2 text-center">
                Transparent Operations
              </h3>
              <p className="text-xs md:text-sm text-gray-500 text-center leading-relaxed">
                Clear processing times and shipping protocols
              </p>
            </div>

            <div className="group bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-4 md:p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
              <div className="flex justify-center mb-3 md:mb-4">
                <div className="p-2 md:p-3 bg-white/5 rounded-lg border border-white/10">
                  <Globe className="h-5 w-5 md:h-7 md:w-7 text-gray-300" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="font-semibold text-white text-sm md:text-lg mb-1 md:mb-2 text-center">
                Canada-Based
              </h3>
              <p className="text-xs md:text-sm text-gray-500 text-center leading-relaxed">
                Operated from Canada with international shipping capacity
              </p>
            </div>
          </div>

          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4">Featured Research Categories</h2>
            <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto">Browse peptides by your scientific focus</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => onNavigate('catalogue')}
                className="group bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-4 md:p-8 border border-white/10 hover:border-[#00A0E0]/50 transition-all duration-500 hover:scale-[1.02] md:hover:scale-105 hover:shadow-[0_15px_40px_rgba(0,160,224,0.25)] text-left"
              >
                <category.icon className="h-6 w-6 md:h-10 md:w-10 text-[#00A0E0] mb-2 md:mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-bold text-white text-sm md:text-xl mb-1 md:mb-2 group-hover:text-[#00A0E0] transition-colors duration-300">
                  {category.title}
                </h3>
                <p className="text-xs md:text-sm text-gray-400 mb-2 md:mb-4 leading-tight md:leading-relaxed">
                  {category.description}
                </p>
                <span className="text-[#00A0E0] text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2 group-hover:gap-2 md:group-hover:gap-3 transition-all">
                  Browse <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <HeroFAQ />

      {bundles.length > 0 && (
        <section className="py-12 md:py-20 lg:py-24 bg-gradient-to-b from-[#050608] via-[#0a0d14] to-[#050608] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(0,160,224,0.08)_0%,_transparent_70%)]" />

          <svg className="absolute inset-0 w-full h-full opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="bundle-pattern" x="0" y="0" width="180" height="180" patternUnits="userSpaceOnUse">
                <circle cx="40" cy="40" r="2" fill="#00A0E0" />
                <circle cx="100" cy="80" r="2" fill="#00A0E0" />
                <line x1="40" y1="40" x2="100" y2="80" stroke="#00A0E0" strokeWidth="0.4" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#bundle-pattern)" />
          </svg>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4">Research Protocol Examples</h2>
              <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto">Curated compound combinations grouped by research objective</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
              {bundles.map((bundle) => (
                <div
                  key={bundle.bundle_id}
                  className="group bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl border border-white/10 hover:border-[#00A0E0]/50 transition-all duration-500 hover:scale-[1.02] md:hover:scale-105 hover:shadow-[0_20px_60px_rgba(0,160,224,0.3)] overflow-hidden"
                >
                  <div className="p-4 md:p-6">
                    <h3 className="font-semibold text-white text-base md:text-xl mb-2 md:mb-3">
                      {bundle.bundle_name}
                    </h3>

                    <p className="text-xs md:text-sm text-gray-400 mb-3 md:mb-4 leading-relaxed line-clamp-2 md:line-clamp-none">
                      {bundle.bundle_description}
                    </p>

                    <div className="space-y-1.5 md:space-y-2 mb-3 md:mb-4">
                      <p className="text-[10px] md:text-xs text-gray-500 font-medium">Protocol Components:</p>
                      {bundle.products?.slice(0, 3).map((product: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-xs md:text-sm text-gray-300">
                          <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-gray-500 rounded-full flex-shrink-0" />
                          <span className="line-clamp-1">{product.name}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-white/10 pt-3 md:pt-4 mb-3 md:mb-4">
                      <div className="flex items-baseline gap-2 md:gap-3">
                        <span className="text-xl md:text-2xl font-semibold text-white">${bundle.discounted_price.toFixed(2)}</span>
                        <span className="text-xs md:text-sm text-gray-500">Protocol price</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigate('stacks', bundle.bundle_slug)}
                      className="w-full py-2.5 md:py-3 bg-white/5 border border-white/20 text-white rounded-lg font-medium hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base"
                    >
                      View Details
                      <ChevronRight className="h-4 w-4" />
                    </button>

                    <p className="text-[10px] md:text-xs text-gray-500 text-center mt-2 md:mt-3">Individual compounds available</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-6 md:mt-8">
              <button
                onClick={() => onNavigate('stacks')}
                className="px-6 py-2.5 md:px-8 md:py-3 bg-white/5 backdrop-blur-md text-white border border-white/20 rounded-lg font-medium hover:bg-white/10 hover:border-white/30 transition-all duration-300 text-sm md:text-base"
              >
                View All Protocols
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="py-12 md:py-20 lg:py-24 bg-gradient-to-b from-[#050608] via-[#0B0D12] to-[#050608] relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,_rgba(0,160,224,0.08)_0%,_transparent_70%)]" />

        <svg className="absolute inset-0 w-full h-full opacity-[0.015]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="about-pattern" x="0" y="0" width="160" height="160" patternUnits="userSpaceOnUse">
              <circle cx="35" cy="35" r="1.5" fill="#00A0E0" />
              <circle cx="85" cy="65" r="1.5" fill="#00A0E0" />
              <line x1="35" y1="35" x2="85" y2="65" stroke="#00A0E0" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#about-pattern)" />
        </svg>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl p-6 md:p-12 border border-white/10">
            <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="p-2 md:p-3 bg-gradient-to-br from-[#00A0E0]/20 to-[#00A0E0]/5 rounded-xl border border-[#00A0E0]/30 flex-shrink-0">
                <FlaskConical className="h-6 w-6 md:h-8 md:w-8 text-[#00A0E0]" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-white mb-3 md:mb-4">About Royal Peptides</h2>
                <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-3 md:mb-4">
                  Royal Peptides supplies pharmaceutical-grade lyophilized research peptides from Canadian operations. We serve researchers and performance professionals with high-purity compounds, transparent operations, and discreet fulfillment.
                </p>
                <p className="text-xs md:text-sm text-gray-500 leading-relaxed mb-4 md:mb-6">
                  All compounds are lyophilized, tracked inventory, and shipped with unmarked packaging. Processing times and shipping protocols are clearly documented for all researchers.
                </p>
                <button
                  onClick={() => onNavigate('about')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 bg-white/5 border border-white/20 text-white rounded-lg font-medium hover:bg-white/10 hover:border-white/30 transition-all duration-300 text-sm md:text-base"
                >
                  Operations & Standards
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="text-center py-6 md:py-8 text-xs text-gray-500 border-t border-white/5">
        <p>For research purposes only. Not for human consumption or clinical use.</p>
      </div>
    </div>
  );
}
