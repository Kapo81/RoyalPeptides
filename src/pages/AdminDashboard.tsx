import { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, TrendingUp, AlertTriangle, Package, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toNumber, money, int } from '../utils/number';

interface DashboardStats {
  today_revenue: number;
  today_orders: number;
  last_7_days_revenue: number;
  last_7_days_orders: number;
  last_30_days_revenue: number;
  last_30_days_orders: number;
  average_order_value: number;
}

interface TopProduct {
  product_id: string;
  product_name: string;
  total_quantity_sold: number;
  total_revenue: number;
  image_url: string;
}

interface LowStockProduct {
  product_id: string;
  product_name: string;
  qty_in_stock: number;
  low_stock_threshold: number;
  image_url: string;
}

export default function AdminDashboard({ onNavigate }: { onNavigate: (section: string) => void }) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResult, topProductsResult, lowStockResult] = await Promise.all([
        supabase.rpc('get_order_stats'),
        supabase.rpc('get_top_selling_products', { limit_count: 5 }),
        supabase.rpc('get_low_stock_products'),
      ]);

      if (statsResult.data && statsResult.data.length > 0) {
        setStats(statsResult.data[0]);
      }

      if (topProductsResult.data) {
        setTopProducts(topProductsResult.data);
      }

      if (lowStockResult.data) {
        setLowStockProducts(lowStockResult.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">Overview of your store performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">${money(stats?.today_revenue)}</h3>
          <p className="text-sm text-gray-500 mt-1">Today's Revenue</p>
          <p className="text-xs text-gray-400 mt-2">{int(stats?.today_orders)} orders</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">${money(stats?.last_7_days_revenue)}</h3>
          <p className="text-sm text-gray-500 mt-1">Last 7 Days Revenue</p>
          <p className="text-xs text-gray-400 mt-2">{int(stats?.last_7_days_orders)} orders</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">${money(stats?.last_30_days_revenue)}</h3>
          <p className="text-sm text-gray-500 mt-1">Last 30 Days Revenue</p>
          <p className="text-xs text-gray-400 mt-2">{int(stats?.last_30_days_orders)} orders</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">${money(stats?.average_order_value)}</h3>
          <p className="text-sm text-gray-500 mt-1">Average Order Value</p>
          <p className="text-xs text-gray-400 mt-2">All time average</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Top 5 Selling Products</h2>
          </div>
          <div className="p-6">
            {topProducts.length === 0 ? (
              <p className="text-gray-500 text-sm">No sales data available yet</p>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product) => (
                  <div key={product.product_id} className="flex items-center gap-4">
                    <img
                      src={product.image_url || '/placeholder-vial.png'}
                      alt={product.product_name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{product.product_name}</h4>
                      <p className="text-sm text-gray-500">{product.total_quantity_sold} sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${money(product.total_revenue)}</p>
                      <p className="text-xs text-gray-500">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h2>
            {lowStockProducts.length > 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded">
                {lowStockProducts.length} items
              </span>
            )}
          </div>
          <div className="p-6">
            {lowStockProducts.length === 0 ? (
              <p className="text-gray-500 text-sm">All products are well stocked!</p>
            ) : (
              <div className="space-y-4">
                {lowStockProducts.map((product) => (
                  <div key={product.product_id} className="flex items-center gap-4">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{product.product_name}</h4>
                      <p className="text-sm text-red-600">
                        Only {product.qty_in_stock} left (threshold: {product.low_stock_threshold})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => onNavigate('orders')}
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">View Orders</h3>
          </div>
          <p className="text-sm text-gray-500">Manage and track customer orders</p>
        </button>

        <button
          onClick={() => onNavigate('products')}
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Manage Inventory</h3>
          </div>
          <p className="text-sm text-gray-500">Update stock and product details</p>
        </button>

        <button
          onClick={() => onNavigate('bundles')}
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Create Bundle</h3>
          </div>
          <p className="text-sm text-gray-500">Design new product stacks</p>
        </button>
      </div>
    </div>
  );
}
