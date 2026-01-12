import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, Loader } from 'lucide-react';

interface PaymentSuccessProps {
  onNavigate: (page: string, data?: any) => void;
}

export default function PaymentSuccess({ onNavigate }: PaymentSuccessProps) {
  const [processing, setProcessing] = useState(true);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const processPayment = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('order_id');
        const token = urlParams.get('token');

        if (!orderId) {
          setError('Order ID not found');
          setProcessing(false);
          return;
        }

        if (token) {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

          const captureResponse = await fetch(`${supabaseUrl}/functions/v1/paypal-capture`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseAnonKey}`,
            },
            body: JSON.stringify({
              orderId: orderId,
              paypalOrderId: token,
            }),
          });

          if (!captureResponse.ok) {
            throw new Error('Failed to capture PayPal payment');
          }
        }

        const { data: order } = await supabase
          .from('orders')
          .select('order_number')
          .eq('id', orderId)
          .single();

        if (order) {
          setOrderNumber(order.order_number);

          await supabase
            .from('cart_items')
            .delete()
            .eq('session_id', localStorage.getItem('sessionId') || '');

          setTimeout(() => {
            onNavigate('order-confirmation', order.order_number);
          }, 2000);
        } else {
          setError('Order not found');
        }
      } catch (err: any) {
        console.error('Payment processing error:', err);
        setError(err.message || 'Failed to process payment');
      } finally {
        setProcessing(false);
      }
    };

    processPayment();
  }, [onNavigate]);

  return (
    <div className="min-h-screen bg-[#050608] flex items-center justify-center pt-20 pb-16">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-gradient-to-br from-[#0B0D12] to-[#050608] border border-white/10 rounded-xl p-8 text-center">
          {processing ? (
            <>
              <Loader className="h-16 w-16 text-[#00A0E0] mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold text-white mb-2">Processing Payment</h2>
              <p className="text-gray-400">Please wait while we confirm your payment...</p>
            </>
          ) : error ? (
            <>
              <div className="h-16 w-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-500 text-2xl">✕</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Payment Error</h2>
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={() => onNavigate('checkout')}
                className="px-6 py-3 bg-gradient-to-r from-[#00A0E0] to-[#11D0FF] text-white rounded-lg font-medium hover:shadow-[0_0_20px_rgba(0,160,224,0.5)] transition-all"
              >
                Return to Checkout
              </button>
            </>
          ) : (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Payment Successful</h2>
              <p className="text-gray-400 mb-2">Order {orderNumber}</p>
              <p className="text-sm text-gray-500">Redirecting to confirmation...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
