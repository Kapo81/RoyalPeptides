import { supabase } from './supabase';

const ADMIN_SESSION_KEY = 'royal_admin_session';

interface LoginResponse {
  success: boolean;
  sessionToken?: string;
  expiresAt?: string;
  error?: string;
}

interface ValidateResponse {
  valid: boolean;
  username?: string;
}

export async function adminLogin(username: string, password: string): Promise<LoginResponse> {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-auth?action=login`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (data.success && data.sessionToken) {
      localStorage.setItem(ADMIN_SESSION_KEY, data.sessionToken);
      localStorage.setItem(ADMIN_SESSION_KEY + '_expires', data.expiresAt);
    }

    return data;
  } catch (error) {
    console.error('Admin login error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

export async function validateAdminSession(): Promise<boolean> {
  try {
    const sessionToken = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!sessionToken) return false;

    const expiresAt = localStorage.getItem(ADMIN_SESSION_KEY + '_expires');
    if (expiresAt && new Date(expiresAt) < new Date()) {
      clearAdminSession();
      return false;
    }

    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-auth?action=validate`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionToken }),
    });

    const data: ValidateResponse = await response.json();

    if (!data.valid) {
      clearAdminSession();
      return false;
    }

    return true;
  } catch (error) {
    console.error('Session validation error:', error);
    clearAdminSession();
    return false;
  }
}

export async function adminLogout(): Promise<void> {
  try {
    const sessionToken = localStorage.getItem(ADMIN_SESSION_KEY);
    if (sessionToken) {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-auth?action=logout`;

      await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionToken }),
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearAdminSession();
  }
}

export function clearAdminSession(): void {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  localStorage.removeItem(ADMIN_SESSION_KEY + '_expires');
  localStorage.removeItem('royal_admin_auth');
}

export function getAdminSession(): string | null {
  return localStorage.getItem(ADMIN_SESSION_KEY);
}
