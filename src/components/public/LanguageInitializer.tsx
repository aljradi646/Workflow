'use client';

import { useEffect } from 'react';
import { useLanguageStore } from '@/store/language-store';

/**
 * This component initializes the language state and syncs
 * the document's `dir` and `lang` attributes with the store.
 * It must be rendered inside ThemeProvider so it has access to
 * client-side hooks.
 */
export function LanguageInitializer() {
  const { language, direction } = useLanguageStore();

  useEffect(() => {
    // Set initial document attributes
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
  }, [language, direction]);

  // This component renders nothing
  return null;
}
