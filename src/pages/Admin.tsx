import { useState, useEffect } from 'react';
import { Lock, LogOut, Package, AlertTriangle, Download, CheckCircle, Clock, Truck, DollarSign, LayoutGrid, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AdminInventory from './AdminInventory';
import AdminAnalytics from './AdminAnalytics';

interface Order {
  id: string;
  order_number: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_province: string;
  shipping_postal_code: string;
  payment_method: string;
  payment_status: string;
  shipping_status: string;
  total: number;
  created_at: string;
  order_items: OrderItem[];
}

interface OrderItem {
  product_name: string;
  quantity: number;
  product_price: number;
  subtotal: number;
}

interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'analytics'>('orders');

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      fetchLowStockProducts();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.shipping_status === statusFilter));
    }
  }, [statusFilter, orders]);

  const checkAuth = () => {
    const adminAuth = localStorage.getItem('admin_authenticated');
    if (adminAuth === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USER || 'admin';
    const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'password';

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      localStorage.setItem('admin_authenticated', 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid username or password');
    }

    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  const fetchOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: items } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);

          return {
            ...order,
            order_items: items || [],
          };
        })
      );

      setOrders(ordersWithItems);
      setFilteredOrders(ordersWithItems);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const fetchLowStockProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, qty_in_stock')
        .order('qty_in_stock', { ascending: true });

      if (error) throw error;

      const lowStock = (data || [])
        .filter(product => product.qty_in_stock > 0 && product.qty_in_stock <= 5)
        .map(product => ({
          id: product.id,
          name: product.name,
          stock: product.qty_in_stock,
        }));

      setLowStockProducts(lowStock);
    } catch (err) {
      console.error('Error fetching low stock products:', err);
      setLowStockProducts([]);
    }
  };

  const updateOrderStatus = async (orderId: string, field: string, value: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      await fetchOrders();
    } catch (err) {
      console.error('Error updating order:', err);
      alert('Failed to update order status');
    }
  };

  const markAsPaidByInterac = async (orderId: string) => {
    await updateOrderStatus(orderId, 'payment_status', 'completed');
  };

  const updateShippingStatus = async (orderId: string, status: string) => {
    await updateOrderStatus(orderId, 'shipping_status', status);
  };

  const exportToCSV = () => {
    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Email',
      'Phone',
      'Shipping Address',
      'Products',
      'Total',
      'Payment Method',
      'Payment Status',
      'Shipping Status',
    ];

    const rows = filteredOrders.map(order => [
      order.order_number,
      new Date(order.created_at).toLocaleDateString(),
      `${order.customer_first_name} ${order.customer_last_name}`,
      order.customer_email,
      order.customer_phone,
      `${order.shipping_address}, ${order.shipping_city}, ${order.shipping_province} ${order.shipping_postal_code}`,
      order.order_items.map(item => `${item.product_name} (${item.quantity}x)`).join('; '),
      `$${order.total.toFixed(2)}`,
      order.payment_method === 'etransfer' ? 'Interac e-Transfer' : 'Stripe',
      order.payment_status,
      order.shipping_status,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string, type: 'payment' | 'shipping') => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      completed: 'bg-green-500/20 text-green-300 border-green-500/30',
      paid: 'bg-green-500/20 text-green-300 border-green-500/30',
      shipped: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      cancelled: 'bg-red-500/20 text-red-300 border-red-500/30',
    };

    return (
      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#05070b] flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#05070b] flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-8 border border-white/10">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 bg-gradient-to-br from-[#00A0E0]/20 to-[#00A0E0]/5 rounded-lg border border-[#00A0E0]/30">
                <Lock className="h-8 w-8 text-[#00A0E0]" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white text-center mb-2">Admin Login</h1>
            <p className="text-gray-400 text-sm text-center mb-6">Enter your admin credentials</p>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
                  placeholder="Enter username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
                  placeholder="Enter password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-[#00A0E0] to-[#11D0FF] text-white rounded-lg font-medium hover:shadow-[0_0_30px_rgba(0,160,224,0.4)] transition-all disabled:opacity-50"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070b] pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm">Manage orders and inventory</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'orders'
                ? 'bg-gradient-to-r from-[#00A0E0] to-[#11D0FF] text-white shadow-[0_0_20px_rgba(0,160,224,0.4)]'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <Package className="h-5 w-5" />
            Orders
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'inventory'
                ? 'bg-gradient-to-r from-[#00A0E0] to-[#11D0FF] text-white shadow-[0_0_20px_rgba(0,160,224,0.4)]'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <LayoutGrid className="h-5 w-5" />
            Inventory
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-[#00A0E0] to-[#11D0FF] text-white shadow-[0_0_20px_rgba(0,160,224,0.4)]'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <TrendingUp className="h-5 w-5" />
            Analytics
          </button>
        </div>

        {activeTab === 'orders' && lowStockProducts.length > 0 && (
          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-yellow-300 font-semibold mb-2">Low Stock Alerts</h3>
                <div className="space-y-1">
                  {lowStockProducts.map(product => (
                    <p key={product.id} className="text-yellow-200 text-sm">
                      <span className="font-medium">{product.name}</span> - Only {product.stock} remaining
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' ? (
          <AdminAnalytics />
        ) : activeTab === 'inventory' ? (
          <AdminInventory />
        ) : (
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-[#00A0E0]" />
                <h2 className="text-xl font-bold text-white">Orders ({filteredOrders.length})</h2>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#00A0E0]/50"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="shipped">Shipped</option>
                </select>

                <button
                  onClick={exportToCSV}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#00A0E0] to-[#11D0FF] text-white rounded-lg font-medium hover:shadow-[0_0_20px_rgba(0,160,224,0.4)] transition-all text-sm"
                >
                  <Download className="h-4 w-4" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Products</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium text-sm">{order.order_number}</p>
                        <p className="text-gray-400 text-xs">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white text-sm">{order.customer_first_name} {order.customer_last_name}</p>
                        <p className="text-gray-400 text-xs">{order.customer_email}</p>
                        <p className="text-gray-500 text-xs">{order.customer_phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {order.order_items.map((item, idx) => (
                          <p key={idx} className="text-gray-300 text-xs">
                            {item.product_name} <span className="text-gray-500">×{item.quantity}</span>
                          </p>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">${order.total.toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <p className="text-gray-300 text-xs">
                          {order.payment_method === 'etransfer' ? 'Interac e-Transfer' : 'Stripe'}
                        </p>
                        {getStatusBadge(order.payment_status, 'payment')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.shipping_status}
                        onChange={(e) => updateShippingStatus(order.id, e.target.value)}
                        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-[#00A0E0]/50"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="shipped">Shipped</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        {order.payment_method === 'etransfer' && order.payment_status === 'pending' && (
                          <button
                            onClick={() => markAsPaidByInterac(order.id)}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-green-500/20 border border-green-500/30 text-green-300 rounded-md hover:bg-green-500/30 transition-colors text-xs font-medium"
                          >
                            <CheckCircle className="h-3 w-3" />
                            <span>Mark Paid</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No orders found</p>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
