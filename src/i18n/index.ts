import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enCommon from './locales/en/common.json'
import enNav from './locales/en/nav.json'
import enAuth from './locales/en/auth.json'
import enDashboard from './locales/en/dashboard.json'
import enInventory from './locales/en/inventory.json'
import enLeads from './locales/en/leads.json'
import enDeals from './locales/en/deals.json'
import enCustomers from './locales/en/customers.json'
import enAbout from './locales/en/about.json'
import enProcess from './locales/en/process.json'

import thCommon from './locales/th/common.json'
import thNav from './locales/th/nav.json'
import thAuth from './locales/th/auth.json'
import thDashboard from './locales/th/dashboard.json'
import thInventory from './locales/th/inventory.json'
import thLeads from './locales/th/leads.json'
import thDeals from './locales/th/deals.json'
import thCustomers from './locales/th/customers.json'
import thAbout from './locales/th/about.json'
import thProcess from './locales/th/process.json'

import viCommon from './locales/vi/common.json'
import viNav from './locales/vi/nav.json'
import viAuth from './locales/vi/auth.json'
import viDashboard from './locales/vi/dashboard.json'
import viInventory from './locales/vi/inventory.json'
import viLeads from './locales/vi/leads.json'
import viDeals from './locales/vi/deals.json'
import viCustomers from './locales/vi/customers.json'
import viAbout from './locales/vi/about.json'
import viProcess from './locales/vi/process.json'

const STORAGE_KEY = 'dms-lang'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon as Record<string, string>,
        nav: enNav as Record<string, string>,
        auth: enAuth as Record<string, string>,
        dashboard: enDashboard as Record<string, string>,
        inventory: enInventory as Record<string, string>,
        leads: enLeads as Record<string, string>,
        deals: enDeals as Record<string, string>,
        customers: enCustomers as Record<string, string>,
        about: enAbout as Record<string, string>,
        process: enProcess as Record<string, string>,
      },
      th: {
        common: thCommon as Record<string, string>,
        nav: thNav as Record<string, string>,
        auth: thAuth as Record<string, string>,
        dashboard: thDashboard as Record<string, string>,
        inventory: thInventory as Record<string, string>,
        leads: thLeads as Record<string, string>,
        deals: thDeals as Record<string, string>,
        customers: thCustomers as Record<string, string>,
        about: thAbout as Record<string, string>,
        process: thProcess as Record<string, string>,
      },
      vi: {
        common: viCommon as Record<string, string>,
        nav: viNav as Record<string, string>,
        auth: viAuth as Record<string, string>,
        dashboard: viDashboard as Record<string, string>,
        inventory: viInventory as Record<string, string>,
        leads: viLeads as Record<string, string>,
        deals: viDeals as Record<string, string>,
        customers: viCustomers as Record<string, string>,
        about: viAbout as Record<string, string>,
        process: viProcess as Record<string, string>,
      },
    },
    fallbackLng: 'en',
    lng: typeof localStorage !== 'undefined' ? (localStorage.getItem(STORAGE_KEY) || 'vi') : 'vi',
    supportedLngs: ['en', 'th', 'vi'],
    defaultNS: 'common',
    ns: ['common', 'nav', 'auth', 'dashboard', 'inventory', 'leads', 'deals', 'customers', 'about', 'process'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: STORAGE_KEY,
      caches: ['localStorage'],
    },
  })

export const LANG_STORAGE_KEY = STORAGE_KEY
export default i18n
