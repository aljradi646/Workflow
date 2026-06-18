'use client';

import { useEffect, useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSiteStore } from '@/store/site-store';
import { useLanguageStore } from '@/store/language-store';
import { getTranslations } from '@/lib/i18n';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { SectionRenderer } from '@/components/public/SectionRenderer';
import { ScrollToTop } from '@/components/public/ScrollToTop';
import { MobileBottomNav } from '@/components/public/MobileBottomNav';
import { LoadingSpinner } from '@/components/public/LoadingSpinner';
import { CustomCursor } from '@/components/public/CustomCursor';
import { SectionProgressBar } from '@/components/public/SectionProgressBar';
import { PageTransition } from '@/components/public/PageTransition';
import { VisitorCounter } from '@/components/public/VisitorCounter';
import { DynamicSEO } from '@/components/public/DynamicSEO';
import { JsonLd } from '@/components/public/JsonLd';
import { ServiceWorkerRegistration } from '@/components/public/ServiceWorkerRegistration';
import { SafeComponent } from '@/components/public/SafeComponent';

// Dynamic imports for client-only / heavy components (ssr: false)
const ThreeBackground = dynamic(
  () => import('@/components/public/ThreeBackground').then(mod => ({ default: mod.ThreeBackground })),
  { ssr: false }
);

const ChatWidget = dynamic(
  () => import('@/components/public/ChatWidget').then(mod => ({ default: mod.ChatWidget })),
  { ssr: false }
);

const ThemeCustomizer = dynamic(
  () => import('@/components/public/ThemeCustomizer').then(mod => ({ default: mod.ThemeCustomizer })),
  { ssr: false }
);

const ResumeViewer = dynamic(
  () => import('@/components/public/ResumeViewer').then(mod => ({ default: mod.ResumeViewer })),
  { ssr: false }
);

const CookieConsent = dynamic(
  () => import('@/components/public/CookieConsent').then(mod => ({ default: mod.CookieConsent })),
  { ssr: false }
);

const KeyboardShortcutsPanel = dynamic(
  () => import('@/components/public/KeyboardShortcutsPanel').then(mod => ({ default: mod.KeyboardShortcutsPanel })),
  { ssr: false }
);

const CommandPalette = dynamic(
  () => import('@/components/public/CommandPalette').then(mod => ({ default: mod.CommandPalette })),
  { ssr: false }
);

const AnalyticsWidget = dynamic(
  () => import('@/components/public/AnalyticsWidget').then(mod => ({ default: mod.AnalyticsWidget })),
  { ssr: false }
);

export default function Home() {
  const { siteData, loading, error, fetchSiteData, setActiveSection } = useSiteStore();
  const sections = siteData?.sections;
  const [resumeOpen, setResumeOpen] = useState(false);
  const { language } = useLanguageStore();
  const t = getTranslations(language);

  const handleViewResume = useCallback(() => {
    setResumeOpen(true);
  }, []);

  // Public site data fetch
  useEffect(() => {
    fetchSiteData();
  }, [fetchSiteData]);

  // Active section tracking on scroll
  const handleScroll = useCallback(() => {
    if (!sections) return;

    const scrollPos = window.scrollY + 200;

    for (let i = sections.length - 1; i >= 0; i--) {
      const sectionEl = document.getElementById(sections[i].type);
      if (sectionEl && sectionEl.offsetTop <= scrollPos) {
        setActiveSection(sections[i].type);
        break;
      }
    }
  }, [sections, setActiveSection]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Loading state
  if (loading) {
    return <LoadingSpinner />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="text-6xl mb-4">😵</div>
        <h2 className="text-2xl font-bold">{t.misc.error}</h2>
        <p className="text-muted-foreground max-w-md">{error}</p>
        <button
          onClick={() => fetchSiteData()}
          className="mt-4 px-6 py-3 rounded-lg gradient-emerald text-white font-medium shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
        >
          {t.misc.retry}
        </button>
      </div>
    );
  }

  // No data
  if (!siteData?.sections || siteData.sections.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="text-6xl mb-4">🚧</div>
        <h2 className="text-2xl font-bold">{t.misc.underConstruction}</h2>
        <p className="text-muted-foreground">{t.misc.underConstructionMsg}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative dark-noise overflow-x-hidden">
      {/* Accessibility Skip Link */}
      <a
        href="#main-content"
        className="skip-to-content"
      >
        {t.accessibility.skipToContent}
      </a>

      {/* Custom Cursor - desktop only */}
      <SafeComponent name="CustomCursor">
        <CustomCursor />
      </SafeComponent>

      {/* Dynamic SEO meta tags */}
      <DynamicSEO />

      {/* JSON-LD Structured Data for SEO */}
      <JsonLd />

      {/* 3D Background */}
      <SafeComponent name="ThreeBackground">
        <ThreeBackground />
      </SafeComponent>

      {/* Header */}
      <Header />

      {/* Section Progress Bar (desktop only) */}
      <SectionProgressBar />

      {/* Main Content with Page Transition */}
      <PageTransition>
      <div id="main-content" className="flex-1 relative z-10 pb-16 md:pb-0">
      <main role="main">
        {siteData.sections.map((section, index) => (
          <SectionRenderer
            key={section.id}
            section={section}
            sectionIndex={index}
            totalSections={siteData.sections.length}
            onViewResume={handleViewResume}
          />
        ))}
      </main>
      </div>
      </PageTransition>

      {/* Footer */}
      <Footer />

      {/* Scroll to Top */}
      <ScrollToTop />

      {/* Visitor Counter */}
      <VisitorCounter />

      {/* Mobile Bottom Nav */}
      <MobileBottomNav />

      {/* Keyboard Shortcuts Panel */}
      <KeyboardShortcutsPanel />

      {/* Command Palette */}
      <CommandPalette />

      {/* Cookie Consent Banner */}
      <CookieConsent />

      {/* AI Chat Widget */}
      <SafeComponent name="ChatWidget">
        <ChatWidget />
      </SafeComponent>

      {/* Resume Viewer */}
      <ResumeViewer open={resumeOpen} onOpenChange={setResumeOpen} />

      {/* Theme Customizer */}
      <SafeComponent name="ThemeCustomizer">
        <ThemeCustomizer />
      </SafeComponent>

      {/* Analytics Widget */}
      <SafeComponent name="AnalyticsWidget">
        <AnalyticsWidget />
      </SafeComponent>

      {/* PWA Service Worker Registration */}
      <ServiceWorkerRegistration />
    </div>
  );
}
