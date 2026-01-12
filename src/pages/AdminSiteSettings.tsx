import { useState, useEffect } from 'react';
import { Settings, Save, Megaphone, Truck, CreditCard, Shield, Mail, RefreshCw, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Toast from '../components/Toast';

interface SiteSettings {
  hero_headline: string;
  hero_subheadline: string;
  promo_tier_1: {
    threshold: number;
    discount_percent: number;
    free_shipping_canada: boolean;
    label: string;
  };
  promo_tier_2: {
    threshold: number;
    discount_percent: number;
    free_shipping_canada: boolean;
    label: string;
  };
  promo_tier_3: {
    threshold: number;
    discount_percent: number;
    free_shipping_canada: boolean;
    label: string;
  };
  promo_tier_4: {
    threshold: number;
    discount_percent: number;
    free_shipping_canada: boolean;
    label: string;
  };
  shipping_rules: {
    canada_flat_under_300: number;
    quebec_flat_under_300: number;
    free_shipping_canada_threshold: number;
    free_shipping_international_threshold: number;
    international_base_rate: number;
  };
  interac_instructions: {
    email: string;
    question: string;
    answer: string;
    deadline_hours: number;
    instructions: string;
  };
  global_trust_points: string[];
  support_email: string;
  processing_time_text: string;
  site_name: string;
  contact_phone: string;
  free_shipping_badge_text: string;
  bulk_discount_badge_text: string;
}

export default function AdminSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_settings')
      .select('*');

    if (!error && data) {
      const settingsObj: any = {};
      data.forEach((row) => {
        settingsObj[row.key] = row.value;
      });
      setSettings(settingsObj);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    const updates = Object.entries(settings).map(([key, value]) => ({
      key,
      value: value,
      updated_at: new Date().toISOString(),
    }));

    let hasError = false;
    for (const update of updates) {
      const { error } = await supabase
        .from('site_settings')
        .upsert(update, { onConflict: 'key' });

      if (error) {
        hasError = true;
        console.error('Error saving setting:', update.key, error);
      }
    }

    if (!hasError) {
      setToastMessage('Settings saved successfully! ✓ Changes are now live on the storefront.');
      setLastSaved(new Date());
      await fetchSettings();
    } else {
      setToastMessage('Failed to save some settings. Please try again.');
    }
    setSaving(false);
  };

  const handleForceRefresh = async () => {
    setRefreshing(true);
    await fetchSettings();
    setToastMessage('Settings refreshed from database ✓');
    setRefreshing(false);
  };

  const updateSetting = (key: keyof SiteSettings, value: any) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  const updateNestedSetting = (
    parentKey: keyof SiteSettings,
    childKey: string,
    value: any
  ) => {
    if (settings) {
      setSettings({
        ...settings,
        [parentKey]: {
          ...(settings[parentKey] as any),
          [childKey]: value,
        },
      });
    }
  };

  const updateTrustPoint = (index: number, value: string) => {
    if (settings) {
      const newPoints = [...settings.global_trust_points];
      newPoints[index] = value;
      setSettings({ ...settings, global_trust_points: newPoints });
    }
  };

  const addTrustPoint = () => {
    if (settings) {
      setSettings({
        ...settings,
        global_trust_points: [...settings.global_trust_points, 'New Trust Point'],
      });
    }
  };

  const removeTrustPoint = (index: number) => {
    if (settings) {
      const newPoints = settings.global_trust_points.filter((_, i) => i !== index);
      setSettings({ ...settings, global_trust_points: newPoints });
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

      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Site Settings</h1>
            <p className="text-gray-400">Customize your storefront content and rules</p>
            {lastSaved && (
              <p className="text-sm text-green-400 mt-1">
                Last saved: {lastSaved.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleForceRefresh}
              disabled={refreshing}
              className="px-4 py-3 bg-white/5 backdrop-blur-md text-white border-2 border-[#00A0E0]/50 rounded-lg font-semibold hover:bg-white/10 hover:border-[#00A0E0] transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-[#00A0E0] to-[#11D0FF] text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,160,224,0.5)] disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="h-5 w-5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-6">
              <Megaphone className="h-5 w-5 text-[#00A0E0]" />
              <h2 className="text-xl font-bold text-white">Hero Content</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.site_name}
                  onChange={(e) => updateSetting('site_name', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Hero Headline
                </label>
                <input
                  type="text"
                  value={settings.hero_headline}
                  onChange={(e) => updateSetting('hero_headline', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
                  placeholder="e.g., Premium Research Peptides"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Hero Subheadline
                </label>
                <textarea
                  value={settings.hero_subheadline}
                  onChange={(e) => updateSetting('hero_subheadline', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
                  rows={2}
                  placeholder="e.g., Quality-tested compounds with fast shipping"
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-6">
              <Megaphone className="h-5 w-5 text-[#00A0E0]" />
              <h2 className="text-xl font-bold text-white">Promotional Tiers</h2>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg p-4 border border-blue-500/30">
                <h3 className="text-white font-semibold mb-4">Tier 1 - Free Shipping</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Order Threshold ($)
                    </label>
                    <input
                      type="number"
                      value={settings.promo_tier_1.threshold}
                      onChange={(e) =>
                        updateNestedSetting('promo_tier_1', 'threshold', parseFloat(e.target.value))
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                      min="0"
                      step="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      value={settings.promo_tier_1.discount_percent}
                      onChange={(e) =>
                        updateNestedSetting('promo_tier_1', 'discount_percent', parseFloat(e.target.value))
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                      min="0"
                      max="100"
                      step="1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Display Label
                    </label>
                    <input
                      type="text"
                      value={settings.promo_tier_1.label}
                      onChange={(e) =>
                        updateNestedSetting('promo_tier_1', 'label', e.target.value)
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg p-4 border border-green-500/30">
                <h3 className="text-white font-semibold mb-4">Tier 2 - 15% Discount</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Order Threshold ($)
                    </label>
                    <input
                      type="number"
                      value={settings.promo_tier_2.threshold}
                      onChange={(e) =>
                        updateNestedSetting('promo_tier_2', 'threshold', parseFloat(e.target.value))
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                      min="0"
                      step="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      value={settings.promo_tier_2.discount_percent}
                      onChange={(e) =>
                        updateNestedSetting('promo_tier_2', 'discount_percent', parseFloat(e.target.value))
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                      min="0"
                      max="100"
                      step="1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Display Label
                    </label>
                    <input
                      type="text"
                      value={settings.promo_tier_2.label}
                      onChange={(e) =>
                        updateNestedSetting('promo_tier_2', 'label', e.target.value)
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg p-4 border border-purple-500/30">
                <h3 className="text-white font-semibold mb-4">Tier 3 - 20% Discount</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Order Threshold ($)
                    </label>
                    <input
                      type="number"
                      value={settings.promo_tier_3.threshold}
                      onChange={(e) =>
                        updateNestedSetting('promo_tier_3', 'threshold', parseFloat(e.target.value))
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                      min="0"
                      step="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      value={settings.promo_tier_3.discount_percent}
                      onChange={(e) =>
                        updateNestedSetting('promo_tier_3', 'discount_percent', parseFloat(e.target.value))
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                      min="0"
                      max="100"
                      step="1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Display Label
                    </label>
                    <input
                      type="text"
                      value={settings.promo_tier_3.label}
                      onChange={(e) =>
                        updateNestedSetting('promo_tier_3', 'label', e.target.value)
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-lg p-4 border border-amber-500/30">
                <h3 className="text-white font-semibold mb-4">Tier 4 - 25% Discount</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Order Threshold ($)
                    </label>
                    <input
                      type="number"
                      value={settings.promo_tier_4.threshold}
                      onChange={(e) =>
                        updateNestedSetting('promo_tier_4', 'threshold', parseFloat(e.target.value))
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                      min="0"
                      step="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      value={settings.promo_tier_4.discount_percent}
                      onChange={(e) =>
                        updateNestedSetting('promo_tier_4', 'discount_percent', parseFloat(e.target.value))
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                      min="0"
                      max="100"
                      step="1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Display Label
                    </label>
                    <input
                      type="text"
                      value={settings.promo_tier_4.label}
                      onChange={(e) =>
                        updateNestedSetting('promo_tier_4', 'label', e.target.value)
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-6">
              <Truck className="h-5 w-5 text-[#00A0E0]" />
              <h2 className="text-xl font-bold text-white">Shipping Rules</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Canada Flat Rate (under threshold)
                </label>
                <input
                  type="number"
                  value={settings.shipping_rules.canada_flat_under_300}
                  onChange={(e) =>
                    updateNestedSetting('shipping_rules', 'canada_flat_under_300', parseFloat(e.target.value))
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Quebec Flat Rate (under threshold)
                </label>
                <input
                  type="number"
                  value={settings.shipping_rules.quebec_flat_under_300}
                  onChange={(e) =>
                    updateNestedSetting('shipping_rules', 'quebec_flat_under_300', parseFloat(e.target.value))
                  }
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
                  value={settings.shipping_rules.free_shipping_canada_threshold}
                  onChange={(e) =>
                    updateNestedSetting('shipping_rules', 'free_shipping_canada_threshold', parseFloat(e.target.value))
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                  min="0"
                  step="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Free Shipping Threshold (International)
                </label>
                <input
                  type="number"
                  value={settings.shipping_rules.free_shipping_international_threshold}
                  onChange={(e) =>
                    updateNestedSetting('shipping_rules', 'free_shipping_international_threshold', parseFloat(e.target.value))
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                  min="0"
                  step="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  International Base Rate
                </label>
                <input
                  type="number"
                  value={settings.shipping_rules.international_base_rate}
                  onChange={(e) =>
                    updateNestedSetting('shipping_rules', 'international_base_rate', parseFloat(e.target.value))
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-6">
              <CreditCard className="h-5 w-5 text-[#00A0E0]" />
              <h2 className="text-xl font-bold text-white">Interac Instructions</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Interac Email
                </label>
                <input
                  type="email"
                  value={settings.interac_instructions.email}
                  onChange={(e) =>
                    updateNestedSetting('interac_instructions', 'email', e.target.value)
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Security Question
                </label>
                <input
                  type="text"
                  value={settings.interac_instructions.question}
                  onChange={(e) =>
                    updateNestedSetting('interac_instructions', 'question', e.target.value)
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Security Answer
                </label>
                <input
                  type="text"
                  value={settings.interac_instructions.answer}
                  onChange={(e) =>
                    updateNestedSetting('interac_instructions', 'answer', e.target.value)
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Payment Deadline (hours)
                </label>
                <input
                  type="number"
                  value={settings.interac_instructions.deadline_hours}
                  onChange={(e) =>
                    updateNestedSetting('interac_instructions', 'deadline_hours', parseInt(e.target.value))
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Additional Instructions
                </label>
                <textarea
                  value={settings.interac_instructions.instructions}
                  onChange={(e) =>
                    updateNestedSetting('interac_instructions', 'instructions', e.target.value)
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="h-5 w-5 text-[#00A0E0]" />
              <h2 className="text-xl font-bold text-white">Trust Points</h2>
            </div>

            <div className="space-y-3">
              {settings.global_trust_points.map((point, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-[#00A0E0] flex-shrink-0" />
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => updateTrustPoint(index, e.target.value)}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                  />
                  <button
                    onClick={() => removeTrustPoint(index)}
                    className="px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={addTrustPoint}
                className="w-full px-4 py-3 bg-[#00A0E0]/10 border border-[#00A0E0]/30 text-[#00A0E0] rounded-lg hover:bg-[#00A0E0]/20 transition-colors font-medium"
              >
                + Add Trust Point
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-6">
              <Mail className="h-5 w-5 text-[#00A0E0]" />
              <h2 className="text-xl font-bold text-white">Contact & Support</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Support Email
                </label>
                <input
                  type="email"
                  value={settings.support_email}
                  onChange={(e) => updateSetting('support_email', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={settings.contact_phone}
                  onChange={(e) => updateSetting('contact_phone', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                  placeholder="Optional"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Processing Time Text
                </label>
                <input
                  type="text"
                  value={settings.processing_time_text}
                  onChange={(e) => updateSetting('processing_time_text', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Free Shipping Badge Text
                </label>
                <input
                  type="text"
                  value={settings.free_shipping_badge_text}
                  onChange={(e) => updateSetting('free_shipping_badge_text', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bulk Discount Badge Text
                </label>
                <input
                  type="text"
                  value={settings.bulk_discount_badge_text}
                  onChange={(e) => updateSetting('bulk_discount_badge_text', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl border border-green-500/30">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-white font-semibold mb-2">Auto-Applied to Storefront</h3>
              <p className="text-gray-300 text-sm">
                All changes made here will automatically appear on your storefront after saving. The storefront
                caches settings for 5 minutes to improve performance. Use the "Refresh" button to reload
                the latest settings from the database.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
