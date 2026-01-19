import { useEffect, useState, useMemo } from 'react';
import { Shield, Package, Truck, FlaskConical, MapPin, Search, ShoppingCart, Lock, CheckCircle, Sparkles, HeadphonesIcon, Award, Eye } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import PageBackground from '../components/PageBackground';
import SEO from '../components/SEO';
import BrandValuesTicker from '../components/BrandValuesTicker';
import HowItWorksTimeline from '../components/HowItWorksTimeline';
import FAQAccordion from '../components/FAQAccordion';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useOrigin } from '../hooks/useOrigin';

interface AboutProps {
  onNavigate: (page: string) => void;
}

export default function About({ onNavigate }: AboutProps) {
  const { t } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const origin = useOrigin();
  const [structuredData, setStructuredData] = useState<object[]>([]);

  const brandValues = [
    'Clarity',
    'Consistency',
    'Discretion',
    'Quality',
    'Reliability',
    'Transparency',
  ];

  const howItWorksSteps = [
    {
      icon: Search,
      title: t('about.step_1_title'),
      description: t('about.step_1_desc'),
    },
    {
      icon: CheckCircle,
      title: t('about.step_2_title'),
      description: t('about.step_2_desc'),
    },
    {
      icon: Lock,
      title: t('about.step_3_title'),
      description: t('about.step_3_desc'),
    },
    {
      icon: Truck,
      title: t('about.step_4_title'),
      description: t('about.step_4_desc'),
    },
  ];

  const trustPillars = [
    {
      icon: Eye,
      title: t('about.pillar_1_title'),
      description: t('about.pillar_1_desc'),
    },
    {
      icon: Sparkles,
      title: t('about.pillar_2_title'),
      description: t('about.pillar_2_desc'),
    },
    {
      icon: Package,
      title: t('about.pillar_3_title'),
      description: t('about.pillar_3_desc'),
    },
    {
      icon: Lock,
      title: t('about.pillar_4_title'),
      description: t('about.pillar_4_desc'),
    },
    {
      icon: HeadphonesIcon,
      title: t('about.pillar_5_title'),
      description: t('about.pillar_5_desc'),
    },
    {
      icon: MapPin,
      title: t('about.pillar_6_title'),
      description: t('about.pillar_6_desc'),
    },
  ];

  const faqItems = useMemo(() => [
    {
      question: t('about.faq_stock_q'),
      answer: t('about.faq_stock_a'),
    },
    {
      question: t('about.faq_ship_international_q'),
      answer: t('about.faq_ship_international_a'),
    },
    {
      question: t('about.faq_payment_q'),
      answer: t('about.faq_payment_a'),
    },
    {
      question: t('about.faq_packaging_q'),
      answer: t('about.faq_packaging_a'),
    },
    {
      question: t('about.faq_tracking_q'),
      answer: t('about.faq_tracking_a'),
    },
    {
      question: t('about.faq_support_q'),
      answer: t('about.faq_support_a'),
    },
    {
      question: t('about.faq_discounts_q'),
      answer: t('about.faq_discounts_a'),
    },
    {
      question: t('about.faq_peptides_q'),
      answer: t('about.faq_peptides_a'),
    },
  ], [t]);

  useEffect(() => {
    if (origin) {
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": origin
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "About",
            "item": `${origin}/about`
          }
        ]
      };

      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqItems.map(item => ({
          "@type": "Question",
          "name": item.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": item.answer
          }
        }))
      };

      setStructuredData([breadcrumbSchema, faqSchema]);
    }
  }, [origin, faqItems]);

  return (
    <div className="min-h-screen bg-[#050608] pt-20 pb-16 md:pb-0">
      <SEO
        title="About Royal Peptides | Premium Research Peptides Canada"
        description="Learn about Royal Peptides Canada - your trusted source for quality research peptides. Fast shipping, secure checkout, and transparent availability."
        canonical={origin ? `${origin}/about` : undefined}
        structuredData={structuredData}
      />
      <PageBackground variant="about" />

      <section className="relative bg-gradient-to-b from-[#050608] via-[#0B0D12] to-[#050608] py-16 md:py-20 border-b border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,_rgba(0,160,224,0.08)_0%,_transparent_70%)]" />

        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00A0E0]/10 via-transparent to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className={`text-center mb-8 ${prefersReducedMotion ? '' : 'animate-[fadeInUp_0.8s_ease-out]'}`}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight mb-4">
              {t('about.title')}
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              {t('about.subtitle')}
            </p>
          </div>

          <div className={`flex flex-wrap items-center justify-center gap-4 md:gap-6 py-4 ${prefersReducedMotion ? '' : 'animate-[fadeInUp_0.8s_ease-out_0.2s_both]'}`}>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#00A0E0]/10 rounded-lg border border-[#00A0E0]/30">
                <FlaskConical className="h-4 w-4 text-[#00A0E0]" />
              </div>
              <span className="text-sm text-gray-300 font-medium">{t('common.inventory_tracked_availability')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#00A0E0]/10 rounded-lg border border-[#00A0E0]/30">
                <Package className="h-4 w-4 text-[#00A0E0]" />
              </div>
              <span className="text-sm text-gray-300 font-medium">{t('common.discreet_packaging')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#00A0E0]/10 rounded-lg border border-[#00A0E0]/30">
                <Lock className="h-4 w-4 text-[#00A0E0]" />
              </div>
              <span className="text-sm text-gray-300 font-medium">{t('common.secure_checkout')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#00A0E0]/10 rounded-lg border border-[#00A0E0]/30">
                <MapPin className="h-4 w-4 text-[#00A0E0]" />
              </div>
              <span className="text-sm text-gray-300 font-medium">{t('common.international_shipping')}</span>
            </div>
          </div>
        </div>
      </section>

      <BrandValuesTicker values={brandValues} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <section className="mb-16 md:mb-24">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div className={`bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl p-8 border border-white/10 ${prefersReducedMotion ? '' : 'animate-[fadeInUp_0.8s_ease-out_0.3s_both]'}`}>
              <div className="border-l-4 border-[#00A0E0] pl-4 mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  {t('about.mission_title')}
                </h2>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6">
                {t('about.mission_text_1')}
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                {t('about.mission_text_2')}
              </p>
            </div>

            <div className={`space-y-4 ${prefersReducedMotion ? '' : 'animate-[fadeInUp_0.8s_ease-out_0.4s_both]'}`}>
              <h3 className="text-xl font-bold text-white mb-4">{t('about.quality_standards')}</h3>

              {[
                { icon: Award, title: t('about.quality_controlled'), desc: t('about.quality_testing') },
                { icon: CheckCircle, title: t('about.clear_labeling'), desc: t('about.storage_guidance') },
                { icon: FlaskConical, title: t('about.inventory_tracking'), desc: t('about.real_time_availability') },
                { icon: Shield, title: t('about.secure_handling'), desc: t('about.professional_packaging') },
              ].map((standard, idx) => {
                const Icon = standard.icon;
                return (
                  <div key={idx} className="group bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:border-[#00A0E0]/50 transition-all duration-300">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-[#00A0E0]/10 rounded-lg border border-[#00A0E0]/30 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-5 w-5 text-[#00A0E0]" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm mb-1 group-hover:text-[#00A0E0] transition-colors">
                          {standard.title}
                        </h4>
                        <p className="text-xs text-gray-400">{standard.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className={`mb-16 md:mb-24 ${prefersReducedMotion ? '' : 'animate-[fadeInUp_0.8s_ease-out_0.5s_both]'}`}>
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('about.how_it_works')}
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              {t('about.how_it_works_subtitle')}
            </p>
          </div>

          <HowItWorksTimeline steps={howItWorksSteps} />

          <div className="text-center mt-10">
            <button
              onClick={() => onNavigate('catalogue')}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#00A0E0] to-[#11D0FF] text-white rounded-lg font-semibold hover:shadow-[0_0_30px_rgba(0,160,224,0.5)] transition-all duration-300 hover:scale-105"
            >
              <ShoppingCart className="h-5 w-5" />
              {t('about.view_catalogue_cta')}
            </button>
          </div>
        </section>

        <section className={`mb-16 md:mb-24 ${prefersReducedMotion ? '' : 'animate-[fadeInUp_0.8s_ease-out_0.6s_both]'}`}>
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('about.why_customers_title')}
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              {t('about.why_customers_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {trustPillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className={`group bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-[#00A0E0]/50 transition-all duration-500 ${
                    prefersReducedMotion ? '' : 'hover:-translate-y-1'
                  } hover:shadow-[0_15px_40px_rgba(0,160,224,0.2)]`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="p-4 bg-gradient-to-br from-[#00A0E0]/20 to-[#00A0E0]/5 rounded-xl border border-[#00A0E0]/30 mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-7 w-7 text-[#00A0E0]" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-bold text-white text-lg mb-2 group-hover:text-[#00A0E0] transition-colors duration-300">
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className={`mb-16 md:mb-24 ${prefersReducedMotion ? '' : 'animate-[fadeInUp_0.8s_ease-out_0.7s_both]'}`}>
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('about.policies_title')}
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              {t('about.policies_subtitle')}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <FAQAccordion items={faqItems} />
          </div>
        </section>

        <div className="bg-gradient-to-br from-amber-900/20 to-amber-950/20 border border-amber-500/30 rounded-xl md:rounded-2xl p-6 md:p-10 mb-16 md:mb-24">
          <div className="flex items-start space-x-3 md:space-x-4">
            <Shield className="h-6 w-6 md:h-8 md:w-8 text-amber-400 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-amber-200 mb-3 md:mb-4">
                {t('about.research_only_title')}
              </h2>
              <div className="space-y-3 text-amber-100/90 text-xs md:text-sm leading-relaxed">
                <p>
                  {t('about.research_only_p1')}
                </p>
                <p>
                  {t('about.research_only_p2')}
                </p>
                <p className="font-semibold text-amber-200">
                  {t('about.research_only_p3')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="relative overflow-hidden bg-gradient-to-br from-[#00A0E0]/10 via-white/5 to-[#11D0FF]/10 backdrop-blur-xl rounded-2xl p-8 sm:p-12 border border-[#00A0E0]/30">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00A0E0]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#11D0FF]/20 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('about.ready_title')}
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              {t('about.ready_subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onNavigate('catalogue')}
                className="group relative px-10 py-4 bg-gradient-to-r from-[#00A0E0] to-[#11D0FF] text-white rounded-lg font-bold tracking-wide transition-all duration-500 shadow-[0_0_30px_rgba(0,160,224,0.4)] hover:shadow-[0_0_50px_rgba(0,160,224,0.8)] hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#11D0FF] to-[#00A0E0] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="relative z-10">{t('about.shop_catalogue_btn')}</span>
                <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent ${
                  prefersReducedMotion ? '' : '-translate-x-full group-hover:translate-x-full transition-transform duration-700'
                }`} />
              </button>
              <button
                onClick={() => onNavigate('stacks')}
                className="px-10 py-4 bg-white/5 backdrop-blur-md text-white border-2 border-[#00A0E0]/50 rounded-lg font-bold tracking-wide hover:bg-white/10 hover:border-[#00A0E0] transition-all duration-500"
              >
                {t('about.explore_stacks_btn')}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
