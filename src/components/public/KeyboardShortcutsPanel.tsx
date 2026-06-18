'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';
import { useLanguageStore } from '@/store/language-store';
import { useSiteStore } from '@/store/site-store';
import { getTranslations } from '@/lib/i18n';
import { useTheme } from 'next-themes';

interface Shortcut {
  keys: string[];
  description: string;
  category: 'navigation' | 'actions';
}

export function KeyboardShortcutsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);
  const { language, setLanguage } = useLanguageStore();
  const { siteData } = useSiteStore();
  const { setTheme, theme } = useTheme();
  const t = getTranslations(language);

  const sections = siteData?.sections?.filter((s) => s.isVisible) ?? [];

  const shortcuts: Shortcut[] = [
    // Section jump shortcuts (1-9)
    ...sections.slice(0, 9).map((section, index) => ({
      keys: [String(index + 1)],
      description: `${t.shortcuts.sectionJump} ${t.shortcuts.sectionPrefix} ${index + 1} (${section.title || section.type})`,
      category: 'navigation' as const,
    })),
    // Action shortcuts
    { keys: ['T'], description: t.shortcuts.themeToggle, category: 'actions' },
    { keys: ['L'], description: t.shortcuts.languageToggle, category: 'actions' },
    { keys: ['/'], description: t.shortcuts.searchCommand, category: 'actions' },
    { keys: ['P'], description: t.shortcuts.printPage, category: 'actions' },
    { keys: ['?'], description: t.shortcuts.showShortcuts, category: 'actions' },
    { keys: ['↑'], description: t.shortcuts.scrollToTop, category: 'actions' },
    { keys: ['Esc'], description: t.shortcuts.closeWindow, category: 'actions' },
  ];

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Show hint on first visit
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const dismissed = localStorage.getItem('shortcuts-hint-dismissed');
      if (dismissed === 'true') return;
    } catch {
      // Ignore
    }
    const showTimer = setTimeout(() => setShowHint(true), 4000);
    const hideTimer = setTimeout(() => setShowHint(false), 12000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const dismissHint = useCallback(() => {
    setShowHint(false);
    setHintDismissed(true);
    try {
      localStorage.setItem('shortcuts-hint-dismissed', 'true');
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Open/close with ? key (shift + /)
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (isTyping) return;
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      // Close with Esc
      if (e.key === 'Escape' && isOpen) {
        close();
        return;
      }

      // Section jump shortcuts (1-9) - only when panel is not open and not typing
      if (!isOpen && !isTyping && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= 9) {
          const sectionIndex = num - 1;
          if (sectionIndex < sections.length) {
            const sectionType = sections[sectionIndex].type;
            const el = document.getElementById(sectionType);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
          return;
        }
      }

      // Theme toggle with T key
      if ((e.key === 't' || e.key === 'T') && !isTyping && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey && !isOpen) {
        setTheme(theme === 'dark' ? 'light' : 'dark');
        return;
      }

      // Language toggle with L key
      if ((e.key === 'l' || e.key === 'L') && !isTyping && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey && !isOpen) {
        setLanguage(language === 'ar' ? 'en' : 'ar');
        return;
      }

      // Search/command palette with / key
      if (e.key === '/' && !isTyping && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey && !isOpen) {
        e.preventDefault();
        // Dispatch custom event to open command palette
        window.dispatchEvent(new CustomEvent('open-command-palette'));
        return;
      }

      // Print with P key
      if ((e.key === 'p' || e.key === 'P') && !isTyping && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey && !isOpen) {
        window.print();
        return;
      }

      // Scroll to top with Shift+T (already have T for theme, use Ctrl+Home or just remove T duplicate)
      // Actually keeping T for theme toggle as specified. ScrollToTop button still available.
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close, sections, theme, setTheme, language, setLanguage]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.id === 'shortcuts-overlay') {
        close();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, close]);

  const navShortcuts = shortcuts.filter((s) => s.category === 'navigation');
  const actionShortcuts = shortcuts.filter((s) => s.category === 'actions');

  return (
    <>
      {/* First-visit hint tooltip */}
      <AnimatePresence>
        {showHint && !hintDismissed && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-30 glass-card-sm rounded-xl px-4 py-2.5 flex items-center gap-3 text-xs text-muted-foreground shadow-lg"
          >
            <Keyboard className="w-3.5 h-3.5 shrink-0" />
            <span>{t.shortcuts.hintMessage}</span>
            <button
              onClick={dismissHint}
              className="shrink-0 px-1.5 py-0.5 rounded bg-muted/80 text-[10px] font-mono border border-border/50 hover:bg-muted transition-colors"
            >
              {t.shortcuts.dismissHint}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shortcuts Panel Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              id="shortcuts-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed inset-0 z-[71] flex items-center justify-center p-4 pointer-events-none"
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            >
              <div className="glass-card-lg rounded-2xl shadow-2xl shadow-black/20 border border-border/50 backdrop-blur-xl w-full max-w-md pointer-events-auto max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border/50 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full gradient-emerald flex items-center justify-center">
                      <Keyboard className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-semibold">{t.shortcuts.title}</h3>
                  </div>
                  <button
                    onClick={close}
                    className="w-7 h-7 rounded-full hover:bg-muted/50 flex items-center justify-center transition-colors"
                    aria-label={t.buttons.close}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Shortcuts List - scrollable */}
                <div className="overflow-y-auto custom-scrollbar flex-1">
                  {/* Navigation Shortcuts */}
                  {navShortcuts.length > 0 && (
                    <>
                      <div className="px-4 pt-3 pb-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {t.commandPalette.navigation}
                        </span>
                      </div>
                      <div className="px-2 space-y-0.5">
                        {navShortcuts.map((shortcut, index) => (
                          <motion.div
                            key={`nav-${index}`}
                            initial={{ opacity: 0, x: language === 'ar' ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/30 transition-colors"
                          >
                            <span className="text-sm text-muted-foreground">
                              {shortcut.description}
                            </span>
                            <div className="flex items-center gap-1">
                              {shortcut.keys.map((key, ki) => (
                                <span key={ki} className="flex items-center gap-1">
                                  <kbd className="px-2 py-1 rounded-md bg-muted/80 text-xs font-mono border border-border/50 shadow-sm min-w-[28px] text-center">
                                    {key}
                                  </kbd>
                                  {ki < shortcut.keys.length - 1 && (
                                    <span className="text-muted-foreground text-xs">+</span>
                                  )}
                                </span>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Action Shortcuts */}
                  <div className="px-4 pt-3 pb-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t.commandPalette.actions}
                    </span>
                  </div>
                  <div className="px-2 pb-2 space-y-0.5">
                    {actionShortcuts.map((shortcut, index) => (
                      <motion.div
                        key={`action-${index}`}
                        initial={{ opacity: 0, x: language === 'ar' ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (navShortcuts.length + index) * 0.03 }}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <span className="text-sm text-muted-foreground">
                          {shortcut.description}
                        </span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, ki) => (
                            <span key={ki} className="flex items-center gap-1">
                              <kbd className="px-2 py-1 rounded-md bg-muted/80 text-xs font-mono border border-border/50 shadow-sm min-w-[28px] text-center">
                                {key}
                              </kbd>
                              {ki < shortcut.keys.length - 1 && (
                                <span className="text-muted-foreground text-xs">+</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Footer hint */}
                <div className="px-4 pb-4 shrink-0">
                  <p className="text-xs text-muted-foreground text-center">
                    {language === 'ar' ? 'اضغط' : 'Press'}{' '}
                    <kbd className="px-1.5 py-0.5 rounded bg-muted/80 text-[10px] font-mono border border-border/50">Esc</kbd>{' '}
                    {language === 'ar' ? 'للإغلاق' : 'to close'}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
