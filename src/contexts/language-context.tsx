
"use client";

import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
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
    const getNestedTranslation = (lang: Language, keyToFind: string): string | undefined => {
      const keys = keyToFind.split('.');
      let result: any = translations[lang];
      for (const k of keys) {
        result = result?.[k];
        if (result === undefined) return undefined;
      }
      return result;
    };

    let translation = getNestedTranslation(language, key);

    if (translation === undefined) {
      translation = getNestedTranslation('en', key);
    }
    
    if (translation === undefined || typeof translation !== 'string') {
      return key;
    }

    if (variables) {
      Object.keys(variables).forEach((varKey) => {
        const regex = new RegExp(`{${varKey}}`, 'g');
        translation = translation.replace(regex, String(variables[varKey]));
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
