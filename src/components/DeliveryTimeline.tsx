import { CheckCircle } from 'lucide-react';

interface TimelineRow {
  region: string;
  transitTime: string;
  tracking: boolean;
}

interface DeliveryTimelineProps {
  rows: TimelineRow[];
}

export default function DeliveryTimeline({ rows }: DeliveryTimelineProps) {
  return (
    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">
                Region
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">
                Transit Time
              </th>
              <th className="text-center px-6 py-4 text-sm font-semibold text-gray-300">
                Tracking
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-6 py-4 text-white font-medium">
                  {row.region}
                </td>
                <td className="px-6 py-4 text-gray-300">
                  {row.transitTime}
                </td>
                <td className="px-6 py-4 text-center">
                  {row.tracking ? (
                    <CheckCircle className="h-5 w-5 text-[#00A0E0] mx-auto" strokeWidth={2} />
                  ) : (
                    <span className="text-gray-500 text-sm">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 bg-white/[0.02] border-t border-white/10">
        <p className="text-xs text-gray-500">
          Transit times vary by carrier and location. Business days only.
        </p>
      </div>
    </div>
  );
}
