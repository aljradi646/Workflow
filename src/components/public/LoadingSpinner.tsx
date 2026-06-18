'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguageStore } from '@/store/language-store';
import { getTranslations } from '@/lib/i18n';

interface SkeletonSectionProps {
  delay: number;
  label: string;
  children: React.ReactNode;
}

function SkeletonSection({ delay, label, children }: SkeletonSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="space-y-4"
    >
      {/* Section label */}
      <motion.div
        className="flex items-center gap-2 mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.2 }}
      >
        <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
        <span className="text-xs text-emerald-500/50 font-medium">{label}</span>
      </motion.div>
      {children}
    </motion.div>
  );
}

// Shimmer wrapper
function ShimmerSkeleton({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-lg ${className || ''}`}>
      <Skeleton className="w-full h-full absolute inset-0" />
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

export function LoadingSpinner() {
  const [progress, setProgress] = useState(0);
  const { language } = useLanguageStore();
  const t = getTranslations(language);
  const isArabic = language === 'ar';
  const [loadingText, setLoadingText] = useState(t.loading.loadingContent);

  // Simulate progress bar
  useEffect(() => {
    let frame: number;
    let start: number;
    const duration = 2500;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const raw = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - raw, 2);
      setProgress(Math.min(eased * 90, 90));
      if (raw < 1) {
        frame = requestAnimationFrame(animate);
      }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Cycle loading text
  const loadingTexts = [t.loading.loadingContent, t.loading.preparingPlatform, t.misc.loading];
  useEffect(() => {
    const texts = loadingTexts;
    let index = 1;
    const interval = setInterval(() => {
      index = index % texts.length;
      setLoadingText(texts[index]);
      index++;
    }, 1500);
    return () => clearInterval(interval);
  }, [loadingTexts, t.loading.loadingContent, t.loading.preparingPlatform, t.misc.loading]);

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Animated gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/3 rounded-full blur-3xl" />
      </div>

      {/* Progress bar at top */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-border/30">
        <motion.div
          className="h-full gradient-emerald"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      {/* Header Skeleton */}
      <div className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center gap-2">
          <ShimmerSkeleton className="w-9 h-9" />
          <ShimmerSkeleton className="w-24 h-5 hidden sm:block" />
        </div>
        <div className="flex items-center gap-2">
          <ShimmerSkeleton className="w-8 h-8" />
          <ShimmerSkeleton className="w-8 h-8 md:hidden" />
          <div className="hidden md:flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <ShimmerSkeleton key={i} className="w-16 h-4" />
            ))}
          </div>
        </div>
      </div>

      {/* Hero Skeleton */}
      <div className="flex-1 flex flex-col items-center justify-center section-padding relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
          {/* Pulsing initials logo */}
          <motion.div
            className="relative"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.div
              className="absolute -inset-4 rounded-full border-2 border-emerald-500/20"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute -inset-8 rounded-full border border-emerald-500/10"
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            />
            <div className="w-24 h-24 rounded-full gradient-emerald flex items-center justify-center shadow-xl shadow-emerald-500/20">
              <motion.span
                className="text-3xl font-bold text-white"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                أم
              </motion.span>
            </div>
          </motion.div>

          <ShimmerSkeleton className="w-32 h-8 rounded-full" />

          <div className="space-y-3 w-full max-w-lg">
            <ShimmerSkeleton className="w-80 h-12 mx-auto" />
            <ShimmerSkeleton className="w-60 h-8 mx-auto" />
          </div>

          <div className="space-y-2 w-full max-w-xl">
            <ShimmerSkeleton className="w-full h-4" />
            <ShimmerSkeleton className="w-3/4 h-4 mx-auto" />
          </div>

          <div className="flex gap-4">
            <ShimmerSkeleton className="w-36 h-12" />
            <ShimmerSkeleton className="w-36 h-12" />
          </div>
        </div>
      </div>

      {/* Staggered skeleton sections */}
      <div className="container mx-auto px-4 pb-16 relative z-10 space-y-12">
        {/* About skeleton */}
        <SkeletonSection delay={0.3} label={t.loading.aboutSection}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <ShimmerSkeleton className="w-3/4 h-5" />
              <ShimmerSkeleton className="w-full h-4" />
              <ShimmerSkeleton className="w-full h-4" />
              <ShimmerSkeleton className="w-2/3 h-4" />
            </div>
            <ShimmerSkeleton className="w-full h-48" />
          </div>
        </SkeletonSection>

        {/* Skills skeleton */}
        <SkeletonSection delay={0.5} label={t.loading.skillsSection}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="space-y-2 flex flex-col items-center">
                <ShimmerSkeleton className="w-12 h-12 rounded-xl" />
                <ShimmerSkeleton className="w-16 h-3" />
                <ShimmerSkeleton className="w-full h-1.5 rounded-full" />
              </div>
            ))}
          </div>
        </SkeletonSection>

        {/* Projects skeleton */}
        <SkeletonSection delay={0.7} label={t.loading.projectsSection}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <ShimmerSkeleton className="w-full h-40 rounded-xl" />
                <ShimmerSkeleton className="w-3/4 h-5" />
                <ShimmerSkeleton className="w-full h-3" />
                <div className="flex gap-2">
                  <ShimmerSkeleton className="w-14 h-5 rounded-full" />
                  <ShimmerSkeleton className="w-14 h-5 rounded-full" />
                  <ShimmerSkeleton className="w-14 h-5 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </SkeletonSection>

        {/* Contact skeleton */}
        <SkeletonSection delay={0.9} label={t.loading.contactSection}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <ShimmerSkeleton className="w-full h-10" />
              <ShimmerSkeleton className="w-full h-10" />
              <ShimmerSkeleton className="w-full h-24" />
              <ShimmerSkeleton className="w-32 h-10" />
            </div>
            <div className="space-y-3">
              <ShimmerSkeleton className="w-full h-14" />
              <ShimmerSkeleton className="w-full h-14" />
              <ShimmerSkeleton className="w-full h-14" />
            </div>
          </div>
        </SkeletonSection>
      </div>

      {/* Loading indicator with progress percentage */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <AnimatePresence mode="wait">
          <motion.div
            key={loadingText}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 text-sm text-muted-foreground"
          >
            {/* Spinning dot indicator */}
            <motion.div
              className="flex gap-1"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
              />
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
              />
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
              />
            </motion.div>
            <span>{loadingText}</span>
            {/* Progress percentage */}
            <motion.span
              className="text-emerald-500 font-medium tabular-nums text-xs"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {Math.round(progress)}%
            </motion.span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
