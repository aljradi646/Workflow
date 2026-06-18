'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * Wraps page content with a rich loading animation.
 * - A thin emerald gradient line sweeps across the top
 * - A gradient overlay sweeps diagonally across the page
 * - Content fades in with a subtle scale animation
 * - A "content ready" pulse effect fires once all sections are loaded
 */
export function PageTransition({ children }: PageTransitionProps) {
  const [phase, setPhase] = useState<'sweep' | 'content' | 'ready'>('sweep');

  useEffect(() => {
    // Phase 1: sweep line (0-600ms)
    const t1 = setTimeout(() => setPhase('content'), 600);
    // Phase 2: content fades in (600-1200ms)
    // Phase 3: content ready pulse after a delay
    const t2 = setTimeout(() => setPhase('ready'), 1400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <>
      {/* Top sweep line */}
      <AnimatePresence>
        {phase === 'sweep' && (
          <motion.div
            key="page-transition-line"
            className="fixed top-0 left-0 right-0 z-[60] h-[3px] pointer-events-none"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              scaleX: { duration: 0.5, ease: 'easeInOut' },
              opacity: { duration: 0.2, delay: 0.4 },
            }}
            style={{
              transformOrigin: 'left',
              background:
                'linear-gradient(90deg, transparent 0%, #10b981 25%, #14b8a6 50%, #10b981 75%, transparent 100%)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Diagonal gradient overlay sweep */}
      <AnimatePresence>
        {phase === 'sweep' && (
          <motion.div
            key="page-transition-overlay"
            className="fixed inset-0 z-[59] pointer-events-none"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            style={{
              background:
                'linear-gradient(105deg, transparent 40%, rgba(16,185,129,0.06) 45%, rgba(20,184,166,0.08) 50%, rgba(16,185,129,0.06) 55%, transparent 60%)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Page content with fade-in + subtle scale */}
      <motion.div
        initial={{ opacity: 0, scale: 0.995 }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{
          opacity: { duration: 0.5, delay: 0.35 },
          scale: { duration: 0.6, delay: 0.35, ease: [0.4, 0, 0.2, 1] },
        }}
      >
        {children}
      </motion.div>

      {/* Content-ready pulse */}
      <AnimatePresence>
        {phase === 'ready' && (
          <motion.div
            key="content-ready-pulse"
            className="fixed top-0 left-0 right-0 z-[58] h-[2px] pointer-events-none"
            initial={{ scaleX: 0, opacity: 0.8 }}
            animate={{ scaleX: 1, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{
              scaleX: { duration: 0.6, ease: 'easeOut' },
              opacity: { duration: 0.8, delay: 0.2 },
            }}
            style={{
              transformOrigin: 'center',
              background:
                'linear-gradient(90deg, transparent 0%, #10b981 40%, #14b8a6 50%, #10b981 60%, transparent 100%)',
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
