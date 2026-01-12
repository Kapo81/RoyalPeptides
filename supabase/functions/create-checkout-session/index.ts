import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecret) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }

    const stripe = new Stripe(stripeSecret, {
      apiVersion: '2024-11-20.acacia',
    });

    const {
      items,
      customerInfo,
      totals,
      orderId,
    } = await req.json();

    if (!items || !customerInfo || !totals || !orderId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const lineItems = items.map((item: any) => {
      const name = item.bundle_name || item.product_name;
      const unitAmount = Math.round((item.bundle_price || item.product_price) * 100);

      return {
        price_data: {
          currency: 'cad',
          product_data: {
            name: name,
            description: item.bundle_id ? 'Bundle Pack' : 'Research Peptide',
          },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      };
    });

    if (totals.shipping > 0) {
      lineItems.push({
        price_data: {
          currency: 'cad',
          product_data: {
            name: 'Shipping',
            description: `Shipping to ${customerInfo.province}`,
          },
          unit_amount: Math.round(totals.shipping * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.headers.get('origin') || 'http://localhost:5173'}?payment=success&order=${orderId}`,
      cancel_url: `${req.headers.get('origin') || 'http://localhost:5173'}?payment=cancelled`,
      customer_email: customerInfo.email,
      metadata: {
        order_id: orderId,
        customer_name: `${customerInfo.firstName} ${customerInfo.lastName}`,
        shipping_province: customerInfo.province,
      },
      shipping_address_collection: {
        allowed_countries: ['CA'],
      },
    });

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Checkout error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
