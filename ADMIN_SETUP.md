# Admin Dashboard Setup Guide

## Overview

The admin dashboard provides secure access to order management, payment tracking, and inventory alerts.

## Features

- **Secure Login**: Email and password authentication with admin role verification
- **Order Management**: View all orders with detailed customer and product information
- **Payment Tracking**: See payment method (Stripe or Interac e-Transfer) and status
- **Status Updates**: Mark orders as Paid, Pending, or Shipped
- **Interac Payments**: One-click button to mark Interac e-Transfer payments as completed
- **CSV Export**: Export filtered orders to CSV for external analysis
- **Low Stock Alerts**: Automatic notifications when products are running low
- **Mobile Responsive**: Full functionality on all devices

## Accessing the Admin Dashboard

Navigate to: `yoursite.com?page=admin` or use the navigation handler to set currentPage to 'admin'

In the browser console, you can access it by:
```javascript
// Type in browser console (temporary access during development)
window.location.hash = '#admin'
// Then manually navigate in your app
```

## Setting Up an Admin User

### Method 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. Create a new user or select an existing user
4. Click on the user to edit
5. In the **User Metadata** section, find **Raw App Meta Data**
6. Add the following JSON:
```json
{
  "is_admin": true
}
```
7. Save the changes

### Method 2: Via SQL

Execute this SQL in your Supabase SQL Editor:

```sql
-- First, create the user via Supabase Auth dashboard or API
-- Then update their metadata:

UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"is_admin": true}'::jsonb
WHERE email = 'admin@yourdomain.com';
```

### Method 3: Via Supabase Management API

```javascript
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SERVICE_ROLE_KEY' // Use service role key, not anon key
)

await supabase.auth.admin.updateUserById(
  'USER_ID',
  {
    app_metadata: { is_admin: true }
  }
)
```

## Admin User Credentials

Create an admin account with:
- Email: `admin@royalpeptides.com` (or your preferred email)
- Password: Use a strong password (min 8 characters)

**Important**: Store credentials securely. Consider using a password manager.

## Security Notes

1. **Never commit admin credentials** to version control
2. **Use strong passwords** for admin accounts
3. **Enable 2FA** in Supabase settings for additional security
4. **Regular audits**: Review admin access periodically
5. **RLS Policies**: The system uses Row Level Security to ensure only users with `is_admin: true` in their metadata can update orders

## Order Statuses

### Payment Status
- **Pending**: Payment not yet received
- **Completed**: Payment confirmed (Stripe or Interac)
- **Cancelled**: Order cancelled

### Shipping Status
- **Pending**: Order received, not yet paid
- **Paid**: Payment confirmed, ready to ship
- **Shipped**: Order dispatched to customer

## Payment Methods

- **Stripe**: Credit card payments (automatically marked as completed when payment succeeds)
- **Interac e-Transfer**: Manual verification required - use "Mark Paid" button after confirming payment

## CSV Export

Exports include:
- Order Number
- Date
- Customer Name & Contact Info
- Shipping Address
- Products & Quantities
- Total Amount
- Payment Method & Status
- Shipping Status

## Low Stock Alerts

The dashboard automatically displays alerts when products have low inventory. Products are considered "low stock" when:
- Quantity falls below threshold (currently: 5 units)
- Based on order frequency and demand patterns

## Troubleshooting

### Cannot Login
- Verify user exists in Supabase Authentication
- Check `is_admin: true` is set in app_metadata
- Confirm email and password are correct
- Check browser console for error messages

### Orders Not Showing
- Verify RLS policies are correctly applied
- Check Supabase connection in browser console
- Ensure orders exist in database

### Cannot Update Orders
- Confirm logged-in user has admin privileges
- Check browser console for permission errors
- Verify RLS policies allow admin updates

## Support

For technical support or questions:
- Email: dev@royalpeptides.com
- Check Supabase logs for detailed error information
- Review browser console for client-side errors
