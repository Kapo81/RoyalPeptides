import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get('orderId');

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'Order ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get Square credentials from environment
    const SQUARE_ENV = Deno.env.get('SQUARE_ENV') || 'sandbox';
    const SQUARE_ACCESS_TOKEN = Deno.env.get('SQUARE_ACCESS_TOKEN');

    if (!SQUARE_ACCESS_TOKEN) {
      throw new Error('Square access token not configured');
    }

    // Get order from database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If already paid, return success (idempotent)
    if (order.payment_status === 'paid') {
      return new Response(
        JSON.stringify({
          success: true,
          order,
          message: 'Payment already confirmed',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if we have a Square order ID to verify
    if (!order.square_order_id) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Payment not yet initiated',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build Square API base URL
    const squareApiBase = SQUARE_ENV === 'production'
      ? 'https://connect.squareup.com'
      : 'https://connect.squareupsandbox.com';

    // Retrieve the order from Square to check payment status
    const squareResponse = await fetch(
      `${squareApiBase}/v2/orders/${order.square_order_id}`,
      {
        method: 'GET',
        headers: {
          'Square-Version': '2024-12-18',
          'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const squareResult = await squareResponse.json();

    if (!squareResponse.ok) {
      console.error('Square API error:', squareResult);
      throw new Error(squareResult.errors?.[0]?.detail || 'Failed to verify payment');
    }

    const squareOrder = squareResult.order;

    // Check if the order has a completed payment
    const isPaid = squareOrder.state === 'COMPLETED';
    const payment = squareOrder.tenders?.find(
      (tender: any) => tender.type === 'CARD' && tender.card_details?.status === 'CAPTURED'
    );

    if (isPaid && payment) {
      // Update order status to paid
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          order_status: 'paid',
          square_payment_id: payment.id,
        })
        .eq('id', orderId)
        .eq('payment_status', 'pending'); // Ensure idempotency

      if (updateError) {
        console.error('Failed to update order:', updateError);
      } else {
        // Send admin notification email (payment confirmed)
        const adminEmail = Deno.env.get('ADMIN_EMAIL');
        if (adminEmail) {
          try {
            await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-order-notification`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                orderId: order.id,
                type: 'paid',
              }),
            });
          } catch (emailError) {
            console.error('Failed to send admin email:', emailError);
          }
        }
      }

      // Fetch updated order
      const { data: updatedOrder } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      return new Response(
        JSON.stringify({
          success: true,
          order: updatedOrder || order,
          message: 'Payment confirmed',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Payment not completed yet',
          orderState: squareOrder.state,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to verify payment',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});