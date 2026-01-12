import { useEffect, useState } from 'react';
import { X, CheckCircle, ChevronRight, ChevronDown, Shield, Sparkles, Activity, Zap, Brain, Moon, Heart, Package, Lock, Truck, FlaskConical } from 'lucide-react';
import { supabase, getSessionId } from '../lib/supabase';
import Toast from '../components/Toast';
import PageBackground from '../components/PageBackground';
import HeroPromoPills from '../components/HeroPromoPills';
import StacksFilterBar from '../components/StacksFilterBar';
import DiscountProgress from '../components/DiscountProgress';
import StacksFAQ from '../components/StacksFAQ';

interface StacksProps {
  onNavigate: (page: string, productSlug?: string) => void;
  onCartUpdate?: () => void;
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

interface BundleEnhancedInfo {
  icon: any;
  color: string;
  gradient: string;
  longDescription: string;
  synergy: string[];
  useCases: string[];
  keywords: string;
}

const bundleInfo: Record<string, BundleEnhancedInfo> = {
  'joint-tissue-recovery': {
    icon: Activity,
    color: '#10b981',
    gradient: 'from-emerald-500/20 to-green-500/20',
    longDescription: 'The ultimate recovery stack for athletes and active individuals dealing with intense training blocks, injury rehabilitation, or chronic soft tissue issues. This powerful combination accelerates healing, reduces inflammation, and supports connective tissue repair.',
    synergy: [
      'BPC-157 initiates tissue repair at the cellular level while reducing inflammation',
      'TB-500 promotes angiogenesis (new blood vessel formation) for enhanced nutrient delivery',
      'PEG-MGF extends muscle satellite cell activation for prolonged recovery signals',
      'Combined effect: Faster recovery times, improved joint mobility, and reduced injury recurrence'
    ],
    useCases: [
      'Post-surgical recovery and wound healing',
      'Chronic tendon or ligament issues (tennis elbow, rotator cuff)',
      'Recovery from intense training blocks or competitions',
      'Injury prevention during high-volume training phases',
      'Soft tissue repair for aging athletes'
    ],
    keywords: 'recovery peptide stack, injury healing peptides, tissue repair stack, BPC-157 TB-500 combo, athletic recovery bundle'
  },
  'metabolic-activation': {
    icon: Zap,
    color: '#f59e0b',
    gradient: 'from-amber-500/20 to-orange-500/20',
    longDescription: 'Designed for fat loss phases, body recomposition, and metabolic optimization. This stack targets multiple fat-burning pathways while enhancing mitochondrial function and energy expenditure without stimulants.',
    synergy: [
      'HGH Fragment 176-191 directly targets adipose tissue for lipolysis without affecting insulin',
      'SLU-PP-332 activates mitochondrial biogenesis for enhanced fat oxidation capacity',
      'MOTS-C improves metabolic flexibility and insulin sensitivity',
      'Combined effect: Multi-pathway fat loss with preserved lean mass and improved energy'
    ],
    useCases: [
      'Cutting phases while maintaining muscle mass',
      'Breaking through fat loss plateaus',
      'Metabolic syndrome and insulin resistance research',
      'Body recomposition for improved body composition',
      'Enhanced endurance and metabolic capacity'
    ],
    keywords: 'fat loss peptide stack, metabolic peptide bundle, body recomposition peptides, fat burning stack Canada, weight loss peptide combo'
  },
  'cognitive-performance-mood': {
    icon: Brain,
    color: '#8b5cf6',
    gradient: 'from-violet-500/20 to-purple-500/20',
    longDescription: 'A comprehensive nootropic and mood support stack for enhanced mental clarity, stress resilience, and social confidence. Perfect for high-pressure work environments, social situations, or cognitive optimization.',
    synergy: [
      'Semax enhances BDNF and dopamine for improved focus and mental stamina',
      'Selank modulates GABA for anxiety reduction without sedation',
      'Oxytocin improves social bonding, trust, and emotional regulation',
      'Combined effect: Sharp focus with calm confidence and enhanced interpersonal connection'
    ],
    useCases: [
      'High-stress work environments and demanding projects',
      'Social anxiety and performance anxiety situations',
      'Cognitive enhancement for studying or creative work',
      'Mood optimization and emotional resilience',
      'Enhanced empathy and social bonding research'
    ],
    keywords: 'nootropic peptide stack, cognitive enhancement peptides, mood peptide bundle, focus peptides Canada, anxiety peptide combo'
  },
  'sleep-longevity': {
    icon: Moon,
    color: '#06b6d4',
    gradient: 'from-cyan-500/20 to-blue-500/20',
    longDescription: 'An anti-aging and sleep optimization stack targeting deep restorative sleep, cellular rejuvenation, and longevity pathways. Ideal for recovery, circadian rhythm optimization, and long-term health span extension.',
    synergy: [
      'DSIP induces natural delta-wave sleep patterns for deep restorative rest',
      'Epitalon activates telomerase enzyme for cellular age reversal effects',
      'Combined circadian rhythm optimization enhances natural repair processes',
      'Combined effect: Deeper sleep quality with enhanced cellular regeneration and longevity markers'
    ],
    useCases: [
      'Sleep quality improvement and insomnia research',
      'Anti-aging and longevity optimization protocols',
      'Recovery enhancement through improved sleep architecture',
      'Circadian rhythm disorders and shift work adaptation',
      'Cellular health and telomere maintenance research'
    ],
    keywords: 'sleep peptide stack, longevity peptide bundle, anti-aging peptides Canada, DSIP Epitalon combo, sleep optimization stack'
  },
  'tanning-libido': {
    icon: Heart,
    color: '#ec4899',
    gradient: 'from-pink-500/20 to-rose-500/20',
    longDescription: 'A specialized combination for cosmetic tanning enhancement and libido support. This stack provides melanogenesis activation alongside sexual function optimization in a cost-effective bundle.',
    synergy: [
      'Melanotan II activates MC1R and MC4R receptors for tanning and appetite effects',
      'PT-141 (Bremelanotide) selectively targets MC4R for libido enhancement',
      'HCG supports natural hormone production and testicular function',
      'Combined effect: Enhanced tanning response with optimized libido and hormonal support'
    ],
    useCases: [
      'UV-free tanning and melanogenesis research',
      'Sexual health and libido enhancement protocols',
      'Appetite modulation research',
      'Cosmetic enhancement and body confidence',
      'Hormone optimization and fertility support'
    ],
    keywords: 'tanning peptide stack, libido peptide bundle, Melanotan PT-141 combo, tanning peptides Canada, sexual health peptide stack'
  }
};

export default function Stacks({ onNavigate, onCartUpdate }: StacksProps) {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingBundle, setAddingBundle] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState('');
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('all');
  const [sortBy, setSortBy] = useState('best-value');

