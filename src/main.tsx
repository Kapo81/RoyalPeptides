import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n';
import App from './App.tsx';
import './index.css';
import { LanguageProvider } from './contexts/LanguageContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { SiteSettingsProvider } from './contexts/SiteSettingsContext';

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
