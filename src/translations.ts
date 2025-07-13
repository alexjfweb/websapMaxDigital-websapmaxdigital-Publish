import esTranslations from '../locales/es/translation.json';
import enTranslations from '../locales/en/translation.json';

export const translations = {
  es: esTranslations,
  en: enTranslations,
} as const;

export type Language = keyof typeof translations;
export type Translations = typeof translations; 