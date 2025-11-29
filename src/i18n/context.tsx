import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations } from './translations';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'kalea_language';

// Detect browser language
const detectBrowserLanguage = (): Language => {
  const browserLang = navigator.language.toLowerCase();
  
  if (browserLang.startsWith('it')) return 'it';
  if (browserLang.startsWith('de')) return 'de';
  if (browserLang.startsWith('fr')) return 'fr';
  if (browserLang.startsWith('en')) return 'en';
  
  // Default to English for rest of the world
  return 'en';
};

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Check localStorage first
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && ['it', 'en', 'de', 'fr'].includes(saved)) {
      return saved as Language;
    }
    
    // Auto-detect on first visit
    return detectBrowserLanguage();
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    
    // Update URL with language prefix
    const currentPath = window.location.pathname;
    const pathWithoutLang = currentPath.replace(/^\/(it|en|de|fr)/, '');
    const newPath = `/${lang}${pathWithoutLang || '/'}`;
    window.history.pushState({}, '', newPath);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key;
    }
    
    return typeof value === 'string' ? value : key;
  };

  // Set initial URL with language prefix on mount
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (!currentPath.match(/^\/(it|en|de|fr)/)) {
      const newPath = `/${language}${currentPath}`;
      window.history.replaceState({}, '', newPath);
    }
  }, []);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};
