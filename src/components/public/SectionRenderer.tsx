'use client';

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, useInView } from 'framer-motion';
import { type Section } from '@/store/site-store';
import { useLanguageStore } from '@/store/language-store';
import { localizeSection } from '@/lib/localize';
import { SectionTransition, getTransitionStyle } from './SectionTransition';
import { ParallaxWrapper } from './ParallaxWrapper';

// ============================================
// Section Skeleton Components (Enhanced with shimmer + stagger)
// ============================================

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`skeleton-shimmer skeleton-pulse ${className}`} />;
}

function BaseSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`skeleton-stagger ${className}`}>
      <SkeletonBlock className="h-6 rounded-lg w-1/3 mb-4" />
      <SkeletonBlock className="h-4 rounded-lg w-2/3 mb-2" />
      <SkeletonBlock className="h-4 rounded-lg w-1/2" />
    </div>
  );
}

function HeroSkeleton() {
  return (
    <section className="min-h-[80vh] flex items-center justify-center section-padding">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center skeleton-stagger">
        <SkeletonBlock className="skeleton-badge h-5 rounded-full w-32 mx-auto mb-6" />
        <SkeletonBlock className="skeleton-heading h-14 rounded-xl w-3/4 mx-auto mb-4" />
        <SkeletonBlock className="skeleton-text-lg h-10 rounded-xl w-1/2 mx-auto mb-8" />
        <SkeletonBlock className="skeleton-text-md h-5 rounded-lg w-2/3 mx-auto mb-10" />
        <div className="flex gap-4 justify-center">
          <SkeletonBlock className="h-12 w-36 rounded-xl" />
          <SkeletonBlock className="h-12 w-36 rounded-xl" />
        </div>
        <div className="flex gap-8 justify-center mt-12">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="text-center">
              <SkeletonBlock className="h-8 w-12 rounded-lg mx-auto mb-2" />
              <SkeletonBlock className="skeleton-text-sm h-3 w-16 rounded mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutSkeleton() {
  return (
    <section className="section-padding">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 skeleton-stagger">
        <div className="flex flex-col md:flex-row gap-10 items-center">
          <SkeletonBlock className="skeleton-image w-64 h-64 rounded-2xl shrink-0" />
          <div className="flex-1">
            <SkeletonBlock className="skeleton-heading h-8 rounded-lg w-1/3 mb-4" />
            <SkeletonBlock className="skeleton-text-md h-4 rounded-lg w-full mb-2" />
            <SkeletonBlock className="skeleton-text-md h-4 rounded-lg w-5/6 mb-2" />
            <SkeletonBlock className="skeleton-text-md h-4 rounded-lg w-3/4 mb-6" />
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <SkeletonBlock key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SkillsSkeleton() {
  return (
    <section className="section-padding">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 skeleton-stagger">
        <div className="text-center mb-10">
          <SkeletonBlock className="skeleton-heading h-8 rounded-lg w-40 mx-auto mb-3" />
          <SkeletonBlock className="skeleton-text-md h-4 rounded-lg w-64 mx-auto" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectsSkeleton() {
  return (
    <section className="section-padding">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 skeleton-stagger">
        <div className="text-center mb-10">
          <SkeletonBlock className="skeleton-heading h-8 rounded-lg w-40 mx-auto mb-3" />
          <SkeletonBlock className="skeleton-text-md h-4 rounded-lg w-64 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden">
              <SkeletonBlock className="skeleton-image h-48" />
              <div className="p-4 space-y-3">
                <SkeletonBlock className="skeleton-text-lg h-5 rounded-lg w-3/4" />
                <SkeletonBlock className="skeleton-text-sm h-3 rounded-lg w-full" />
                <SkeletonBlock className="skeleton-text-sm h-3 rounded-lg w-2/3" />
                <div className="flex gap-2 mt-2">
                  <SkeletonBlock className="skeleton-badge h-6 w-16 rounded-full" />
                  <SkeletonBlock className="skeleton-badge h-6 w-16 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesSkeleton() {
  return (
    <section className="section-padding">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 skeleton-stagger">
        <div className="text-center mb-10">
          <SkeletonBlock className="skeleton-heading h-8 rounded-lg w-40 mx-auto mb-3" />
          <SkeletonBlock className="skeleton-text-md h-4 rounded-lg w-64 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-6 rounded-xl space-y-4">
              <SkeletonBlock className="w-12 h-12 rounded-lg" />
              <SkeletonBlock className="skeleton-text-lg h-5 rounded-lg w-2/3" />
              <SkeletonBlock className="skeleton-text-sm h-3 rounded-lg w-full" />
              <SkeletonBlock className="skeleton-text-sm h-3 rounded-lg w-4/5" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSkeleton() {
  return (
    <section className="section-padding">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 skeleton-stagger">
        <div className="text-center mb-10">
          <SkeletonBlock className="skeleton-heading h-8 rounded-lg w-48 mx-auto mb-3" />
          <SkeletonBlock className="skeleton-text-md h-4 rounded-lg w-64 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-6 rounded-xl space-y-3">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, j) => (
                  <SkeletonBlock key={j} className="w-4 h-4 rounded" />
                ))}
              </div>
              <SkeletonBlock className="skeleton-text-sm h-3 rounded-lg w-full" />
              <SkeletonBlock className="skeleton-text-sm h-3 rounded-lg w-5/6" />
              <div className="flex items-center gap-3 mt-4">
                <SkeletonBlock className="skeleton-avatar" />
                <div>
                  <SkeletonBlock className="skeleton-text-md h-4 rounded-lg w-24 mb-1" />
                  <SkeletonBlock className="skeleton-text-sm h-3 rounded-lg w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExperienceSkeleton() {
  return (
    <section className="section-padding">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 skeleton-stagger">
        <div className="text-center mb-10">
          <SkeletonBlock className="skeleton-heading h-8 rounded-lg w-48 mx-auto mb-3" />
          <SkeletonBlock className="skeleton-text-md h-4 rounded-lg w-64 mx-auto" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          {/* Timeline line */}
          <div className="absolute start-1/2 top-0 bottom-0 w-0.5 bg-muted/20 -translate-x-1/2" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-6 mb-10 relative">
              <div className="flex-1">
                {i % 2 === 0 ? (
                  <div className="p-4 rounded-xl space-y-2">
                    <SkeletonBlock className="skeleton-text-lg h-5 rounded-lg w-3/4" />
                    <SkeletonBlock className="skeleton-text-sm h-3 rounded-lg w-1/2" />
                    <SkeletonBlock className="skeleton-text-sm h-3 rounded-lg w-full" />
                  </div>
                ) : (
                  <div />
                )}
              </div>
              <SkeletonBlock className="skeleton-circle w-4 h-4 shrink-0 mt-2 z-10" />
              <div className="flex-1">
                {i % 2 !== 0 ? (
                  <div className="p-4 rounded-xl space-y-2">
                    <SkeletonBlock className="skeleton-text-lg h-5 rounded-lg w-3/4" />
                    <SkeletonBlock className="skeleton-text-sm h-3 rounded-lg w-1/2" />
                    <SkeletonBlock className="skeleton-text-sm h-3 rounded-lg w-full" />
                  </div>
                ) : (
                  <div />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EducationSkeleton() {
  return (
    <section className="section-padding">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 skeleton-stagger">
        <div className="text-center mb-10">
          <SkeletonBlock className="skeleton-heading h-8 rounded-lg w-40 mx-auto mb-3" />
          <SkeletonBlock className="skeleton-text-md h-4 rounded-lg w-64 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-5 rounded-xl space-y-3">
              <SkeletonBlock className="w-10 h-10 rounded-lg" />
              <SkeletonBlock className="skeleton-text-lg h-5 rounded-lg w-3/4" />
              <SkeletonBlock className="skeleton-text-sm h-3 rounded-lg w-1/2" />
              <SkeletonBlock className="skeleton-text-sm h-3 rounded-lg w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSkeleton() {
  return (
    <section className="section-padding">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 skeleton-stagger">
        <div className="text-center mb-10">
          <SkeletonBlock className="skeleton-heading h-8 rounded-lg w-32 mx-auto mb-3" />
          <SkeletonBlock className="skeleton-text-md h-4 rounded-lg w-64 mx-auto" />
        </div>
        <div className="max-w-2xl mx-auto space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSkeleton() {
  return (
    <section className="section-padding">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 skeleton-stagger">
        <div className="text-center mb-10">
          <SkeletonBlock className="skeleton-heading h-8 rounded-lg w-40 mx-auto mb-3" />
          <SkeletonBlock className="skeleton-text-md h-4 rounded-lg w-64 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <SkeletonBlock className="skeleton-text-sm h-4 rounded-lg w-24 mb-2" />
                <SkeletonBlock className="h-10 rounded-lg w-full" />
              </div>
            ))}
            <SkeletonBlock className="h-10 rounded-lg w-32" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
                <SkeletonBlock className="skeleton-circle w-10 h-10" />
                <div className="flex-1">
                  <SkeletonBlock className="skeleton-text-sm h-3 rounded-lg w-20 mb-1" />
                  <SkeletonBlock className="skeleton-text-md h-4 rounded-lg w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BlogSkeleton() {
  return (
    <section className="section-padding">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 skeleton-stagger">
        <div className="text-center mb-10">
          <SkeletonBlock className="skeleton-heading h-8 rounded-lg w-40 mx-auto mb-3" />
          <SkeletonBlock className="skeleton-text-md h-4 rounded-lg w-64 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden">
              <SkeletonBlock className="skeleton-image h-40" />
              <div className="p-4 space-y-3">
                <SkeletonBlock className="skeleton-text-lg h-5 rounded-lg w-3/4" />
                <SkeletonBlock className="skeleton-text-sm h-3 rounded-lg w-full" />
                <SkeletonBlock className="skeleton-text-sm h-3 rounded-lg w-2/3" />
                <div className="flex items-center gap-2 mt-2">
                  <SkeletonBlock className="skeleton-text-sm h-3 rounded-lg w-20" />
                  <SkeletonBlock className="skeleton-text-sm h-3 rounded-lg w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Map section types to their skeleton components
const sectionSkeletons: Record<string, React.ComponentType> = {
  hero: HeroSkeleton,
  about: AboutSkeleton,
  skills: SkillsSkeleton,
  projects: ProjectsSkeleton,
  services: ServicesSkeleton,
  testimonials: TestimonialsSkeleton,
  experience: ExperienceSkeleton,
  education: EducationSkeleton,
  faq: FAQSkeleton,
  contact: ContactSkeleton,
  blog: BlogSkeleton,
};

function SectionSkeleton({ type }: { type: string }) {
  const Skeleton = sectionSkeletons[type] || BaseSkeleton;
  return <Skeleton />;
}

// ============================================
// Dynamic Imports for Section Components
// ============================================

const DynamicHeroSection = dynamic(
  () => import('./HeroSection').then(mod => ({ default: mod.HeroSection })),
  { ssr: true, loading: () => <SectionSkeleton type="hero" /> }
);

const DynamicAboutSection = dynamic(
  () => import('./AboutSection').then(mod => ({ default: mod.AboutSection })),
  { ssr: true, loading: () => <SectionSkeleton type="about" /> }
);

const DynamicSkillsSection = dynamic(
  () => import('./SkillsSection').then(mod => ({ default: mod.SkillsSection })),
  { ssr: true, loading: () => <SectionSkeleton type="skills" /> }
);

const DynamicProjectsSection = dynamic(
  () => import('./ProjectsSection').then(mod => ({ default: mod.ProjectsSection })),
  { ssr: true, loading: () => <SectionSkeleton type="projects" /> }
);

const DynamicServicesSection = dynamic(
  () => import('./ServicesSection').then(mod => ({ default: mod.ServicesSection })),
  { ssr: true, loading: () => <SectionSkeleton type="services" /> }
);

const DynamicTestimonialsSection = dynamic(
  () => import('./TestimonialsSection').then(mod => ({ default: mod.TestimonialsSection })),
  { ssr: true, loading: () => <SectionSkeleton type="testimonials" /> }
);

const DynamicExperienceSection = dynamic(
  () => import('./ExperienceSection').then(mod => ({ default: mod.ExperienceSection })),
  { ssr: true, loading: () => <SectionSkeleton type="experience" /> }
);

const DynamicEducationSection = dynamic(
  () => import('./EducationSection').then(mod => ({ default: mod.EducationSection })),
  { ssr: true, loading: () => <SectionSkeleton type="education" /> }
);

const DynamicFAQSection = dynamic(
  () => import('./FAQSection').then(mod => ({ default: mod.FAQSection })),
  { ssr: true, loading: () => <SectionSkeleton type="faq" /> }
);

const DynamicContactSection = dynamic(
  () => import('./ContactSection').then(mod => ({ default: mod.ContactSection })),
  { ssr: true, loading: () => <SectionSkeleton type="contact" /> }
);

const DynamicBlogSection = dynamic(
  () => import('./BlogSection').then(mod => ({ default: mod.BlogSection })),
  { ssr: true, loading: () => <SectionSkeleton type="blog" /> }
);

// Map section types to dynamically imported components
const sectionComponents: Record<string, React.ComponentType<{ section: Section; onViewResume?: () => void }>> = {
  hero: DynamicHeroSection,
  about: DynamicAboutSection,
  skills: DynamicSkillsSection,
  projects: DynamicProjectsSection,
  services: DynamicServicesSection,
  testimonials: DynamicTestimonialsSection,
  experience: DynamicExperienceSection,
  education: DynamicEducationSection,
  faq: DynamicFAQSection,
  contact: DynamicContactSection,
  blog: DynamicBlogSection,
};

// Animation variants based on section animation field
const animationVariants: Record<string, {
  initial: { opacity: number; x?: number; y?: number; scale?: number; };
  animate: { opacity: number; x?: number; y?: number; scale?: number; };
}> = {
  fade: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
  slide: {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
  },
  zoom: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
  },
  flip: {
    initial: { opacity: 0, rotateY: 10 },
    animate: { opacity: 1, rotateY: 0 },
  },
  rotate: {
    initial: { opacity: 0, rotate: -3, scale: 0.98 },
    animate: { opacity: 1, rotate: 0, scale: 1 },
  },
  bounce: {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
  },
};

// Sections that get parallax effect
const parallaxSections = new Set(['hero', 'about', 'testimonials']);

// Parallax speed per section
const parallaxSpeeds: Record<string, number> = {
  hero: 0.1,
  about: 0.15,
  testimonials: 0.2,
};

function SectionWrapper({ children, section }: { children: React.ReactNode; section: Section }) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const animationType = section.animation || 'fade';
  const variant = animationVariants[animationType] || animationVariants.fade;

  return (
    <motion.div
      ref={ref}
      initial={variant.initial}
      animate={isInView ? variant.animate : variant.initial}
      transition={{
        duration: 0.7,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  );
}

export function SectionRenderer({ section, sectionIndex, totalSections, onViewResume }: SectionRendererProps) {
  const Component = sectionComponents[section.type];
  const { language } = useLanguageStore();

  // Determine transition style for this section's bottom divider
  const transitionStyle = getTransitionStyle(sectionIndex);
  const showTransition = sectionIndex < totalSections - 1;
  const isHero = section.type === 'hero';

  // Localize the fallback section data
  const localizedFallback = localizeSection(section, language);

  // Render the section content, potentially wrapped in ParallaxWrapper
  const renderSectionContent = () => {
    if (!Component) {
      // Fallback for unknown section types
      return (
        <SectionWrapper section={section}>
          <section id={section.type} className="section-padding">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold mb-4">{localizedFallback.title}</h2>
              {localizedFallback.subtitle && (
                <p className="text-lg text-muted-foreground mb-8">{localizedFallback.subtitle}</p>
              )}
              {localizedFallback.description && (
                <p className="text-muted-foreground">{localizedFallback.description}</p>
              )}
            </div>
          </section>
        </SectionWrapper>
      );
    }

    // Hero section doesn't need extra wrapping animation (it has its own)
    if (isHero) {
      return <Component section={section} onViewResume={onViewResume} />;
    }

    const content = (
      <SectionWrapper section={section}>
        <Component section={section} />
      </SectionWrapper>
    );

    // Wrap certain sections with ParallaxWrapper
    if (parallaxSections.has(section.type)) {
      return (
        <ParallaxWrapper speed={parallaxSpeeds[section.type] || 0.15}>
          {content}
        </ParallaxWrapper>
      );
    }

    return content;
  };

  return (
    <div data-layout={section.layout || 'default'} className="relative">
      {/* Morphing blob backgrounds for visual richness */}
      {section.type !== 'hero' && sectionIndex % 3 === 1 && (
        <>
          <div className="blob-bg blob-bg-1 -top-20 -left-20 opacity-50" />
          <div className="blob-bg blob-bg-2 -bottom-16 -right-16 opacity-40" />
        </>
      )}

      {renderSectionContent()}

      {/* Section transition divider */}
      {showTransition && !isHero && (
        <SectionTransition
          style={transitionStyle}
          flip={sectionIndex % 2 === 1}
        />
      )}
    </div>
  );
}

interface SectionRendererProps {
  section: Section;
  sectionIndex: number;
  totalSections: number;
  onViewResume?: () => void;
}
