import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface HeroProduct {
  id: string;
  name: string;
  price_cad: number;
  image_url: string | null;
  qty_in_stock: number | null;
  featured: boolean;
  created_at: string;
}

export function useHeroProducts() {
  const [products, setProducts] = useState<HeroProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchHeroProducts() {
      try {
        const { data, error: fetchError } = await supabase
          .from('products')
          .select('id, name, price_cad, image_url, qty_in_stock, featured, created_at')
          .or('featured.eq.true,qty_in_stock.gt.0')
          .not('image_url', 'is', null)
          .order('featured', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(8);

        if (fetchError) throw fetchError;

        if (mounted) {
          setProducts(data || []);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch products'));
          setProducts([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchHeroProducts();

    return () => {
      mounted = false;
    };
  }, []);

  return { products, loading, error };
}
