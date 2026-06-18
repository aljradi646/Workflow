'use client';

import { motion } from 'framer-motion';
import {
  LayoutGrid,
  PanelLeft,
  PanelRight,
  Maximize,
  Grid3X3,
  Clock,
  LayoutDashboard,
  GalleryHorizontal,
} from 'lucide-react';

interface LayoutPattern {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  svg: React.ReactNode;
}

const LAYOUT_PATTERNS: LayoutPattern[] = [
  {
    value: 'default',
    label: 'افتراضي',
    icon: LayoutGrid,
    svg: (
      <svg viewBox="0 0 48 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="4" width="32" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
        <rect x="12" y="8" width="24" height="4" rx="1" fill="currentColor" opacity="0.5" />
        <rect x="12" y="15" width="18" height="2" rx="1" fill="currentColor" opacity="0.25" />
        <rect x="12" y="19" width="20" height="2" rx="1" fill="currentColor" opacity="0.25" />
      </svg>
    ),
  },
  {
    value: 'split-left',
    label: 'مقسم يسار',
    icon: PanelLeft,
    svg: (
      <svg viewBox="0 0 48 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="4" width="20" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
        <rect x="28" y="4" width="16" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.15" />
        <rect x="8" y="8" width="12" height="3" rx="1" fill="currentColor" opacity="0.5" />
        <rect x="8" y="14" width="10" height="2" rx="1" fill="currentColor" opacity="0.25" />
        <rect x="8" y="18" width="11" height="2" rx="1" fill="currentColor" opacity="0.25" />
        <rect x="8" y="22" width="8" height="2" rx="1" fill="currentColor" opacity="0.15" />
        <circle cx="36" cy="16" r="4" fill="currentColor" opacity="0.1" />
      </svg>
    ),
  },
  {
    value: 'split-right',
    label: 'مقسم يمين',
    icon: PanelRight,
    svg: (
      <svg viewBox="0 0 48 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="4" width="16" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.15" />
        <rect x="24" y="4" width="20" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
        <circle cx="12" cy="16" r="4" fill="currentColor" opacity="0.1" />
        <rect x="28" y="8" width="12" height="3" rx="1" fill="currentColor" opacity="0.5" />
        <rect x="28" y="14" width="10" height="2" rx="1" fill="currentColor" opacity="0.25" />
        <rect x="28" y="18" width="11" height="2" rx="1" fill="currentColor" opacity="0.25" />
        <rect x="28" y="22" width="8" height="2" rx="1" fill="currentColor" opacity="0.15" />
      </svg>
    ),
  },
  {
    value: 'full-width',
    label: 'عرض كامل',
    icon: Maximize,
    svg: (
      <svg viewBox="0 0 48 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="4" width="44" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
        <rect x="6" y="8" width="36" height="3" rx="1" fill="currentColor" opacity="0.5" />
        <rect x="6" y="14" width="30" height="2" rx="1" fill="currentColor" opacity="0.25" />
        <rect x="6" y="18" width="32" height="2" rx="1" fill="currentColor" opacity="0.25" />
        <rect x="6" y="22" width="28" height="2" rx="1" fill="currentColor" opacity="0.15" />
      </svg>
    ),
  },
  {
    value: 'cards-grid',
    label: 'شبكة بطاقات',
    icon: Grid3X3,
    svg: (
      <svg viewBox="0 0 48 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="4" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
        <rect x="18" y="4" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
        <rect x="32" y="4" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
        <rect x="4" y="18" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.15" />
        <rect x="18" y="18" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.15" />
        <rect x="32" y="18" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.15" />
      </svg>
    ),
  },
  {
    value: 'timeline',
    label: 'خط زمني',
    icon: Clock,
    svg: (
      <svg viewBox="0 0 48 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="24" y1="4" x2="24" y2="28" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
        <circle cx="24" cy="8" r="2.5" fill="currentColor" opacity="0.5" />
        <rect x="28" y="6" width="14" height="4" rx="1" fill="currentColor" opacity="0.2" />
        <circle cx="24" cy="16" r="2.5" fill="currentColor" opacity="0.5" />
        <rect x="6" y="14" width="14" height="4" rx="1" fill="currentColor" opacity="0.2" />
        <circle cx="24" cy="24" r="2.5" fill="currentColor" opacity="0.5" />
        <rect x="28" y="22" width="14" height="4" rx="1" fill="currentColor" opacity="0.2" />
      </svg>
    ),
  },
  {
    value: 'masonry',
    label: 'فسيفساء',
    icon: LayoutDashboard,
    svg: (
      <svg viewBox="0 0 48 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="4" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
        <rect x="18" y="4" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
        <rect x="32" y="4" width="12" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
        <rect x="4" y="20" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.15" />
        <rect x="18" y="14" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.15" />
      </svg>
    ),
  },
  {
    value: 'carousel',
    label: 'شرائح',
    icon: GalleryHorizontal,
    svg: (
      <svg viewBox="0 0 48 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="4" width="28" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
        <rect x="14" y="8" width="20" height="3" rx="1" fill="currentColor" opacity="0.35" />
        <rect x="14" y="14" width="16" height="2" rx="1" fill="currentColor" opacity="0.2" />
        <rect x="14" y="18" width="18" height="2" rx="1" fill="currentColor" opacity="0.2" />
        <polygon points="6,16 10,12 10,20" fill="currentColor" opacity="0.2" />
        <polygon points="42,16 38,12 38,20" fill="currentColor" opacity="0.2" />
        <circle cx="22" cy="26" r="1" fill="currentColor" opacity="0.4" />
        <circle cx="26" cy="26" r="1" fill="currentColor" opacity="0.2" />
      </svg>
    ),
  },
];

interface LayoutSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function LayoutSelector({ value, onChange }: LayoutSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">نمط التخطيط</label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {LAYOUT_PATTERNS.map((pattern) => {
          const isSelected = value === pattern.value;
          const Icon = pattern.icon;
          return (
            <motion.button
              key={pattern.value}
              type="button"
              onClick={() => onChange(pattern.value)}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={`
                relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-colors duration-200 cursor-pointer
                ${isSelected
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-md shadow-emerald-500/10'
                  : 'border-border/50 bg-card hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-muted/30'
                }
              `}
            >
              {isSelected && (
                <motion.div
                  layoutId="layout-selector-glow"
                  className="absolute inset-0 rounded-xl border-2 border-emerald-400/50 dark:border-emerald-500/30"
                  style={{ boxShadow: '0 0 12px rgba(16, 185, 129, 0.2)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
              <div className={`w-10 h-6 text-muted-foreground ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                {pattern.svg}
              </div>
              <div className="flex items-center gap-1.5">
                <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`} />
                <span className={`text-xs font-medium ${isSelected ? 'text-emerald-700 dark:text-emerald-300' : 'text-muted-foreground'}`}>
                  {pattern.label}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
