import { Award } from 'lucide-react';

export default function ResearchIncentives() {
  return (
    <div className="inline-flex flex-col gap-4 w-full max-w-md">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 bg-gradient-to-br from-[#0093D0]/10 to-[#0093D0]/5 rounded-md border border-[#0093D0]/20">
          <Award className="h-4 w-4 text-[#0093D0]" strokeWidth={1.5} />
        </div>
        <h3 className="text-sm font-medium text-gray-200 tracking-wide">
          Automatic Order Advantages
        </h3>
      </div>

      <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-sm rounded-xl border border-white/[0.08] p-5 space-y-3.5">
        <div className="space-y-2.5">
          <div className="flex items-start gap-2.5">
            <span className="text-[#0093D0] text-sm mt-0.5">•</span>
            <span className="text-gray-300 text-sm leading-relaxed">Orders of $300+ receive 10% automatic savings</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="text-[#0093D0] text-sm mt-0.5">•</span>
            <span className="text-gray-300 text-sm leading-relaxed">Orders of $500+ receive 15% automatic savings</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="text-[#0093D0] text-sm mt-0.5">•</span>
            <span className="text-gray-300 text-sm leading-relaxed">Complimentary Canadian shipping included on qualifying orders</span>
          </div>
        </div>

        <div className="pt-3 border-t border-white/[0.06]">
          <p className="text-[10px] text-gray-500 leading-relaxed">
            All advantages are applied automatically at checkout based on order value.
          </p>
        </div>
      </div>
    </div>
  );
}
