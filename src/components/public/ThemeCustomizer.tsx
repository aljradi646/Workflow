'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, X, Check, RotateCcw } from 'lucide-react';
import { useLanguageStore } from '@/store/language-store';
import { getTranslations } from '@/lib/i18n';
import { Slider } from '@/components/ui/slider';

// Color theme presets with hsl values for both light and dark modes
const COLOR_PRESETS = {
  emerald: {
    name: 'Emerald',
    light: {
      primary: 'hsl(153 100% 28%)',
      primaryForeground: 'hsl(120 14% 99%)',
      ring: 'hsl(153 100% 28%)',
      emerald: 'hsl(153 100% 28%)',
      teal: 'hsl(167 100% 31%)',
      accent: 'hsl(144 38% 92%)',
      accentForeground: 'hsl(150 31% 11%)',
      secondary: 'hsl(142 27% 94%)',
      secondaryForeground: 'hsl(150 31% 11%)',
      muted: 'hsl(150 14% 95%)',
      mutedForeground: 'hsl(148 6% 43%)',
      sidebarPrimary: 'hsl(153 100% 28%)',
      sidebarRing: 'hsl(153 100% 28%)',
      chart1: 'hsl(153 100% 28%)',
      chart2: 'hsl(167 100% 31%)',
      chart3: 'hsl(131 76% 27%)',
      chart4: 'hsl(159 100% 34%)',
      chart5: 'hsl(144 84% 22%)',
    },
    dark: {
      primary: 'hsl(158 100% 37%)',
      primaryForeground: 'hsl(144 56% 2%)',
      ring: 'hsl(158 100% 37%)',
      emerald: 'hsl(158 100% 37%)',
      teal: 'hsl(168 100% 34%)',
      accent: 'hsl(145 25% 9%)',
      accentForeground: 'hsl(150 14% 95%)',
      secondary: 'hsl(145 25% 9%)',
      secondaryForeground: 'hsl(150 14% 95%)',
      muted: 'hsl(145 25% 9%)',
      mutedForeground: 'hsl(146 6% 55%)',
      sidebarPrimary: 'hsl(158 100% 37%)',
      sidebarRing: 'hsl(158 100% 37%)',
      chart1: 'hsl(158 100% 37%)',
      chart2: 'hsl(168 100% 34%)',
      chart3: 'hsl(125 44% 41%)',
      chart4: 'hsl(162 100% 41%)',
      chart5: 'hsl(137 45% 36%)',
    },
    preview: ['#10b981', '#14b8a6'],
  },
  rose: {
    name: 'Rose',
    light: {
      primary: 'hsl(336 100% 41%)',
      primaryForeground: 'hsl(0 33% 99%)',
      ring: 'hsl(336 100% 41%)',
      emerald: 'hsl(336 100% 41%)',
      teal: 'hsl(324 69% 48%)',
      accent: 'hsl(353 100% 95%)',
      accentForeground: 'hsl(347 50% 15%)',
      secondary: 'hsl(356 70% 96%)',
      secondaryForeground: 'hsl(347 50% 15%)',
      muted: 'hsl(0 30% 95%)',
      mutedForeground: 'hsl(355 10% 46%)',
      sidebarPrimary: 'hsl(336 100% 41%)',
      sidebarRing: 'hsl(336 100% 41%)',
      chart1: 'hsl(336 100% 41%)',
      chart2: 'hsl(324 69% 48%)',
      chart3: 'hsl(351 70% 41%)',
      chart4: 'hsl(341 81% 61%)',
      chart5: 'hsl(349 62% 36%)',
    },
    dark: {
      primary: 'hsl(346 100% 68%)',
      primaryForeground: 'hsl(350 43% 3%)',
      ring: 'hsl(346 100% 68%)',
      emerald: 'hsl(346 100% 68%)',
      teal: 'hsl(327 72% 60%)',
      accent: 'hsl(353 30% 12%)',
      accentForeground: 'hsl(348 20% 95%)',
      secondary: 'hsl(353 30% 12%)',
      secondaryForeground: 'hsl(348 20% 95%)',
      muted: 'hsl(353 30% 12%)',
      mutedForeground: 'hsl(353 11% 58%)',
      sidebarPrimary: 'hsl(346 100% 68%)',
      sidebarRing: 'hsl(346 100% 68%)',
      chart1: 'hsl(346 100% 68%)',
      chart2: 'hsl(327 72% 60%)',
      chart3: 'hsl(355 64% 56%)',
      chart4: 'hsl(340 100% 71%)',
      chart5: 'hsl(351 46% 49%)',
    },
    preview: ['#f43f5e', '#e11d48'],
  },
  amber: {
    name: 'Amber',
    light: {
      primary: 'hsl(36 100% 43%)',
      primaryForeground: 'hsl(20 43% 99%)',
      ring: 'hsl(36 100% 43%)',
      emerald: 'hsl(36 100% 43%)',
      teal: 'hsl(28 100% 44%)',
      accent: 'hsl(33 100% 91%)',
      accentForeground: 'hsl(32 100% 10%)',
      secondary: 'hsl(31 74% 94%)',
      secondaryForeground: 'hsl(32 100% 10%)',
      muted: 'hsl(33 38% 94%)',
      mutedForeground: 'hsl(32 14% 43%)',
      sidebarPrimary: 'hsl(36 100% 43%)',
      sidebarRing: 'hsl(36 100% 43%)',
      chart1: 'hsl(36 100% 43%)',
      chart2: 'hsl(28 100% 44%)',
      chart3: 'hsl(38 100% 35%)',
      chart4: 'hsl(33 100% 48%)',
      chart5: 'hsl(37 100% 31%)',
    },
    dark: {
      primary: 'hsl(36 93% 55%)',
      primaryForeground: 'hsl(30 70% 4%)',
      ring: 'hsl(36 93% 55%)',
      emerald: 'hsl(36 93% 55%)',
      teal: 'hsl(28 90% 53%)',
      accent: 'hsl(34 81% 8%)',
      accentForeground: 'hsl(30 21% 95%)',
      secondary: 'hsl(34 81% 8%)',
      secondaryForeground: 'hsl(30 21% 95%)',
      muted: 'hsl(34 81% 8%)',
      mutedForeground: 'hsl(31 13% 55%)',
      sidebarPrimary: 'hsl(36 93% 55%)',
      sidebarRing: 'hsl(36 93% 55%)',
      chart1: 'hsl(36 93% 55%)',
      chart2: 'hsl(28 90% 53%)',
      chart3: 'hsl(40 100% 38%)',
      chart4: 'hsl(38 100% 55%)',
      chart5: 'hsl(39 100% 35%)',
    },
    preview: ['#f59e0b', '#d97706'],
  },
  violet: {
    name: 'Violet',
    light: {
      primary: 'hsl(257 75% 60%)',
      primaryForeground: 'hsl(270 33% 99%)',
      ring: 'hsl(257 75% 60%)',
      emerald: 'hsl(257 75% 60%)',
      teal: 'hsl(237 72% 61%)',
      accent: 'hsl(246 100% 96%)',
      accentForeground: 'hsl(251 36% 17%)',
      secondary: 'hsl(244 100% 97%)',
      secondaryForeground: 'hsl(251 36% 17%)',
      muted: 'hsl(240 33% 96%)',
      mutedForeground: 'hsl(246 8% 47%)',
      sidebarPrimary: 'hsl(257 75% 60%)',
      sidebarRing: 'hsl(257 75% 60%)',
      chart1: 'hsl(257 75% 60%)',
      chart2: 'hsl(237 72% 61%)',
      chart3: 'hsl(266 48% 49%)',
      chart4: 'hsl(247 100% 73%)',
      chart5: 'hsl(260 44% 43%)',
    },
    dark: {
      primary: 'hsl(255 100% 77%)',
      primaryForeground: 'hsl(250 38% 3%)',
      ring: 'hsl(255 100% 77%)',
      emerald: 'hsl(255 100% 77%)',
      teal: 'hsl(233 100% 74%)',
      accent: 'hsl(249 31% 13%)',
      accentForeground: 'hsl(240 17% 95%)',
      secondary: 'hsl(249 31% 13%)',
      secondaryForeground: 'hsl(240 17% 95%)',
      muted: 'hsl(249 31% 13%)',
      mutedForeground: 'hsl(246 10% 59%)',
      sidebarPrimary: 'hsl(255 100% 77%)',
      sidebarRing: 'hsl(255 100% 77%)',
      chart1: 'hsl(255 100% 77%)',
      chart2: 'hsl(233 100% 74%)',
      chart3: 'hsl(265 62% 62%)',
      chart4: 'hsl(248 100% 81%)',
      chart5: 'hsl(258 44% 55%)',
    },
    preview: ['#8b5cf6', '#7c3aed'],
  },
  cyan: {
    name: 'Cyan',
    light: {
      primary: 'hsl(181 100% 28%)',
      primaryForeground: 'hsl(180 25% 98%)',
      ring: 'hsl(181 100% 28%)',
      emerald: 'hsl(181 100% 28%)',
      teal: 'hsl(190 100% 32%)',
      accent: 'hsl(180 44% 92%)',
      accentForeground: 'hsl(182 86% 8%)',
      secondary: 'hsl(180 41% 93%)',
      secondaryForeground: 'hsl(182 86% 8%)',
      muted: 'hsl(172 27% 94%)',
      mutedForeground: 'hsl(180 7% 43%)',
      sidebarPrimary: 'hsl(181 100% 28%)',
      sidebarRing: 'hsl(181 100% 28%)',
      chart1: 'hsl(181 100% 28%)',
      chart2: 'hsl(190 100% 32%)',
      chart3: 'hsl(173 100% 24%)',
      chart4: 'hsl(184 100% 36%)',
      chart5: 'hsl(177 100% 21%)',
    },
    dark: {
      primary: 'hsl(181 100% 37%)',
      primaryForeground: 'hsl(180 75% 2%)',
      ring: 'hsl(181 100% 37%)',
      emerald: 'hsl(181 100% 37%)',
      teal: 'hsl(188 100% 38%)',
      accent: 'hsl(180 63% 7%)',
      accentForeground: 'hsl(180 17% 94%)',
      secondary: 'hsl(180 63% 7%)',
      secondaryForeground: 'hsl(180 17% 94%)',
      muted: 'hsl(180 63% 7%)',
      mutedForeground: 'hsl(180 7% 54%)',
      sidebarPrimary: 'hsl(181 100% 37%)',
      sidebarRing: 'hsl(181 100% 37%)',
      chart1: 'hsl(181 100% 37%)',
      chart2: 'hsl(188 100% 38%)',
      chart3: 'hsl(174 100% 30%)',
      chart4: 'hsl(184 100% 43%)',
      chart5: 'hsl(177 100% 26%)',
    },
    preview: ['#06b6d4', '#0891b2'],
  },
} as const;

