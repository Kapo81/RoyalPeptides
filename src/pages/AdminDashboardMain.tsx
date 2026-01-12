import { useEffect, useState } from 'react';
import { Package, DollarSign, TrendingUp, ShoppingCart } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUnits: number;
}

export default function AdminDashboardMain() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[AdminRoute] Mounted: /admin/dashboard');
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [ordersRes, inventoryRes] = await Promise.all([
        supabase.from('orders').select('total, created_at').order('created_at', { ascending: false }).limit(100),
        supabase.rpc('get_inventory_stats'),
      ]);

      const totalOrders = ordersRes.data?.length || 0;
      const totalRevenue = ordersRes.data?.reduce((sum, order) => sum + order.total, 0) || 0;
      const totalProducts = inventoryRes.data?.[0]?.total_products_in_stock || 0;
      const totalUnits = inventoryRes.data?.[0]?.total_units_in_stock || 0;

      setStats({
        totalOrders,
        totalRevenue,
        totalProducts,
        totalUnits,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#00A0E0] border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Overview of your store performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#00A0E0]/20 rounded-lg border border-[#00A0E0]/30">
              <ShoppingCart className="h-6 w-6 text-[#00A0E0]" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Orders</p>
              <p className="text-2xl font-bold text-white">{stats?.totalOrders || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-lg border border-green-500/30">
              <DollarSign className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-white">${(stats?.totalRevenue || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-lg border border-purple-500/30">
              <Package className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Products</p>
              <p className="text-2xl font-bold text-white">{stats?.totalProducts || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/20 rounded-lg border border-amber-500/30">
              <TrendingUp className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Units in Stock</p>
              <p className="text-2xl font-bold text-white">{stats?.totalUnits || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/10">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => window.location.hash = '#orders'}
            className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition-all group"
          >
            <Package className="h-8 w-8 text-[#00A0E0] mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-white mb-1">Manage Orders</h3>
            <p className="text-sm text-gray-400">View and process customer orders</p>
          </button>

          <button
            onClick={() => window.location.hash = '#inventory'}
            className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition-all group"
          >
            <TrendingUp className="h-8 w-8 text-[#00A0E0] mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-white mb-1">Update Inventory</h3>
            <p className="text-sm text-gray-400">Manage product stock levels</p>
          </button>

          <button
            onClick={() => window.location.hash = '#settings'}
            className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition-all group"
          >
            <Package className="h-8 w-8 text-[#00A0E0] mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-white mb-1">Store Settings</h3>
            <p className="text-sm text-gray-400">Configure shipping and preferences</p>
          </button>
        </div>
      </div>
    </div>
  );
}
