// lib/hooks/useTranslation.ts
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import en from '@/locales/en';
import es from '@/locales/es';

type Locale = 'en' | 'es';
type Translations = Record<string, string>;

// Default to Spanish if no locale is detected
const DEFAULT_LOCALE: Locale = 'es';

export function useTranslation() {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const pathname = usePathname();

  useEffect(() => {
    // Try to get locale from environment variable
    const envLocale = process.env.NEXT_PUBLIC_LANGUAGE as Locale || DEFAULT_LOCALE;
    
    // Or determine from browser settings
    const browserLocale = 
      typeof window !== 'undefined' && navigator.language.split('-')[0] as Locale;
    
    setLocale(envLocale || browserLocale || DEFAULT_LOCALE);
  }, []);

  const translations: Record<Locale, Translations> = {
    en,
    es,
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    // Get the translation for the current locale, fallback to the key itself
    let translation = translations[locale][key] || key;
    
    // Replace parameters if they exist
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(`{${paramKey}}`, String(paramValue));
      });
    }
    
    return translation;
  };

  // Function to change locale
  const changeLocale = (newLocale: Locale) => {
    if (newLocale !== locale && (newLocale === 'en' || newLocale === 'es')) {
      setLocale(newLocale);
      
      // You could also save the locale preference to localStorage here
      if (typeof window !== 'undefined') {
        localStorage.setItem('locale', newLocale);
      }
    }
  };

  return {
    t,
    locale,
    changeLocale,
  };
}