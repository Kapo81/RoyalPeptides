import { useEffect, useState } from 'react';
import { TrendingUp, Users, MousePointer, ShoppingCart, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AnalyticsSummary {
  total_page_views: number;
  unique_visitors: number;
  total_product_clicks: number;
  total_orders: number;
  conversion_rate: number;
}

interface TopClickedProduct {
  product_id: string;
  product_name: string;
  click_count: number;
  image_url: string;
}

export default function AdminAnalytics() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [topClicked, setTopClicked] = useState<TopClickedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);

    const { data: summaryData, error: summaryError } = await supabase.rpc('get_analytics_summary');
    if (!summaryError && summaryData && summaryData.length > 0) {
      setSummary(summaryData[0]);
    }

    const { data: clickedData, error: clickedError } = await supabase.rpc('get_top_clicked_products', { limit_count: 5 });
    if (!clickedError && clickedData) {
      setTopClicked(clickedData);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A0E0] mx-auto mb-4"></div>
        <p className="text-gray-400">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Analytics Dashboard</h2>
        <p className="text-gray-400 text-sm">Performance metrics for the last 30 days</p>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-5 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Eye className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Page Views</p>
                <p className="text-2xl font-bold text-white">{summary.total_page_views.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-5 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Users className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Unique Visitors</p>
                <p className="text-2xl font-bold text-white">{summary.unique_visitors.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-5 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <MousePointer className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Product Clicks</p>
                <p className="text-2xl font-bold text-white">{summary.total_product_clicks.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-5 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Orders</p>
                <p className="text-2xl font-bold text-white">{summary.total_orders.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-5 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Conversion Rate</p>
                <p className="text-2xl font-bold text-white">{summary.conversion_rate}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {topClicked.length > 0 && (
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-4">Most Viewed Products</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {topClicked.map((product) => (
              <div key={product.product_id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.product_name}
                    className="w-full h-24 object-contain mb-3 rounded"
                  />
                )}
                <p className="text-sm font-semibold text-white mb-2 line-clamp-2">{product.product_name}</p>
                <div className="flex items-center gap-2 text-xs">
                  <Eye className="h-3 w-3 text-[#00A0E0]" />
                  <span className="text-gray-400">{product.click_count} views</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
