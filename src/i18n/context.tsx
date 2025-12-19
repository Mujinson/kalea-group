import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations } from './translations';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'kalea_language';
const IP_LANGUAGE_DETECTED_KEY = 'kalea_ip_language_detected';

// Map country codes to languages
const countryToLanguage: Record<string, Language> = {
  IT: 'it', // Italy
  DE: 'de', // Germany
  AT: 'de', // Austria
  CH: 'de', // Switzerland (German speaking majority)
  FR: 'fr', // France
  BE: 'fr', // Belgium (French speaking)
  MC: 'fr', // Monaco
  LU: 'fr', // Luxembourg
};

// Detect language from IP using free geolocation API
const detectLanguageFromIP = async (): Promise<Language> => {
  try {
    const response = await fetch('https://ipapi.co/json/', { 
      signal: AbortSignal.timeout(3000) 
    });
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();
    const countryCode = data.country_code;
    return countryToLanguage[countryCode] || 'en';
  } catch {
    // Fallback to browser language if IP detection fails
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('it')) return 'it';
    if (browserLang.startsWith('de')) return 'de';
    if (browserLang.startsWith('fr')) return 'fr';
    return 'en';
  }
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
    // Temporary default while we detect from IP
    return 'en';
  });

  const [initialized, setInitialized] = useState(false);

  // Detect language from IP on first visit
  useEffect(() => {
    const detectAndSetLanguage = async () => {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      const alreadyDetected = localStorage.getItem(IP_LANGUAGE_DETECTED_KEY);
      
      // Only auto-detect if never saved and never detected from IP before
      if (!saved && !alreadyDetected) {
        const detectedLang = await detectLanguageFromIP();
        setLanguageState(detectedLang);
        localStorage.setItem(IP_LANGUAGE_DETECTED_KEY, 'true');
        
        // Update URL with detected language
        const currentPath = window.location.pathname;
        const pathWithoutLang = currentPath.replace(/^\/(it|en|de|fr)/, '');
        const newPath = `/${detectedLang}${pathWithoutLang || '/'}`;
        window.history.replaceState({}, '', newPath);
      }
      setInitialized(true);
    };
    
    detectAndSetLanguage();
  }, []);

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
    if (!initialized) return;
    
    const currentPath = window.location.pathname;
    if (!currentPath.match(/^\/(it|en|de|fr)/)) {
      const newPath = `/${language}${currentPath}`;
      window.history.replaceState({}, '', newPath);
    }
  }, [initialized, language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};
