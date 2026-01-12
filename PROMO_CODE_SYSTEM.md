# Promo Code System

## Overview

A robust promo code system with race condition protection, server-side validation, and atomic redemption has been implemented.

## Features

- Server-side validation and redemption
- Race condition protection using database-level locking
- Atomic redemption prevents double-spending
- Case-insensitive code matching
- Configurable discount types (fixed or percentage)
- Minimum subtotal requirements
- Usage limits (max uses per code)
- Expiration dates (optional)

## Current Promo Code

### New2026

**Code:** `New2026` (case-insensitive)

**Discount:** $50 OFF

**Requirements:**
- Cart subtotal must be >= $300 CAD
- Valid for first 20 successful orders only (globally)
- Active immediately, no expiration date

**Enforcement:**
- Server-side validation before order placement
- Atomic redemption during checkout (prevents race conditions)
- Usage counter incremented only after successful redemption
- If limit reached, code shows as "expired"

## Database Schema

### Tables Created

#### 1. promo_codes
Primary table storing all promo codes:

```sql
code                 text PRIMARY KEY           -- Promo code (case-insensitive)
discount_type        text NOT NULL              -- 'fixed' or 'percent'
discount_value       numeric NOT NULL           -- Amount or percentage
min_subtotal         numeric DEFAULT 0          -- Minimum cart subtotal required
max_uses             integer NOT NULL           -- Maximum redemptions allowed
uses_count           integer DEFAULT 0          -- Current redemption count
is_active            boolean DEFAULT true       -- Active/inactive status
starts_at            timestamptz                -- Optional start date
ends_at              timestamptz                -- Optional end date
created_at           timestamptz DEFAULT now()  -- Creation timestamp
```

#### 2. promo_redemptions
Audit trail of all promo code uses:

```sql
id                   uuid PRIMARY KEY           -- Unique identifier
code                 text NOT NULL              -- Promo code used
order_id             uuid NOT NULL              -- Order reference
order_number         text NOT NULL              -- Order number
discount_amount      numeric NOT NULL           -- Actual discount applied
redeemed_at          timestamptz DEFAULT now()  -- Redemption timestamp
```

#### 3. orders (updated)
Added columns to track promo usage:

```sql
promo_code           text                       -- Applied promo code
promo_discount       numeric DEFAULT 0          -- Promo discount amount
```

## Database Functions

### 1. validate_promo_code(p_code, p_subtotal)

**Purpose:** Preview validation without redeeming

**Parameters:**
- `p_code` (text): Promo code to validate
- `p_subtotal` (numeric): Cart subtotal

**Returns:** JSON object with validation result
```json
{
  "valid": true,
  "code": "New2026",
  "discount_amount": 50,
  "discount_type": "fixed",
  "min_subtotal": 300,
  "remaining_uses": 20
}
```

**Or on error:**
```json
{
  "valid": false,
  "error": "Minimum subtotal of $300 required"
}
```

**Validations:**
- Code exists and is active
- Not expired (if dates set)
- Usage limit not reached
- Subtotal meets minimum requirement

### 2. validate_and_redeem_promo(p_code, p_subtotal, p_order_id, p_order_number)

**Purpose:** Atomically validate and redeem promo code

**Parameters:**
- `p_code` (text): Promo code to redeem
- `p_subtotal` (numeric): Cart subtotal
- `p_order_id` (uuid): Order ID
- `p_order_number` (text): Order number

**Returns:** JSON object with redemption result
```json
{
  "success": true,
  "code": "New2026",
  "discount_amount": 50,
  "discount_type": "fixed",
  "remaining_uses": 19
}
```

**Race Condition Protection:**
- Uses `SELECT ... FOR UPDATE` to lock the promo code row
- Increments `uses_count` atomically
- Multiple simultaneous redemptions are serialized
- Ensures exactly 20 redemptions, no more

**Validations:**
- All validations from `validate_promo_code`
- Atomically increments usage counter
- Creates redemption record

## User Flow

