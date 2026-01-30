import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import bg from './locales/bg.json';

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
