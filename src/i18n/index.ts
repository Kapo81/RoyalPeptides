import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import frCA from './locales/fr-CA.json';
import en from './locales/en.json';

const resources = {
  'fr-CA': {
    translation: frCA,
  },
  en: {
    translation: en,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr-CA',
    supportedLngs: ['fr-CA', 'en'],
    lng: 'fr-CA',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'lang',
    },
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  localStorage.setItem('lang', lng);
});

const initialLang = localStorage.getItem('lang') || 'fr-CA';
if (initialLang) {
  i18n.changeLanguage(initialLang);
  document.documentElement.lang = initialLang;
}

export default i18n;
