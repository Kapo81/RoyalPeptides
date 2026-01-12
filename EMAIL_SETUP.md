# Email Notification Setup Guide

## Overview

Automatic email notifications are sent to `1984Gotfina@gmail.com` for every new order. The system uses Supabase Edge Functions and Resend API for reliable email delivery.

## Features

All order notification emails include:
- Order number (format: RP-YYYYMMDD-####)
- Customer name, email, phone
- Complete shipping address
- Product list with quantities and prices
- Subtotal, shipping fee, and total amount
- Payment method (Stripe or Interac e-Transfer)
- **Interac payment instructions** (if applicable)

## Email Sample

For Interac e-Transfer orders, emails include highlighted payment instructions:
- Send payment to: `1984Gotfina@gmail.com`
- Order reference number
- Payment amount
- Reminder to include order number in message

## Setup Instructions

### Step 1: Create a Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
   - Free tier includes: 100 emails/day, 3,000 emails/month
3. Verify your email address

### Step 2: Add and Verify Domain (Recommended)

**Option A: Custom Domain (Professional)**
1. In Resend Dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain: `royalpeptides.com`
4. Add the DNS records provided by Resend to your domain registrar
5. Wait for verification (usually 5-30 minutes)
6. Once verified, you can send from `orders@royalpeptides.com`

**Option B: Resend's Shared Domain (Quick Start)**
- For testing, you can use Resend's shared domain
- Emails will come from `onboarding@resend.dev`
- Limited to verified recipient addresses only
- Not recommended for production

### Step 3: Get Your API Key

1. In Resend Dashboard, go to **API Keys**
2. Click **Create API Key**
3. Name it: "Royal Peptides Production"
4. Select permissions: **Sending access**
5. Click **Create**
6. **Copy the API key immediately** (it won't be shown again)

### Step 4: Configure Supabase Secret

1. Go to your Supabase Dashboard
2. Select your project
3. Navigate to **Project Settings** → **Edge Functions** → **Manage Secrets**
4. Click **Add new secret**
5. Set:
   - **Name**: `RESEND_API_KEY`
   - **Value**: Your Resend API key (starts with `re_`)
6. Click **Save**

### Step 5: Update Email Sender Address (If Using Custom Domain)

If you verified a custom domain, update the edge function:

1. Open `supabase/functions/send-order-notification/index.ts`
2. Find this line:
   ```typescript
   from: "Royal Peptides <orders@royalpeptides.com>",
   ```
3. Replace with your verified domain:
   ```typescript
   from: "Royal Peptides <orders@yourdomain.com>",
   ```
4. Redeploy the function

### Step 6: Test Email Notifications

1. Place a test order on your site
2. Check that email arrives at `1984Gotfina@gmail.com`
3. Verify all order details are correct
4. Test both payment methods (Stripe and Interac)

## How It Works

1. **Customer completes checkout** → Order is created in database
2. **System calls edge function** → Sends order ID to `/functions/v1/send-order-notification`
3. **Edge function fetches order details** → Gets complete order and items from database
4. **Email is formatted** → Generates HTML email with all details
5. **Resend sends email** → Delivers to `1984Gotfina@gmail.com`
6. **Admin receives notification** → Can process order immediately

The notification system is **non-blocking**, meaning if email fails, the order still completes successfully.

## Email Delivery Status

### Check Email Logs in Resend

1. Go to Resend Dashboard → **Logs**
2. View all sent emails
3. See delivery status:
   - **Delivered**: Email sent successfully
   - **Bounced**: Invalid recipient address
   - **Complained**: Marked as spam
   - **Failed**: Delivery error

### Check Edge Function Logs in Supabase

1. Go to Supabase Dashboard → **Edge Functions**
2. Click on `send-order-notification`
3. View **Logs** tab
4. Check for errors or successful sends

## Troubleshooting

### Emails Not Being Received

**Check 1: Verify Resend API Key**
- Ensure `RESEND_API_KEY` is set in Supabase secrets
- Verify the key is active in Resend dashboard
- Check key has "Sending access" permission

**Check 2: Check Edge Function Logs**
```bash
# In Supabase Dashboard:
Edge Functions → send-order-notification → Logs
```
Look for error messages

**Check 3: Verify Domain/Sender**
- If using custom domain, ensure DNS records are verified
- If using shared domain, verify recipient email is added to allowed list

**Check 4: Check Spam Folder**
- Emails may be filtered to spam initially
- Mark as "Not Spam" to train filters

**Check 5: Review Resend Logs**
- Go to Resend Dashboard → Logs
- Check if emails are being sent
- Review bounce/failure reasons

### Common Errors

**Error: "API key not found"**
- Solution: Add `RESEND_API_KEY` to Supabase secrets

**Error: "Domain not verified"**
- Solution: Complete domain verification in Resend or use shared domain for testing

**Error: "Rate limit exceeded"**
- Solution: Upgrade Resend plan or wait for rate limit reset

**Error: "Invalid recipient"**
- Solution: Verify email address in edge function code

## Security Notes

- **API Key Protection**: Never commit API keys to version control
- **Service Role Key**: Edge function uses Supabase service role key for database access
- **Email Content**: Avoid including sensitive data in emails
- **HTTPS Only**: All API calls are encrypted via HTTPS

## Email Customization

### Change Recipient Email

Edit `supabase/functions/send-order-notification/index.ts`:

```typescript
to: ["your-new-email@example.com"],
```

### Add Multiple Recipients

```typescript
to: ["admin@example.com", "orders@example.com"],
```

### Add CC or BCC

```typescript
cc: ["manager@example.com"],
bcc: ["backup@example.com"],
```

### Customize Email Subject

```typescript
subject: `New Order: ${order.order_number} - $${order.total.toFixed(2)}`,
```

### Modify Email Template

The HTML template is in the `emailHtml` variable. Customize colors, layout, or add your logo.

## Resend Pricing

**Free Tier:**
- 100 emails/day
- 3,000 emails/month
- All features included

**Paid Plans:**
- Start at $20/month for 50,000 emails
- Volume discounts available
- No setup fees

## Support

### Resend Support
- Documentation: [resend.com/docs](https://resend.com/docs)
- Support: support@resend.com

### Technical Issues
- Check Supabase Edge Function logs
- Review Resend email logs
- Verify all configuration steps completed
- Contact development team if issues persist

## Production Checklist

Before going live:

- [ ] Resend account created and verified
- [ ] Custom domain added and DNS verified
- [ ] API key created and saved securely
- [ ] `RESEND_API_KEY` added to Supabase secrets
- [ ] Sender address updated in edge function
- [ ] Test order placed and email received
- [ ] Both payment methods tested (Stripe and Interac)
- [ ] Emails checked in spam folder and marked as safe
- [ ] Multiple test orders to verify reliability
- [ ] Email formatting verified on desktop and mobile
- [ ] Admin notified about email notification system

## Alternative Email Services

If you prefer not to use Resend, the edge function can be modified to use:
- **SendGrid**: Popular alternative with similar pricing
- **Mailgun**: Good for high volume
- **Amazon SES**: Low cost, more technical setup
- **Postmark**: Focus on transactional emails

Each requires updating the API endpoint and authentication in the edge function.
