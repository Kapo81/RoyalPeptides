# Square Checkout - Debug Mode & Error Diagnostics

## Overview

The Square checkout integration now includes comprehensive error logging and diagnostics to help identify and resolve issues quickly.

---

## Error Handling Architecture

### Server-Side (Edge Function)
- Structured error responses with error codes
- Detailed logging of configuration and API responses
- Sanitized errors (no secrets exposed)

### Client-Side (Frontend)
- Full error details logged to browser console
- User-friendly generic messages shown to customers
- Technical details available for debugging

---

## How to Debug Checkout Issues

### Step 1: Check Browser Console

When a checkout fails, open your browser's Developer Tools (F12) and check the Console tab.

**You should see:**

```
[Square Checkout] Initiating checkout request...
[Square Checkout] Response status: 500

=== SQUARE CHECKOUT ERROR ===
Status: 500
Error code: SQUARE_API_ERROR
Error message: Square payment gateway returned an error
Error details: <specific error message>
Square error code: <Square error code>
Square error category: <error category>
Full error response: <complete error object>
============================
```

### Step 2: Check Edge Function Logs

Go to Supabase Dashboard → Edge Functions → `square-create-checkout` → Logs

**You should see:**

```
=== SQUARE CHECKOUT DIAGNOSTICS ===
Environment: sandbox
Location ID: LK9VXXW72F7H5
Access token configured: true
Access token length: 173
Admin email configured: true
===================================

Creating checkout for order: {...}
Generated order number: RP-CA-20231221-1234
Idempotency key: 1703174400000_abc123

Order created successfully with ID: uuid-here
Line items prepared: 3
Calling Square API to create payment link...
Square API response status: 400

SQUARE API ERROR - Status: 400
SQUARE API ERROR - Full response: {...}
SQUARE ERROR DETAILS: {...}
```

---

## Common Error Scenarios

### 1. Configuration Errors

#### Error Code: `SQUARE_NOT_CONFIGURED`

**Server Log:**
```
CRITICAL: Square access token not configured
```

**Cause:** Missing `SQUARE_ACCESS_TOKEN` environment variable

**Solution:**
1. Go to Bolt environment variables
2. Add `SQUARE_ACCESS_TOKEN` with your token from Square Developer Dashboard
3. Redeploy edge functions

---

#### Error Code: `SQUARE_API_ERROR` with "UNAUTHORIZED"

**Server Log:**
```
SQUARE API ERROR - Status: 401
Square error code: UNAUTHORIZED
```

**Causes:**
- Access token is invalid or expired
- Access token doesn't match environment (sandbox token used in production or vice versa)

**Solution:**
1. Verify `SQUARE_ENV` matches your token type
2. Get fresh token from Square Developer Dashboard
3. Update `SQUARE_ACCESS_TOKEN` environment variable

---

### 2. API Errors

#### Error Code: `SQUARE_API_ERROR` with "INVALID_REQUEST_ERROR"

**Server Log:**
```
SQUARE API ERROR - Status: 400
Square error code: INVALID_REQUEST_ERROR
Square error category: INVALID_REQUEST_ERROR
Error details: <specific field issue>
```

**Common Causes:**
- Invalid location ID
- Invalid currency (must be CAD for Canada)
- Invalid line item format
- Invalid redirect URL

**Solution:**
Check the `Error details` field for the specific issue. Common fixes:
- Verify `SQUARE_LOCATION_ID` is correct
- Ensure prices are positive numbers
- Check redirect URL is valid HTTPS

---

#### Error Code: `SQUARE_API_ERROR` with "NOT_FOUND"

**Server Log:**
```
SQUARE API ERROR - Status: 404
Square error code: NOT_FOUND
```

**Cause:** Location ID doesn't exist in your Square account

**Solution:**
1. Go to Square Developer Dashboard
2. Get correct Location ID from your account
3. Update `SQUARE_LOCATION_ID` in the code or environment variable

---

### 3. Database Errors

#### Error Code: `DATABASE_ERROR`

**Server Log:**
```
DATABASE ERROR - Failed to create order: <error details>
```

**Causes:**
- Database schema mismatch
- Missing required fields
- RLS policy blocking insert

**Solution:**
1. Check all migrations are applied
2. Verify RLS policies allow inserts
3. Check database connection is healthy

---

### 4. Network Errors

#### Error Code: `INTERNAL_ERROR`

**Server Log:**
```
=== UNEXPECTED ERROR ===
Error type: TypeError
Error message: <message>
Error stack: <stack trace>
========================
```

**Causes:**
- Network timeout
- Invalid JSON response
- Unexpected data format

**Solution:**
- Check network connectivity
- Verify Square API status
- Review full error stack trace

---

## Diagnostic Checklist

When debugging a checkout failure, check these in order:

### ☐ 1. Environment Configuration
```bash
# Required environment variables
SQUARE_ENV=sandbox              # or "production"
SQUARE_ACCESS_TOKEN=<token>     # From Square Dashboard
ADMIN_EMAIL=<email>             # Your admin email
```

**Verify:**
- [ ] Variables are set in Bolt environment settings
- [ ] `SQUARE_ENV` matches token type (sandbox/production)
- [ ] Access token is not expired
- [ ] No extra spaces in token

### ☐ 2. Square Dashboard Setup
- [ ] Application created in Square Developer Dashboard
- [ ] Correct environment selected (Sandbox/Production)
- [ ] Location exists and is active
- [ ] Access token copied correctly

