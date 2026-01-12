# PayPal Payment Integration

## Overview

PayPal has been integrated as the primary card payment processor, replacing Stripe. This provides a low-friction solution that accepts Visa and Mastercard without requiring immediate full business registration.

## Why PayPal?

- **Quick Setup:** Faster onboarding compared to traditional payment processors
- **Card Acceptance:** Processes Visa, Mastercard, and other major cards
- **Merchant of Record:** PayPal handles certain compliance aspects
- **Test Mode:** Full sandbox environment for testing
- **Reduced Barriers:** Lighter initial verification requirements

## System Architecture

### Edge Functions

**1. `paypal-checkout`** (src/supabase/functions/paypal-checkout)
- Creates PayPal order with line items
- Stores PayPal Order ID in database
- Returns approval URL for customer redirect
- Handles authentication with PayPal API

**2. `paypal-capture`** (src/supabase/functions/paypal-capture)
- Captures payment after customer approval
- Updates order status to "paid"
- Triggers admin notification
- Securely handles PayPal credentials

**3. `paypal-webhook`** (src/supabase/functions/paypal-webhook)
- Listens for PayPal webhook events
- Handles CHECKOUT.ORDER.APPROVED
- Handles PAYMENT.CAPTURE.COMPLETED
- Provides redundancy for payment confirmation

### Frontend Components

**1. Checkout Page** (src/pages/Checkout.tsx)
- Updated to use PayPal as default card payment
- Calls `paypal-checkout` edge function
- Redirects to PayPal approval URL
- Maintains e-Transfer as alternative

**2. Payment Success Page** (src/pages/PaymentSuccess.tsx)
- Handles return from PayPal
- Calls `paypal-capture` to finalize payment
- Redirects to order confirmation
- Displays processing status

**3. App Router** (src/App.tsx)
- Added `payment-success` route
- Detects PayPal return parameters
- Routes user appropriately

### Database Schema

New fields added to `orders` table:
```sql
- paypal_order_id (text) - PayPal Order ID
- paypal_capture_id (text) - PayPal Capture ID
- payment_provider (text) - 'paypal', 'stripe', or 'etransfer'
```

## Payment Flow

### Card Payment Flow

1. **Customer submits checkout**
   - Order created in database with `payment_provider: 'paypal'`
   - Payment status: `pending`
   - Frontend notification sent

2. **PayPal order creation**
   - Edge function calls PayPal API
   - Creates order with line items and totals
   - Returns approval URL

3. **Customer redirected to PayPal**
   - Customer logs into PayPal or pays with card
   - Completes payment on PayPal's secure page

4. **Customer returns to site**
   - Redirected to `/payment-success?order_id=...&token=...`
   - Frontend calls `paypal-capture` edge function

5. **Payment captured**
   - Edge function finalizes payment with PayPal
   - Updates order status to `paid`
   - Sends admin notification
   - Displays success message

6. **Auto-redirect to confirmation**
   - Customer redirected to order confirmation page
   - Email notifications sent

### e-Transfer Flow

Unchanged - continues to work as before with pending status and manual payment.

## Environment Variables Required

Set these in Supabase Dashboard → Project Settings → Edge Functions:

```
PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_SECRET=your_secret_here
PAYPAL_MODE=sandbox (or 'live' for production)
APP_URL=https://yourdomain.com (for return URLs)
```

## Testing

### Test Mode Setup

1. Create PayPal Developer account at https://developer.paypal.com
2. Create a Sandbox Business account
3. Create a Sandbox Personal account (buyer)
4. Get Sandbox API credentials:
   - Client ID
   - Secret
5. Set `PAYPAL_MODE=sandbox`

### Test Cards

PayPal Sandbox provides test accounts. Log in with sandbox personal account or use:
- Visa: Test cards provided in PayPal sandbox
- Mastercard: Test cards provided in PayPal sandbox

### Test Procedure

1. Add products to cart
2. Proceed to checkout
3. Select "Credit / Debit Card" payment
4. Fill in shipping information
5. Click "Place Order"
6. You'll be redirected to PayPal sandbox
7. Log in with test personal account
8. Complete payment
9. Return to site - verify order confirmation
10. Check admin email for notification

## Webhook Configuration

### Setting Up Webhooks

1. Go to PayPal Developer Dashboard
2. Navigate to your app
3. Add webhook URL: `https://your-supabase-project.supabase.co/functions/v1/paypal-webhook`
4. Select events:
   - `CHECKOUT.ORDER.APPROVED`
   - `PAYMENT.CAPTURE.COMPLETED`

### Webhook Purpose

Provides backup notification if customer closes browser before payment capture completes. Ensures all successful payments are recorded.

## Security Features

- PayPal credentials stored only in Supabase edge functions
- No sensitive data exposed to frontend
- Payment capture happens server-side only
- Order verification before payment capture
- Duplicate notification prevention via order_notifications table

## Admin Notifications

All payment events trigger notifications:
- Order placed: Immediate notification (pending status)
- Payment captured: Second notification (paid status)
- Email sent to: `Mathieu7gel@gmail.com`
- Logged in `order_notifications` table

## Migration from Stripe

Stripe integration remains in codebase but inactive:
- Stripe edge functions not deleted
- Can be re-enabled by changing payment method
- Database supports both providers via `payment_provider` field
- No data loss for historical Stripe orders

## Troubleshooting

### Payment Fails After Redirect

- Check PayPal API credentials are correct
- Verify `PAYPAL_MODE` matches environment (sandbox/live)
- Check edge function logs in Supabase Dashboard
- Ensure APP_URL is set correctly

### Notification Not Received

- Verify RESEND_API_KEY is configured
- Check `order_notifications` table for errors
- Review edge function logs for failures
- Confirm admin email is `Mathieu7gel@gmail.com`

### Order Status Not Updating

- Check PayPal webhook is configured
- Verify webhook URL is correct
- Review `paypal-webhook` edge function logs
- Manually trigger notification if needed

## Production Checklist

Before going live:

- [ ] Create live PayPal Business account
- [ ] Complete PayPal business verification
- [ ] Get live API credentials
- [ ] Set `PAYPAL_MODE=live`
- [ ] Update APP_URL to production domain
- [ ] Configure production webhook URL
- [ ] Test full payment flow in live mode
- [ ] Verify admin notifications working
- [ ] Monitor first few transactions closely

## Advantages Over Stripe

1. **Faster Setup:** Can accept test payments immediately
2. **Lower Barriers:** Less stringent initial verification
3. **Familiar Brand:** Customers trust PayPal
4. **Flexible:** Can process PayPal balance + cards
5. **Built-in Fraud Protection:** PayPal handles risk

## Considerations

1. **Fees:** PayPal fees may be higher than Stripe (typically 2.9% + $0.30)
2. **Business Verification:** Still required for full features
3. **Account Holds:** PayPal may hold funds for new merchants
4. **Customer Experience:** Extra redirect vs embedded checkout
5. **Product Restrictions:** Verify peptides are allowed under PayPal ToS

## Support Resources

- PayPal Developer Docs: https://developer.paypal.com/docs/
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Integration Support: Check edge function logs for errors

## Next Steps

1. Complete PayPal business verification for production
2. Review PayPal's Acceptable Use Policy for research peptides
3. Consider adding PayPal branding to checkout for trust
4. Monitor transaction success rates
5. Optimize return URL flow if needed
