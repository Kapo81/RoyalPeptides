import { supabase } from './supabase';

const CACHE_TTL = 5 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: number;
}

interface VersionMap {
  products_version?: number;
  categories_version?: number;
  settings_version?: number;
  bundles_version?: number;
}

export class CacheManager {
  private static instance: CacheManager;

  private constructor() {}

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  private getCacheKey(key: string): string {
    return `rp_cache_${key}`;
  }

  private getVersionKey(key: string): string {
    return `rp_version_${key}`;
  }

  async getVersions(): Promise<VersionMap> {
    try {
      const { data, error } = await supabase.rpc('get_all_versions');

      if (error) {
        console.warn('[CacheManager] Failed to fetch versions:', error);
        return {};
      }

      return data || {};
    } catch (error) {
      console.warn('[CacheManager] Error fetching versions:', error);
      return {};
    }
  }

  async getVersion(versionKey: string): Promise<number | null> {
    try {
      const { data, error } = await supabase.rpc('get_data_version', { version_key: versionKey });

      if (error) {
        console.warn(`[CacheManager] Failed to fetch version for ${versionKey}:`, error);
        return null;
      }

      return data;
    } catch (error) {
      console.warn(`[CacheManager] Error fetching version for ${versionKey}:`, error);
      return null;
    }
  }

  async get<T>(key: string, versionKey: string): Promise<T | null> {
    try {
      const cacheKey = this.getCacheKey(key);
      const versionCacheKey = this.getVersionKey(key);
      const cachedData = localStorage.getItem(cacheKey);
      const cachedVersion = localStorage.getItem(versionCacheKey);

      if (!cachedData || !cachedVersion) {
        console.log(`[CacheManager] Cache miss for ${key} (no data)`);
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(cachedData);
      const now = Date.now();

      if (now - entry.timestamp > CACHE_TTL) {
        console.log(`[CacheManager] Cache expired for ${key} (TTL)`);
        this.clear(key);
        return null;
      }

      const currentVersion = await this.getVersion(versionKey);

      if (currentVersion === null || entry.version !== currentVersion) {
        console.log(`[CacheManager] Cache stale for ${key} (version mismatch: cached=${entry.version}, current=${currentVersion})`);
        this.clear(key);
        return null;
      }

      console.log(`[CacheManager] Cache hit for ${key} (version=${currentVersion})`);
      return entry.data;
    } catch (error) {
      console.warn(`[CacheManager] Error reading cache for ${key}:`, error);
      this.clear(key);
      return null;
    }
  }

  async set<T>(key: string, versionKey: string, data: T): Promise<void> {
    try {
      const currentVersion = await this.getVersion(versionKey);

      if (currentVersion === null) {
        console.warn(`[CacheManager] Could not get version for ${versionKey}, skipping cache`);
        return;
      }

      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        version: currentVersion,
      };

      const cacheKey = this.getCacheKey(key);
      const versionCacheKey = this.getVersionKey(key);

      localStorage.setItem(cacheKey, JSON.stringify(entry));
      localStorage.setItem(versionCacheKey, currentVersion.toString());

      console.log(`[CacheManager] Cached ${key} (version=${currentVersion})`);
    } catch (error) {
      console.warn(`[CacheManager] Error setting cache for ${key}:`, error);
    }
  }

  clear(key: string): void {
    try {
      const cacheKey = this.getCacheKey(key);
      const versionCacheKey = this.getVersionKey(key);

      localStorage.removeItem(cacheKey);
      localStorage.removeItem(versionCacheKey);

      console.log(`[CacheManager] Cleared cache for ${key}`);
    } catch (error) {
      console.warn(`[CacheManager] Error clearing cache for ${key}:`, error);
    }
  }

  clearAll(): void {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith('rp_cache_') || key.startsWith('rp_version_'));

      cacheKeys.forEach(key => localStorage.removeItem(key));

      console.log(`[CacheManager] Cleared all cache (${cacheKeys.length} entries)`);
    } catch (error) {
      console.warn('[CacheManager] Error clearing all cache:', error);
    }
  }

  async fetchWithCache<T>(
    key: string,
    versionKey: string,
    fetcher: () => Promise<T>
  ): Promise<T> {
    const cached = await this.get<T>(key, versionKey);

    if (cached !== null) {
      return cached;
    }

    console.log(`[CacheManager] Fetching fresh data for ${key}...`);
    const data = await fetcher();
    await this.set(key, versionKey, data);

    return data;
  }
}

export const cacheManager = CacheManager.getInstance();

export async function forceRefreshStorefront(): Promise<void> {
  try {
    console.log('[CacheManager] Force refreshing storefront data...');

    const { data, error } = await supabase.rpc('force_refresh_all');

    if (error) {
      console.error('[CacheManager] Failed to force refresh:', error);
      throw error;
    }

    cacheManager.clearAll();

    console.log('[CacheManager] Storefront data refreshed. New versions:', data);
  } catch (error) {
    console.error('[CacheManager] Error during force refresh:', error);
    throw error;
  }
}
