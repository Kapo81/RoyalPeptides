import { useEffect, useState } from 'react';
import { Eye, MousePointer, Activity, TrendingUp, BarChart3, ShoppingCart, CheckCircle, Target, AlertTriangle } from 'lucide-react';
import { getAnalyticsSummary, AnalyticsSummary } from '../lib/analytics';
import { toNumber, int, safeFixed } from '../utils/number';

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    console.log('[AdminRoute] Mounted: /admin/analytics');
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    console.log('[AdminAnalytics] Fetching analytics for timeRange:', timeRange);
    try {
      const data = await getAnalyticsSummary(timeRange);
      console.log('[AdminAnalytics] Analytics data loaded:', data);
      setAnalytics(data);
    } catch (err: any) {
      console.error('[AdminAnalytics] Error fetching analytics:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Analytics</h1>
          <p className="text-gray-400">Track user behavior and engagement</p>
        </div>
        <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 backdrop-blur-xl rounded-xl border border-red-500/30 p-12">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Error Loading Analytics</h3>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={fetchAnalytics}
              className="px-6 py-3 bg-gradient-to-r from-[#00A0E0] to-[#11D0FF] text-white rounded-lg hover:shadow-[0_0_20px_rgba(0,160,224,0.4)] transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A0E0] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Analytics</h1>
          <p className="text-gray-400">Track user behavior and engagement</p>
        </div>
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl border border-white/10 p-12">
          <div className="text-center">
            <Activity className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Analytics Data</h3>
            <p className="text-gray-400">Unable to load analytics data at this time.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Analytics</h1>
          <p className="text-gray-400">Track user behavior and engagement</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(Number(e.target.value))}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-[#00A0E0]/20 rounded-lg">
              <Eye className="h-6 w-6 text-[#00A0E0]" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white">{toNumber(analytics.total_visits, 0).toLocaleString()}</h3>
          <p className="text-sm text-gray-400 mt-1">Unique Visitors</p>
          <p className="text-xs text-gray-500 mt-2">{toNumber(analytics.total_page_views, 0).toLocaleString()} page views</p>
        </div>

        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <MousePointer className="h-6 w-6 text-green-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white">{toNumber(analytics.product_clicks, 0).toLocaleString()}</h3>
          <p className="text-sm text-gray-400 mt-1">Product Clicks</p>
          <p className="text-xs text-gray-500 mt-2">{int(analytics.add_to_cart_events)} add to cart</p>
        </div>

        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-orange-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white">{toNumber(analytics.checkout_starts, 0).toLocaleString()}</h3>
          <p className="text-sm text-gray-400 mt-1">Checkout Starts</p>
          <p className="text-xs text-gray-500 mt-2">{int(analytics.orders_completed)} completed</p>
        </div>

        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Target className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white">{safeFixed(analytics.conversion_rate, 1)}%</h3>
          <p className="text-sm text-gray-400 mt-1">Conversion Rate</p>
          <p className="text-xs text-gray-500 mt-2">{int(analytics.orders_completed)} orders</p>
        </div>
      </div>

      {analytics.top_products && analytics.top_products.length > 0 && (
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#00A0E0]" />
              <h2 className="text-lg font-semibold text-white">Top Viewed Products</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Product</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">Clicks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {analytics.top_products.map((product, index) => (
                    <tr key={index} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-white">{product.product_name || 'Unknown'}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-semibold text-[#00A0E0]">{int(product.clicks)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {toNumber(analytics.total_visits, 0) === 0 && (
        <div className="bg-gradient-to-br from-[#00A0E0]/10 to-[#00A0E0]/5 backdrop-blur-xl rounded-xl border border-[#00A0E0]/30 p-6 mt-6">
          <div className="flex items-start gap-3">
            <Activity className="h-6 w-6 text-[#00A0E0] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white mb-1">No Analytics Data Yet</h3>
              <p className="text-sm text-gray-400">
                Analytics data will appear here once users start visiting your site and interacting with products.
                Tracking is automatically enabled on all public pages.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
