import { supabase, getSessionId } from './supabase';

export type AnalyticsEventType =
  | 'page_view'
  | 'product_click'
  | 'product_view'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'checkout_start'
  | 'order_complete';

interface AnalyticsEvent {
  eventType: AnalyticsEventType;
  productId?: string;
  productName?: string;
  pagePath?: string;
  metadata?: Record<string, any>;
}

function getBrowserFingerprint(): string {
  const nav = navigator;
  const screen = window.screen;
  const fingerprint = [
    nav.userAgent,
    nav.language,
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
  ].join('|');

  return btoa(fingerprint).substring(0, 32);
}

export function getAnalyticsSessionId(): string {
  const storageKey = 'analytics_session_id';
  let sessionId = sessionStorage.getItem(storageKey);

  if (!sessionId) {
    sessionId = `${Date.now()}_${getBrowserFingerprint()}_${Math.random().toString(36).substring(2, 11)}`;
    sessionStorage.setItem(storageKey, sessionId);
  }

  return sessionId;
}

async function trackEvent(event: AnalyticsEvent): Promise<void> {
  try {
    const sessionId = getAnalyticsSessionId();

    await supabase.from('analytics_events').insert({
      event_type: event.eventType,
      session_id: sessionId,
      product_id: event.productId || null,
      product_name: event.productName || null,
      page_path: event.pagePath || window.location.pathname,
      metadata: event.metadata || {},
      user_agent: navigator.userAgent,
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
}

export function trackPageView(pagePath?: string): void {
  trackEvent({
    eventType: 'page_view',
    pagePath: pagePath || window.location.pathname,
  });
}

export function trackProductClick(productId: string, productName: string): void {
  trackEvent({
    eventType: 'product_click',
    productId,
    productName,
  });
}

export function trackProductView(productId: string, productName: string): void {
  trackEvent({
    eventType: 'product_view',
    productId,
    productName,
  });
}

export function trackAddToCart(productId: string, productName: string, quantity: number = 1): void {
  trackEvent({
    eventType: 'add_to_cart',
    productId,
    productName,
    metadata: { quantity },
  });
}

export function trackRemoveFromCart(productId: string, productName: string): void {
  trackEvent({
    eventType: 'remove_from_cart',
    productId,
    productName,
  });
}

export function trackCheckoutStart(cartTotal: number, itemCount: number): void {
  trackEvent({
    eventType: 'checkout_start',
    metadata: { cartTotal, itemCount },
  });
}

export function trackOrderComplete(orderId: string, orderTotal: number, itemCount: number): void {
  trackEvent({
    eventType: 'order_complete',
    metadata: { orderId, orderTotal, itemCount },
  });
}

export interface AnalyticsSummary {
  total_visits: number;
  total_page_views: number;
  product_clicks: number;
  add_to_cart_events: number;
  checkout_starts: number;
  orders_completed: number;
  conversion_rate: number;
  top_products: Array<{
    product_name: string;
    clicks: number;
  }> | null;
}

export async function getAnalyticsSummary(daysBack: number = 30): Promise<AnalyticsSummary> {
  console.log('[AdminAnalytics] Fetching analytics summary for', daysBack, 'days');

  try {
    const { data, error } = await supabase.rpc('get_analytics_summary', { days_back: daysBack });

    if (error) {
      console.error('[AdminAnalytics] RPC error:', error);
      throw new Error(`Failed to fetch analytics: ${error.message}`);
    }

    console.log('[AdminAnalytics] Raw RPC response:', data);

    if (!data) {
      console.warn('[AdminAnalytics] No data returned from RPC');
      return {
        total_visits: 0,
        total_page_views: 0,
        product_clicks: 0,
        add_to_cart_events: 0,
        checkout_starts: 0,
        orders_completed: 0,
        conversion_rate: 0,
        top_products: null,
      };
    }

    const summary = data as AnalyticsSummary;
    console.log('[AdminAnalytics] Parsed summary:', summary);
    return summary;
  } catch (error: any) {
    console.error('[AdminAnalytics] Error fetching analytics summary:', error);
    throw error;
  }
}
