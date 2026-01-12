import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, X-Square-Signature',
};

async function verifySquareSignature(
  body: string,
  signature: string,
  webhookSignatureKey: string
): Promise<boolean> {
  try {
    // Square webhook signature verification
    // The signature is HMAC-SHA256 of the request body
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(webhookSignatureKey),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(body)
    );

    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return computedSignature === signature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get webhook signature key from environment
    const SQUARE_WEBHOOK_SIGNATURE_KEY = Deno.env.get('SQUARE_WEBHOOK_SIGNATURE_KEY');
    const signature = req.headers.get('x-square-signature');

    // Read body as text for signature verification
    const bodyText = await req.text();

    // Verify webhook signature if signature key is configured
    if (SQUARE_WEBHOOK_SIGNATURE_KEY && signature) {
      const isValid = await verifySquareSignature(
        bodyText,
        signature,
        SQUARE_WEBHOOK_SIGNATURE_KEY
      );

      if (!isValid) {
        console.error('Invalid webhook signature');
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const event = JSON.parse(bodyText);

    console.log('Square webhook event:', event.type);

    // Handle payment.updated event
    if (event.type === 'payment.updated' || event.type === 'payment.created') {
      const payment = event.data.object.payment;
      const orderId = payment.order_id;

      if (!orderId) {
        console.log('No order ID in payment');
        return new Response(
          JSON.stringify({ received: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Only process completed payments
      if (payment.status !== 'COMPLETED') {
        console.log('Payment not completed:', payment.status);
        return new Response(
          JSON.stringify({ received: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Find order by Square order ID
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('square_order_id', orderId)
        .single();

      if (orderError || !order) {
        console.error('Order not found for Square order ID:', orderId);
        return new Response(
          JSON.stringify({ received: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update order to paid if not already paid (idempotent)
      if (order.payment_status !== 'paid') {
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            order_status: 'paid',
            square_payment_id: payment.id,
          })
          .eq('id', order.id)
          .eq('payment_status', 'pending');

        if (updateError) {
          console.error('Failed to update order:', updateError);
        } else {
          console.log('Order marked as paid:', order.id);

          // Send admin notification email
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
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Webhook processing failed',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});