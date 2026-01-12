import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

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

interface SiteSettingsContextType {
  settings: SiteSettings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  lastFetched: Date | null;
}

const defaultSettings: SiteSettings = {
  hero_headline: 'Premium Research Peptides for Canadian Researchers',
  hero_subheadline: 'Quality-tested compounds with fast, discreet shipping across Canada',
  promo_tier_1: {
    threshold: 300,
    discount_percent: 0,
    free_shipping_canada: true,
    label: 'Free Shipping on Orders $300+',
  },
  promo_tier_2: {
    threshold: 500,
    discount_percent: 15,
    free_shipping_canada: true,
    label: '15% OFF + Free Shipping on Orders $500+',
  },
  promo_tier_3: {
    threshold: 750,
    discount_percent: 20,
    free_shipping_canada: true,
    label: '20% OFF + Free Shipping on Orders $750+',
  },
  promo_tier_4: {
    threshold: 1000,
    discount_percent: 25,
    free_shipping_canada: true,
    label: '25% OFF + Free Shipping on Orders $1000+',
  },
  shipping_rules: {
    canada_flat_under_300: 25,
    quebec_flat_under_300: 20,
    free_shipping_canada_threshold: 300,
    free_shipping_international_threshold: 500,
    international_base_rate: 20,
  },
  interac_instructions: {
    email: 'payments@royalpeptides.ca',
    question: 'Order Number?',
    answer: 'Your order number will be provided after checkout',
    deadline_hours: 24,
    instructions: 'Send Interac e-Transfer to the email provided. Use your order number as the security answer.',
  },
  global_trust_points: [
    'Quality-Tested Research Compounds',
    'Fast Canada-Wide Shipping',
    'Discreet Packaging',
    'Secure Payment Options',
    'Responsive Customer Support',
  ],
  support_email: 'support@royalpeptides.ca',
  processing_time_text: 'Orders ship within 24 business hours',
  site_name: 'Royal Peptides Canada',
  contact_phone: '',
  free_shipping_badge_text: 'Free Shipping $300+',
  bulk_discount_badge_text: 'Bulk Discounts Available',
};

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

const CACHE_DURATION = 5 * 60 * 1000;

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchSettings = async (force: boolean = false) => {
    if (!force && lastFetched && Date.now() - lastFetched.getTime() < CACHE_DURATION) {
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.from('site_settings').select('*');

      if (!error && data) {
        const settingsObj: any = { ...defaultSettings };
        data.forEach((row) => {
          settingsObj[row.key] = row.value;
        });
        setSettings(settingsObj);
        setLastFetched(new Date());
      }
    } catch (error) {
      console.error('Error fetching site settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = async () => {
    await fetchSettings(true);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refreshSettings, lastFetched }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
}
