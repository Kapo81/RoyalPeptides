# Order Email Notifications - Quick Start

## What's Been Implemented

✅ **Automatic email notifications** sent to `1984Gotfina@gmail.com` for every new order
✅ **Complete order details** including customer info, products, pricing
✅ **Payment instructions** included for Interac e-Transfer orders
✅ **Professional HTML email** template with branded design
✅ **Non-blocking delivery** - orders complete even if email fails
✅ **All orders saved** in Admin Dashboard automatically

## Email Contents

Every order notification includes:

- **Order Information**
  - Order number (RP-YYYYMMDD-####)
  - Order date and time
  - Payment method

- **Customer Details**
  - Full name
  - Email address
  - Phone number

- **Shipping Address**
  - Complete address with city, province, postal code
  - Country

- **Order Items**
  - Product names
  - Quantities
  - Individual prices
  - Line totals

- **Pricing**
  - Subtotal
  - Shipping fee
  - Total amount

- **Payment Instructions** (if Interac)
  - Email to send payment: 1984Gotfina@gmail.com
  - Amount to send
  - Order reference number
  - Reminder to include order number

## How to Enable Email Delivery

### 30-Second Setup (for testing)

The system is **already functional** but requires a Resend API key to actually send emails:

1. **Create Resend account**: Go to [resend.com](https://resend.com) (free)
2. **Get API key**: Dashboard → API Keys → Create
3. **Add to Supabase**: Project Settings → Edge Functions → Secrets
   - Name: `RESEND_API_KEY`
   - Value: Your API key
4. **Done!** Orders will now trigger emails

### Full Production Setup (recommended)

1. **Verify custom domain** in Resend (for professional sender address)
2. **Update sender address** in edge function to use your domain
3. **Test with real order** to verify delivery
4. **Check spam folder** and mark as safe

See `EMAIL_SETUP.md` for detailed instructions.

## What Happens When a Customer Orders

```
1. Customer completes checkout form
   ↓
2. Order created in Supabase database
   ↓
3. Edge function called automatically
   ↓
4. Email sent to 1984Gotfina@gmail.com
   ↓
5. Customer redirected to confirmation page
   ↓
6. Admin sees order in dashboard
```

**Important**: If email fails, the order still completes successfully. Email is logged but doesn't block checkout.

## Files Created

- **Edge Function**: `supabase/functions/send-order-notification/index.ts`
  - Fetches order details from database
  - Formats professional HTML email
  - Sends via Resend API

- **Checkout Update**: `src/pages/Checkout.tsx`
  - Triggers email notification after order creation
  - Non-blocking API call

## Testing Without Resend

While testing without a Resend API key configured:

- Orders still complete normally ✅
- Orders saved in database ✅
- Orders appear in Admin Dashboard ✅
- Email notification is logged but not sent ⚠️

To see what's happening, check:
- Supabase Dashboard → Edge Functions → send-order-notification → Logs

## Email Preview

**Subject**: `New Order: RP-20241211-1234 - $299.99`

**Body includes**:
- Header with Royal Peptides branding
- Order number in highlighted box
- Customer details section
- Shipping address section
- Product table with line items
- Totals with shipping
- Payment instructions (if Interac) in highlighted warning box
- Footer with disclaimer

## Payment Method Handling

### Stripe Orders
- Email shows "Payment Confirmed"
- Green success box
- No action needed

### Interac e-Transfer Orders
- Email shows payment instructions
- Yellow/orange instruction box
- Includes:
  - Payment email: 1984Gotfina@gmail.com
  - Amount
  - Order reference
  - Reminder to include order number

## Admin Workflow

1. **Email notification arrives** at 1984Gotfina@gmail.com
2. **Review order details** in email
3. **Check payment**:
   - Stripe: Auto-confirmed
   - Interac: Check email for e-Transfer
4. **Login to Admin Dashboard**
5. **Mark as "Paid"** (for Interac orders)
6. **Update shipping status** when shipped
7. **Export CSV** for records/accounting if needed

## Costs

**Resend Free Tier**:
- 100 emails/day
- 3,000 emails/month
- **Cost**: $0/month

Even at 10 orders/day, you'll stay within free tier.

## Quick Links

- **Resend Dashboard**: [resend.com/dashboard](https://resend.com/dashboard)
- **Supabase Edge Functions**: Your Supabase Dashboard → Edge Functions
- **Admin Panel**: Navigate to admin page in your app
- **Detailed Setup Guide**: See `EMAIL_SETUP.md`
- **Admin Setup Guide**: See `ADMIN_SETUP.md`

## Support & Troubleshooting

**Emails not arriving?**
1. Check Supabase secrets for `RESEND_API_KEY`
2. View Edge Function logs for errors
3. Check Resend dashboard logs
4. Verify sender domain if using custom domain

**Need help?**
- Full documentation: `EMAIL_SETUP.md`
- Admin setup: `ADMIN_SETUP.md`
- Edge function logs: Supabase Dashboard
- Resend support: support@resend.com

## Next Steps

1. **Set up Resend API key** (5 minutes)
2. **Place test order** to verify emails work
3. **Check spam folder** and mark as safe
4. **Set up admin account** (see ADMIN_SETUP.md)
5. **Process first real order** using admin dashboard

That's it! Your order notification system is ready to go.
