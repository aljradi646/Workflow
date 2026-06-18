'use client';

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { type Section, type SectionItem } from '@/store/site-store';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useLanguageStore } from '@/store/language-store';
import { getTranslations } from '@/lib/i18n';
import { localizeSection, localizeSectionItem } from '@/lib/localize';
import {
  Quote,
  Star,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Columns3,
  Sparkles,
} from 'lucide-react';

interface TestimonialsSectionProps {
  section: Section;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          whileHover={{ scale: 1.2 }}
          className={i < rating ? 'drop-shadow-[0_0_4px_rgba(251,191,36,0.4)]' : ''}
        >
          <Star
            className={`w-4 h-4 transition-colors ${
              i < rating
                ? 'text-amber-400 fill-amber-400'
                : 'text-muted-foreground/30'
            }`
            }
          />
        </motion.div>
      ))}
    </div>
  );
}

function TestimonialCard({ item, index, isInView }: { item: SectionItem; index: number; isInView: boolean }) {
  const rating = item.rating || 5;
  const initial = item.title?.charAt(0) || '?';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative"
    >
      <div className="relative glass-card rounded-2xl p-6 h-full transition-all duration-500 hover:-translate-y-2 hover:shadow-lg hover:shadow-emerald-500/10 overflow-hidden">
        {/* Gradient border on hover */}
        <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-transparent via-transparent to-transparent group-hover:from-emerald-500/50 group-hover:via-teal-500/50 group-hover:to-emerald-500/50 transition-all duration-500 opacity-0 group-hover:opacity-100 pointer-events-none">
          <div className="w-full h-full rounded-2xl bg-card" />
        </div>

        {/* Quote icon watermark */}
        <div className="absolute top-2 right-2 opacity-[0.04] pointer-events-none rotate-12">
          <Quote className="w-24 h-24 text-primary" />
        </div>

        <div className="relative z-10 space-y-4">
          {/* Avatar with gradient ring */}
          <div className="flex items-center gap-3">
            <div className="rounded-full p-[2px] bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-400">
              <Avatar className="w-12 h-12 border-2 border-background">
                <AvatarFallback className="gradient-emerald text-white text-sm font-bold">
                  {initial}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">{item.title}</p>
              {item.subtitle && (
                <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
              )}
            </div>
          </div>

          {/* Star Rating */}
          <StarRating rating={rating} />

          {/* Quote Text */}
          <blockquote className="text-sm leading-relaxed text-foreground/80 relative">
            &ldquo;{item.description}&rdquo;
          </blockquote>
        </div>
      </div>
    </motion.div>
  );
}