### 1. Checkout Page

**Promo Code Section:**
- Located in order summary (right sidebar)
- Input field with "Apply" button
- Real-time validation feedback
- Shows discount amount when applied

**User Actions:**
1. Enter promo code (case-insensitive)
2. Click "Apply"
3. System validates via database function
4. Shows error or success message
5. Updates order total if valid

### 2. Order Placement

**Server-Side Process:**
1. Order created in database
2. If promo code applied:
   - Call `validate_and_redeem_promo` function
   - Lock promo code row (prevents race conditions)
   - Validate all requirements
   - Increment usage counter
   - Create redemption record
   - Return success/failure
3. If redemption fails:
   - Update order to remove promo discount
   - Adjust total back to original
   - Show error to user
4. Order completes regardless of promo status

**Fallback Behavior:**
- If promo redemption fails during checkout
- Order still completes successfully
- Promo discount removed from order
- User notified of adjusted total
- No data loss or stuck orders

## Testing Guide

### Test Scenario 1: Valid Code with Sufficient Subtotal

**Steps:**
1. Add products totaling >= $300 to cart
2. Go to checkout
3. Enter code: `New2026` (or `new2026` or `NEW2026`)
4. Click "Apply"

**Expected:**
- ✓ "Promo code applied successfully" message
- ✓ $50 discount shown
- ✓ Total reduced by $50
- ✓ Code displayed in order summary

### Test Scenario 2: Valid Code with Insufficient Subtotal

**Steps:**
1. Add products totaling < $300 to cart
2. Go to checkout
3. Enter code: `New2026`
4. Click "Apply"

**Expected:**
- ✗ Error: "Minimum subtotal of $300 required"
- ✗ No discount applied
- ✗ Total unchanged

### Test Scenario 3: Invalid/Expired Code

**Steps:**
1. Add products >= $300
2. Enter code: `INVALID123`
3. Click "Apply"

**Expected:**
- ✗ Error: "Invalid promo code"
- ✗ No discount applied

### Test Scenario 4: Code Usage Limit

**Steps:**
1. Place 20 successful orders with `New2026`
2. Attempt 21st order with same code

**Expected:**
- ✗ Error: "Promo code has expired"
- ✗ Code no longer redeemable
- ✗ Usage count = 20 (max reached)

### Test Scenario 5: Race Condition (Concurrent Orders)

**Setup:** Simulate 2+ users placing orders simultaneously with same promo code

**Steps:**
1. Open multiple browser tabs
2. Add items >= $300 in each
3. Apply `New2026` in all tabs
4. Submit orders at same time

**Expected:**
- ✓ All validations pass before checkout
- ✓ Only first 20 orders redeem successfully
- ✗ Orders 21+ fail promo redemption
- ✗ Failed orders complete without discount
- ✓ Usage count = exactly 20

## Admin Management

### Check Promo Code Status

```sql
SELECT
  code,
  discount_value,
  min_subtotal,
  max_uses,
  uses_count,
  is_active,
  (max_uses - uses_count) as remaining_uses
FROM promo_codes
WHERE code = 'New2026';
```

### View Redemptions

```sql
SELECT
  r.order_number,
  r.discount_amount,
  r.redeemed_at,
  o.customer_email,
  o.total
FROM promo_redemptions r
JOIN orders o ON r.order_id = o.id
WHERE r.code = 'New2026'
ORDER BY r.redeemed_at DESC;
```

### Deactivate Code Early

```sql
UPDATE promo_codes
SET is_active = false
WHERE code = 'New2026';
```

### Reset Usage Count (Testing Only)

```sql
-- WARNING: Only for testing
UPDATE promo_codes
SET uses_count = 0
WHERE code = 'New2026';

DELETE FROM promo_redemptions
WHERE code = 'New2026';
```

### Create New Promo Code

