import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div
            key={index}
            className={`bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl border transition-all duration-300 overflow-hidden ${
              isOpen ? 'border-[#00A0E0]/50 shadow-[0_10px_30px_rgba(0,160,224,0.15)]' : 'border-white/10 hover:border-white/20'
            }`}
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full px-5 py-4 flex items-center justify-between text-left group"
            >
              <h3 className={`font-semibold pr-4 transition-colors duration-300 ${
                isOpen ? 'text-[#00A0E0]' : 'text-white group-hover:text-gray-200'
              }`}>
                {item.question}
              </h3>
              <ChevronDown
                className={`h-5 w-5 flex-shrink-0 transition-all duration-300 ${
                  isOpen ? 'rotate-180 text-[#00A0E0]' : 'text-gray-400 group-hover:text-gray-300'
                } ${prefersReducedMotion ? '' : 'transform'}`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                isOpen ? 'max-h-96' : 'max-h-0'
              }`}
            >
              <div className="px-5 pb-4 text-sm text-gray-300 leading-relaxed">
                {item.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
