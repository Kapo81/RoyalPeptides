import { useEffect, useState } from 'react';
import { Search, X, Package, CheckCircle, Trash2, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Toast from '../components/Toast';

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_province: string;
  shipping_postal_code: string;
  shipping_country: string;
  payment_method: string;
  payment_status: string;
  shipping_status: string;
  subtotal: number;
  shipping_fee: number;
  total: number;
}

interface OrderItem {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
}

export default function AdminOrdersEnhanced() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteConfirmOrder, setDeleteConfirmOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    console.log('[AdminRoute] Mounted: /admin/orders');
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else if (data) {
      setOrders(data);
    }
    setLoading(false);
  };

  const fetchOrderItems = async (orderId: string) => {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (error) {
      console.error('Error fetching order items:', error);
    } else if (data) {
      setOrderItems(data);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.order_number.toLowerCase().includes(search) ||
          order.customer_email.toLowerCase().includes(search) ||
          `${order.customer_first_name} ${order.customer_last_name}`.toLowerCase().includes(search)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.shipping_status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    fetchOrderItems(order.id);
  };

  const handleMarkPaid = async (orderId: string) => {
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', orderId);

    if (itemsError || !items) {
      console.error('Error fetching order items:', itemsError);
      alert('Failed to fetch order items');
      return;
    }

    for (const item of items) {
      if (item.product_id) {
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('qty_in_stock, qty_sold')
          .eq('id', item.product_id)
          .single();

        if (!productError && product) {
          await supabase
            .from('products')
            .update({
              qty_in_stock: Math.max(0, product.qty_in_stock - item.quantity),
              qty_sold: (product.qty_sold || 0) + item.quantity
            })
            .eq('id', item.product_id);
        }
      }
    }

    const { error } = await supabase
      .from('orders')
      .update({ payment_status: 'paid', updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order:', error);
      setToastMessage('Failed to mark order as paid');
    } else {
      setToastMessage('Order marked as paid and stock deducted successfully');
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, payment_status: 'paid' });
      }
    }
  };

  const handleMarkShipped = async (orderId: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ shipping_status: 'shipped', updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order:', error);
      setToastMessage('Failed to update order status');
    } else {
      setToastMessage('Order marked as shipped successfully');
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, shipping_status: 'shipped' } : order
        )
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, shipping_status: 'shipped' });
      }
    }
  };

  const handleMarkCompleted = async (orderId: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ shipping_status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order:', error);
      setToastMessage('Failed to mark order as completed');
    } else {
      setToastMessage('Order marked as completed successfully');
      setOrders(prevOrders =>
        prevOrders.filter(order => order.id !== orderId)
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
    }
  };

  const handleDeleteOrder = async (order: Order) => {
    const { error: itemsError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', order.id);

    if (itemsError) {
      console.error('Error deleting order items:', itemsError);
      setToastMessage('Failed to delete order items');
      return;
    }

    const { error: orderError } = await supabase
      .from('orders')
      .delete()
      .eq('id', order.id);

    if (orderError) {
      console.error('Error deleting order:', orderError);
      setToastMessage('Failed to delete order');
    } else {
      setToastMessage(`Order ${order.order_number} deleted successfully`);
      setDeleteConfirmOrder(null);
      if (selectedOrder?.id === order.id) {
        setSelectedOrder(null);
      }
      setOrders(prevOrders => prevOrders.filter(o => o.id !== order.id));
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      paid: 'bg-green-500/20 text-green-300 border-green-500/30',
      shipped: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    };
    return styles[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#00A0E0] border-r-transparent" />
      </div>
    );
  }

  return (
    <div>
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      )}
      <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl border border-white/10 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order #, name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="shipped">Shipped</option>
          </select>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Order</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Total</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Payment</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">{order.order_number}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">
                      {order.customer_first_name} {order.customer_last_name}
                    </div>
                    <div className="text-xs text-gray-400">{order.customer_email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">${order.total.toFixed(2)}</div>
                    <div className="text-xs text-gray-400">
                      {order.payment_method === 'etransfer' ? 'Interac' : 'Stripe'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded border ${getStatusBadge(
                        order.payment_status
                      )}`}
                    >
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded border ${getStatusBadge(
                        order.shipping_status
                      )}`}
                    >
                      {order.shipping_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="p-2 bg-[#00A0E0]/20 border border-[#00A0E0]/30 text-[#00A0E0] rounded-lg hover:bg-[#00A0E0]/30 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {order.payment_status === 'pending' && (
                        <button
                          onClick={() => handleMarkPaid(order.id)}
                          className="p-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-lg hover:bg-emerald-500/30 transition-colors"
                          title="Mark as Paid (Deduct Stock)"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      {order.shipping_status === 'pending' && order.payment_status === 'paid' && (
                        <button
                          onClick={() => handleMarkShipped(order.id)}
                          className="p-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                          title="Mark as Shipped"
                        >
                          <Package className="h-4 w-4" />
                        </button>
                      )}
                      {order.shipping_status === 'shipped' && (
                        <button
                          onClick={() => handleMarkCompleted(order.id)}
                          className="p-2 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors"
                          title="Mark as Completed"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteConfirmOrder(order)}
                        className="p-2 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                        title="Delete Order"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No orders found</p>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-gradient-to-br from-[#0B0D12] to-[#05070b] border border-white/20 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_60px_rgba(0,160,224,0.3)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedOrder.order_number}</h2>
                <p className="text-sm text-gray-400">{new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Customer Information</h3>
                <div className="bg-white/5 rounded-lg p-4 space-y-2">
                  <p className="text-white">
                    {selectedOrder.customer_first_name} {selectedOrder.customer_last_name}
                  </p>
                  <p className="text-gray-400 text-sm">{selectedOrder.customer_email}</p>
                  <p className="text-gray-400 text-sm">{selectedOrder.customer_phone}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Shipping Address</h3>
                <div className="bg-white/5 rounded-lg p-4 space-y-1 text-gray-300 text-sm">
                  <p>{selectedOrder.shipping_address}</p>
                  <p>
                    {selectedOrder.shipping_city}, {selectedOrder.shipping_province}{' '}
                    {selectedOrder.shipping_postal_code}
                  </p>
                  <p>{selectedOrder.shipping_country}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Order Items</h3>
                <div className="space-y-2">
                  {orderItems.map((item) => (
                    <div key={item.id} className="bg-white/5 rounded-lg p-4 flex justify-between">
                      <div>
                        <p className="text-white font-medium">{item.product_name}</p>
                        <p className="text-gray-400 text-sm">Quantity: {item.quantity}</p>
                      </div>
                      <p className="text-[#00A0E0] font-medium">${item.subtotal.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-white">${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Shipping</span>
                    <span className="text-white">${selectedOrder.shipping_fee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2">
                    <span className="text-white">Total</span>
                    <span className="text-[#00A0E0]">${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmOrder && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setDeleteConfirmOrder(null)}
        >
          <div
            className="bg-gradient-to-br from-[#0B0D12] to-[#05070b] border border-red-500/30 rounded-xl max-w-md w-full p-6 shadow-[0_0_60px_rgba(239,68,68,0.3)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <Trash2 className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Delete Order</h3>
                <p className="text-gray-300 text-sm">
                  Are you sure you want to permanently delete order{' '}
                  <span className="font-semibold text-white">{deleteConfirmOrder.order_number}</span>?
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmOrder(null)}
                className="flex-1 py-2.5 px-4 bg-white/10 border border-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteOrder(deleteConfirmOrder)}
                className="flex-1 py-2.5 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