  useEffect(() => {
    fetchBundles();

    document.title = 'Peptide Research Stacks | Pre-Built Synergy Bundles | Royal Peptides';

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Save 10–20% with curated peptide research stacks designed for cognition, body composition, recovery, and more. Premium research-grade peptide bundles from a trusted Canadian supplier.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Save 10–20% with curated peptide research stacks designed for cognition, body composition, recovery, and more. Premium research-grade peptide bundles from a trusted Canadian supplier.';
      document.head.appendChild(meta);
    }

    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'peptide stacks Canada, peptide bundles, research peptides, peptide combinations, recovery stack, fat loss peptides, cognitive peptides, nootropic stack, anti-aging peptides, performance peptides');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = 'peptide stacks Canada, peptide bundles, research peptides, peptide combinations, recovery stack, fat loss peptides, cognitive peptides, nootropic stack, anti-aging peptides, performance peptides';
      document.head.appendChild(meta);
    }

    return () => {
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  const fetchBundles = async () => {
    const { data, error } = await supabase.rpc('get_all_bundles');

    if (!error && data) {
      setBundles(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (bundles.length > 0) {
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Peptide Research Stacks & Bundles",
        "description": "Save 10–20% with curated peptide research stacks designed for cognition, body composition, recovery, and more.",
        "url": "https://royalpeptides.com/stacks",
        "mainEntity": {
          "@type": "ItemList",
          "itemListElement": bundles.map((bundle, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
              "@type": "Product",
              "name": bundle.bundle_name,
              "description": bundle.bundle_description,
              "offers": {
                "@type": "Offer",
                "price": bundle.discounted_price.toFixed(2),
                "priceCurrency": "CAD",
                "availability": "https://schema.org/InStock",
                "url": "https://royalpeptides.com/stacks"
              },
              "additionalProperty": [
                {
                  "@type": "PropertyValue",
                  "name": "isBundle",
                  "value": "true"
                },
                {
                  "@type": "PropertyValue",
                  "name": "originalPrice",
                  "value": bundle.total_price.toFixed(2)
                }
              ]
            }
          }))
        }
      };

      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        existingScript.textContent = JSON.stringify(structuredData);
      } else {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(structuredData);
        document.head.appendChild(script);
      }
    }
  }, [bundles]);

  const addBundleToCart = async (bundle: Bundle) => {
    setAddingBundle(prev => ({ ...prev, [bundle.bundle_id]: true }));

    const sessionId = getSessionId();

    // Add bundle as a single cart item
    const bundleProducts = bundle.products.map(product => ({
      id: product.id,
      name: product.name,
      quantity: product.quantity || 1,
      price: product.price
    }));

    const { error } = await supabase
      .from('cart_items')
      .insert({
        session_id: sessionId,
        product_id: null,
        quantity: 1,
        bundle_id: bundle.bundle_id,
        bundle_name: bundle.bundle_name,
        bundle_price: bundle.discounted_price,
        bundle_products: bundleProducts
      });

    setAddingBundle(prev => ({ ...prev, [bundle.bundle_id]: false }));

    if (!error) {
      setToastMessage(`${bundle.bundle_name} added to cart!`);
      setSelectedBundle(null);
      onCartUpdate?.();
    } else {
      setToastMessage('Error adding bundle to cart');
    }

    setTimeout(() => setToastMessage(''), 3000);
  };

  const toggleSection = (bundleId: string, section: string) => {
    const key = `${bundleId}-${section}`;
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getBundleInfo = (slug: string): BundleEnhancedInfo => {
    return bundleInfo[slug] || {
      icon: Package,
      color: '#00A0E0',
      gradient: 'from-blue-500/20 to-cyan-500/20',
      longDescription: '',
      synergy: [],
      useCases: [],
      keywords: ''
    };
  };

  const getGoalFromSlug = (slug: string): string => {
    if (slug.includes('recovery') || slug.includes('tissue')) return 'recovery';
    if (slug.includes('metabolic') || slug.includes('fat')) return 'metabolic';
    if (slug.includes('cognitive') || slug.includes('mood') || slug.includes('brain')) return 'cognitive';
    if (slug.includes('sleep') || slug.includes('longevity')) return 'sleep';
    if (slug.includes('tanning') || slug.includes('libido')) return 'cosmetic';
    return 'all';
  };

  const filteredAndSortedBundles = bundles
    .filter(bundle => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          bundle.bundle_name.toLowerCase().includes(searchLower) ||
          bundle.bundle_description.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .filter(bundle => {
      if (selectedGoal === 'all') return true;
      return getGoalFromSlug(bundle.bundle_slug) === selectedGoal;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.discounted_price - b.discounted_price;
        case 'price-high':
          return b.discounted_price - a.discounted_price;
        case 'newest':
          return 0;
        case 'best-value':
        default:
          return b.savings - a.savings;
      }
    });

  return (
    <div className="min-h-screen bg-[#050608] pt-20 pb-16 md:pb-8">
      <PageBackground variant="stacks" />

      <section className="relative bg-gradient-to-b from-[#050608] via-[#0B0D12] to-[#050608] py-12 md:py-20 border-b border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,_rgba(0,160,224,0.08)_0%,_transparent_70%)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full mb-4 md:mb-6 animate-[fadeInDown_0.8s_ease-out]">
              <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-green-400" />
              <span className="text-xs md:text-sm text-green-300 font-semibold">Save 10-20% on Peptide Combos</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 tracking-tight animate-[fadeInUp_0.8s_ease-out_0.2s_both]">
              Peptide Research Stacks
            </h1>

            <p className="text-sm md:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4 mb-6 md:mb-8 animate-[fadeInUp_0.8s_ease-out_0.3s_both]">
              Curated peptide combinations for synergistic research applications. Each stack combines complementary compounds at discounted prices.
            </p>

            <div className="flex justify-center mb-6 md:mb-8 animate-[fadeInUp_0.8s_ease-out_0.4s_both]">
              <HeroPromoPills />
            </div>

            <div className="flex items-center justify-center gap-6 md:gap-12 py-4 animate-[fadeInUp_0.8s_ease-out_0.5s_both]">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-[#00A0E0]" />
                <span className="text-xs md:text-sm text-gray-300 font-medium">Secure Checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-[#00A0E0]" />
                <span className="text-xs md:text-sm text-gray-300 font-medium">Lab-Grade Quality</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <Truck className="h-4 w-4 text-[#00A0E0]" />
                <span className="text-xs md:text-sm text-gray-300 font-medium">Discreet Packaging</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 lg:py-20 relative">
        <svg className="absolute inset-0 w-full h-full opacity-[0.015] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="lab-grid" x="0" y="0" width="180" height="180" patternUnits="userSpaceOnUse">
              <circle cx="40" cy="40" r="1.5" fill="#00A0E0" />
              <circle cx="100" cy="80" r="1.5" fill="#00A0E0" />
              <line x1="40" y1="40" x2="100" y2="80" stroke="#00A0E0" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#lab-grid)" />
        </svg>

        <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-8">
          <div className="lg:col-span-1">
            <StacksFilterBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedGoal={selectedGoal}
              onGoalChange={setSelectedGoal}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />

            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#00A0E0] border-r-transparent" />
                <p className="mt-4 text-gray-400">Loading peptide stacks...</p>
              </div>
            ) : filteredAndSortedBundles.length === 0 ? (
              <div className="text-center py-20">
                <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">
                  {searchTerm || selectedGoal !== 'all'
                    ? 'No stacks match your filters'
                    : 'No bundles available at the moment'}
                </p>
                {(searchTerm || selectedGoal !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedGoal('all');
                    }}
                    className="mt-4 text-[#00A0E0] hover:underline text-sm"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:gap-6">
                {filteredAndSortedBundles.map((bundle) => {
              const info = getBundleInfo(bundle.bundle_slug);
              const Icon = info.icon;

              return (
                <div
                  key={bundle.bundle_id}
                  onClick={() => setSelectedBundle(bundle)}
                  className="group cursor-pointer bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl border border-white/10 hover:border-[#00A0E0]/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(0,160,224,0.3)] overflow-hidden"
                >
                  <div className="p-4 md:p-6 lg:p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 md:p-4 bg-gradient-to-br ${info.gradient} rounded-xl border border-white/10 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-6 w-6 md:h-8 md:w-8" style={{ color: info.color }} />
                      </div>
                      <div className="text-right">
                        <div className="flex items-baseline gap-1 md:gap-2 justify-end">
                          <span className="text-2xl md:text-3xl font-bold text-white">${bundle.discounted_price.toFixed(2)}</span>
                          <span className="text-sm md:text-base text-gray-400 line-through">${bundle.total_price.toFixed(2)}</span>
                        </div>
                        <p className="text-xs md:text-sm text-gray-500 mt-1">Stack advantage: ${bundle.savings.toFixed(2)}</p>
                      </div>
                    </div>

                    <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-2 md:mb-3 group-hover:text-[#00A0E0] transition-colors duration-300">
                      {bundle.bundle_name}
                    </h2>

                    <p className="text-xs md:text-sm text-gray-300 mb-4 md:mb-6 leading-relaxed line-clamp-2 md:line-clamp-3">
                      {bundle.bundle_description}
                    </p>

                    <div className="bg-white/5 rounded-lg p-3 md:p-4 mb-4 md:mb-6 border border-white/10">
                      <p className="text-xs md:text-sm font-semibold text-gray-300 mb-2 md:mb-3">Includes {bundle.products?.length} peptides:</p>
                      <div className="space-y-2">
                        {bundle.products?.slice(0, 3).map((product: any, i: number) => (
                          <div key={i} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-[#00A0E0] flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs md:text-sm text-white font-medium truncate">{product.name}</p>
                            </div>
                          </div>
                        ))}
                        {bundle.products?.length > 3 && (
                          <p className="text-xs text-gray-400 pl-6">+{bundle.products.length - 3} more...</p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addBundleToCart(bundle);
                      }}
                      disabled={addingBundle[bundle.bundle_id]}
                      className="w-full py-3 md:py-3.5 bg-gradient-to-r from-[#00A0E0] to-[#11D0FF] text-white rounded-xl font-semibold text-sm md:text-base transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,160,224,0.5)] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-3 md:mb-4"
                    >
                      {addingBundle[bundle.bundle_id] ? (
                        <>
                          <div className="h-4 w-4 md:h-5 md:w-5 animate-spin rounded-full border-2 border-white border-r-transparent" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 md:h-5 md:w-5" />
                          Add Bundle to Cart
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-2 text-[#00A0E0] font-medium text-sm group-hover:gap-3 transition-all">
                      <span>View Full Details</span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>

                    <img
                      src="/ab72c5e3-25b2-4790-8243-cdc880fc0bdc.png"
                      alt="Peptide vials"
                      className="absolute bottom-4 right-4 h-16 md:h-24 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none"
                      loading="lazy"
                    />
                  </div>
                </div>
              );
                })}
              </div>
            )}

            <div className="mt-8 md:mt-12 bg-gradient-to-br from-amber-900/20 to-amber-950/20 border border-amber-500/30 rounded-xl p-4 md:p-6 lg:p-8">
              <div className="flex items-start gap-3 md:gap-4">
                <Shield className="h-5 w-5 md:h-6 md:w-6 text-amber-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-base md:text-lg font-bold text-amber-200 mb-2">For Research Purposes Only</h3>
                  <p className="text-xs md:text-sm text-amber-100/90 leading-relaxed">
                    All peptide stacks are designed for research applications only. These products are not intended for human consumption, therapeutic use, or clinical applications. By purchasing, you acknowledge compliance with applicable regulations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <DiscountProgress />
            </div>
          </div>
        </div>

        <div className="lg:hidden mt-8">
          <DiscountProgress />
        </div>
      </div>

      <StacksFAQ />

      {selectedBundle && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease-out]"
          onClick={() => setSelectedBundle(null)}
        >
          <div
            className="bg-gradient-to-br from-[#0B0D12] to-[#050608] border border-white/20 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-[slideUp_0.3s_ease-out] shadow-[0_0_60px_rgba(0,160,224,0.3)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-b from-[#0B0D12] to-[#0B0D12]/95 backdrop-blur-lg border-b border-white/10 p-4 md:p-6 z-10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 md:gap-4 flex-1">
                  {(() => {
                    const info = getBundleInfo(selectedBundle.bundle_slug);
                    const Icon = info.icon;
                    return (
                      <div className={`p-3 md:p-4 bg-gradient-to-br ${info.gradient} rounded-xl border border-white/10 flex-shrink-0`}>
                        <Icon className="h-6 w-6 md:h-8 md:w-8" style={{ color: info.color }} />
                      </div>
                    );
                  })()}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2">{selectedBundle.bundle_name}</h2>
                    <p className="text-sm md:text-base text-gray-300">{selectedBundle.bundle_description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBundle(null)}
                  className="flex-shrink-0 p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 md:h-6 md:w-6 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl p-4 md:p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs md:text-sm text-gray-400 mb-1">Stack Price</p>
                    <div className="flex items-baseline gap-2 md:gap-3">
                      <span className="text-3xl md:text-4xl font-bold text-white">${selectedBundle.discounted_price.toFixed(2)}</span>
                      <span className="text-lg md:text-xl text-gray-400 line-through">${selectedBundle.total_price.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs md:text-sm text-gray-500 mb-1">Individual Purchase</p>
                    <p className="text-sm md:text-base text-gray-400">${selectedBundle.total_price.toFixed(2)}</p>
                    <p className="text-xs md:text-sm text-gray-500 mt-2">Stack Advantage</p>
                    <p className="text-sm md:text-base text-[#00A0E0]">${selectedBundle.savings.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {(() => {
                const info = getBundleInfo(selectedBundle.bundle_slug);
                return (
                  <>
                    {info.longDescription && (
                      <div>
                        <h3 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4">Overview</h3>
                        <p className="text-sm md:text-base text-gray-300 leading-relaxed">{info.longDescription}</p>
                      </div>
                    )}

                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4">Included Products</h3>
                      <div className="space-y-3 md:space-y-4">
                        {selectedBundle.products?.map((product: any, i: number) => (
                          <div key={i} className="bg-white/5 rounded-lg p-3 md:p-4 border border-white/10 hover:border-[#00A0E0]/30 transition-colors">
                            <div className="flex items-start gap-3">
                              <CheckCircle className="h-5 w-5 text-[#00A0E0] flex-shrink-0 mt-1" />
                              <div className="flex-1">
                                <p className="text-sm md:text-base text-white font-semibold mb-1">{product.name}</p>
                                <p className="text-xs md:text-sm text-gray-400 mb-2">{product.dosage || 'Standard dosage'}</p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs md:text-sm text-gray-400">
                                    {product.quantity > 1 ? `${product.quantity} vials` : '1 vial'}
                                  </span>
                                  <span className="text-sm md:text-base text-[#00A0E0] font-medium">${(product.price * product.quantity).toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {info.synergy && info.synergy.length > 0 && (
                      <div>
                        <button
                          onClick={() => toggleSection(selectedBundle.bundle_id, 'synergy')}
                          className="w-full flex items-center justify-between text-left mb-3 md:mb-4 group"
                        >
                          <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-[#00A0E0] transition-colors">
                            Mechanisms of Synergy
                          </h3>
                          <ChevronDown
                            className={`h-5 w-5 text-gray-400 transition-transform ${
                              expandedSections[`${selectedBundle.bundle_id}-synergy`] ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {(expandedSections[`${selectedBundle.bundle_id}-synergy`] || window.innerWidth >= 768) && (
                          <div className="space-y-3 bg-gradient-to-br from-[#00A0E0]/5 to-cyan-500/5 rounded-lg p-4 md:p-6 border border-[#00A0E0]/20">
                            {info.synergy.map((item, i) => (
                              <div key={i} className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#00A0E0] rounded-full flex-shrink-0 mt-2" />
                                <p className="text-xs md:text-sm text-gray-300 leading-relaxed">{item}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {info.useCases && info.useCases.length > 0 && (
                      <div>
                        <button
                          onClick={() => toggleSection(selectedBundle.bundle_id, 'useCases')}
                          className="w-full flex items-center justify-between text-left mb-3 md:mb-4 group"
                        >
                          <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-[#00A0E0] transition-colors">
                            Recommended Use Cases
                          </h3>
                          <ChevronDown
                            className={`h-5 w-5 text-gray-400 transition-transform ${
                              expandedSections[`${selectedBundle.bundle_id}-useCases`] ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {(expandedSections[`${selectedBundle.bundle_id}-useCases`] || window.innerWidth >= 768) && (
                          <div className="grid grid-cols-1 gap-2 md:gap-3">
                            {info.useCases.map((useCase, i) => (
                              <div
                                key={i}
                                className="bg-white/5 rounded-lg p-3 md:p-4 border border-white/10 hover:border-[#00A0E0]/30 transition-colors"
                              >
                                <div className="flex items-start gap-2 md:gap-3">
                                  <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br from-[#00A0E0]/20 to-cyan-500/20 border border-[#00A0E0]/30 flex items-center justify-center flex-shrink-0">
                                    <span className="text-[10px] md:text-xs font-bold text-[#00A0E0]">{i + 1}</span>
                                  </div>
                                  <p className="text-xs md:text-sm text-gray-300 leading-relaxed">{useCase}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                );
              })()}

              <div className="sticky bottom-0 bg-gradient-to-t from-[#050608] to-transparent pt-6 pb-2 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8">
                <button
                  onClick={() => addBundleToCart(selectedBundle)}
                  disabled={addingBundle[selectedBundle.bundle_id]}
                  className="w-full py-3 md:py-4 bg-gradient-to-r from-[#00A0E0] to-[#11D0FF] text-white rounded-xl font-semibold text-sm md:text-base transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,160,224,0.5)] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {addingBundle[selectedBundle.bundle_id] ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-r-transparent" />
                      Adding to Cart...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Add Complete Stack to Cart
                      <ChevronRight className="h-5 w-5" />
                    </>
                  )}
                </button>
                <p className="text-xs text-center text-gray-500 mt-3">
                  Individual vials also available in the{' '}
                  <button
                    onClick={() => {
                      setSelectedBundle(null);
                      onNavigate('catalogue');
                    }}
                    className="text-[#00A0E0] hover:underline"
                  >
                    catalogue
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
