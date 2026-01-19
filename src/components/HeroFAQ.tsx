import { useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

export default function HeroFAQ() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What are the discount thresholds?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We offer two discount tiers: 10% off on orders $300 or more, and 15% off on orders $500 or more. Discounts are applied automatically at checkout and are available worldwide.',
          },
        },
        {
          '@type': 'Question',
          name: 'Where does free shipping apply?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Free shipping applies only to orders within Canada that meet the discount threshold ($300+ or $500+). The discount percentage applies worldwide, but free shipping is exclusive to Canadian addresses.',
          },
        },
        {
          '@type': 'Question',
          name: 'How are discounts applied?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'All discounts are applied automatically at checkout based on your cart total. No promo codes are needed. The discount and any applicable free shipping will be calculated and displayed before you complete your purchase.',
          },
        },
      ],
    };

    const scriptId = 'hero-faq-schema';
    document.getElementById(scriptId)?.remove();

    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(script);

    return () => {
      document.getElementById(scriptId)?.remove();
    };
  }, []);

  const faqs = [
    {
      question: 'What are the discount thresholds?',
      answer:
        'We offer two discount tiers: 10% off on orders $300 or more, and 15% off on orders $500 or more. Discounts are applied automatically at checkout and are available worldwide.',
    },
    {
      question: 'Where does free shipping apply?',
      answer:
        'Free shipping applies only to orders within Canada that meet the discount threshold ($300+ or $500+). The discount percentage applies worldwide, but free shipping is exclusive to Canadian addresses.',
    },
    {
      question: 'How are discounts applied?',
      answer:
        'All discounts are applied automatically at checkout based on your cart total. No promo codes are needed. The discount and any applicable free shipping will be calculated and displayed before you complete your purchase.',
    },
  ];

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-[#050608] to-[#0B0D12] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(0,160,224,0.03)_0%,_transparent_70%)]" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-white/5 rounded-lg border border-white/10">
            <HelpCircle className="h-5 w-5 text-[#00A0E0]" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors duration-300"
            >
              <summary className="cursor-pointer px-6 py-4 text-white font-semibold flex items-center justify-between hover:bg-white/[0.02] transition-colors duration-300">
                <span className="text-sm md:text-base">{faq.question}</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform duration-300">
                  ▼
                </span>
              </summary>
              <div className="px-6 pb-4 text-sm md:text-base text-gray-400 leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
