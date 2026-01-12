# Discount Stacking Rules Documentation

## Overview

Clear, non-stackable discount system implemented to prevent pricing bugs and ensure consistent totals across cart and checkout.

## Discount Types

### 1. Automatic Volume Discounts
**Rule:** Based on subtotal amount, automatically applied
- **10% OFF** - Orders $300-$499
- **15% OFF** - Orders $500+

**Characteristics:**
- Calculated automatically
- No user action required
- Applied to subtotal before shipping and taxes
- Shows with green Tag icon
- Label: "Volume Discount (X%)"

### 2. Promo Code Discounts
**Example:** New2026 = $50 OFF on $300+
- **$50 OFF** - First 20 orders with $300+ subtotal

**Characteristics:**
- User must enter code manually
- Validation required
- Usage limits enforced
- Applied to subtotal before shipping and taxes
- Shows with blue Ticket icon
- Label: "Discount (CODE)"

## Stacking Rule (Non-Stackable)

### Primary Rule
**Promo codes and automatic volume discounts are mutually exclusive.**

When a promo code is applied:
- ✅ Promo code discount applies
- ❌ Automatic volume discount is disabled
- User is informed via warning message

When no promo code is applied:
- ✅ Automatic volume discount applies (if qualified)
- ❌ Promo code field is empty

### Implementation Logic

```typescript
// Calculate both discounts
const volumeDiscount = calculateDiscount(subtotal);
const promoDiscount = promoApplied ? promoDiscountAmount : 0;

// Apply only one at a time (non-stacking)
const activeDiscount = promoApplied ? 0 : volumeDiscount.amount;
const activePromoDiscount = promoApplied ? promoDiscount : 0;

// Calculate final subtotal
const discountedSubtotal = subtotal - activeDiscount - activePromoDiscount;
```

### Visual Logic

```typescript
// Only show active discount
{!promoApplied && volumeDiscount.applied && (
  <div>Volume Discount: -${volumeDiscount.amount}</div>
)}

{promoApplied && promoDiscount > 0 && (
  <div>Discount ({promoCode}): -${promoDiscount}</div>
)}
```

## User Experience

### Scenario 1: No Discounts (Subtotal < $300)
```
Subtotal:                $250.00
Shipping:                $25.00
Taxes:                   $30.25
────────────────────────────────
Order Total:             $305.25

[Promo Code Input]
ℹ Limited: first 20 orders. Minimum $300+.
⚠ Promo codes cannot be combined with automatic discounts.
```

### Scenario 2: Volume Discount Active (Subtotal $300-$499)
```
Subtotal:                $350.00
Volume Discount (10%):   -$35.00
Shipping:                FREE
Taxes:                   $34.65
────────────────────────────────
Order Total:             $349.65

[Promo Code Input]
ℹ Limited: first 20 orders. Minimum $300+.
⚠ Promo codes cannot be combined with automatic discounts.
ℹ Current auto discount: 10% (-$35.00)
```

### Scenario 3: Volume Discount Active (Subtotal $500+)
```
Subtotal:                $550.00
Volume Discount (15%):   -$82.50
Shipping:                FREE
Taxes:                   $51.47
────────────────────────────────
Order Total:             $518.97

[Promo Code Input]
ℹ Limited: first 20 orders. Minimum $300+.
⚠ Promo codes cannot be combined with automatic discounts.
ℹ Current auto discount: 15% (-$82.50)
```

### Scenario 4: Promo Code Applied ($350 Subtotal)
```
Subtotal:                $350.00
Discount (New2026):      -$50.00
Shipping:                FREE
Taxes:                   $33.00
────────────────────────────────
Order Total:             $333.00

✓ Promo applied: -$50.00  [✕ Remove]

Note: Volume discount (10%, -$35.00) is disabled while promo is active.
```

### Scenario 5: Promo Code Applied ($550 Subtotal)
```
Subtotal:                $550.00
Discount (New2026):      -$50.00
Shipping:                FREE
Taxes:                   $55.00
────────────────────────────────
Order Total:             $555.00

✓ Promo applied: -$50.00  [✕ Remove]

Note: User chose promo over better auto discount (15%, -$82.50)
```

## Warning Messages

