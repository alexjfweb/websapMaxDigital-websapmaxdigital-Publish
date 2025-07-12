
"use client";

import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { translations } from '@/translations'; 

export type Language = 'en' | 'es' | 'pt' | 'fr';

// Define a type for the variables that can be passed to the translation function
type TranslationVariables = { [key: string]: string | number };

interface LanguageContextType {
  language: Language;
  setLanguage: Dispatch<SetStateAction<Language>>;
  t: (key: string, variables?: TranslationVariables) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en'); // Default language

  const t = useCallback((key: string, variables?: TranslationVariables): string => {
    // Helper function to get a nested property from an object
    const getNestedTranslation = (lang: Language, keyToFind: string) => {
      const keys = keyToFind.split('.');
      let result: any = translations[lang];
      for (const k of keys) {
        result = result?.[k];
        if (result === undefined) {
          return undefined;
        }
      }
      return result;
    }

    let translation = getNestedTranslation(language, key);

    if (translation === undefined) {
      // Fallback to English if translation not found in current language
      translation = getNestedTranslation('en', key);
    }
    
    // If still not found, return the key itself as a last resort
    if (translation === undefined || typeof translation !== 'string') {
      return key;
    }

    // Replace variables if any
    if (variables) {
      Object.keys(variables).forEach((varKey) => {
        const regex = new RegExp(`{${varKey}}`, 'g');
        translation = (translation as string).replace(regex, String(variables[varKey]));
      });
    }

    return translation;
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
