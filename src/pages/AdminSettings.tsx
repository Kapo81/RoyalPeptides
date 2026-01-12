import { useEffect, useState } from 'react';
import { Save, Settings as SettingsIcon, DollarSign, Mail, Globe, Truck } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AdminSettings {
  id: string;
  business_name: string;
  support_email: string;
  currency: string;
  shipping_free_threshold_canada: number;
  shipping_free_threshold_international: number;
  shipping_base_cost: number;
  created_at: string;
  updated_at: string;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [businessName, setBusinessName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [currency, setCurrency] = useState('CAD');
  const [freeShippingCanada, setFreeShippingCanada] = useState('');
  const [freeShippingInternational, setFreeShippingInternational] = useState('');
  const [baseShippingCost, setBaseShippingCost] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching settings:', error);
        // If no settings exist, we'll use defaults
        return;
      }

      if (data) {
        setSettings(data);
        setBusinessName(data.business_name);
        setSupportEmail(data.support_email);
        setCurrency(data.currency);
        setFreeShippingCanada(data.shipping_free_threshold_canada.toString());
        setFreeShippingInternational(data.shipping_free_threshold_international.toString());
        setBaseShippingCost(data.shipping_base_cost.toString());
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);

    const updatedSettings = {
      business_name: businessName,
      support_email: supportEmail,
      currency: currency,
      shipping_free_threshold_canada: parseFloat(freeShippingCanada),
      shipping_free_threshold_international: parseFloat(freeShippingInternational),
      shipping_base_cost: parseFloat(baseShippingCost),
      updated_at: new Date().toISOString(),
    };

    try {
      if (settings) {
        // Update existing settings
        const { error } = await supabase
          .from('admin_settings')
          .update(updatedSettings)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Create new settings
        const { error } = await supabase
          .from('admin_settings')
          .insert([updatedSettings]);

        if (error) throw error;
      }

      alert('Settings saved successfully!');
      fetchSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#00A0E0] border-r-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl border border-white/10">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-[#00A0E0]" />
            <h2 className="text-lg font-semibold text-white">General Settings</h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Globe className="h-4 w-4 text-[#00A0E0]" />
                Business Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Royal Peptides"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
              />
              <p className="mt-1 text-xs text-gray-400">
                This name appears in emails and invoices
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Mail className="h-4 w-4 text-[#00A0E0]" />
                Support Email
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="support@royalpeptides.com"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
              />
              <p className="mt-1 text-xs text-gray-400">
                Customer support and inquiry emails
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <DollarSign className="h-4 w-4 text-[#00A0E0]" />
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
              >
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
              <p className="mt-1 text-xs text-gray-400">
                Store currency for pricing
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Truck className="h-4 w-4 text-[#00A0E0]" />
                Base Shipping Cost
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={baseShippingCost}
                  onChange={(e) => setBaseShippingCost(e.target.value)}
                  placeholder="15.00"
                  className="w-full pl-8 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Standard shipping fee
              </p>
            </div>

            <div className="md:col-span-1">
              <div className="h-4"></div>
              <div className="bg-[#00A0E0]/10 border border-[#00A0E0]/30 rounded-lg p-3">
                <p className="text-xs text-[#00A0E0]">
                  Shipping fees are calculated based on order total and destination
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <h3 className="text-md font-semibold text-white mb-4">Free Shipping Thresholds</h3>
            <p className="text-sm text-gray-400 mb-4">
              Set minimum order amounts for free shipping based on destination
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Canada Free Shipping Threshold
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={freeShippingCanada}
                    onChange={(e) => setFreeShippingCanada(e.target.value)}
                    placeholder="300.00"
                    className="w-full pl-8 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  Orders over this amount ship free within Canada
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  International Free Shipping Threshold
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={freeShippingInternational}
                    onChange={(e) => setFreeShippingInternational(e.target.value)}
                    placeholder="500.00"
                    className="w-full pl-8 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  Orders over this amount ship free internationally
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <SettingsIcon className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-200 mb-1">Important Note</h4>
                  <p className="text-sm text-amber-300">
                    Changes to shipping thresholds and costs will apply to new orders immediately.
                    Make sure to communicate any pricing changes to your customers.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00A0E0] to-[#11D0FF] text-white rounded-lg hover:shadow-[0_0_30px_rgba(0,160,224,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Save className="h-5 w-5" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl border border-white/10">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Current Configuration</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Business Information</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-400">Business Name:</dt>
                  <dd className="font-medium text-white">{businessName || 'Not set'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Support Email:</dt>
                  <dd className="font-medium text-white">{supportEmail || 'Not set'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Currency:</dt>
                  <dd className="font-medium text-white">{currency}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Shipping Configuration</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-400">Base Shipping Cost:</dt>
                  <dd className="font-medium text-white">${baseShippingCost || '0.00'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Free Shipping (Canada):</dt>
                  <dd className="font-medium text-white">${freeShippingCanada || '0.00'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Free Shipping (International):</dt>
                  <dd className="font-medium text-white">${freeShippingInternational || '0.00'}</dd>
                </div>
              </dl>
            </div>
          </div>

          {settings && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-gray-500">
                Last updated: {new Date(settings.updated_at).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
