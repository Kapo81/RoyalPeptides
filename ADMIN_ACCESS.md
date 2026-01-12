# Quick Admin Access Guide

## How to Access the Admin Dashboard

### Option 1: Direct URL Access (Development)
When running locally, you can access the admin panel by manually changing the route in your browser:

1. Open your browser console (F12)
2. Run this JavaScript command:
```javascript
// Access admin page
window.location.href = window.location.origin + '/#admin'
```

### Option 2: Add a Hidden Access Link
For production, you can add a hidden link that's only known to admins:

**Example**: Visit `https://yoursite.com/#admin` directly in the browser

### Option 3: Temporary Dev Access Button
During development, you can temporarily add this to your Navigation component:

```jsx
{/* Temporary admin access - REMOVE IN PRODUCTION */}
<button onClick={() => onNavigate('admin')}>Admin</button>
```

**Important**: Remove this button before deploying to production!

## Setting Up Your First Admin User

### Step-by-Step Process:

1. **Create a Supabase Account for Admin**
   - Go to Supabase Dashboard → Authentication → Users
   - Click "Add User" (via email)
   - Email: `admin@royalpeptides.com`
   - Password: Create a strong password
   - Click "Create User"

2. **Grant Admin Privileges**
   - Click on the newly created user
   - Scroll to "User Metadata" section
   - Find "Raw App Meta Data"
   - Click "Edit"
   - Add this JSON:
   ```json
   {
     "is_admin": true
   }
   ```
   - Save

3. **Login to Admin Dashboard**
   - Navigate to the admin page (see access methods above)
   - Enter the admin email and password
   - You should now have full access

## First Login

**Default Test Credentials** (set these up first):
- Email: `admin@royalpeptides.com`
- Password: `[Your secure password]`

**Important**: Change these credentials to your own secure values!

## Admin Dashboard Features

Once logged in, you can:

✅ View all orders with full details
✅ See customer information and shipping addresses
✅ Filter orders by status (Pending, Paid, Shipped)
✅ Mark Interac e-Transfer payments as paid
✅ Update shipping status for each order
✅ Export orders to CSV for reporting
✅ View low-stock alerts automatically
✅ Manage inventory levels

## Security Reminders

🔒 **Never share admin credentials**
🔒 **Use strong, unique passwords**
🔒 **Enable 2FA in Supabase (recommended)**
🔒 **Don't expose admin access links publicly**
🔒 **Regularly review admin user list**
🔒 **Monitor login activity in Supabase logs**

## Troubleshooting

### "Access denied. Admin privileges required"
- Check that `is_admin: true` is set in user's app_metadata
- Verify you're using the correct email/password
- Try logging out and back in

### Can't see orders
- Verify orders exist in the database
- Check Supabase RLS policies are applied
- Review browser console for errors

### Unable to update order status
- Confirm you're logged in as admin
- Check browser network tab for API errors
- Verify Supabase connection is active

## Production Deployment Notes

Before deploying to production:

1. ✅ Remove any temporary admin access buttons from UI
2. ✅ Ensure admin page is not linked in public navigation
3. ✅ Set up strong admin passwords
4. ✅ Document the admin URL for authorized personnel only
5. ✅ Test all admin functions in staging environment
6. ✅ Enable Supabase 2FA for admin accounts
7. ✅ Set up monitoring/logging for admin actions

## Support

For technical issues:
- Check `ADMIN_SETUP.md` for detailed documentation
- Review Supabase logs for backend errors
- Inspect browser console for frontend errors
- Contact development team if issues persist
