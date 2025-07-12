
"use client";

import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { translations } from '@/translations'; 
import type { Language, TranslationVariables } from '@/types/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: Dispatch<SetStateAction<Language>>;
  t: (key: string, variables?: TranslationVariables) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = useCallback((key: string, variables?: TranslationVariables): string => {
    // Helper function to safely access nested properties
    const getNestedTranslation = (lang: Language, keyToFind: string): string | undefined => {
      const keys = keyToFind.split('.');
      let result: any = translations[lang];
      for (const k of keys) {
        if (result === undefined) return undefined;
        result = result[k];
      }
      return result;
    };

    let translation = getNestedTranslation(language, key);

    // Fallback to English if translation is not found in the current language
    if (translation === undefined) {
      translation = getNestedTranslation('en', key);
    }
    
    // Return the key itself if no translation is found anywhere
    if (translation === undefined || typeof translation !== 'string') {
      return key;
    }

    // Replace variables if any
    if (variables) {
      Object.keys(variables).forEach((varKey) => {
        const regex = new RegExp(`{${varKey}}`, 'g');
        translation = translation.replace(regex, String(variables[varKey]));
      });
    }

    return translation;
  }, [language]);

  const value = useMemo(() => {
      const setLanguageAndStore = (newLang: Language | ((prevState: Language) => Language)) => {
        const lang = typeof newLang === 'function' ? newLang(language) : newLang;
        localStorage.setItem('language', lang);
        setLanguage(lang);
      };
      return { language, setLanguage: setLanguageAndStore, t };
  }, [language, t]);

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
