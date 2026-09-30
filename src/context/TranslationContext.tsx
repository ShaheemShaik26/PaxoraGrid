import React, { createContext, useContext, useState, ReactNode } from 'react';
import { getTranslation, SupportedLanguage, SUPPORTED_LANGUAGES } from '../services/i18n';

export interface TranslationContextType {
  currentLanguage: SupportedLanguage;
  setCurrentLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

const VALID_LANGUAGE_CODES = new Set(SUPPORTED_LANGUAGES.map(l => l.code));

export const TranslationProvider: React.FC<{ children: ReactNode; initialLang?: SupportedLanguage }> = ({
  children,
  initialLang = 'en'
}) => {
  const [currentLanguage, setCurrentLanguageState] = useState<SupportedLanguage>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('paxora_lang') as SupportedLanguage;
        if (saved && VALID_LANGUAGE_CODES.has(saved)) {
          return saved;
        }
      }
    } catch {
      // Ignore localStorage access issues
    }
    return initialLang;
  });

  const setCurrentLanguage = (lang: SupportedLanguage) => {
    setCurrentLanguageState(lang);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('paxora_lang', lang);
      }
    } catch {
      // Ignore
    }
  };

  const t = (key: string): string => {
    return getTranslation(key, currentLanguage);
  };

  return (
    <TranslationContext.Provider value={{ currentLanguage, setCurrentLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