```sql
INSERT INTO promo_codes (
  code,
  discount_type,
  discount_value,
  min_subtotal,
  max_uses,
  is_active
) VALUES (
  'SPRING2026',      -- Code name
  'percent',         -- 'fixed' or 'percent'
  15,               -- 15% off
  200,              -- Min $200 subtotal
  50,               -- Max 50 uses
  true              -- Active
);
```

## Security Features

### 1. Server-Side Enforcement
- All validation happens in database functions
- Client-side validation is for UX only
- Cannot bypass restrictions via frontend manipulation

### 2. Race Condition Protection
- Database-level row locking (`FOR UPDATE`)
- Atomic operations in transactions
- Serialized concurrent redemptions
- Guarantees exactly N redemptions

### 3. Case-Insensitive Matching
- Codes normalized to lowercase
- `New2026 = new2026 = NEW2026`
- User-friendly input

### 4. Audit Trail
- Every redemption logged in `promo_redemptions`
- Order ID and number recorded
- Timestamp of redemption
- Discount amount applied

## Integration Points

### Frontend (Checkout.tsx)
- Promo code input field
- Validation via `validate_promo_code` RPC
- Atomic redemption during order creation
- Error handling and user feedback

### Backend (Database Functions)
- `validate_promo_code` - Preview only
- `validate_and_redeem_promo` - Atomic redemption
- Row-level locking for race protection

### Orders Table
- Stores applied promo code
- Tracks promo discount amount
- Separate from volume discounts

## Calculations

### Order Total Formula

```
Subtotal              = Sum of all product prices
Volume Discount       = Auto-applied discount (10% at $300+)
Promo Discount        = Promo code discount (if applied)
Discounted Subtotal   = Subtotal - Volume Discount - Promo Discount
Shipping Fee          = Based on location and weight
Taxable Amount        = Discounted Subtotal + Shipping Fee
Tax                   = Taxable Amount × Tax Rate (by province)
Order Total           = Taxable Amount + Tax
```

**Example:**
```
Subtotal:             $350.00
Volume Discount:      -$35.00  (10% auto-applied)
Promo Discount:       -$50.00  (New2026 code)
Discounted Subtotal:  $265.00
Shipping:             +$25.00
Taxable Amount:       $290.00
Tax (13% ON):         +$37.70
Order Total:          $327.70
```

## Troubleshooting

### Issue: "Promo code has expired" but usage < max_uses

**Cause:** Multiple tabs or race condition

**Solution:** Check actual `uses_count` in database:
```sql
SELECT uses_count, max_uses FROM promo_codes WHERE code = 'New2026';
```

### Issue: Discount not applied during order

**Cause:** Redemption failed server-side

**Solution:** Check order record:
```sql
SELECT promo_code, promo_discount FROM orders WHERE order_number = 'RP-...';
```

If `promo_code` is NULL but user entered one, redemption failed during checkout.

### Issue: Usage count incremented but order failed

**Cause:** Transaction rollback issue

**Solution:** Manually decrement and remove redemption:
```sql
UPDATE promo_codes SET uses_count = uses_count - 1 WHERE code = 'New2026';
DELETE FROM promo_redemptions WHERE order_id = 'failed-order-uuid';
```

## Future Enhancements

Possible improvements:

1. **Per-User Limits:** Limit redemptions per customer email
2. **Code Generation:** Auto-generate unique codes in bulk
3. **Product-Specific Codes:** Restrict to certain products/categories
4. **Stackable Codes:** Allow multiple codes per order
5. **Admin UI:** Manage codes through admin dashboard
6. **Analytics:** Track conversion rates by code
7. **Expiration Warnings:** Notify users when code about to expire
8. **Dynamic Discounts:** Vary discount by order value

## Summary

The promo code system is:
- ✅ Fully functional and production-ready
- ✅ Race condition protected
- ✅ Server-side enforced
- ✅ Case-insensitive
- ✅ Atomic and transactional
- ✅ Auditable and trackable
- ✅ User-friendly with real-time validation

**Code `New2026` is live and ready to use:**
- $50 OFF orders >= $300
- Limited to first 20 orders
- Available now, no expiration
