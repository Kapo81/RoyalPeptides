import { useEffect, useState } from 'react';
import { CheckCircle2, Mail, Shield, Copy, Check, Package, ArrowLeft, FileText, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface OrderConfirmationProps {
  orderNumber: string;
  onNavigate: (page: string, param?: string) => void;
}

interface Order {
  id: string;
  order_number: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  payment_method: string;
  payment_status: string;
  order_status: string;
  total: number;
  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  tax_amount: number;
  tax_rate: number;
  shipping_province: string;
  created_at: string;
}

export default function OrderConfirmation({ orderNumber, onNavigate }: OrderConfirmationProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    fetchOrder();
  }, [orderNumber]);

  const fetchOrder = async () => {
    try {
      const isUUID = orderNumber.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq(isUUID ? 'id' : 'order_number', orderNumber)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching order:', fetchError);
        setError(true);
        setLoading(false);
        return;
      }

      if (!data) {
        setError(true);
        setLoading(false);
        return;
      }

      setOrder(data);
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setError(true);
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const maskEmail = (email: string) => {
    const [name, domain] = email.split('@');
    if (name.length <= 2) return email;
    return `${name[0]}${'*'.repeat(name.length - 2)}${name[name.length - 1]}@${domain}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050608] flex items-center justify-center pt-20 px-4">
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A0E0] mx-auto mb-4"></div>
          <p className="text-gray-300 font-medium mb-2">Loading order details...</p>
          <p className="text-sm text-gray-500">This will only take a moment</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#050608] flex items-center justify-center pt-20 px-4">
        <div className="max-w-md w-full">
          <div className="bg-gradient-to-br from-[#0B0D12] to-[#050608] border border-white/10 rounded-xl p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Order Not Found</h2>
            <p className="text-gray-400 mb-6 leading-relaxed">
              We couldn't load your order details. This might be because:
            </p>
            <ul className="text-left text-sm text-gray-400 mb-8 space-y-2">
              <li className="flex items-start space-x-2">
                <span className="text-[#00A0E0] mt-1">•</span>
                <span>The order is still being processed (try refreshing in a moment)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-[#00A0E0] mt-1">•</span>
                <span>The order number is incorrect</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-[#00A0E0] mt-1">•</span>
                <span>There was a temporary connection issue</span>
              </li>
            </ul>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setError(false);
                  setLoading(true);
                  fetchOrder();
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#00A0E0] to-[#11D0FF] text-white rounded-lg font-medium hover:shadow-[0_0_20px_rgba(0,160,224,0.5)] transition-all flex items-center justify-center space-x-2"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Retry</span>
              </button>
              <button
                onClick={() => onNavigate('catalogue')}
                className="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-gray-300 hover:border-[#00A0E0] hover:text-[#00A0E0] transition-all rounded-lg font-medium"
              >
                Back to Catalogue
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-6">
              Check your email for order confirmation details
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isPaid = order.payment_status === 'PAID' || order.payment_status === 'paid' || order.payment_status === 'completed';

  return (
    <div className="min-h-screen bg-[#050608] pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => onNavigate('catalogue')}
          className="flex items-center space-x-2 text-gray-400 hover:text-[#00A0E0] transition-colors mb-8"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Catalogue</span>
        </button>

        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-8 border border-green-500/30 mb-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full border-2 border-green-500/50 mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Order Confirmed!</h1>
            <p className="text-gray-300 mb-4">
              Thank you for your order, {order.customer_first_name}!
            </p>
            <p className="text-sm text-gray-400">
              A confirmation email has been sent to {maskEmail(order.customer_email)}
            </p>
          </div>
        </div>

        {!isPaid && (
          <div className="bg-gradient-to-br from-[#00A0E0]/10 to-[#11D0FF]/10 rounded-xl p-6 border border-[#00A0E0]/30 mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <Mail className="h-6 w-6 text-[#00A0E0]" />
              <span>Payment Instructions (Interac e-Transfer)</span>
            </h2>

            <div className="bg-[#050608] rounded-lg p-6 mb-4 border border-white/10">
              <p className="text-gray-300 mb-4 font-semibold">Send your Interac e-Transfer to:</p>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Email:</p>
                    <p className="text-[#00A0E0] font-semibold">1984Gotfina@gmail.com</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard('1984Gotfina@gmail.com', 'email')}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10"
                    title="Copy email"
                  >
                    {copiedField === 'email' ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <Copy className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Security Question:</p>
                    <p className="text-white font-semibold">Marque</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard('Marque', 'question')}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10"
                    title="Copy question"
                  >
                    {copiedField === 'question' ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <Copy className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Answer:</p>
                    <p className="text-white font-semibold">RoyalPep</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard('RoyalPep', 'answer')}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10"
                    title="Copy answer"
                  >
                    {copiedField === 'answer' ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <Copy className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Amount:</p>
                    <p className="text-2xl font-bold text-[#00A0E0]">${order.total.toFixed(2)} CAD</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(order.total.toFixed(2), 'amount')}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10"
                    title="Copy amount"
                  >
                    {copiedField === 'amount' ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <Copy className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Transfer Message/Memo:</p>
                    <p className="text-white font-semibold font-mono">{order.order_number}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(order.order_number, 'orderNumber')}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10"
                    title="Copy order number"
                  >
                    {copiedField === 'orderNumber' ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <Copy className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-400 font-semibold text-sm mb-1">Important</p>
                  <ul className="text-amber-100/90 text-sm space-y-1 list-disc list-inside">
                    <li>Use your order number ({order.order_number}) as the transfer message</li>
                    <li>Orders are processed within 24 hours (business days) after payment is received</li>
                    <li>You will receive tracking information once your order ships</li>
                    <li>Keep this page bookmarked to check your order status</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {isPaid && (
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/30 mb-8">
            <div className="text-center">
              <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">Payment Received!</h3>
              <p className="text-gray-300">
                Your order is being prepared for shipment. You will receive tracking information within 24 business hours.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-[#0B0D12] to-[#050608] border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <FileText className="h-5 w-5 text-[#00A0E0]" />
              <span>Order Details</span>
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Order Number</p>
                <p className="text-white font-mono font-semibold">{order.order_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Order Date</p>
                <p className="text-white">
                  {new Date(order.created_at).toLocaleDateString('en-CA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Payment Status</p>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    isPaid
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {isPaid ? 'Paid' : 'Awaiting Payment'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-400">Order Status</p>
                <p className="text-white capitalize">{order.order_status || 'Pending'}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#0B0D12] to-[#050608] border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <Package className="h-5 w-5 text-[#00A0E0]" />
              <span>Order Summary</span>
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">${order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Discount</span>
                  <span className="text-green-400">-${order.discount_amount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Shipping</span>
                <span className="text-white">${order.shipping_fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">
                  Taxes {order.shipping_province && `(${order.shipping_province})`}
                </span>
                <span className="text-white">${order.tax_amount.toFixed(2)}</span>
              </div>
              <div className="h-px bg-white/10 my-2"></div>
              <div className="flex justify-between text-lg font-bold">
                <span className="text-white">Total</span>
                <span className="text-[#00A0E0]">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => onNavigate('catalogue')}
            className="flex-1 px-6 py-4 bg-[#00A0E0] text-white hover:bg-[#007ab8] transition-colors rounded-lg font-medium"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => onNavigate('order-status', order.order_number)}
            className="flex-1 px-6 py-4 bg-transparent border border-gray-700 text-gray-400 hover:border-[#00A0E0] hover:text-[#00A0E0] transition-all rounded-lg font-medium"
          >
            View Order Status
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-400">
          <p>Need help? Contact us at peptidesroyal@gmail.com</p>
        </div>
      </div>
    </div>
  );
}
