'use client';

import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSiteStore } from '@/store/site-store';
import { useLanguageStore } from '@/store/language-store';
import { getTranslations } from '@/lib/i18n';

/** Section labels from i18n */
const sectionLabelKeys: Record<string, string> = {
  hero: 'hero',
  about: 'about',
  skills: 'skills',
  projects: 'projects',
  services: 'services',
  testimonials: 'testimonials',
  experience: 'experience',
  education: 'education',
  faq: 'faq',
  contact: 'contact',
  blog: 'blog',
};

export function SectionProgressBar() {
  const { siteData, activeSection } = useSiteStore();
  const { language } = useLanguageStore();
  const t = getTranslations(language);
  const [sectionProgress, setSectionProgress] = useState<Record<string, number>>({});
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const sections = useMemo(
    () => siteData?.sections?.filter((s) => s.isVisible) ?? [],
    [siteData?.sections],
  );

  // Track per-section scroll progress
  useEffect(() => {
    const handleScroll = () => {
      if (!sections.length) return;

      const viewportBottom = window.scrollY + window.innerHeight;
      const progressMap: Record<string, number> = {};

      sections.forEach((section) => {
        const el = document.getElementById(section.type);
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const sectionTop = rect.top + window.scrollY;
        const sectionHeight = el.offsetHeight;

        // Calculate how much of the section has been scrolled through
        const scrolledInto = viewportBottom - sectionTop;
        const progress = Math.max(0, Math.min(1, scrolledInto / sectionHeight));
        progressMap[section.type] = progress;
      });

      setSectionProgress(progressMap);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollToSection = useCallback((sectionType: string) => {
    const el = document.getElementById(sectionType);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const getSectionLabel = useCallback(
    (sectionType: string, sectionTitle: string | null) => {
      const key = sectionLabelKeys[sectionType];
      if (key && t.sections[key as keyof typeof t.sections]) {
        return t.sections[key as keyof typeof t.sections];
      }
      return sectionTitle ?? sectionType;
    },
    [t],
  );

  // Keyboard navigation (Tab + Enter)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, sectionType: string) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        scrollToSection(sectionType);
      }
    },
    [scrollToSection],
  );

  // Don't render on empty or while loading
  if (!sections.length) return null;

  const isRTL = language === 'ar';

  return (
    <nav
      ref={navRef}
      aria-label={language === 'ar' ? 'شريط تقدم الأقسام' : 'Section progress bar'}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col items-center gap-0"
    >
      {/* Vertical thin line behind dots */}
      <div className="absolute top-0 bottom-0 right-[7px] w-[2px] bg-border/40 rounded-full" />

      {sections.map((section) => {
        const isActive = activeSection === section.type;
        const progress = sectionProgress[section.type] ?? 0;
        const label = getSectionLabel(section.type, section.title);

        // Mini progress ring parameters
        const dotSize = isActive ? 24 : 20;
        const ringRadius = (dotSize - 4) / 2;
        const circumference = 2 * Math.PI * ringRadius;
        const strokeDashoffset = circumference - progress * circumference;

        return (
          <div
            key={section.id}
            className="relative flex items-center group"
            style={{ marginBottom: '0px' }}
            onMouseEnter={() => setHoveredSection(section.type)}
            onMouseLeave={() => setHoveredSection(null)}
          >
            {/* Label tooltip on hover */}
            <AnimatePresence>
              {hoveredSection === section.type && (
                <motion.div
                  initial={{ opacity: 0, x: isRTL ? -8 : 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRTL ? -8 : 8 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute whitespace-nowrap px-2.5 py-1 rounded-md glass-card-sm text-xs font-medium text-foreground pointer-events-none shadow-md ${
                    isRTL ? 'left-6' : 'right-6'
                  }`}
                >
                  {label}
                  {progress > 0 && progress < 1 && (
                    <span className="ml-1 text-emerald-500 tabular-nums">
                      {Math.round(progress * 100)}%
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dot with progress ring */}
            <button
              onClick={() => scrollToSection(section.type)}
              onKeyDown={(e) => handleKeyDown(e, section.type)}
              aria-label={`${isRTL ? 'الانتقال إلى قسم' : 'Go to section'} ${label}${progress > 0 ? ` (${Math.round(progress * 100)}%)` : ''}`}
              className="relative z-10 flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
              style={{ width: dotSize, height: dotSize }}
            >
              {/* Active ring pulse */}
              {isActive && (
                <motion.span
                  layoutId="section-progress-ring"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)',
                  }}
                  animate={{
                    scale: [1, 1.6, 1],
                    opacity: [0.6, 0, 0.6],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}

              {/* SVG mini progress ring */}
              <svg
                className="absolute inset-0"
                width={dotSize}
                height={dotSize}
                style={{ transform: 'rotate(-90deg)' }}
              >
                {/* Background ring */}
                <circle
                  cx={dotSize / 2}
                  cy={dotSize / 2}
                  r={ringRadius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-border/30"
                />
                {/* Progress ring */}
                {progress > 0 && progress < 1 && (
                  <circle
                    cx={dotSize / 2}
                    cy={dotSize / 2}
                    r={ringRadius}
                    fill="none"
                    stroke="url(#sectionProgressGradient)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-150"
                  />
                )}
                {/* Completed ring */}
                {progress >= 1 && (
                  <circle
                    cx={dotSize / 2}
                    cy={dotSize / 2}
                    r={ringRadius}
                    fill="none"
                    stroke="url(#sectionProgressGradient)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={0}
                  />
                )}
                <defs>
                  <linearGradient id="sectionProgressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#14b8a6" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Inner dot */}
              <motion.span
                layoutId="section-progress-dot"
                className="block rounded-full relative"
                animate={{
                  width: isActive ? 8 : 6,
                  height: isActive ? 8 : 6,
                  background: progress >= 1
                    ? 'linear-gradient(135deg, #10b981, #14b8a6)'
                    : isActive
                      ? 'linear-gradient(135deg, #10b981, #14b8a6)'
                      : 'rgba(120,120,120,0.3)',
                }}
                transition={{
                  type: 'spring',
                  stiffness: 350,
                  damping: 25,
                }}
              />
            </button>
          </div>
        );
      })}
    </nav>
  );
}
