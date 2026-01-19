import { useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

export default function StacksFAQ() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is a peptide research stack?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A peptide research stack is a curated combination of complementary peptides designed to work synergistically toward a specific research goal. Our stacks bundle multiple peptides at a discounted price (10-20% savings compared to purchasing individually), providing both convenience and value for researchers.',
          },
        },
        {
          '@type': 'Question',
          name: 'How much do I save with stacks compared to individual peptides?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Our peptide stacks offer savings of 10-20% compared to purchasing each peptide individually. The exact savings depend on the specific stack, with individual savings amounts displayed on each bundle card. Additionally, all orders qualify for our volume discounts: 10% off at $300+ and 15% off at $500+.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I purchase individual peptides instead of the full stack?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, all peptides included in our stacks are available for individual purchase in our catalogue. You can browse the complete peptide catalogue to purchase specific compounds separately. However, purchasing the stack provides better value and ensures you have all complementary compounds for your research protocol.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do stack discounts combine with the $300/$500 volume discounts?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! Stack prices already include the bundle discount (10-20% savings), and your total order qualifies for our volume discounts: 10% off orders $300+ and 15% off orders $500+. Both discounts are applied automatically at checkout, maximizing your savings.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I know which stack is right for my research?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Each stack is designed for specific research applications like recovery, metabolic optimization, cognitive enhancement, sleep improvement, or cosmetic research. Click on any stack to view detailed information including mechanisms of synergy, recommended use cases, and complete product breakdowns. Our stacks are curated based on complementary mechanisms of action.',
          },
        },
      ],
    };

    const scriptId = 'stacks-faq-schema';
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
      question: 'What is a peptide research stack?',
      answer:
        'A peptide research stack is a curated combination of complementary peptides designed to work synergistically toward a specific research goal. Our stacks bundle multiple peptides at a discounted price (10-20% savings compared to purchasing individually), providing both convenience and value for researchers.',
    },
    {
      question: 'How much do I save with stacks compared to individual peptides?',
      answer:
        'Our peptide stacks offer savings of 10-20% compared to purchasing each peptide individually. The exact savings depend on the specific stack, with individual savings amounts displayed on each bundle card. Additionally, all orders qualify for our volume discounts: 10% off at $300+ and 15% off at $500+.',
    },
    {
      question: 'Can I purchase individual peptides instead of the full stack?',
      answer:
        'Yes, all peptides included in our stacks are available for individual purchase in our catalogue. You can browse the complete peptide catalogue to purchase specific compounds separately. However, purchasing the stack provides better value and ensures you have all complementary compounds for your research protocol.',
    },
    {
      question: 'Do stack discounts combine with the $300/$500 volume discounts?',
      answer:
        'Yes! Stack prices already include the bundle discount (10-20% savings), and your total order qualifies for our volume discounts: 10% off orders $300+ and 15% off orders $500+. Both discounts are applied automatically at checkout, maximizing your savings.',
    },
    {
      question: 'How do I know which stack is right for my research?',
      answer:
        'Each stack is designed for specific research applications like recovery, metabolic optimization, cognitive enhancement, sleep improvement, or cosmetic research. Click on any stack to view detailed information including mechanisms of synergy, recommended use cases, and complete product breakdowns. Our stacks are curated based on complementary mechanisms of action.',
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
          <h2 className="text-2xl md:text-3xl font-bold text-white">Research Stack FAQs</h2>
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
