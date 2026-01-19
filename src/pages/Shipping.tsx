import { useState, useEffect } from 'react';
import { Package, Globe, Truck, Shield, MapPin, Clock, Mail, HeadphonesIcon, CheckCircle, AlertCircle, XCircle, MessageCircle, FileText } from 'lucide-react';
import PageBackground from '../components/PageBackground';
import SEO from '../components/SEO';
import DeliveryTimeline from '../components/DeliveryTimeline';
import ReturnProcessTimeline from '../components/ReturnProcessTimeline';
import FAQAccordion from '../components/FAQAccordion';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { supabase } from '../lib/supabase';

interface ShippingProps {
  onNavigate: (page: string) => void;
}

interface SiteSettings {
  shipping_text_canada: string;
  shipping_base_cost: number;
  shipping_free_threshold_canada: number;
  shipping_free_threshold_international: number;
}

export default function Shipping({ onNavigate }: ShippingProps) {
  const prefersReducedMotion = useReducedMotion();
  const [settings, setSettings] = useState<SiteSettings>({
    shipping_text_canada: '$25 flat rate shipping Canada',
    shipping_base_cost: 25,
    shipping_free_threshold_canada: 300,
    shipping_free_threshold_international: 500,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('shipping_text_canada, shipping_base_cost, shipping_free_threshold_canada, shipping_free_threshold_international')
      .single();

    if (!error && data) {
      setSettings({
        shipping_text_canada: data.shipping_text_canada || '$25 flat rate shipping Canada',
        shipping_base_cost: data.shipping_base_cost || 25,
        shipping_free_threshold_canada: data.shipping_free_threshold_canada || 300,
        shipping_free_threshold_international: data.shipping_free_threshold_international || 500,
      });
    }
  };

  const deliveryRows = [
    {
      region: 'Canada',
      transitTime: '2–5 business days',
      tracking: true,
    },
    {
      region: 'Worldwide',
      transitTime: '7–21 business days',
      tracking: true,
    },
  ];

  const returnSteps = [
    {
      icon: MessageCircle,
      title: 'Contact Support',
      description: 'Reach out to our support team with your order details and concern.',
    },
    {
      icon: FileText,
      title: 'Provide Order Info',
      description: 'Share your order number and relevant details for review.',
    },
    {
      icon: Mail,
      title: 'Receive Instructions',
      description: 'Our team will provide guidance based on your specific situation.',
    },
    {
      icon: Package,
      title: 'Return Received',
      description: 'Once received, we review the return within 3–5 business days.',
    },
    {
      icon: CheckCircle,
      title: 'Resolution Issued',
      description: 'Eligible refunds or replacements are processed to original payment method.',
    },
  ];

  const faqItems = [
    {
      question: 'Do you ship worldwide?',
      answer: 'Yes, we ship to all provinces and territories within Canada, as well as internationally to most countries. Shipping costs are calculated automatically at checkout based on your location.',
    },
    {
      question: 'Do you offer free shipping in Canada?',
      answer: `Yes. Orders over $${settings.shipping_free_threshold_canada} qualify for free shipping within Canada. Orders under $${settings.shipping_free_threshold_canada} have a flat rate of $${settings.shipping_base_cost}.`,
    },
    {
      question: 'When do I receive tracking?',
      answer: 'Tracking numbers are sent via email within 24 hours of order confirmation. Check your email (including spam/junk folders) for tracking updates.',
    },
    {
      question: 'What if my package is delayed?',
      answer: 'Transit times are estimates provided by carriers. If your package is significantly delayed, contact our support team with your tracking number and we will assist in resolving the issue.',
    },
    {
      question: 'What if my shipping address is wrong?',
      answer: 'Contact support immediately after placing your order if you notice an error. We cannot guarantee address changes after the order has been dispatched, but we will do our best to assist.',
    },
    {
      question: 'Can I change or cancel my order after placing it?',
      answer: 'Due to our fast fulfillment process (orders ship within 24 hours), we cannot guarantee order changes or cancellations. Contact support immediately for assistance.',
    },
    {
      question: 'What is your return policy?',
      answer: 'Due to the nature of research peptides, all sales are final. Returns or refunds are only considered in cases of damaged shipments, incorrect products, or verified quality issues. Contact support within 48 hours of delivery with photographic evidence.',
    },
    {
      question: 'How long do refunds take?',
      answer: 'Approved refunds are processed within 3–5 business days and returned to your original payment method. Bank processing times may vary (typically 5–10 business days).',
    },
    {
      question: 'Are customs fees included in the shipping cost?',
      answer: 'For international orders, customs fees, duties, and taxes are the responsibility of the customer and are not included in our shipping costs. These vary by country and are collected by your local customs authority.',
    },
    {
      question: 'How do I contact support?',
      answer: 'You can reach our support team via the contact information provided on our website. We typically respond within 24 hours during business days.',
    },
  ];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": window.location.origin
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Shipping & Returns",
        "item": `${window.location.origin}/shipping`
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

  return (
    <div className="min-h-screen bg-[#050608] pt-20 pb-16 md:pb-0">
      <SEO
        title="Shipping & Returns | Royal Peptides Canada"
        description="Clear shipping timelines, discreet packaging, and transparent return policies. Fast Canada-wide delivery and worldwide shipping available."
        canonical={`${window.location.origin}/shipping`}
        structuredData={[breadcrumbSchema, faqSchema]}
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
              Shipping & Returns
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Clear timelines, discreet packaging, and transparent policies
            </p>
          </div>

          <div className={`flex flex-wrap items-center justify-center gap-4 md:gap-6 py-4 ${prefersReducedMotion ? '' : 'animate-[fadeInUp_0.8s_ease-out_0.2s_both]'}`}>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#00A0E0]/10 rounded-lg border border-[#00A0E0]/30">
                <Package className="h-4 w-4 text-[#00A0E0]" />
              </div>
              <span className="text-sm text-gray-300 font-medium">Discreet Packaging</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#00A0E0]/10 rounded-lg border border-[#00A0E0]/30">
                <Truck className="h-4 w-4 text-[#00A0E0]" />
              </div>
              <span className="text-sm text-gray-300 font-medium">Tracking Updates</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#00A0E0]/10 rounded-lg border border-[#00A0E0]/30">
                <CheckCircle className="h-4 w-4 text-[#00A0E0]" />
              </div>
              <span className="text-sm text-gray-300 font-medium">Clear Eligibility</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#00A0E0]/10 rounded-lg border border-[#00A0E0]/30">
                <HeadphonesIcon className="h-4 w-4 text-[#00A0E0]" />
              </div>
              <span className="text-sm text-gray-300 font-medium">Support Available</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <section className={`mb-16 md:mb-24 ${prefersReducedMotion ? '' : 'animate-[fadeInUp_0.8s_ease-out_0.3s_both]'}`}>
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Shipping Overview
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Where we ship and how orders are processed
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/10 group hover:border-[#00A0E0]/30 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-[#00A0E0]/10 rounded-lg border border-[#00A0E0]/30">
                  <MapPin className="h-6 w-6 text-[#00A0E0]" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-[#00A0E0] transition-colors">
                  Shipping Regions
                </h3>
              </div>
              <div className="space-y-3 text-gray-300">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-[#00A0E0] flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <div>
                    <p className="font-semibold text-white">Canada</p>
                    <p className="text-sm text-gray-400">All provinces and territories</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Globe className="h-5 w-5 text-[#00A0E0] flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <div>
                    <p className="font-semibold text-white">Worldwide</p>
                    <p className="text-sm text-gray-400">International shipping available</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/10 group hover:border-[#00A0E0]/30 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-[#00A0E0]/10 rounded-lg border border-[#00A0E0]/30">
                  <Clock className="h-6 w-6 text-[#00A0E0]" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-[#00A0E0] transition-colors">
                  Processing & Dispatch
                </h3>
              </div>
              <div className="space-y-3 text-gray-300">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-[#00A0E0] flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <div>
                    <p className="font-semibold text-white">Processing Time</p>
                    <p className="text-sm text-gray-400">Orders ship within 24 business hours</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="h-5 w-5 text-[#00A0E0] flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <div>
                    <p className="font-semibold text-white">Tracking Provided</p>
                    <p className="text-sm text-gray-400">Sent via email after dispatch</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={`mb-16 md:mb-24 ${prefersReducedMotion ? '' : 'animate-[fadeInUp_0.8s_ease-out_0.4s_both]'}`}>
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Delivery Timelines
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Typical transit times by region
            </p>
          </div>

          <DeliveryTimeline rows={deliveryRows} />
        </section>

        <section className={`mb-16 md:mb-24 ${prefersReducedMotion ? '' : 'animate-[fadeInUp_0.8s_ease-out_0.5s_both]'}`}>
          <div className="relative overflow-hidden bg-gradient-to-br from-[#00A0E0]/10 via-white/5 to-[#11D0FF]/10 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-[#00A0E0]/30">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00A0E0]/30 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#11D0FF]/30 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-[#00A0E0]/20 rounded-lg border border-[#00A0E0]/40">
                  <Truck className="h-6 w-6 text-[#00A0E0]" strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  Shipping Costs & Free Shipping
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-white text-lg">Canada</h3>
                  <div className="space-y-2 text-gray-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-[#00A0E0]" strokeWidth={2} />
                      <span className="text-sm"><strong className="text-white">Free shipping</strong> on orders ${settings.shipping_free_threshold_canada}+</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-[#00A0E0]" strokeWidth={2} />
                      <span className="text-sm"><strong className="text-white">{settings.shipping_text_canada}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-white text-lg">Worldwide</h3>
                  <div className="space-y-2 text-gray-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-[#00A0E0]" strokeWidth={2} />
                      <span className="text-sm"><strong className="text-white">Free shipping</strong> on orders ${settings.shipping_free_threshold_international}+</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-[#00A0E0]" strokeWidth={2} />
                      <span className="text-sm">Calculated at checkout based on location</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/20">
                <p className="text-sm text-gray-300">
                  <strong className="text-white">Note:</strong> International customers are responsible for any customs fees, duties, or taxes imposed by their country.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={`mb-16 md:mb-24 ${prefersReducedMotion ? '' : 'animate-[fadeInUp_0.8s_ease-out_0.6s_both]'}`}>
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Discreet Packaging & Tracking
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Your privacy and delivery confidence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-[#00A0E0]/30 transition-all duration-300 group">
              <div className="flex flex-col items-center text-center">
                <div className="p-4 bg-[#00A0E0]/10 rounded-xl border border-[#00A0E0]/30 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-7 w-7 text-[#00A0E0]" strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-white text-lg mb-2 group-hover:text-[#00A0E0] transition-colors">
                  Discreet Packaging
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  All orders ship in unmarked packaging with no external indication of contents
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-[#00A0E0]/30 transition-all duration-300 group">
              <div className="flex flex-col items-center text-center">
                <div className="p-4 bg-[#00A0E0]/10 rounded-xl border border-[#00A0E0]/30 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Mail className="h-7 w-7 text-[#00A0E0]" strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-white text-lg mb-2 group-hover:text-[#00A0E0] transition-colors">
                  Tracking Updates
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Tracking numbers emailed within 24 hours of order confirmation
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-[#00A0E0]/30 transition-all duration-300 group">
              <div className="flex flex-col items-center text-center">
                <div className="p-4 bg-[#00A0E0]/10 rounded-xl border border-[#00A0E0]/30 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <AlertCircle className="h-7 w-7 text-[#00A0E0]" strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-white text-lg mb-2 group-hover:text-[#00A0E0] transition-colors">
                  Delivery Issues
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Contact support with your tracking number if packages are delayed or missing
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={`mb-16 md:mb-24 ${prefersReducedMotion ? '' : 'animate-[fadeInUp_0.8s_ease-out_0.7s_both]'}`}>
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Returns & Refunds
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Clear eligibility and process
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <XCircle className="h-6 w-6 text-amber-400" strokeWidth={1.5} />
                Eligibility
              </h3>
              <div className="space-y-3 text-gray-300">
                <div className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">•</span>
                  <p className="text-sm">Due to the nature of research peptides, <strong className="text-white">all sales are final</strong></p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#00A0E0] mt-1">•</span>
                  <p className="text-sm">Returns considered only for <strong className="text-white">damaged shipments, incorrect products, or verified quality issues</strong></p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#00A0E0] mt-1">•</span>
                  <p className="text-sm">Contact support <strong className="text-white">within 48 hours of delivery</strong> with photographic evidence</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-[#00A0E0]" strokeWidth={1.5} />
                Refund Handling
              </h3>
              <div className="space-y-3 text-gray-300">
                <div className="flex items-start gap-2">
                  <span className="text-[#00A0E0] mt-1">•</span>
                  <p className="text-sm">Approved refunds processed within <strong className="text-white">3–5 business days</strong></p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#00A0E0] mt-1">•</span>
                  <p className="text-sm">Refunds returned to <strong className="text-white">original payment method</strong></p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#00A0E0] mt-1">•</span>
                  <p className="text-sm">Bank processing may take an additional <strong className="text-white">5–10 business days</strong></p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6">Return Process</h3>
            <ReturnProcessTimeline steps={returnSteps} />
          </div>
        </section>

        <section className={`mb-16 md:mb-24 ${prefersReducedMotion ? '' : 'animate-[fadeInUp_0.8s_ease-out_0.8s_both]'}`}>
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Quick answers to common shipping questions
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <FAQAccordion items={faqItems} />
          </div>
        </section>

        <section className="relative overflow-hidden bg-gradient-to-br from-[#00A0E0]/10 via-white/5 to-[#11D0FF]/10 backdrop-blur-xl rounded-2xl p-8 sm:p-12 border border-[#00A0E0]/30">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00A0E0]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#11D0FF]/20 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Need help with an order?
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Contact our support team and we'll respond with next steps
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onNavigate('about')}
                className="group relative px-10 py-4 bg-gradient-to-r from-[#00A0E0] to-[#11D0FF] text-white rounded-lg font-bold tracking-wide transition-all duration-500 shadow-[0_0_30px_rgba(0,160,224,0.4)] hover:shadow-[0_0_50px_rgba(0,160,224,0.8)] hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#11D0FF] to-[#00A0E0] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="relative z-10 flex items-center gap-2 justify-center">
                  <HeadphonesIcon className="h-5 w-5" />
                  Contact Support
                </span>
                <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent ${
                  prefersReducedMotion ? '' : '-translate-x-full group-hover:translate-x-full transition-transform duration-700'
                }`} />
              </button>
              <button
                onClick={() => onNavigate('catalogue')}
                className="px-10 py-4 bg-white/5 backdrop-blur-md text-white border-2 border-[#00A0E0]/50 rounded-lg font-bold tracking-wide hover:bg-white/10 hover:border-[#00A0E0] transition-all duration-500"
              >
                Shop Catalogue
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
