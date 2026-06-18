'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket } from 'lucide-react';
import { useLanguageStore } from '@/store/language-store';
import { getTranslations } from '@/lib/i18n';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  color: string;
}

const PARTICLE_COLORS = ['#10b981', '#14b8a6', '#34d399', '#5eead4', '#6ee7b7'];

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [isLaunching, setIsLaunching] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const { language } = useLanguageStore();
  const t = getTranslations(language);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
      setScrollPercent(Math.min(percent, 100));
      setVisible(scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const launchParticles = useCallback(() => {
    const newParticles: Particle[] = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 60,
      y: -(Math.random() * 40 + 10),
      size: Math.random() * 5 + 2,
      delay: i * 0.04,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1200);
  }, []);

  const scrollToTop = useCallback(() => {
    if (isLaunching) return;
    setIsLaunching(true);
    launchParticles();
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
    setTimeout(() => {
      setIsLaunching(false);
    }, 800);
  }, [isLaunching, launchParticles]);

  // SVG circle progress ring
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollPercent / 100) * circumference;

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.3, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.3, y: 30 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25, mass: 0.8 }}
          onClick={scrollToTop}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="fixed bottom-6 left-6 z-40 w-14 h-14 text-white flex items-center justify-center group"
          aria-label={t.misc.backToTop}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
        >
          {/* Outer glow on hover */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: isHovered
                ? '0 0 20px rgba(16,185,129,0.5), 0 0 40px rgba(16,185,129,0.2)'
                : '0 0 0px rgba(16,185,129,0)',
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Progress Ring */}
          <svg
            className="absolute inset-0 w-14 h-14 -rotate-90"
            viewBox="0 0 48 48"
          >
            {/* Background circle */}
            <circle
              cx="24"
              cy="24"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-emerald-500/15"
            />
            {/* Progress circle */}
            <motion.circle
              cx="24"
              cy="24"
              r={radius}
              fill="none"
              stroke="url(#scrollGradientEnhanced)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-150"
            />
            <defs>
              <linearGradient id="scrollGradientEnhanced" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#14b8a6" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
          </svg>

          {/* Inner circle background */}
          <motion.div
            className="w-10 h-10 rounded-full gradient-emerald flex items-center justify-center shadow-lg relative"
            animate={{
              boxShadow: isHovered
                ? '0 0 25px rgba(16,185,129,0.6)'
                : '0 4px 15px rgba(16,185,129,0.25)',
            }}
            transition={{ duration: 0.3 }}
          >
            {/* Rocket icon */}
            <motion.div
              animate={
                isLaunching
                  ? { y: -20, scale: 1.4, opacity: 0 }
                  : { y: 0, scale: 1, opacity: 1 }
              }
              transition={
                isLaunching
                  ? { duration: 0.6, ease: 'easeIn' }
                  : { duration: 0.3, ease: 'easeOut' }
              }
            >
              <Rocket className="w-4 h-4" />
            </motion.div>
          </motion.div>

          {/* Particle burst on click */}
          <AnimatePresence>
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute rounded-full"
                style={{
                  width: p.size,
                  height: p.size,
                  left: '50%',
                  top: '50%',
                  backgroundColor: p.color,
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: p.x,
                  y: p.y + 20,
                  opacity: 0,
                  scale: 0.3,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.9,
                  delay: p.delay,
                  ease: 'easeOut',
                }}
              />
            ))}
          </AnimatePresence>

          {/* Scroll percentage label */}
          <motion.span
            className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-semibold text-emerald-500 tabular-nums"
            initial={{ opacity: 0 }}
            animate={{ opacity: scrollPercent > 5 ? 0.8 : 0 }}
          >
            {Math.round(scrollPercent)}%
          </motion.span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