type ColorPresetKey = keyof typeof COLOR_PRESETS;

interface ThemeSettings {
  colorPreset: ColorPresetKey;
  fontSize: number;
  borderRadius: number;
  layout: 'compact' | 'normal' | 'comfortable';
  animationSpeed: 'reduced' | 'normal' | 'enhanced';
}

const DEFAULT_SETTINGS: ThemeSettings = {
  colorPreset: 'emerald',
  fontSize: 16,
  borderRadius: 10,
  layout: 'normal',
  animationSpeed: 'normal',
};

const LAYOUT_SPACING = {
  compact: { '--spacing-unit': '0.25rem', '--section-padding': '2rem', '--card-padding': '0.75rem' },
  normal: { '--spacing-unit': '0.5rem', '--section-padding': '3rem', '--card-padding': '1rem' },
  comfortable: { '--spacing-unit': '0.75rem', '--section-padding': '4rem', '--card-padding': '1.5rem' },
};

const ANIMATION_SPEEDS = {
  reduced: { '--animation-duration-multiplier': '2' },
  normal: { '--animation-duration-multiplier': '1' },
  enhanced: { '--animation-duration-multiplier': '0.5' },
};

const STORAGE_KEY = 'theme-customizer-settings';

function loadSettingsFromStorage(): ThemeSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<ThemeSettings>;
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        colorPreset: parsed.colorPreset && parsed.colorPreset in COLOR_PRESETS ? parsed.colorPreset : 'emerald',
        layout: parsed.layout && ['compact', 'normal', 'comfortable'].includes(parsed.layout) ? parsed.layout : 'normal',
        animationSpeed: parsed.animationSpeed && ['reduced', 'normal', 'enhanced'].includes(parsed.animationSpeed) ? parsed.animationSpeed : 'normal',
        fontSize: typeof parsed.fontSize === 'number' ? Math.min(20, Math.max(14, parsed.fontSize)) : 16,
        borderRadius: typeof parsed.borderRadius === 'number' ? Math.min(24, Math.max(0, parsed.borderRadius)) : 10,
      };
    }
  } catch {
    // Ignore localStorage errors
  }
  return DEFAULT_SETTINGS;
}

