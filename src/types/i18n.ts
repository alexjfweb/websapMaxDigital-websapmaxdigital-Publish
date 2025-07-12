export type Language = 'en' | 'es' | 'pt' | 'fr';

export type TranslationVariables = { [key: string]: string | number };

export type Translations = {
  [key: string]: string | { [key: string]: string | { [key: string]: string | string[] } };
};
