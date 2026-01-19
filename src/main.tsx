import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n';
import App from './App.tsx';
import './index.css';
import { LanguageProvider } from './contexts/LanguageContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { SiteSettingsProvider } from './contexts/SiteSettingsContext';

if (import.meta.env.DEV) {
  window.addEventListener('error', (event) => {
    console.error('🔴 GLOBAL ERROR CAUGHT:', {
      route: window.location.pathname,
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
      stack: event.error?.stack,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('🔴 UNHANDLED PROMISE REJECTION:', {
      route: window.location.pathname,
      reason: event.reason,
      promise: event.promise,
    });
  });

  console.log('🔍 Dev crash logger enabled');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <AdminAuthProvider>
        <SiteSettingsProvider>
          <App />
        </SiteSettingsProvider>
      </AdminAuthProvider>
    </LanguageProvider>
  </StrictMode>
);
