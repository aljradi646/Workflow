'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye } from 'lucide-react';

const VISITOR_KEY = 'visitor-count';
const VISITOR_SESSION_KEY = 'visitor-session';

function computeVisitorCount(): number {
  if (typeof window === 'undefined') return 0;

  try {
    const stored = localStorage.getItem(VISITOR_KEY);
    const session = sessionStorage.getItem(VISITOR_SESSION_KEY);

    if (!stored) {
      const base = Math.floor(Math.random() * (2500 - 1200 + 1)) + 1200;
      const newCount = base + 1;
      localStorage.setItem(VISITOR_KEY, JSON.stringify(newCount));
      sessionStorage.setItem(VISITOR_SESSION_KEY, 'true');
      return newCount;
    }

    if (!session) {
      const current = parseInt(stored, 10);
      const newCount = current + 1;
      localStorage.setItem(VISITOR_KEY, JSON.stringify(newCount));
      sessionStorage.setItem(VISITOR_SESSION_KEY, 'true');
      return newCount;
    }

    return parseInt(stored, 10);
  } catch {
    return 0;
  }
}

export function VisitorCounter() {
  const [visitorData, setVisitorData] = useState<{ count: number; ready: boolean }>({
    count: 0,
    ready: false,
  });

  useEffect(() => {
    const count = computeVisitorCount();
    // Use microtask to avoid synchronous setState in effect
    queueMicrotask(() => {
      setVisitorData({ count, ready: true });
    });
  }, []);

  if (!visitorData.ready || visitorData.count === 0) return null;

  return (
    <div className="fixed bottom-20 right-6 z-40" dir="rtl">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 1 }}
          className="glass-card-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs shadow-lg border border-border/30 backdrop-blur-md"
        >
          <Eye className="w-3.5 h-3.5 text-emerald-500" />
          <motion.span
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
            className="font-medium tabular-nums"
          >
            {visitorData.count.toLocaleString('ar-SA')}
          </motion.span>
          <span className="text-muted-foreground">زائر</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
