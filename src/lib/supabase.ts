import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Product {
  id: string;
  name: string;
  short_name: string;
  dosage: string;
  slug: string;
  description: string;
  benefits_summary: string | null;
  purity: string;
  storage: string;
  price: number;
  price_cad: number;
  selling_price: number | null;
  qty_in_stock: number | null;
  form: string | null;
  image_url: string | null;
  image_detail_url: string | null;
  featured: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  name_en: string;
  slug: string;
  description: string;
  created_at: string;
}

export interface ProductCategory {
  product_id: string;
  category_id: string;
}

export interface CartItem {
  id: string;
  session_id: string;
  product_id: string | null;
  quantity: number;
  created_at: string;
  updated_at: string;
  bundle_id: string | null;
  bundle_name: string | null;
  bundle_price: number | null;
  bundle_products: any[];
}

export function getSessionId(): string {
  let sessionId = localStorage.getItem('cart_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    localStorage.setItem('cart_session_id', sessionId);
  }
  return sessionId;
}
