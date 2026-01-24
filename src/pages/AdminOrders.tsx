import { useEffect, useState } from 'react';
import { Search, Filter, X, Package, Truck, CheckCircle, Edit2, Save, Trash2, Clock, Mail, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Toast from '../components/Toast';
import { toNumber, money, int } from '../utils/number';

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
  fulfillment_status: string;
  subtotal: number;
  shipping_fee: number;
  total: number;
  tax_amount?: number;
  tax_rate?: number;
  admin_notes: string;
  tracking_number: string;
  carrier: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [fulfillmentFilter, setFulfillmentFilter] = useState('all');
  const [editingOrder, setEditingOrder] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');
  const [editedTracking, setEditedTracking] = useState('');
  const [editedCarrier, setEditedCarrier] = useState('');
  const [editedFulfillmentStatus, setEditedFulfillmentStatus] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    console.log('[AdminRoute] Mounted: /admin/orders');
    fetchOrders();
  }, []);

  const logAdminAction = async (action: string, orderId: string, details: any = {}) => {
    try {
      await supabase.rpc('log_admin_action', {
        p_admin_user: 'peptidesroyal@gmail.com',
        p_action: action,
        p_order_id: orderId,
        p_details: details
      });
      console.log('[AdminOrders] Audit log created:', action, orderId);
    } catch (err) {
      console.error('[AdminOrders] Failed to log action:', err);
    }
  };

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter, fulfillmentFilter]);

  const fetchOrders = async () => {
    console.log('[AdminOrders] Fetching orders from database...');
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[AdminOrders] FETCH FAILED:', error);
    } else if (data) {
      console.log(`[AdminOrders] Successfully fetched ${data.length} orders`);
      setOrders(data);
    } else {
      console.warn('[AdminOrders] No data returned from fetch');
      setOrders([]);
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
      filtered = filtered.filter((order) => order.payment_status === statusFilter);
    }

    if (fulfillmentFilter !== 'all') {
      filtered = filtered.filter((order) => order.fulfillment_status === fulfillmentFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setEditedNotes(order.admin_notes || '');
    setEditedTracking(order.tracking_number || '');
    setEditedCarrier(order.carrier || '');
    setEditedFulfillmentStatus(order.fulfillment_status || 'unfulfilled');
    fetchOrderItems(order.id);
  };

  const handleMarkProcessing = async () => {
    if (!selectedOrder) return;

    console.log('[AdminOrders] Marking order as processing:', selectedOrder.id);

    const { error } = await supabase
      .from('orders')
      .update({ fulfillment_status: 'processing' })
      .eq('id', selectedOrder.id);

    if (!error) {
      console.log('[AdminOrders] Status update successful, refetching...');
      setToastMessage('Saved ✓ - Order marked as Processing');

      await logAdminAction('order_status_changed', selectedOrder.id, {
        old_status: selectedOrder.fulfillment_status,
        new_status: 'processing'
      });

      await fetchOrders();

      const { data: verifyData } = await supabase
        .from('orders')
        .select('*')
        .eq('id', selectedOrder.id)
        .maybeSingle();

      if (verifyData) {
        console.log('[AdminOrders] Update verified:', verifyData);
        setSelectedOrder(verifyData);
      }
    } else {
      console.error('[AdminOrders] UPDATE FAILED:', error);
      setToastMessage(`Failed: ${error.message}`);
    }
  };

  const handleMarkShipped = async () => {
    if (!selectedOrder) return;

    console.log('[AdminOrders] Marking order as shipped:', selectedOrder.id);

    const { error } = await supabase
      .from('orders')
      .update({ fulfillment_status: 'shipped' })
      .eq('id', selectedOrder.id);

    if (!error) {
      console.log('[AdminOrders] Status update successful, refetching...');
      setToastMessage('Saved ✓ - Order marked as Shipped');

      await logAdminAction('order_status_changed', selectedOrder.id, {
        old_status: selectedOrder.fulfillment_status,
        new_status: 'shipped'
      });

      await fetchOrders();

      const { data: verifyData } = await supabase
        .from('orders')
        .select('*')
        .eq('id', selectedOrder.id)
        .maybeSingle();

      if (verifyData) {
        console.log('[AdminOrders] Update verified:', verifyData);
        setSelectedOrder(verifyData);
      }
    } else {
      console.error('[AdminOrders] UPDATE FAILED:', error);
      setToastMessage(`Failed: ${error.message}`);
    }
  };

  const handleAddTracking = async () => {
    if (!selectedOrder) return;

    if (!editedTracking || !editedCarrier) {
      setToastMessage('Please enter both carrier and tracking number');
      return;
    }

    console.log('[AdminOrders] Adding tracking info:', selectedOrder.id);

    const { error } = await supabase
      .from('orders')
      .update({
        tracking_number: editedTracking,
        carrier: editedCarrier,
        fulfillment_status: 'shipped'
      })
      .eq('id', selectedOrder.id);

    if (!error) {
      console.log('[AdminOrders] Tracking added, refetching...');
      setToastMessage('Saved ✓ - Tracking added. Email notification sent to customer.');
      setEditingOrder(false);

      await logAdminAction('tracking_added', selectedOrder.id, {
        carrier: editedCarrier,
        tracking_number: editedTracking
      });

      await fetchOrders();

      const { data: verifyData } = await supabase
        .from('orders')
        .select('*')
        .eq('id', selectedOrder.id)
        .maybeSingle();

      if (verifyData) {
        console.log('[AdminOrders] Update verified:', verifyData);
        setSelectedOrder(verifyData);
      }
    } else {
      console.error('[AdminOrders] UPDATE FAILED:', error);
      setToastMessage(`Failed: ${error.message}`);
    }
  };

  const handleSaveOrder = async () => {
    if (!selectedOrder) return;

    const updates = {
      admin_notes: editedNotes,
      tracking_number: editedTracking,
      carrier: editedCarrier,
      fulfillment_status: editedFulfillmentStatus,
      updated_at: new Date().toISOString(),
    };

    console.log('[AdminOrders] Updating order:', selectedOrder.id, updates);

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', selectedOrder.id);

    if (error) {
      console.error('[AdminOrders] UPDATE FAILED:', error);
      setToastMessage(`Failed to update order: ${error.message}`);
    } else {
      console.log('[AdminOrders] Update successful, refetching...');
      setEditingOrder(false);
      setToastMessage('Saved ✓');

      await logAdminAction('order_updated', selectedOrder.id, {
        updated_fields: Object.keys(updates)
      });

      await fetchOrders();

      const { data: verifyData } = await supabase
        .from('orders')
        .select('*')
        .eq('id', selectedOrder.id)
        .maybeSingle();

      if (verifyData) {
        console.log('[AdminOrders] Update verified:', verifyData);
        setSelectedOrder(verifyData);
      }
    }
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;

    console.log('[AdminOrders] Attempting to delete order:', selectedOrder.id, selectedOrder.order_number);

    await logAdminAction('order_deleted', selectedOrder.id, {
      order_number: selectedOrder.order_number,
      customer_email: selectedOrder.customer_email,
      total: selectedOrder.total
    });

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', selectedOrder.id);

    if (error) {
      console.error('[AdminOrders] DELETE FAILED:', error);
      setToastMessage(`Failed to delete order: ${error.message}`);
    } else {
      console.log('[AdminOrders] Delete successful, refetching orders...');
      setToastMessage('Saved ✓ - Order deleted permanently');

      const deletedOrderId = selectedOrder.id;
      setSelectedOrder(null);
      setShowDeleteConfirm(false);

      await fetchOrders();

      const { data: verifyData } = await supabase
        .from('orders')
        .select('id')
        .eq('id', deletedOrderId)
        .maybeSingle();

      if (verifyData) {
        console.error('[AdminOrders] PERSISTENCE FAILED: Order still exists after delete!');
        setToastMessage('Warning: Order may not have been deleted. Check diagnostics.');
      } else {
        console.log('[AdminOrders] Delete verified - order no longer in database');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const getFulfillmentBadge = (status: string) => {
    const styles: Record<string, string> = {
      unfulfilled: 'bg-gray-100 text-gray-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const getFulfillmentLabel = (status: string) => {
    const labels: Record<string, string> = {
      unfulfilled: 'New',
      processing: 'Processing',
      shipped: 'Shipped',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading orders...</div>;
  }

  return (
    <div>
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 mt-2">Manage and track customer orders</p>
      </div>

      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Payment Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={fulfillmentFilter}
            onChange={(e) => setFulfillmentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Fulfillment Status</option>
            <option value="unfulfilled">New</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            <Filter className="h-5 w-5" />
            More Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fulfillment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => handleOrderClick(order)}
                      className={`cursor-pointer hover:bg-gray-50 ${
                        selectedOrder?.id === order.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{order.order_number}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {order.customer_first_name} {order.customer_last_name}
                        </div>
                        <div className="text-xs text-gray-500">{order.customer_email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        ${money(order.total)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${getStatusBadge(
                            order.payment_status
                          )}`}
                        >
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${getFulfillmentBadge(
                            order.fulfillment_status
                          )}`}
                        >
                          {getFulfillmentLabel(order.fulfillment_status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No orders found matching your filters
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          {selectedOrder ? (
            <div className="bg-white rounded-lg shadow sticky top-8">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">{selectedOrder.order_number}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedOrder.created_at).toLocaleString()}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Customer Information</h4>
                  <div className="text-sm space-y-1">
                    <p className="text-gray-900">
                      {selectedOrder.customer_first_name} {selectedOrder.customer_last_name}
                    </p>
                    <p className="text-gray-600">{selectedOrder.customer_email}</p>
                    <p className="text-gray-600">{selectedOrder.customer_phone}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Shipping Address</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>{selectedOrder.shipping_address}</p>
                    <p>
                      {selectedOrder.shipping_city}, {selectedOrder.shipping_province}{' '}
                      {selectedOrder.shipping_postal_code}
                    </p>
                    <p>{selectedOrder.shipping_country}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Order Items</h4>
                  <div className="space-y-2">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.quantity}x {item.product_name}
                        </span>
                        <span className="font-medium">${money(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>${money(selectedOrder.subtotal)}</span>
                    </div>
                    {selectedOrder.tax_amount && toNumber(selectedOrder.tax_amount) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Tax ({selectedOrder.tax_rate ? `${selectedOrder.tax_rate}%` : 'HST'})
                        </span>
                        <span>${money(selectedOrder.tax_amount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span>${money(selectedOrder.shipping_fee)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${money(selectedOrder.total)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t">
                      <span className="text-gray-600">Payment Method</span>
                      <span className="font-medium">Interac e-Transfer</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={handleMarkProcessing}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">Mark Processing</span>
                    </button>

                    <button
                      onClick={() => setEditingOrder(true)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                      <span className="text-sm font-medium">Add Tracking + Send Email</span>
                    </button>

                    <button
                      onClick={handleMarkShipped}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <Truck className="h-4 w-4" />
                      <span className="text-sm font-medium">Mark Shipped</span>
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Fulfillment Status</h4>
                    {!editingOrder && (
                      <button
                        onClick={() => setEditingOrder(true)}
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </button>
                    )}
                  </div>

                  {editingOrder ? (
                    <div className="space-y-3">
                      <select
                        value={editedFulfillmentStatus}
                        onChange={(e) => setEditedFulfillmentStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="unfulfilled">New</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Carrier (e.g., Canada Post)"
                        value={editedCarrier}
                        onChange={(e) => setEditedCarrier(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />

                      <input
                        type="text"
                        placeholder="Tracking Number"
                        value={editedTracking}
                        onChange={(e) => setEditedTracking(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />

                      <textarea
                        placeholder="Admin notes..."
                        value={editedNotes}
                        onChange={(e) => setEditedNotes(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />

                      <div className="flex gap-2">
                        {editedTracking && editedCarrier ? (
                          <button
                            onClick={handleAddTracking}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                          >
                            <Mail className="h-4 w-4" />
                            Save & Send Email
                          </button>
                        ) : (
                          <button
                            onClick={handleSaveOrder}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            <Save className="h-4 w-4" />
                            Save
                          </button>
                        )}
                        <button
                          onClick={() => setEditingOrder(false)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-gray-600">Status: </span>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${getFulfillmentBadge(
                            selectedOrder.fulfillment_status
                          )}`}
                        >
                          {getFulfillmentLabel(selectedOrder.fulfillment_status)}
                        </span>
                      </p>
                      {selectedOrder.carrier && (
                        <p>
                          <span className="text-gray-600">Carrier: </span>
                          {selectedOrder.carrier}
                        </p>
                      )}
                      {selectedOrder.tracking_number && (
                        <p>
                          <span className="text-gray-600">Tracking: </span>
                          {selectedOrder.tracking_number}
                        </p>
                      )}
                      {selectedOrder.admin_notes && (
                        <div>
                          <span className="text-gray-600">Notes: </span>
                          <p className="mt-1 text-gray-700 whitespace-pre-wrap">
                            {selectedOrder.admin_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-gray-200">
                  {showDeleteConfirm ? (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-red-600">
                        Are you sure you want to delete this order?
                      </p>
                      <p className="text-xs text-gray-500">
                        This action cannot be undone. Inventory will be restored automatically.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleDeleteOrder}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                        >
                          Yes, Delete Order
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select an order to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