export function ThemeCustomizer() {
  const [isOpen, setIsOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const { language } = useLanguageStore();
  const t = getTranslations(language);
  const isArabic = language === 'ar';

  const [settings, setSettings] = useState<ThemeSettings>(loadSettingsFromStorage);

  // Apply settings to CSS variables whenever they change
  useEffect(() => {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    const preset = COLOR_PRESETS[settings.colorPreset];
    const colors = isDark ? preset.dark : preset.light;

    // Apply color preset
    const cssVarMap: Record<string, string> = {
      '--primary': colors.primary,
      '--primary-foreground': colors.primaryForeground,
      '--ring': colors.ring,
      '--emerald': colors.emerald,
      '--teal': colors.teal,
      '--accent': colors.accent,
      '--accent-foreground': colors.accentForeground,
      '--secondary': colors.secondary,
      '--secondary-foreground': colors.secondaryForeground,
      '--muted': colors.muted,
      '--muted-foreground': colors.mutedForeground,
      '--sidebar-primary': colors.sidebarPrimary,
      '--sidebar-ring': colors.sidebarRing,
      '--chart-1': colors.chart1,
      '--chart-2': colors.chart2,
      '--chart-3': colors.chart3,
      '--chart-4': colors.chart4,
      '--chart-5': colors.chart5,
      '--radius': `${settings.borderRadius / 16}rem`,
      '--font-size-base': `${settings.fontSize}px`,
    };

    // Apply layout spacing
    const layoutVars = LAYOUT_SPACING[settings.layout];
    Object.entries(layoutVars).forEach(([key, value]) => {
      cssVarMap[key] = value;
    });

    // Apply animation speed
    const animVars = ANIMATION_SPEEDS[settings.animationSpeed];
    Object.entries(animVars).forEach(([key, value]) => {
      cssVarMap[key] = value;
    });

    // Set all CSS variables
    Object.entries(cssVarMap).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Apply font size to body
    root.style.fontSize = `${settings.fontSize}px`;

    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore
    }
  }, [settings]);

  // Listen for dark mode changes to re-apply color preset
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const root = document.documentElement;
      const isDark = root.classList.contains('dark');
      const preset = COLOR_PRESETS[settings.colorPreset];
      const colors = isDark ? preset.dark : preset.light;

      root.style.setProperty('--primary', colors.primary);
      root.style.setProperty('--primary-foreground', colors.primaryForeground);
      root.style.setProperty('--ring', colors.ring);
      root.style.setProperty('--emerald', colors.emerald);
      root.style.setProperty('--teal', colors.teal);
      root.style.setProperty('--accent', colors.accent);
      root.style.setProperty('--accent-foreground', colors.accentForeground);
      root.style.setProperty('--secondary', colors.secondary);
      root.style.setProperty('--secondary-foreground', colors.secondaryForeground);
      root.style.setProperty('--muted', colors.muted);
      root.style.setProperty('--muted-foreground', colors.mutedForeground);
      root.style.setProperty('--sidebar-primary', colors.sidebarPrimary);
      root.style.setProperty('--sidebar-ring', colors.sidebarRing);
      root.style.setProperty('--chart-1', colors.chart1);
      root.style.setProperty('--chart-2', colors.chart2);
      root.style.setProperty('--chart-3', colors.chart3);
      root.style.setProperty('--chart-4', colors.chart4);
      root.style.setProperty('--chart-5', colors.chart5);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, [settings.colorPreset]);

  const handleColorPresetChange = useCallback((preset: ColorPresetKey) => {
    setSettings((prev) => ({ ...prev, colorPreset: preset }));
  }, []);

  const handleFontSizeChange = useCallback((value: number[]) => {
    setSettings((prev) => ({ ...prev, fontSize: value[0] }));
  }, []);

  const handleBorderRadiusChange = useCallback((value: number[]) => {
    setSettings((prev) => ({ ...prev, borderRadius: value[0] }));
  }, []);

  const handleLayoutChange = useCallback((layout: ThemeSettings['layout']) => {
    setSettings((prev) => ({ ...prev, layout }));
  }, []);

  const handleAnimationSpeedChange = useCallback((speed: ThemeSettings['animationSpeed']) => {
    setSettings((prev) => ({ ...prev, animationSpeed: speed }));
  }, []);

  const handleReset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    setShowResetConfirm(false);
    // Clear all custom CSS variables
    const root = document.documentElement;
    const customVars = [
      '--primary', '--primary-foreground', '--ring', '--emerald', '--teal',
      '--accent', '--accent-foreground', '--secondary', '--secondary-foreground',
      '--muted', '--muted-foreground', '--sidebar-primary', '--sidebar-ring',
      '--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5',
      '--radius', '--font-size-base', '--spacing-unit', '--section-padding',
      '--card-padding', '--animation-duration-multiplier',
    ];
    customVars.forEach((v) => root.style.removeProperty(v));
    root.style.removeProperty('font-size');
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  // Animated gradient border keyframes
  const gradientBorderVariants = {
    animate: {
      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    },
  };

  return (
    <div className="fixed bottom-24 right-6 z-40" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Slide-out Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: isArabic ? 360 : -360, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: isArabic ? 360 : -360, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed top-0 bottom-0 w-[360px] max-w-[calc(100vw-3rem)] z-50 flex flex-col overflow-hidden"
              style={{
                [isArabic ? 'right' : 'left']: 0,
              }}
            >
              <div className="h-full flex flex-col bg-background/80 backdrop-blur-xl border border-border/50 shadow-2xl">
                {/* Animated gradient border at top */}
                <motion.div
                  className="h-1 w-full shrink-0"
                  style={{
                    background: `linear-gradient(90deg, var(--emerald), var(--teal), var(--emerald))`,
                    backgroundSize: '200% 100%',
                  }}
                  variants={gradientBorderVariants}
                  animate="animate"
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border/50 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <Palette className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm">{t.themeCustomizer.title}</h3>
                  </div>
                  <motion.button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full hover:bg-muted/50 flex items-center justify-center transition-colors"
                    whileHover={{ rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={t.buttons.close}
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Content - scrollable */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                  {/* Color Theme */}
                  <div className="space-y-3">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t.themeCustomizer.colorTheme}
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {(Object.keys(COLOR_PRESETS) as ColorPresetKey[]).map((key) => {
                        const preset = COLOR_PRESETS[key];
                        const isActive = settings.colorPreset === key;
                        return (
                          <motion.button
                            key={key}
                            onClick={() => handleColorPresetChange(key)}
                            className="relative group"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label={preset.name}
                            title={preset.name}
                          >
                            <div
                              className={`w-10 h-10 rounded-full transition-all duration-200 flex items-center justify-center ${
                                isActive
                                  ? 'ring-2 ring-offset-2 ring-offset-background ring-primary shadow-lg'
                                  : 'hover:ring-2 hover:ring-offset-2 hover:ring-offset-background hover:ring-primary/30'
                              }`}
                              style={{
                                background: `linear-gradient(135deg, ${preset.preview[0]}, ${preset.preview[1]})`,
                              }}
                            >
                              <AnimatePresence>
                                {isActive && (
                                  <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                  >
                                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                            <span className="text-[10px] text-muted-foreground mt-1 block text-center capitalize">
                              {preset.name}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Font Size */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t.themeCustomizer.fontSize}
                      </label>
                      <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded-md">
                        {settings.fontSize}px
                      </span>
                    </div>
                    <Slider
                      value={[settings.fontSize]}
                      min={14}
                      max={20}
                      step={1}
                      onValueChange={handleFontSizeChange}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground/60">
                      <span>14px</span>
                      <span>20px</span>
                    </div>
                  </div>

                  {/* Border Radius */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t.themeCustomizer.borderRadius}
                      </label>
                      <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded-md">
                        {settings.borderRadius}px
                      </span>
                    </div>
                    <Slider
                      value={[settings.borderRadius]}
                      min={0}
                      max={24}
                      step={1}
                      onValueChange={handleBorderRadiusChange}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground/60">
                      <span>0px</span>
                      <span>24px</span>
                    </div>
                    {/* Preview of border radius */}
                    <div className="flex items-center justify-center gap-3 py-2">
                      <div
                        className="w-10 h-10 bg-primary/20 border-2 border-primary"
                        style={{ borderRadius: `${settings.borderRadius}px` }}
                      />
                      <div
                        className="w-16 h-8 bg-primary/10 border border-primary/50"
                        style={{ borderRadius: `${settings.borderRadius}px` }}
                      />
                      <div
                        className="w-8 h-8 bg-primary/30"
                        style={{ borderRadius: `${settings.borderRadius}px` }}
                      />
                    </div>
                  </div>

                  {/* Layout Density */}
                  <div className="space-y-3">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t.themeCustomizer.layout}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['compact', 'normal', 'comfortable'] as const).map((layout) => (
                        <motion.button
                          key={layout}
                          onClick={() => handleLayoutChange(layout)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border ${
                            settings.layout === layout
                              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                              : 'bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted hover:text-foreground'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {t.themeCustomizer[layout]}
                        </motion.button>
                      ))}
                    </div>
                    {/* Visual preview */}
                    <div className="p-3 border border-border/30 rounded-lg bg-muted/20">
                      <div
                        className="flex flex-col gap-1 transition-all duration-300"
                        style={{
                          gap: settings.layout === 'compact' ? '2px' : settings.layout === 'comfortable' ? '8px' : '4px',
                        }}
                      >
                        <div
                          className="h-2 bg-primary/30 rounded transition-all duration-300"
                          style={{
                            height: settings.layout === 'compact' ? '4px' : settings.layout === 'comfortable' ? '10px' : '6px',
                          }}
                        />
                        <div className="h-2 bg-primary/20 rounded w-3/4" style={{ height: settings.layout === 'compact' ? '4px' : settings.layout === 'comfortable' ? '10px' : '6px' }} />
                        <div className="h-2 bg-primary/10 rounded w-1/2" style={{ height: settings.layout === 'compact' ? '4px' : settings.layout === 'comfortable' ? '10px' : '6px' }} />
                      </div>
                    </div>
                  </div>

                  {/* Animation Speed */}
                  <div className="space-y-3">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t.themeCustomizer.animationSpeed}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['reduced', 'normal', 'enhanced'] as const).map((speed) => (
                        <motion.button
                          key={speed}
                          onClick={() => handleAnimationSpeedChange(speed)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border ${
                            settings.animationSpeed === speed
                              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                              : 'bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted hover:text-foreground'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {t.themeCustomizer[speed]}
                        </motion.button>
                      ))}
                    </div>
                    {/* Animation preview */}
                    <div className="flex items-center justify-center gap-4 py-3 border border-border/30 rounded-lg bg-muted/20">
                      <motion.div
                        className="w-6 h-6 rounded-full bg-primary/50"
                        animate={{
                          x: [0, 30, 0],
                        }}
                        transition={{
                          duration: settings.animationSpeed === 'reduced' ? 2 : settings.animationSpeed === 'enhanced' ? 0.5 : 1,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                    </div>
                  </div>

                  {/* Reset */}
                  <div className="pt-2">
                    {!showResetConfirm ? (
                      <motion.button
                        onClick={() => setShowResetConfirm(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-border/50 bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        {t.themeCustomizer.reset}
                      </motion.button>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-2"
                      >
                        <p className="text-xs text-center text-muted-foreground">
                          {t.themeCustomizer.resetConfirm}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={handleReset}
                            className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-colors"
                          >
                            {t.themeCustomizer.reset}
                          </button>
                          <button
                            onClick={() => setShowResetConfirm(false)}
                            className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-muted/50 text-muted-foreground border border-border/50 hover:bg-muted transition-colors"
                          >
                            {t.buttons.close}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-14 h-14 rounded-full bg-background/80 backdrop-blur-md text-primary border border-border/50 shadow-lg shadow-black/10 hover:shadow-primary/20 flex items-center justify-center transition-shadow duration-300 group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={t.themeCustomizer.title}
        title={t.themeCustomizer.title}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div
              key="palette"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="group-hover:animate-[spin_2s_linear_infinite]"
            >
              <Palette className="w-5 h-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
