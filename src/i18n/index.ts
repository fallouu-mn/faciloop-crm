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
import frSuperAdmin from './locales/fr/superAdmin.json';
import frLegal from './locales/fr/legal.json';

// English Locales
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enDashboard from './locales/en/dashboard.json';
import enLanding from './locales/en/landing.json';
import enSales from './locales/en/sales.json';
import enAdmin from './locales/en/admin.json';
import enClients from './locales/en/clients.json';
import enSuperAdmin from './locales/en/superAdmin.json';

// Wolof Locales
import woCommon from './locales/wo/common.json';
import woAuth from './locales/wo/auth.json';
import woDashboard from './locales/wo/dashboard.json';
import woLanding from './locales/wo/landing.json';
import woSales from './locales/wo/sales.json';
import woAdmin from './locales/wo/admin.json';
import woClients from './locales/wo/clients.json';
import woSuperAdmin from './locales/wo/superAdmin.json';
import woLegal from './locales/wo/legal.json';

export const NAMESPACES = [
  'common',
  'auth',
  'dashboard',
  'landing',
  'sales',
  'admin',
  'clients',
  'superAdmin',
  'legal',
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
    superAdmin: frSuperAdmin,
    legal: frLegal,
  },
  en: {
    common: enCommon,
    auth: enAuth,
    dashboard: enDashboard,
    landing: enLanding,
    sales: enSales,
    admin: enAdmin,
    clients: enClients,
    superAdmin: enSuperAdmin,
    legal: frLegal,
  },
  wo: {
    common: woCommon,
    auth: woAuth,
    dashboard: woDashboard,
    landing: woLanding,
    sales: woSales,
    admin: woAdmin,
    clients: woClients,
    superAdmin: woSuperAdmin,
    legal: woLegal,
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
    if (navLang.toLowerCase().startsWith('wo')) {
      return 'wo';
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
