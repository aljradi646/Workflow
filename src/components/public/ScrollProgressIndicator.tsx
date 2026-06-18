'use client';

import { useState, useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';
import { useLanguageStore } from '@/store/language-store';
import { getTranslations } from '@/lib/i18n';

export function ScrollProgressIndicator() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const { language } = useLanguageStore();
  const t = getTranslations(language);
  const isRTL = language === 'ar';

  const scaleX = useSpring(0, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? window.scrollY / totalHeight : 0;
      setScrollProgress(progress);
      scaleX.set(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [scaleX]);

  if (scrollProgress < 0.01) return null;

  return (
    <motion.div
      className="scroll-progress"
      style={{
        scaleX,
        transformOrigin: isRTL ? '100%' : '0%',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      role="progressbar"
      aria-valuenow={Math.round(scrollProgress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={t.misc.readingProgress}
    />
  );
}
