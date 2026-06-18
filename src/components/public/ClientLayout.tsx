'use client';

import { useLanguageStore } from '@/store/language-store';
import { getTranslations } from '@/lib/i18n';
import { Toaster } from '@/components/ui/sonner';

/**
 * Client-side layout component that renders language-dependent UI elements
 * like the Toaster (with correct dir) and accessibility skip link.
 */
export function ClientLayout() {
  const { language } = useLanguageStore();
  const t = getTranslations(language);
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <>
      {/* Skip to main content - accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:gradient-emerald focus:text-white focus:shadow-lg focus:outline-none"
      >
        {t.accessibility.skipToContent}
      </a>
      <Toaster
        position="top-center"
        richColors
        closeButton
        dir={dir}
      />
    </>
  );
}
