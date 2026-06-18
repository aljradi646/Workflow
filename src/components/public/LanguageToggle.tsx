'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useLanguageStore } from '@/store/language-store';
import { Languages } from 'lucide-react';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguageStore();

  const toggle = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <motion.button
      onClick={toggle}
      className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium
        hover:bg-accent transition-colors duration-200 overflow-hidden"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={language === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
    >
      <Languages className="w-4 h-4 text-muted-foreground" />
      <AnimatePresence mode="wait">
        <motion.span
          key={language}
          initial={{ y: -15, opacity: 0, rotateX: 90 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          exit={{ y: 15, opacity: 0, rotateX: -90 }}
          transition={{ duration: 0.25 }}
          className="inline-block text-xs font-bold tracking-wide"
        >
          {language === 'ar' ? 'EN' : 'عربي'}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
