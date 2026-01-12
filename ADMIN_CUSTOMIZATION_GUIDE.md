# Admin Customization System - Complete Guide

## Overview

Your website now has a comprehensive admin customization system that allows you to control site-wide settings through the admin panel. All changes save automatically to the database and reflect on the website immediately.

## What Was Changed

### 1. Shipping Text Updated
- Changed from "$15 flat rate" to "$25 flat rate shipping Canada"
- Updated in both the Shipping Information page and FAQ section

### 2. Database Enhancements
- Enhanced the `admin_settings` table with 20+ new customizable fields
- Added fields for shipping costs, promotional text, discount tiers, and operational settings
- All settings are stored in a single row for easy management

### 3. Admin Panel Features
The Admin Settings page now includes:

#### **General Settings**
- Business Name
- Support Email
- Currency (CAD/USD)

#### **Inventory & Stock**
- Inventory deduction trigger (paid/shipped)
- Low stock alert threshold

#### **Shipping & Pricing**
- Base Shipping Cost (Canada) - **Currently $25**
- Quebec Shipping Cost - **$20**
- International Base Rate - **$20**
- Free Shipping Threshold (Canada) - **$300**
- Free Shipping Threshold (International) - **$500**
- Shipping Display Text (Canada) - **"$25 flat rate shipping Canada"**

#### **Promotional Text & Banners**
- Enable/Disable Promotional Banner
- Free Shipping Promotion Text
- 15% Discount Promotion Text
- 20% Discount Promotion Text
- 25% Discount Promotion Text

#### **Discount Tiers**
- **Tier 1:** Threshold ($500) and Percentage (15%)
- **Tier 2:** Threshold ($750) and Percentage (20%)
- **Tier 3:** Threshold ($1000) and Percentage (25%)

#### **Operations & Support**
- Support Response Time - **"24 hours"**
- Order Processing Time - **"24 hours"**

#### **Tax Settings**
- Enable/Disable Tax Calculation
- Tax Rate Percentage

#### **Security & Logging**
- Session Timeout (minutes)
- Enable Activity Logging

## How to Use the Admin Panel

### Accessing Settings
1. Log into the admin panel at `/admin`
2. Navigate to "Settings" from the sidebar
3. All current settings will be loaded automatically

### Making Changes
1. Update any field with your desired value
2. Click the **"Save Changes"** button at the top right
3. You'll see a confirmation message: "Settings saved successfully! Changes are now live on the website."
4. Changes take effect immediately across the entire website

### Important Notes
- All changes are saved to the database automatically
- No manual configuration files need to be edited
- Changes are reflected site-wide instantly
- The system uses fallback values if settings are missing

## Dynamic Loading

The following pages dynamically load settings from the database:
- **Shipping Information Page**: Loads shipping costs, thresholds, and display text
- **Checkout Page**: Uses shipping and tax settings
- **Cart Page**: Uses discount tier settings
- **Homepage**: Uses promotional banner settings

## Examples of Customization

### Example 1: Change Shipping Text
1. Go to Admin → Settings → Shipping & Pricing
2. Find "Shipping Display Text (Canada)"
3. Change to your desired text (e.g., "$30 flat rate Canada-wide shipping")
4. Click Save Changes
5. The Shipping Information page will now display your new text

### Example 2: Adjust Free Shipping Threshold
1. Go to Admin → Settings → Shipping & Pricing
2. Find "Free Shipping Threshold (Canada)"
3. Change from $300 to your desired amount (e.g., $250)
4. Click Save Changes
5. Free shipping will now activate at the new threshold

### Example 3: Update Discount Tiers
1. Go to Admin → Settings → Discount Tiers
2. Adjust the threshold or percentage for any tier
3. Click Save Changes
4. New discounts will be applied to orders immediately

## Technical Details

### Database Table: `admin_settings`
- Single row contains all site settings
- RLS enabled (public read, admin write)
- Auto-updated timestamp on every change
- Includes helper function `get_site_settings()` for easy retrieval

### Frontend Integration
- React components use `useEffect` to fetch settings on mount
- Fallback values ensure the site works even if settings aren't loaded
- All numeric values support decimals for precision

## Future Expansion Ideas

You can easily expand this system by:
1. Adding more fields to the `admin_settings` table
2. Creating new sections in the Admin Settings UI
3. Consuming these settings in other pages/components
4. Adding validation rules for specific fields

## Support

If you need to add more customizable settings:
1. Add the column to the `admin_settings` table via migration
2. Add the field to the `AdminSettings` interface in `AdminSettingsEnhanced.tsx`
3. Add the UI input field in the appropriate section
4. Include the field in the `handleSave` function
5. Use the setting in your frontend components

All settings auto-save to the database and are immediately reflected across the website!
