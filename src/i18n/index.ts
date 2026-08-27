import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// French Locales (Loaded by default for Offline-First capability)
import frCommon from './locales/fr/common.json';
import frAuth from './locales/fr/auth.json';
import frDashboard from './locales/fr/dashboard.json';
import frLanding from './locales/fr/landing.json';
import frSales from './locales/fr/sales.json';
import frAdmin from './locales/fr/admin.json';
import frClients from './locales/fr/clients.json';

// English Locales
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enDashboard from './locales/en/dashboard.json';
import enLanding from './locales/en/landing.json';
import enSales from './locales/en/sales.json';
import enAdmin from './locales/en/admin.json';
import enClients from './locales/en/clients.json';

export const NAMESPACES = [
  'common',
  'auth',
  'dashboard',
  'landing',
  'sales',
  'admin',
  'clients',
] as const;

const resources = {
  fr: {
    common: frCommon,
    auth: frAuth,
    dashboard: frDashboard,
    landing: frLanding,
    sales: frSales,
    admin: frAdmin,
    clients: frClients,
  },
  en: {
    common: enCommon,
    auth: enAuth,
    dashboard: enDashboard,
    landing: enLanding,
    sales: enSales,
    admin: enAdmin,
    clients: enClients,
  },
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
    defaultNS: 'common',
    ns: NAMESPACES,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
