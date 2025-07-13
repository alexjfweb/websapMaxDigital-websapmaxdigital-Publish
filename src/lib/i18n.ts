import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from '../../locales/en/translation.json';
import translationES from '../../locales/es/translation.json';

const resources = {
  en: { translation: translationEN },
  es: { translation: translationES }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es', // Idioma por defecto
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React ya escapa por defecto
    },
    react: {
      useSuspense: false // Importante para App Router
    }
  });

export default i18n; 