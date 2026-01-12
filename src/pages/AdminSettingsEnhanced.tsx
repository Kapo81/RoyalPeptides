import { useState, useEffect } from 'react';
import { Settings, Save, DollarSign, Package, Mail, Shield, Clock, Tag, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Toast from '../components/Toast';

interface AdminSettings {
  id: string;
  business_name: string;
  support_email: string;
  currency: string;
  shipping_free_threshold_canada: number;
  shipping_free_threshold_international: number;
  shipping_base_cost: number;
  shipping_quebec_cost?: number;
  shipping_text_canada?: string;
  shipping_international_base?: number;
  inventory_deduction_trigger: 'paid' | 'shipped';
  low_stock_threshold: number;
  session_timeout_minutes: number;
  enable_activity_log: boolean;
  tax_enabled: boolean;
  tax_rate_percent: number;
  promo_banner_enabled?: boolean;
  promo_free_shipping_text?: string;
  promo_discount_15_text?: string;
  promo_discount_20_text?: string;
  promo_discount_25_text?: string;
  discount_tier1_threshold?: number;
  discount_tier1_percentage?: number;
  discount_tier2_threshold?: number;
  discount_tier2_percentage?: number;
  discount_tier3_threshold?: number;
  discount_tier3_percentage?: number;
  support_response_time?: string;
  order_processing_time?: string;
}

export default function AdminSettingsEnhanced() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    console.log('[AdminRoute] Mounted: /admin/settings');
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
      .single();

    if (!error && data) {
      setSettings(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    const { error } = await supabase
      .from('admin_settings')
      .update({
        business_name: settings.business_name,
        support_email: settings.support_email,
        currency: settings.currency,
        shipping_free_threshold_canada: settings.shipping_free_threshold_canada,
        shipping_free_threshold_international: settings.shipping_free_threshold_international,
        shipping_base_cost: settings.shipping_base_cost,
        shipping_quebec_cost: settings.shipping_quebec_cost,
        shipping_text_canada: settings.shipping_text_canada,
        shipping_international_base: settings.shipping_international_base,
        inventory_deduction_trigger: settings.inventory_deduction_trigger,
        low_stock_threshold: settings.low_stock_threshold,
        session_timeout_minutes: settings.session_timeout_minutes,
        enable_activity_log: settings.enable_activity_log,
        tax_enabled: settings.tax_enabled,
        tax_rate_percent: settings.tax_rate_percent,
        promo_banner_enabled: settings.promo_banner_enabled,
        promo_free_shipping_text: settings.promo_free_shipping_text,
        promo_discount_15_text: settings.promo_discount_15_text,
        promo_discount_20_text: settings.promo_discount_20_text,
        promo_discount_25_text: settings.promo_discount_25_text,
        discount_tier1_threshold: settings.discount_tier1_threshold,
        discount_tier1_percentage: settings.discount_tier1_percentage,
        discount_tier2_threshold: settings.discount_tier2_threshold,
        discount_tier2_percentage: settings.discount_tier2_percentage,
        discount_tier3_threshold: settings.discount_tier3_threshold,
        discount_tier3_percentage: settings.discount_tier3_percentage,
        support_response_time: settings.support_response_time,
        order_processing_time: settings.order_processing_time,
        updated_at: new Date().toISOString(),
      })
      .eq('id', settings.id);

    if (!error) {
      setToastMessage('Settings saved successfully! Changes are now live on the website.');
      await fetchSettings();
    } else {
      setToastMessage('Failed to save settings');
    }
    setSaving(false);
  };

  const updateSetting = (key: keyof AdminSettings, value: any) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#00A0E0] border-r-transparent" />
      </div>
    );
  }

  if (!settings) {
    return <div className="text-white">Failed to load settings</div>;
  }

  return (
    <div className="min-h-screen bg-[#05070b] p-4 md:p-8">
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      )}

      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Settings</h1>
            <p className="text-gray-400">Configure your store operations and preferences</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-[#00A0E0] to-[#11D0FF] text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,160,224,0.5)] disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="h-5 w-5" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="h-5 w-5 text-[#00A0E0]" />
              <h2 className="text-xl font-bold text-white">General Settings</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  value={settings.business_name}
                  onChange={(e) => updateSetting('business_name', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Support Email
                </label>
                <input
                  type="email"
                  value={settings.support_email}
                  onChange={(e) => updateSetting('support_email', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Currency
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => updateSetting('currency', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                >
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="USD">USD - US Dollar</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-6">
              <Package className="h-5 w-5 text-[#00A0E0]" />
              <h2 className="text-xl font-bold text-white">Inventory & Stock</h2>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-lg p-4 border border-amber-500/30">
                <label className="block text-sm font-semibold text-white mb-3">
                  Inventory Deduction Trigger
                </label>
                <p className="text-sm text-gray-400 mb-4">
                  When should inventory be deducted from stock?
                </p>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="deduction"
                      checked={settings.inventory_deduction_trigger === 'paid'}
                      onChange={() => updateSetting('inventory_deduction_trigger', 'paid')}
                      className="w-4 h-4 text-[#00A0E0]"
                    />
                    <div>
                      <span className="text-white font-medium">On Payment Confirmed</span>
                      <p className="text-xs text-gray-400">Deduct immediately when order is marked as paid</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="deduction"
                      checked={settings.inventory_deduction_trigger === 'shipped'}
                      onChange={() => updateSetting('inventory_deduction_trigger', 'shipped')}
                      className="w-4 h-4 text-[#00A0E0]"
                    />
                    <div>
                      <span className="text-white font-medium">On Order Shipped</span>
                      <p className="text-xs text-gray-400">Deduct only when order status is set to shipped</p>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Low Stock Alert Threshold
                </label>
                <input
                  type="number"
                  value={settings.low_stock_threshold}
                  onChange={(e) => updateSetting('low_stock_threshold', parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Alert when product quantity falls below this number
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-6">
              <DollarSign className="h-5 w-5 text-[#00A0E0]" />
              <h2 className="text-xl font-bold text-white">Shipping & Pricing</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Base Shipping Cost (Canada)
                </label>
                <input
                  type="number"
                  value={settings.shipping_base_cost}
                  onChange={(e) => updateSetting('shipping_base_cost', parseFloat(e.target.value))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Quebec Shipping Cost
                </label>
                <input
                  type="number"
                  value={settings.shipping_quebec_cost || 20}
                  onChange={(e) => updateSetting('shipping_quebec_cost', parseFloat(e.target.value))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  International Base Rate
                </label>
                <input
                  type="number"
                  value={settings.shipping_international_base || 20}
                  onChange={(e) => updateSetting('shipping_international_base', parseFloat(e.target.value))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Free Shipping Threshold (Canada)
                </label>
                <input
                  type="number"
                  value={settings.shipping_free_threshold_canada}
                  onChange={(e) => updateSetting('shipping_free_threshold_canada', parseFloat(e.target.value))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Free Shipping Threshold (International)
                </label>
                <input
                  type="number"
                  value={settings.shipping_free_threshold_international}
                  onChange={(e) => updateSetting('shipping_free_threshold_international', parseFloat(e.target.value))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Shipping Display Text (Canada)
                </label>
                <input
                  type="text"
                  value={settings.shipping_text_canada || '$25 flat rate shipping Canada'}
                  onChange={(e) => updateSetting('shipping_text_canada', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
                  placeholder="e.g., $25 flat rate shipping Canada"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This text is displayed on the Shipping Information page
                </p>
              </div>
            </div>

            <div className="mt-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.tax_enabled}
                  onChange={(e) => updateSetting('tax_enabled', e.target.checked)}
                  className="w-5 h-5 rounded text-[#00A0E0]"
                />
                <div>
                  <span className="text-white font-medium">Enable Tax</span>
                  <p className="text-xs text-gray-400">Apply tax to orders</p>
                </div>
              </label>

              {settings.tax_enabled && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    value={settings.tax_rate_percent}
                    onChange={(e) => updateSetting('tax_rate_percent', parseFloat(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-6">
              <Tag className="h-5 w-5 text-[#00A0E0]" />
              <h2 className="text-xl font-bold text-white">Promotional Text & Banners</h2>
            </div>

            <div className="space-y-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.promo_banner_enabled || true}
                  onChange={(e) => updateSetting('promo_banner_enabled', e.target.checked)}
                  className="w-5 h-5 rounded text-[#00A0E0]"
                />
                <div>
                  <span className="text-white font-medium">Enable Promotional Banner</span>
                  <p className="text-xs text-gray-400">Show rotating promotional banner on homepage</p>
                </div>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Free Shipping Promotion Text
                </label>
                <input
                  type="text"
                  value={settings.promo_free_shipping_text || 'Free Shipping on Orders $300+'}
                  onChange={(e) => updateSetting('promo_free_shipping_text', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  15% Discount Promotion Text
                </label>
                <input
                  type="text"
                  value={settings.promo_discount_15_text || '15% OFF orders $500+'}
                  onChange={(e) => updateSetting('promo_discount_15_text', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  20% Discount Promotion Text
                </label>
                <input
                  type="text"
                  value={settings.promo_discount_20_text || '20% OFF orders $750+'}
                  onChange={(e) => updateSetting('promo_discount_20_text', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  25% Discount Promotion Text
                </label>
                <input
                  type="text"
                  value={settings.promo_discount_25_text || '25% OFF orders $1000+'}
                  onChange={(e) => updateSetting('promo_discount_25_text', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-[#00A0E0]" />
              <h2 className="text-xl font-bold text-white">Discount Tiers</h2>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg p-4 border border-green-500/30">
                <h3 className="text-white font-semibold mb-4">Tier 1 - 15% OFF</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Order Threshold ($)
                    </label>
                    <input
                      type="number"
                      value={settings.discount_tier1_threshold || 500}
                      onChange={(e) => updateSetting('discount_tier1_threshold', parseFloat(e.target.value))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Discount Percentage (%)
                    </label>
                    <input
                      type="number"
                      value={settings.discount_tier1_percentage || 15}
                      onChange={(e) => updateSetting('discount_tier1_percentage', parseFloat(e.target.value))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg p-4 border border-blue-500/30">
                <h3 className="text-white font-semibold mb-4">Tier 2 - 20% OFF</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Order Threshold ($)
                    </label>
                    <input
                      type="number"
                      value={settings.discount_tier2_threshold || 750}
                      onChange={(e) => updateSetting('discount_tier2_threshold', parseFloat(e.target.value))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Discount Percentage (%)
                    </label>
                    <input
                      type="number"
                      value={settings.discount_tier2_percentage || 20}
                      onChange={(e) => updateSetting('discount_tier2_percentage', parseFloat(e.target.value))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg p-4 border border-purple-500/30">
                <h3 className="text-white font-semibold mb-4">Tier 3 - 25% OFF</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Order Threshold ($)
                    </label>
                    <input
                      type="number"
                      value={settings.discount_tier3_threshold || 1000}
                      onChange={(e) => updateSetting('discount_tier3_threshold', parseFloat(e.target.value))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Discount Percentage (%)
                    </label>
                    <input
                      type="number"
                      value={settings.discount_tier3_percentage || 25}
                      onChange={(e) => updateSetting('discount_tier3_percentage', parseFloat(e.target.value))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="h-5 w-5 text-[#00A0E0]" />
              <h2 className="text-xl font-bold text-white">Operations & Support</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Support Response Time
                </label>
                <input
                  type="text"
                  value={settings.support_response_time || '24 hours'}
                  onChange={(e) => updateSetting('support_response_time', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
                  placeholder="e.g., 24 hours"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Order Processing Time
                </label>
                <input
                  type="text"
                  value={settings.order_processing_time || '24 hours'}
                  onChange={(e) => updateSetting('order_processing_time', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
                  placeholder="e.g., 24 hours"
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="h-5 w-5 text-[#00A0E0]" />
              <h2 className="text-xl font-bold text-white">Security & Logging</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={settings.session_timeout_minutes}
                  onChange={(e) => updateSetting('session_timeout_minutes', parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                  min="15"
                  max="1440"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Admin session will timeout after this period of inactivity
                </p>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enable_activity_log}
                  onChange={(e) => updateSetting('enable_activity_log', e.target.checked)}
                  className="w-5 h-5 rounded text-[#00A0E0]"
                />
                <div>
                  <span className="text-white font-medium">Enable Activity Logging</span>
                  <p className="text-xs text-gray-400">Track all admin actions for audit purposes</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
