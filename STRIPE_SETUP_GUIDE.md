# Stripe Payment Integration Guide

## Current Status

✅ **Order System:** Fully functional - creates orders, sends notifications, tracks inventory
✅ **Interac e-Transfer:** Working payment method with instructions
⚠️ **Stripe:** Ready for integration - requires API keys and checkout configuration

---

## What Works Now

Your checkout system is **fully operational** with Interac e-Transfer:

1. ✅ User fills out shipping information
2. ✅ Selects payment method (e-Transfer or Stripe)
3. ✅ Order is created in database
4. ✅ Inventory is automatically decremented
5. ✅ Order confirmation email sent to admin
6. ✅ Customer sees order confirmation page
7. ✅ Admin can manage orders in dashboard

**For e-Transfer payments:**
- Customer receives payment instructions with order number
- Admin gets email notification with order details
- Manual payment confirmation workflow

---

## Adding Stripe Integration

### Step 1: Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create account or log in
3. Navigate to **Developers → API Keys**
4. Copy:
   - **Publishable key** (starts with `pk_`)
   - **Secret key** (starts with `sk_`)

**For testing:** Use test mode keys (they start with `pk_test_` and `sk_test_`)

---

### Step 2: Add Stripe Keys to Environment

Add to your `.env` file:

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
```

**Note:**
- `VITE_` prefix makes it available in frontend
- Secret key stays server-side only (for edge function)

---

### Step 3: Install Stripe Library

```bash
npm install @stripe/stripe-js
```

---

### Step 4: Create Stripe Checkout Edge Function

Create: `supabase/functions/create-stripe-checkout/index.ts`

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@14";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")!;
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    const { orderId, orderNumber, total, items, customerEmail } = await req.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customerEmail,
      line_items: items.map((item: any) => ({
        price_data: {
          currency: "cad",
          product_data: {
            name: item.name,
            description: item.description || "Research peptide",
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      })),
      success_url: `${req.headers.get("origin")}/order-confirmation?order=${orderNumber}`,
      cancel_url: `${req.headers.get("origin")}/checkout`,
      metadata: {
        orderId: orderId,
        orderNumber: orderNumber,
      },
    });

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Stripe error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
```

Deploy the function:
```bash
# This will be handled by the deployment tool
# Function will be available at: /functions/v1/create-stripe-checkout
```

---

### Step 5: Update Checkout.tsx

Replace the Stripe placeholder code (around line 236-240):

```typescript
if (paymentMethod === 'etransfer') {
  onNavigate('order-confirmation', orderNumber);
} else {
  // Stripe checkout
  try {
    const stripeResponse = await fetch(`${supabaseUrl}/functions/v1/create-stripe-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        orderId: orderData.id,
        orderNumber: orderNumber,
        total: orderTotal,
        customerEmail: formData.email,
        items: cartItems.map(item => ({
          name: item.product?.name || item.bundle_name || 'Product',
          price: item.product ? (item.product.selling_price || item.product.price_cad) : (item.bundle_price || 0),
          quantity: item.quantity,
          description: item.product?.benefits_summary || '',
        })),
      }),
    });

    const { url, error: stripeError } = await stripeResponse.json();

    if (stripeError) {
      throw new Error(stripeError);
    }

    // Redirect to Stripe checkout
    window.location.href = url;
  } catch (stripeError) {
    console.error('Stripe error:', stripeError);
    alert('Failed to initialize Stripe checkout. Please try again or use e-Transfer.');
    setProcessing(false);
  }
}
```

---

### Step 6: Add Stripe Webhook (Optional but Recommended)

Create: `supabase/functions/stripe-webhook/index.ts`

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@14";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, Stripe-Signature",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")!;
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const signature = req.headers.get("stripe-signature")!;
    const body = await req.text();

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    // Handle successful payment
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const { createClient } = await import("npm:@supabase/supabase-js@2");
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Update order payment status
        await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            stripe_payment_intent: session.payment_intent,
          })
          .eq("id", orderId);

        console.log(`Order ${orderId} marked as paid`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

**Webhook Setup:**
1. Deploy the function
2. Get the URL: `https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook`
3. Add webhook in Stripe Dashboard → Developers → Webhooks
4. Listen for event: `checkout.session.completed`
5. Copy the webhook signing secret
6. Add to environment: `STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET`

---

### Step 7: Add Loading State to Checkout

In `Checkout.tsx`, add Stripe redirect indicator:

```typescript
// Add to state
const [redirectingToStripe, setRedirectingToStripe] = useState(false);

// Update button
<button
  type="submit"
  disabled={processing || redirectingToStripe || !acceptTerms}
  className="..."
>
  {redirectingToStripe
    ? 'Redirecting to Stripe...'
    : processing
    ? 'Processing...'
    : 'Complete Order'}
</button>
```

---

## Testing Stripe Integration

### Test Cards

Use these cards in **test mode**:

| Card Number | Result |
|------------|--------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Declined |
| `4000 0025 0000 3155` | Requires authentication |

**Any future expiry date and any 3-digit CVC works for test cards.**

### Test Workflow

1. Add products to cart
2. Go to checkout
3. Fill out shipping info
4. Select "Credit/Debit Card" (Stripe)
5. Click "Complete Order"
6. Should redirect to Stripe checkout page
7. Enter test card: `4242 4242 4242 4242`
8. Complete payment
9. Should redirect back to order confirmation
10. Check admin dashboard - order should show "Paid"

---

## Production Checklist

Before going live:

- [ ] Switch from test keys to live keys in `.env`
- [ ] Update Stripe webhook to production endpoint
- [ ] Test with real card (small amount)
- [ ] Verify email notifications work
- [ ] Confirm inventory deduction works
- [ ] Test order shows in admin dashboard
- [ ] Verify customer receives order confirmation

---

## Alternative: Stripe Payment Links (Simpler)

If you want a **simpler approach** without custom integration:

1. Create products in Stripe Dashboard
2. Generate Payment Links for each
3. Store payment link URLs in product database
4. When user selects Stripe, redirect to payment link with pre-filled info
5. Use Stripe webhook to update order status

**Pros:** No code changes needed, faster setup
**Cons:** Less customization, redirects away from site

---

## Cost & Fees

**Stripe Pricing (Canada):**
- 2.9% + $0.30 CAD per successful transaction
- No monthly fees, no setup fees
- No additional fees for Canadian cards

**Example:**
- Order total: $250 CAD
- Stripe fee: $7.55 CAD
- You receive: $242.45 CAD

---

## Current Payment Methods Status

| Method | Status | Notes |
|--------|--------|-------|
| **Interac e-Transfer** | ✅ Live & Working | Manual confirmation required |
| **Stripe** | ⚠️ Ready to implement | Requires API keys (see above) |
| **Apple Pay** | 🔄 Available via Stripe | Automatic once Stripe is configured |
| **Google Pay** | 🔄 Available via Stripe | Automatic once Stripe is configured |

---

## Support & Resources

- [Stripe Docs](https://stripe.com/docs)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Test Cards](https://stripe.com/docs/testing)
- [Webhooks Guide](https://stripe.com/docs/webhooks)

---

## Summary

Your order system is **production-ready** right now with e-Transfer payments.

**To add Stripe:**
1. Get API keys (5 minutes)
2. Add to environment variables (1 minute)
3. Create edge function (copy/paste code above)
4. Update checkout.tsx (copy/paste code above)
5. Test with test card (2 minutes)

**Total time to add Stripe: ~30 minutes**

---

**Note:** Until Stripe is configured, customers can successfully order using Interac e-Transfer. The system is fully functional and production-ready.
