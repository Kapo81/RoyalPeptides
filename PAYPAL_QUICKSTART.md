# PayPal Integration - Quick Start Guide

## Immediate Setup (Test Mode)

### Step 1: Create PayPal Developer Account

1. Go to https://developer.paypal.com
2. Sign up with your PayPal account (or create one)
3. Access the Developer Dashboard

### Step 2: Create Sandbox App

1. In Developer Dashboard, go to "My Apps & Credentials"
2. Switch to "Sandbox" tab
3. Click "Create App"
4. Enter app name (e.g., "Royal Peptides Sandbox")
5. Select "Merchant" account type
6. Click "Create App"

### Step 3: Get API Credentials

After creating the app, you'll see:
- **Client ID** - Copy this
- **Secret** - Click "Show" and copy this

### Step 4: Create Test Buyer Account

1. In Developer Dashboard, go to "Sandbox Accounts"
2. Click "Create Account"
3. Select "Personal" account type
4. Choose Country: Canada
5. Click "Create Account"
6. Note the email and password for testing

### Step 5: Configure Supabase

1. Go to your Supabase Dashboard
2. Navigate to Project Settings → Edge Functions
3. Add these environment variables:

```
PAYPAL_CLIENT_ID=<your_sandbox_client_id>
PAYPAL_SECRET=<your_sandbox_secret>
PAYPAL_MODE=sandbox
APP_URL=http://localhost:5173
```

For production, update `APP_URL` to your actual domain.

### Step 6: Test Payment

1. Run your app locally: `npm run dev`
2. Add products to cart
3. Go to checkout
4. Fill in shipping information
5. Select "Credit / Debit Card"
6. Click "Place Order"
7. You'll be redirected to PayPal Sandbox
8. Log in with your test buyer account
9. Complete payment
10. You'll return to your site
11. Check your email for admin notification

## Going Live (Production)

### Step 1: Verify Your Business

1. Complete PayPal Business account verification
2. Provide business documents as requested
3. Wait for approval (typically 1-3 business days)

### Step 2: Review Acceptable Use Policy

**IMPORTANT:** Verify that research peptides are permitted under PayPal's terms:
- Review PayPal Acceptable Use Policy
- Consult with PayPal merchant support if unsure
- Consider alternative payment processors if needed

### Step 3: Get Live Credentials

1. In Developer Dashboard, switch to "Live" tab
2. Create live app or use existing
3. Copy live Client ID and Secret

### Step 4: Update Environment Variables

In Supabase Dashboard:

```
PAYPAL_CLIENT_ID=<your_live_client_id>
PAYPAL_SECRET=<your_live_secret>
PAYPAL_MODE=live
APP_URL=https://yourdomain.com
```

### Step 5: Configure Webhook

1. In PayPal Developer Dashboard
2. Go to your live app
3. Scroll to "Webhooks"
4. Click "Add Webhook"
5. Enter URL: `https://your-project.supabase.co/functions/v1/paypal-webhook`
6. Select events:
   - CHECKOUT.ORDER.APPROVED
   - PAYMENT.CAPTURE.COMPLETED
7. Save webhook

### Step 6: Test Live Transaction

1. Place a real test order with small amount
2. Complete payment
3. Verify order status updates to "paid"
4. Confirm admin notification received
5. Check PayPal dashboard for transaction

## Stripe Comparison

| Feature | Stripe (Previous) | PayPal (Current) |
|---------|------------------|------------------|
| Setup Speed | Requires business verification | Faster sandbox access |
| Card Acceptance | Direct | Via PayPal |
| Fees | ~2.9% + $0.30 | ~2.9% + $0.30 |
| Customer Experience | Embedded | Redirect |
| Business Verification | Required for live | Required for live |
| Status | Disabled (code kept) | Active |

## Switching Back to Stripe

If you need to revert:

1. Update `src/pages/Checkout.tsx`:
   - Change `paymentMethod` default from `'paypal'` to `'stripe'`
   - Update button labels back to "Credit Card" and "Secure Stripe checkout"
   - Replace API call from `paypal-checkout` to `create-checkout-session`

2. Update `payment_provider` field in order creation to `'stripe'`

3. Stripe edge functions are still deployed and ready to use

## Common Issues

### "PayPal credentials not configured"
- Verify environment variables are set in Supabase
- Check spelling of variable names
- Ensure no extra spaces in values

### Payment succeeds but order status doesn't update
- Check `paypal-capture` edge function logs
- Verify webhook is configured
- Review `order_notifications` table for errors

### Customer sees error after PayPal redirect
- Verify `APP_URL` is correct
- Check `payment-success` route is working
- Review browser console for errors

### Admin notification not received
- Confirm RESEND_API_KEY is configured
- Check admin email is `Mathieu7gel@gmail.com`
- Review `order_notifications` table

## Support

- PayPal API Docs: https://developer.paypal.com/docs/api/orders/v2/
- Supabase Logs: Project Dashboard → Edge Functions → Logs
- Database Queries: Use Supabase SQL Editor
- Notification Tracking: Query `order_notifications` table

## Summary

PayPal is now the active card payment processor. The integration:
- ✅ Accepts Visa and Mastercard
- ✅ Works in test mode immediately
- ✅ Includes admin notifications
- ✅ Maintains e-Transfer option
- ✅ Keeps Stripe code for future use
- ✅ Provides secure payment processing
- ✅ Redirects to order confirmation

Test thoroughly in sandbox mode before going live with real transactions.
