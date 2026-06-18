'use client';

import { create } from 'zustand';
import { type Language, getDirection } from '@/lib/i18n';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  direction: 'rtl' | 'ltr';
}

export const useLanguageStore = create<LanguageState>((set) => {
  // Try to read from localStorage on init
  let initialLang: Language = 'ar';
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('language');
      if (stored === 'ar' || stored === 'en') {
        initialLang = stored;
      }
    } catch {
      // SSR or blocked localStorage
    }
  }

  return {
    language: initialLang,
    direction: getDirection(initialLang),
    setLanguage: (lang: Language) => {
      // Persist to localStorage
      try {
        localStorage.setItem('language', lang);
      } catch {
        // Ignore
      }

      // Update document attributes
      if (typeof document !== 'undefined') {
        document.documentElement.dir = getDirection(lang);
        document.documentElement.lang = lang;
      }

      set({ language: lang, direction: getDirection(lang) });
    },
  };
});