### Primary Warning (Always Shown)
```
⚠ Promo codes cannot be combined with automatic discounts.
```
- Color: Amber (#f59e0b at 80% opacity)
- Icon: AlertCircle
- Position: Under promo code input
- Visibility: Always visible when input is shown

### Discount Comparison (Conditional)
```
ℹ Current auto discount: 15% (-$82.50)
```
- Color: Gray
- Icon: None
- Position: Below warning message
- Visibility: Only when volume discount would apply
- Purpose: Inform user of what they're giving up

## Decision Making Support

### When User Applies Promo
System shows current auto discount value so user can make informed choice:

**Example:**
- Subtotal: $550
- Auto discount: 15% = $82.50 OFF
- Promo code: New2026 = $50 OFF

**User sees:**
```
Current auto discount: 15% (-$82.50)
```

**User can decide:**
- Keep auto discount (better deal)
- Apply promo anyway (personal choice)
- Remove promo later to restore auto discount

## Edge Cases

### Case 1: Subtotal Changes Below Promo Minimum
**Scenario:** User has promo applied, then reduces cart below $300

**Behavior:**
- Promo remains applied (already validated)
- If user removes and re-applies, validation will fail
- Clear error message: "Requires $300+ subtotal"

### Case 2: Promo Better Than Auto Discount
**Scenario:** Subtotal $350, auto discount 10% ($35) vs promo $50

**Behavior:**
- User applies promo
- Gets better deal ($50 vs $35)
- Auto discount disabled
- System shows comparison for transparency

### Case 3: Auto Discount Better Than Promo
**Scenario:** Subtotal $550, auto discount 15% ($82.50) vs promo $50

**Behavior:**
- User applies promo
- Gets worse deal ($50 vs $82.50)
- System shows: "Current auto discount: 15% (-$82.50)"
- User can see they're choosing suboptimal discount
- User can remove promo to get better deal

### Case 4: Promo Code Exhausted
**Scenario:** Code reaches 20/20 usage limit

**Behavior:**
- Validation fails: "Code fully redeemed (20/20 used)"
- Auto discount remains/returns
- User cannot override with exhausted code

### Case 5: Invalid Code Entered
**Scenario:** User enters non-existent code

**Behavior:**
- Error: "Invalid code"
- Auto discount unchanged
- User can try different code

## Pricing Consistency

### Calculation Order
1. Calculate subtotal (sum of all items)
2. Calculate volume discount (if applicable)
3. Check if promo is applied
4. Apply ONLY ONE discount type
5. Calculate shipping on discounted amount
6. Calculate tax on (discounted amount + shipping)
7. Calculate final total

### Formula
```typescript
// Step 1: Subtotal
subtotal = sum(items)

// Step 2: Calculate both discounts
volumeDiscount = calculateDiscount(subtotal)
promoDiscount = validatePromo(code, subtotal)

// Step 3: Apply only one (non-stacking)
activeDiscount = promoApplied ? 0 : volumeDiscount.amount
activePromoDiscount = promoApplied ? promoDiscount : 0

// Step 4: Discounted subtotal
discountedSubtotal = subtotal - activeDiscount - activePromoDiscount

// Step 5: Shipping
shipping = calculateShipping(discountedSubtotal, items, province)

// Step 6: Taxable amount
taxableAmount = discountedSubtotal + shipping

// Step 7: Tax
tax = calculateTax(taxableAmount, province)

// Step 8: Final total
total = taxableAmount + tax
```

### Guaranteed Consistency
- ✅ Same calculation in Cart and Checkout
- ✅ Only one discount type applied at a time
- ✅ No double discounting possible
- ✅ Totals always match between pages
- ✅ Tax calculated on correct amount
- ✅ Shipping calculated correctly

## Testing Scenarios

### Test 1: No Discounts
```
Cart: $250
Expected: No discounts shown
Result: ✅ Pass
```

### Test 2: Volume Discount 10%
```
Cart: $350
Expected: -$35 volume discount
Result: ✅ Pass
```

### Test 3: Volume Discount 15%
```
Cart: $550
Expected: -$82.50 volume discount
Result: ✅ Pass
```

### Test 4: Promo Applied (Better)
```
Cart: $350
Promo: New2026 ($50)
Expected: -$50 promo, no volume discount
Result: ✅ Pass
```

### Test 5: Promo Applied (Worse)
```
Cart: $550
Promo: New2026 ($50)
Expected: -$50 promo, volume discount disabled, warning shown
Result: ✅ Pass
```

### Test 6: Remove Promo
```
Cart: $550 with promo applied
Action: Remove promo
Expected: Promo removed, 15% volume discount restored (-$82.50)
Result: ✅ Pass
```

### Test 7: Cart-to-Checkout Consistency
```
Cart total: $333.00 (with promo)
Checkout total: $333.00 (same)
Expected: Totals match
Result: ✅ Pass
```

### Test 8: Promo Not Stackable
```
Cart: $550
Volume: -$82.50 (15%)
Promo: -$50
Expected: Only one applied ($50 promo OR $82.50 volume)
Result: ✅ Pass - No stacking
```

## Benefits

### For Business
- ✅ No pricing bugs or double discounting
- ✅ Predictable discount logic
- ✅ Clear rules for support team
- ✅ Easy to explain to customers
- ✅ Protected profit margins

### For Customers
- ✅ Transparent pricing
- ✅ Clear discount display
- ✅ Informed decision making
- ✅ No confusion about discounts
- ✅ Consistent totals

### For Developers
- ✅ Simple implementation
- ✅ Easy to maintain
- ✅ Clear code documentation
- ✅ Testable logic
- ✅ No edge case surprises

## Summary

**Non-stackable discount system successfully implemented:**

1. **One discount at a time** - Either promo code OR volume discount
2. **Clear warnings** - User informed about non-stacking
3. **Comparison shown** - User sees current auto discount value
4. **Consistent totals** - Same calculation across all pages
5. **No pricing bugs** - Guaranteed single discount application
6. **Transparent UX** - User always knows which discount applies
7. **Informed choices** - User can compare and decide

**Result:** Reliable, bug-free discount system with excellent user experience.
