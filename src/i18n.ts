import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import English translations
import enNavigation from './languages/EN/navigation.json';
import enDashboard from './languages/EN/dashboard.json';
import enCalendar from './languages/EN/calendar.json';
import enAppointment from './languages/EN/appointment.json';
import enSettings from './languages/EN/settings.json';
import enCommon from './languages/EN/common.json';
import enMessages from './languages/EN/messages.json';

// Import Bulgarian translations
import bgNavigation from './languages/BG/navigation.json';
import bgDashboard from './languages/BG/dashboard.json';
import bgCalendar from './languages/BG/calendar.json';
import bgAppointment from './languages/BG/appointment.json';
import bgSettings from './languages/BG/settings.json';
import bgCommon from './languages/BG/common.json';
import bgMessages from './languages/BG/messages.json';

// Merge English translations
const en = {
  nav: enNavigation,
  dashboard: enDashboard,
  calendar: enCalendar,
  appointment: enAppointment,
  settings: enSettings,
  table: enCommon,
  status: {
    completed: enCommon.statusCompleted,
    waiting: enCommon.statusWaiting,
    confirmed: enCommon.statusConfirmed,
    cancelled: enCommon.statusCancelled,
    noShow: enCommon.statusNoShow
  },
  common: enCommon,
  messages: enMessages
};

// Merge Bulgarian translations
const bg = {
  nav: bgNavigation,
  dashboard: bgDashboard,
  calendar: bgCalendar,
  appointment: bgAppointment,
  settings: bgSettings,
  table: bgCommon,
  status: {
    completed: bgCommon.statusCompleted,
    waiting: bgCommon.statusWaiting,
    confirmed: bgCommon.statusConfirmed,
    cancelled: bgCommon.statusCancelled,
    noShow: bgCommon.statusNoShow
  },
  common: bgCommon,
  messages: bgMessages
};

i18next
  .use(LanguageDetector)
  .init({
    fallbackLng: 'bg',
    defaultNS: 'translation',
    resources: {
      en: { translation: en },
      bg: { translation: bg }
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18next;
