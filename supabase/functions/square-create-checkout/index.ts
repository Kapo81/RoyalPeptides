import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  bundle_id?: string;
}

interface CheckoutRequest {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  customer: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  discountAmount?: number;
  discountType?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // Environment diagnostics
  const SQUARE_ENV = Deno.env.get('SQUARE_ENV') || 'sandbox';
  const SQUARE_ACCESS_TOKEN = Deno.env.get('SQUARE_ACCESS_TOKEN');
  const SQUARE_LOCATION_ID = 'LK9VXXW72F7H5';
  const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL');

  console.log('=== SQUARE CHECKOUT DIAGNOSTICS ===');
  console.log('Environment:', SQUARE_ENV);
  console.log('Location ID:', SQUARE_LOCATION_ID);
  console.log('Access token configured:', !!SQUARE_ACCESS_TOKEN);
  console.log('Access token length:', SQUARE_ACCESS_TOKEN?.length || 0);
  console.log('Admin email configured:', !!ADMIN_EMAIL);
  console.log('===================================');

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Validate Square configuration
    if (!SQUARE_ACCESS_TOKEN) {
      console.error('CRITICAL: Square access token not configured');
      return new Response(
        JSON.stringify({
          error: 'SQUARE_NOT_CONFIGURED',
          message: 'Square payment gateway is not configured',
          details: 'Missing SQUARE_ACCESS_TOKEN environment variable',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const body: CheckoutRequest = await req.json();
    const { items, subtotal, shipping, total, customer, discountAmount = 0, discountType = '' } = body;

    console.log('Creating checkout for order:', {
      itemCount: items.length,
      subtotal,
      shipping,
      total,
      customerEmail: customer.email,
    });

    // Generate unique order ID
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 10000);
    const orderNumber = `RP-CA-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${randomSuffix}`;
    const idempotencyKey = `${timestamp}_${Math.random().toString(36).substring(7)}`;

    console.log('Generated order number:', orderNumber);
    console.log('Idempotency key:', idempotencyKey);

    // Create order in Supabase with pending_payment status
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        first_name: customer.firstName,
        last_name: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        postal_code: customer.postalCode,
        shipping_province: customer.province,
        country: customer.country,
        payment_method: 'square',
        payment_provider: 'square',
        payment_status: 'pending',
        order_status: 'pending_payment',
        subtotal: subtotal,
        shipping_cost: shipping,
        total_amount: total,
        stripe_session_id: idempotencyKey,
        discount_amount: discountAmount,
        discount_type: discountType,
      })
      .select()
      .single();

    if (orderError) {
      console.error('DATABASE ERROR - Failed to create order:', orderError);
      return new Response(
        JSON.stringify({
          error: 'DATABASE_ERROR',
          message: 'Failed to create order in database',
          details: orderError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Order created successfully with ID:', order.id);

    // Create order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.bundle_id ? null : item.id,
      bundle_id: item.bundle_id || null,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('DATABASE ERROR - Failed to create order items:', itemsError);
      // Continue anyway - order exists
    }

    // Build Square API base URL
    const squareApiBase = SQUARE_ENV === 'production'
      ? 'https://connect.squareup.com'
      : 'https://connect.squareupsandbox.com';

    console.log('Square API base URL:', squareApiBase);

    // Get the base URL for redirects
    const origin = new URL(req.url).origin;
    const appUrl = origin.includes('localhost') ? 'http://localhost:5173' : origin;
    const redirectUrl = `${appUrl}/order-confirmation?orderId=${order.id}`;

    console.log('Redirect URL:', redirectUrl);

    // Create line items for Square
    const lineItems = items.map((item) => ({
      name: item.name,
      quantity: item.quantity.toString(),
      base_price_money: {
        amount: Math.round(item.price * 100), // Convert to cents
        currency: 'CAD',
      },
    }));

    // Add shipping as a line item
    if (shipping > 0) {
      lineItems.push({
        name: 'Shipping',
        quantity: '1',
        base_price_money: {
          amount: Math.round(shipping * 100),
          currency: 'CAD',
        },
      });
    }

    console.log('Line items prepared:', lineItems.length);

    // Create Square Checkout
    const checkoutData = {
      idempotency_key: idempotencyKey,
      order: {
        location_id: SQUARE_LOCATION_ID,
        line_items: lineItems,
      },
      checkout_options: {
        redirect_url: redirectUrl,
        accepted_payment_methods: {
          apple_pay: true,
          google_pay: true,
        },
      },
      pre_populate_buyer_email: customer.email,
    };

    console.log('Calling Square API to create payment link...');

    const squareResponse = await fetch(`${squareApiBase}/v2/online-checkout/payment-links`, {
      method: 'POST',
      headers: {
        'Square-Version': '2024-12-18',
        'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutData),
    });

    console.log('Square API response status:', squareResponse.status);

    const squareResult = await squareResponse.json();

    if (!squareResponse.ok) {
      console.error('SQUARE API ERROR - Status:', squareResponse.status);
      console.error('SQUARE API ERROR - Full response:', JSON.stringify(squareResult, null, 2));

      // Extract Square error details
      const squareErrors = squareResult.errors || [];
      const primaryError = squareErrors[0] || {};

      const errorDetails = {
        code: primaryError.code || 'UNKNOWN',
        category: primaryError.category || 'UNKNOWN',
        detail: primaryError.detail || 'No details provided',
        field: primaryError.field || null,
      };

      console.error('SQUARE ERROR DETAILS:', errorDetails);

      return new Response(
        JSON.stringify({
          error: 'SQUARE_API_ERROR',
          message: 'Square payment gateway returned an error',
          details: errorDetails.detail,
          errorCode: errorDetails.code,
          errorCategory: errorDetails.category,
          httpStatus: squareResponse.status,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Square payment link created successfully');
    console.log('Payment link ID:', squareResult.payment_link?.id);
    console.log('Square order ID:', squareResult.payment_link?.order_id);

    // Update order with Square checkout ID
    await supabase
      .from('orders')
      .update({
        square_checkout_id: squareResult.payment_link.id,
        square_order_id: squareResult.payment_link.order_id,
      })
      .eq('id', order.id);

    console.log('Order updated with Square IDs');

    // Send admin notification email (order created)
    if (ADMIN_EMAIL) {
      console.log('Sending admin notification email...');
      try {
        await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-order-notification`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: order.id,
            type: 'created',
          }),
        });
        console.log('Admin notification sent');
      } catch (emailError) {
        console.error('Failed to send admin email (non-critical):', emailError);
      }
    } else {
      console.log('Skipping admin email - ADMIN_EMAIL not configured');
    }

    console.log('=== CHECKOUT COMPLETED SUCCESSFULLY ===');

    return new Response(
      JSON.stringify({
        checkoutUrl: squareResult.payment_link.url,
        orderId: order.id,
        orderNumber: orderNumber,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('=== UNEXPECTED ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('========================');

    return new Response(
      JSON.stringify({
        error: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        details: error.message || 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});