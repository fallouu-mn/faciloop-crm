import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import fr from './locales/fr.json';
import en from './locales/en.json';

const resources = {
  fr: { translation: fr },
  en: { translation: en }
};

const getInitialLanguage = (): string => {
  const saved = localStorage.getItem('i18nextLng');
  if (saved) return saved;

  if (typeof window !== 'undefined' && window.navigator) {
    const navLang = window.navigator.language || (window.navigator as any).userLanguage || '';
    if (navLang.toLowerCase().startsWith('en')) {
      return 'en';
    }
  }

  return 'fr';
};

const initialLang = getInitialLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLang,
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