export function TestimonialsSection({ section }: TestimonialsSectionProps) {
  const { language } = useLanguageStore();
  const t = getTranslations(language);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');
  const [autoplayProgress, setAutoplayProgress] = useState(0);

  const localizedSection = localizeSection(section, language);

  // Create localized items
  const items = useMemo(() =>
    section.items.map((item) => {
      const localized = localizeSectionItem(item, language);
      return { ...item, title: localized.title, subtitle: localized.subtitle, description: localized.description };
    }),
  [section.items, language]);
  const config = (() => {
    try { return JSON.parse(section.config || '{}'); } catch { return {}; }
  })();
  const autoplay = config.autoplay !== false;
  const autoplayDuration = 5000;

  // Autoplay with progress
  useEffect(() => {
    if (!autoplay || items.length <= 1 || viewMode !== 'carousel') return;
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setAutoplayProgress(Math.min((elapsed / autoplayDuration) * 100, 100));
    }, 50);
    const timer = setTimeout(() => {
      setDirection(1);
      requestAnimationFrame(() => setAutoplayProgress(0));
      setCurrent((prev) => (prev + 1) % items.length);
    }, autoplayDuration);
    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [current, items.length, autoplay, viewMode]);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const currentItem = items[current];
  if (!currentItem) return null;

  const prevItem = items.length > 1 ? items[(current - 1 + items.length) % items.length] : null;
  const nextItem = items.length > 1 ? items[(current + 1) % items.length] : null;

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="section-padding relative overflow-hidden bg-mesh"
    >
      {/* Decorative quote watermark in background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.02]">
        <Quote className="w-80 h-80 text-primary" />
      </div>
      <div className="absolute bottom-1/4 right-[10%] pointer-events-none opacity-[0.015] rotate-12">
        <Quote className="w-40 h-40 text-primary" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with sparkle badge */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card-sm text-xs font-medium text-primary mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.testimonials.badge}</span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-shimmer-heading">{localizedSection.title}</h2>
          {localizedSection.subtitle && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {localizedSection.subtitle}
            </p>
          )}

          {/* View Toggle */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setViewMode('carousel')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                viewMode === 'carousel'
                  ? 'gradient-emerald text-white shadow-md shadow-emerald-500/20'
                  : 'glass-card-sm text-muted-foreground hover:text-primary'
              }`}
              aria-label={t.testimonials.carouselView}
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>{t.testimonials.carouselView}</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                viewMode === 'grid'
                  ? 'gradient-emerald text-white shadow-md shadow-emerald-500/20'
                  : 'glass-card-sm text-muted-foreground hover:text-primary'
              }`}
              aria-label={t.testimonials.gridView}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{t.testimonials.gridView}</span>
            </button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            /* ===== GRID VIEW ===== */
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-fade"
            >
              {items.map((item, index) => (
                <TestimonialCard
                  key={item.id}
                  item={item}
                  index={index}
                  isInView={isInView}
                />
              ))}
            </motion.div>
          ) : (
            /* ===== CAROUSEL VIEW ===== */
            <motion.div
              key="carousel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-4xl mx-auto"
            >
              <div className="relative">
                {/* Carousel with peek preview */}
                <div className="relative flex items-center justify-center min-h-[320px]">
                  {/* Previous preview */}
                  {prevItem && items.length > 2 && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[60%] w-[280px] opacity-20 pointer-events-none hidden md:block">
                      <div className="glass-card rounded-2xl p-6 blur-[1px]">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full gradient-emerald flex items-center justify-center text-white text-xs font-bold">
                              {prevItem.title?.charAt(0) || '?'}
                            </div>
                            <p className="text-sm font-bold truncate">{prevItem.title}</p>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{prevItem.description}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Next preview */}
                  {nextItem && items.length > 2 && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[60%] w-[280px] opacity-20 pointer-events-none hidden md:block">
                      <div className="glass-card rounded-2xl p-6 blur-[1px]">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full gradient-emerald flex items-center justify-center text-white text-xs font-bold">
                              {nextItem.title?.charAt(0) || '?'}
                            </div>
                            <p className="text-sm font-bold truncate">{nextItem.title}</p>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{nextItem.description}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Main Card */}
                  <div className="w-full max-w-2xl mx-auto">
                    <AnimatePresence mode="wait" custom={direction}>
                      <motion.div
                        key={current}
                        custom={direction}
                        initial={{ opacity: 0, x: direction * 120, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: direction * -120, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 25, mass: 0.8 }}
                      >
                        <div className="group relative gradient-border-animated">
                          {/* Animated gradient border - enhanced */}
                          <div className="absolute -inset-[1.5px] rounded-2xl bg-gradient-to-r from-emerald-500/60 via-teal-500/60 to-emerald-500/60 opacity-70 animate-gradient-rotate blur-[0.5px]" />
                          <div className="relative glass-card-lg rounded-2xl p-8 sm:p-12 text-center overflow-hidden">
                            {/* Quote Icon Watermark - enhanced */}
                            <div className="absolute top-4 right-4 opacity-[0.08] rotate-12 pointer-events-none">
                              <Quote className="w-28 h-28 text-primary" />
                            </div>
                            <div className="absolute bottom-4 left-4 opacity-[0.04] -rotate-12 pointer-events-none">
                              <Quote className="w-16 h-16 text-primary" />
                            </div>

                            <div className="space-y-6 relative z-10">
                              {/* Avatar with gradient ring */}
                              <div className="mx-auto w-fit">
                                <div className="rounded-full p-[2px] bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-400 animate-gradient-rotate">
                                  <Avatar className="w-20 h-20 border-2 border-background">
                                    <AvatarFallback className="gradient-emerald text-white text-xl font-bold">
                                      {currentItem.title?.charAt(0) || '?'}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>
                              </div>

                              {/* Rating */}
                              <div className="flex justify-center">
                                <StarRating rating={currentItem.rating || 5} />
                              </div>

                              {/* Quote */}
                              <blockquote className="text-lg sm:text-xl leading-relaxed text-foreground/85 max-w-xl mx-auto italic">
                                &ldquo;{currentItem.description}&rdquo;
                              </blockquote>

                              {/* Author */}
                              <div>
                                <p className="font-bold text-lg">{currentItem.title}</p>
                                {currentItem.subtitle && (
                                  <p className="text-sm text-muted-foreground mt-1">{currentItem.subtitle}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Navigation Controls */}
                {items.length > 1 && (
                  <div className="mt-8 space-y-4">
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={prev}
                        className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-accent transition-colors group"
                        aria-label={t.testimonials.previous}
                      >
                        <ChevronRight className="w-5 h-5 group-hover:text-primary transition-colors" />
                      </button>

                      {/* Dots */}
                      <div className="flex gap-2">
                        {items.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setDirection(i > current ? 1 : -1);
                              setCurrent(i);
                            }}
                            className={`h-2 rounded-full transition-all duration-300 ${
                              i === current
                                ? 'gradient-emerald w-8'
                                : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                            }`}
                            aria-label={`${t.testimonials.testimonial} ${i + 1}`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={next}
                        className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-accent transition-colors group"
                        aria-label={t.testimonials.next}
                      >
                        <ChevronLeft className="w-5 h-5 group-hover:text-primary transition-colors" />
                      </button>
                    </div>

                    {/* Auto-progress bar */}
                    {autoplay && (
                      <div className="max-w-xs mx-auto">
                        <div className="h-1 rounded-full bg-muted/30 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full gradient-emerald"
                            initial={{ width: '0%' }}
                            animate={{ width: `${autoplayProgress}%` }}
                            transition={{ duration: 0.05, ease: 'linear' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
