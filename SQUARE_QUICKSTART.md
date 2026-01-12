# Square Payment Integration - Quick Start Guide

## Immediate Action Required

Configure these environment variables in your Bolt project to enable Square payments.

---

## Step 1: Get Your Square Credentials

### For Sandbox Testing (Start Here)

1. Visit [Square Developer Dashboard](https://developer.squareup.com/apps)
2. Sign in or create a Square Developer account
3. Create a new application or select existing one
4. Go to **Credentials** tab
5. Select **Sandbox** environment
6. Copy your **Sandbox Access Token**

---

## Step 2: Configure Environment Variables

Add these to your Bolt project environment variables:

```bash
# Start with Sandbox for testing
SQUARE_ENV=sandbox

# Paste your Sandbox Access Token here
SQUARE_ACCESS_TOKEN=YOUR_SANDBOX_TOKEN_HERE

# Your email for order notifications
ADMIN_EMAIL=your-email@example.com

# Location ID (already configured in code)
# SQUARE_LOCATION_ID=LK9VXXW72F7H5
```

**Important:** Replace `YOUR_SANDBOX_TOKEN_HERE` and `your-email@example.com` with your actual values.

---

## Step 3: Test the Integration

### Test Card Details (Sandbox Only)

Use these test card details on Square's checkout page:

- **Card Number:** `4111 1111 1111 1111`
- **CVV:** Any 3 digits (e.g., `123`)
- **Expiry:** Any future date (e.g., `12/25`)
- **Postal Code:** Any valid format (e.g., `12345`)

### Test Steps

1. Add items to cart
2. Go to checkout
3. Fill out shipping information
4. Select "Pay with Card"
5. Click "Place Order"
6. You'll be redirected to Square's checkout
7. Enter test card details above
8. Complete payment
9. You'll return to order confirmation
10. Payment status should show "Paid"
11. Check your admin email for 2 notifications

---

## Step 4: Going Live (When Ready)

### Switch to Production

1. In Square Developer Dashboard
2. Go to **Credentials** → **Production** tab
3. Copy your **Production Access Token**
4. Update environment variables:

```bash
# Switch to production
SQUARE_ENV=production

# Use production token
SQUARE_ACCESS_TOKEN=YOUR_PRODUCTION_TOKEN_HERE
```

⚠️ **Warning:** Production tokens process real money. Test thoroughly in sandbox first!

---

## Troubleshooting

### Debug Mode (NEW!)

Square checkout now includes comprehensive error logging. When checkout fails:

1. **Open Browser Console (F12)**
   - Look for `SQUARE CHECKOUT ERROR` section
   - Contains full error details, codes, and Square responses
   - Technical details visible only in console (users see generic message)

2. **Check Edge Function Logs**
   - Go to Supabase Dashboard → Edge Functions → `square-create-checkout`
   - View logs for diagnostic information
   - Shows environment config, API responses, and error details

3. **Review Debug Guide**
   - See `SQUARE_DEBUG_GUIDE.md` for complete troubleshooting steps
   - Includes common error scenarios and solutions
   - Error code reference table

### Common Issues

#### "Square access token not configured"
- Check you've set `SQUARE_ACCESS_TOKEN` in environment variables
- Verify no extra spaces in the token
- Check browser console for error code `SQUARE_NOT_CONFIGURED`
- View edge function logs for diagnostics section

#### Payment not completing
- Open browser console and check for detailed error logs
- Verify `SQUARE_ENV` matches your token type (sandbox/production)
- Check edge function logs show "Access token configured: true"
- Review Square API response status in logs
- See `SQUARE_DEBUG_GUIDE.md` for error code meanings

#### Not receiving admin emails
- Verify `ADMIN_EMAIL` is set correctly
- Check spam folder
- Review `send-order-notification` function logs
- Edge function logs show "Admin email configured: true/false"

---

## Environment Variables Reference

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `SQUARE_ENV` | Yes | `sandbox` or `production` | Square environment |
| `SQUARE_ACCESS_TOKEN` | Yes | `EAAAl...` | Square API access token |
| `ADMIN_EMAIL` | Yes | `admin@example.com` | Admin notification email |
| `SQUARE_WEBHOOK_SIGNATURE_KEY` | Optional | `abc123...` | For webhook verification |

---

## Fixed Configuration (Already in Code)

These are configured in the code and don't need environment variables:

- **Location ID:** `LK9VXXW72F7H5`
- **Sandbox App ID:** `sandbox-sq0idb-Qd7IvpnChoJ9Y5OMvEcvPg`
- **Production App ID:** `sq0idp-DBpvzrAVfYgqvwdnHqvoSw`

---

## What Was Changed

✅ PayPal completely removed
✅ Square integrated as primary payment processor
✅ Secure hosted checkout (redirect flow)
✅ Automatic payment verification
✅ Admin email notifications
✅ Database updated with Square fields
✅ e-Transfer option still available

---

## Need Help?

Review the detailed documentation in `SQUARE_PAYMENT_INTEGRATION.md` for:
- Complete implementation details
- Payment flow diagrams
- Webhook setup instructions
- Security features
- Database schema changes

---

## Quick Test Command

Once configured, test the checkout:

1. **Add to cart:** Browse catalogue and add items
2. **Checkout:** Click cart → proceed to checkout
3. **Fill form:** Enter shipping details
4. **Pay:** Select "Pay with Card" → Place Order
5. **Test card:** Use `4111 1111 1111 1111` on Square page
6. **Verify:** Check order confirmation and admin emails

✅ Success indicators:
- Redirected to Square checkout
- Returned to order confirmation
- Payment status shows "Paid"
- Received 2 admin emails (created + paid)