### ☐ 3. Browser Console
- [ ] Check for error logs with `SQUARE CHECKOUT ERROR` header
- [ ] Note the error code and details
- [ ] Look for network request failures

### ☐ 4. Edge Function Logs
- [ ] Check diagnostics section shows correct config
- [ ] Access token length is reasonable (100-200 chars)
- [ ] Square API response status code
- [ ] Full Square error response

### ☐ 5. Network Request
- [ ] Request reached edge function
- [ ] Request body is valid JSON
- [ ] Response is received
- [ ] Response can be parsed

---

## Example Debug Sessions

### Successful Checkout

**Browser Console:**
```
[Square Checkout] Initiating checkout request...
[Square Checkout] Response status: 200
[Square Checkout] Checkout URL received, redirecting...
```

**Server Logs:**
```
=== SQUARE CHECKOUT DIAGNOSTICS ===
Environment: sandbox
Access token configured: true
===================================
Creating checkout for order: {...}
Order created successfully with ID: abc-123
Square payment link created successfully
Payment link ID: xyz-789
=== CHECKOUT COMPLETED SUCCESSFULLY ===
```

---

### Failed Checkout (Missing Token)

**Browser Console:**
```
=== SQUARE CHECKOUT ERROR ===
Status: 500
Error code: SQUARE_NOT_CONFIGURED
Error message: Square payment gateway is not configured
Error details: Missing SQUARE_ACCESS_TOKEN environment variable
============================
```

**Server Logs:**
```
=== SQUARE CHECKOUT DIAGNOSTICS ===
Environment: sandbox
Access token configured: false
Access token length: 0
===================================
CRITICAL: Square access token not configured
```

**Action:** Configure `SQUARE_ACCESS_TOKEN` in environment variables.

---

### Failed Checkout (Invalid Token)

**Browser Console:**
```
=== SQUARE CHECKOUT ERROR ===
Status: 500
Error code: SQUARE_API_ERROR
Square error code: UNAUTHORIZED
Square error category: AUTHENTICATION_ERROR
Error details: The Authorization http header of your request was malformed or incorrect.
============================
```

**Server Logs:**
```
=== SQUARE CHECKOUT DIAGNOSTICS ===
Environment: sandbox
Access token configured: true
Access token length: 150
===================================
Square API response status: 401
SQUARE API ERROR - Status: 401
Square error code: UNAUTHORIZED
```

**Action:** Verify token is correct and matches environment (sandbox vs production).

---

## Testing Error Handling

To test the error handling system:

### Test 1: Missing Configuration
1. Remove `SQUARE_ACCESS_TOKEN` from environment
2. Attempt checkout
3. Verify error appears in browser console
4. Check edge function logs show "CRITICAL: Square access token not configured"

### Test 2: Invalid Token
1. Set `SQUARE_ACCESS_TOKEN` to invalid value (e.g., "test123")
2. Attempt checkout
3. Verify browser shows detailed error with UNAUTHORIZED code
4. Check server logs show 401 response from Square

### Test 3: Network Inspection
1. Open browser Developer Tools → Network tab
2. Attempt checkout
3. Find request to `/functions/v1/square-create-checkout`
4. Check:
   - Request payload is correct
   - Response status code
   - Response body contains error details

---

## Quick Reference: Error Codes

| Error Code | Meaning | Common Cause | Solution |
|------------|---------|--------------|----------|
| `SQUARE_NOT_CONFIGURED` | Missing configuration | No access token | Add `SQUARE_ACCESS_TOKEN` |
| `SQUARE_API_ERROR` (401) | Authentication failed | Invalid/expired token | Update access token |
| `SQUARE_API_ERROR` (400) | Invalid request | Bad data format | Check request payload |
| `SQUARE_API_ERROR` (404) | Resource not found | Invalid location ID | Verify location ID |
| `DATABASE_ERROR` | Database operation failed | Schema/RLS issue | Check migrations |
| `INTERNAL_ERROR` | Unexpected error | Various | Check full stack trace |

---

## Production Monitoring

When running in production:

1. **Enable Monitoring:**
   - Set up alerts for edge function errors
   - Monitor error rates in Supabase dashboard
   - Track Square API response times

2. **Log Review:**
   - Review edge function logs daily
   - Look for patterns in errors
   - Track successful vs failed checkout ratio

3. **User Reports:**
   - When users report checkout issues, ask them to send:
     - Screenshot of browser console (if technical user)
     - Approximate time of attempt
     - Any error message shown

4. **Debug Process:**
   - Check edge function logs for the timeframe
   - Look for diagnostic section showing configuration
   - Review Square API error response
   - Cross-reference with Square Dashboard webhook events

---

## Getting Help

If you're still unable to resolve the issue:

1. **Collect Information:**
   - Browser console error logs
   - Edge function logs (redact any tokens)
   - Approximate timestamp of failure
   - Environment (sandbox/production)

2. **Check Square Status:**
   - Visit [Square Status Page](https://www.issquareup.com/status)
   - Verify API services are operational

3. **Review Square Docs:**
   - [Online Checkout API Reference](https://developer.squareup.com/reference/square/online-checkout-api)
   - [Error Codes Reference](https://developer.squareup.com/docs/build-basics/common-api-patterns/error-handling)

4. **Contact Support:**
   - Square Developer Support (for Square API issues)
   - Review implementation code in edge function
