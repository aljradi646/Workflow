'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useSiteStore, type Navigation } from '@/store/site-store';
import { useLanguageStore } from '@/store/language-store';
import { getTranslations } from '@/lib/i18n';
import { localizeNavigation } from '@/lib/localize';
import { Button } from '@/components/ui/button';
import { ScrollProgressIndicator } from '@/components/public/ScrollProgressIndicator';
import { LanguageToggle } from '@/components/public/LanguageToggle';
import { NotificationCenter } from '@/components/public/NotificationCenter';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Sun,
  Moon,
  Menu,
  X,
  Code2,
  ArrowUp,
  Search,
  Home,
  User,
  Briefcase,
  FolderOpen,
  Wrench,
  GraduationCap,
  BookOpen,
  MessageSquare,
  HelpCircle,
  Star,
  Languages,
  Palette,
} from 'lucide-react';

const sectionIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  hero: Home,
  about: User,
  experience: Briefcase,
  projects: FolderOpen,
  services: Wrench,
  education: GraduationCap,
  blog: BookOpen,
  contact: MessageSquare,
  faq: HelpCircle,
  testimonials: Star,
  skills: Wrench,
};

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [scrollOpacity, setScrollOpacity] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const { siteData, activeSection } = useSiteStore();
  const { resolvedTheme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguageStore();
  const t = getTranslations(language);
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const newScrolled = scrollY > 50;
      setScrolled(newScrolled);
      // Calculate scroll-based opacity (0 to 1)
      const opacity = Math.min(scrollY / 300, 1);
      setScrollOpacity(opacity);
      setShowBackToTop(scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Command palette keyboard shortcut (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const siteName = siteData?.settings?.site_name || t.hero.defaultName;
  const navigation: Navigation[] = siteData?.navigation || [];

  // Localize navigation labels
  const localizedNavigation = useMemo(() =>
    navigation.map((nav) => {
      const localized = localizeNavigation(nav, language);
      return { ...nav, label: localized.label };
    }),
  [navigation, language]);

  const handleNavClick = useCallback((url: string | null) => {
    if (!url) return;
    setMobileOpen(false);
    setCommandOpen(false);
    const el = document.querySelector(url);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Scroll Progress */}
      <ScrollProgressIndicator />

      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass-header-scrolled' : 'bg-transparent'
        }`}
      >
        {/* Emerald accent line at bottom when scrolled - gradient effect */}
        {scrolled && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{
              background: `linear-gradient(to right, transparent, rgba(16,185,129,${0.3 + scrollOpacity * 0.4}), rgba(20,184,166,${0.2 + scrollOpacity * 0.3}), transparent)`,
            }}
          />
        )}

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <motion.a
              href="#hero"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('#hero');
              }}
              className="flex items-center gap-2.5 group relative"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                className="relative w-9 h-9 rounded-lg gradient-emerald flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow"
                whileHover={{ rotate: 10 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
              >
                <Code2 className="w-5 h-5 text-white" />
                {/* Pulse effect on logo dot */}
                <motion.div
                  className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-300"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [1, 0.7, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </motion.div>
              <span className="text-lg font-bold hidden sm:inline-block bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 bg-clip-text text-transparent group-hover:shimmer">
                {siteName}
              </span>
              {/* Sparkle particles around logo on hover */}
              <motion.div
                className="absolute -inset-2 pointer-events-none"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-emerald-400"
                    style={{
                      top: `${20 + Math.sin(i * Math.PI / 2) * 80}%`,
                      left: `${20 + Math.cos(i * Math.PI / 2) * 80}%`,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </motion.div>
            </motion.a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {localizedNavigation.map((item) => {
                const isActive = activeSection === item.url?.replace('#', '');
                return (
                  <motion.a
                    key={item.id}
                    href={item.url || '#'}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(item.url);
                    }}
                    className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full gradient-emerald"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                    {/* Active background indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavBg"
                        className="absolute inset-0 rounded-lg bg-primary/5"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.a>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Search / Command Palette Trigger */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCommandOpen(true)}
                className="relative overflow-hidden min-w-[44px] min-h-[44px]"
                aria-label={t.commandPalette.title}
              >
                <Search className="h-4 w-4" />
                <kbd className="sr-only sm:not-sr-only sm:absolute sm:bottom-0.5 sm:right-0.5 sm:text-[8px] sm:text-muted-foreground/50 sm:pointer-events-none">
                  ⌘K
                </kbd>
              </Button>

              {/* Notification Center */}
              {mounted && <NotificationCenter />}

              {/* Language Toggle */}
              {mounted && <LanguageToggle />}

              {/* Theme Toggle */}
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                  className="relative overflow-hidden min-w-[44px] min-h-[44px]"
                  aria-label={t.misc.theme}
                >
                  <AnimatePresence mode="wait">
                    {resolvedTheme === 'dark' ? (
                      <motion.div
                        key="sun"
                        initial={{ rotate: -90, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        exit={{ rotate: 90, scale: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Sun className="h-5 w-5" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="moon"
                        initial={{ rotate: -90, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        exit={{ rotate: 90, scale: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Moon className="h-5 w-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              )}

              {/* Back to top */}
              <AnimatePresence>
                {showBackToTop && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="hidden md:block"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={scrollToTop}
                      className="relative overflow-hidden text-muted-foreground hover:text-primary min-w-[44px] min-h-[44px]"
                      aria-label={t.misc.backToTop}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden min-w-[44px] min-h-[44px]"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={language === 'ar' ? 'القائمة' : 'Menu'}
                aria-expanded={mobileOpen}
                aria-controls="mobile-navigation"
              >
                <AnimatePresence mode="wait">
                  {mobileOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      exit={{ rotate: 90, scale: 0 }}
                    >
                      <X className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: -90, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      exit={{ rotate: 90, scale: 0 }}
                    >
                      <Menu className="h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Enhanced with slide-in and backdrop blur */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 top-16 bg-black/20 backdrop-blur-sm md:hidden"
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                id="mobile-navigation"
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="md:hidden glass-header-scrolled border-t border-border/50 overflow-hidden"
                role="navigation"
                aria-label={language === 'ar' ? 'القائمة الرئيسية' : 'Main navigation'}
              >
                <nav className="container mx-auto px-4 py-4 space-y-1">
                  {localizedNavigation.map((item, i) => {
                    const isActive = activeSection === item.url?.replace('#', '');
                    const SectionIcon = item.url ? sectionIconMap[item.url.replace('#', '')] : null;
                    return (
                      <motion.a
                        key={item.id}
                        href={item.url || '#'}
                        onClick={(e) => {
                          e.preventDefault();
                          handleNavClick(item.url);
                        }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06, duration: 0.3 }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        }`}
                      >
                        {isActive && (
                          <div className="w-1 h-5 rounded-full gradient-emerald" />
                        )}
                        {SectionIcon && <SectionIcon className="w-4 h-4" />}
                        {item.label}
                      </motion.a>
                    );
                  })}
                  {/* Language Toggle in Mobile Menu */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: localizedNavigation.length * 0.06, duration: 0.3 }}
                    className="pt-2 border-t border-border/30 mt-2"
                  >
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm text-muted-foreground">{t.misc.language}</span>
                      <LanguageToggle />
                    </div>
                  </motion.div>
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Command Palette Dialog */}
      <CommandDialog
        open={commandOpen}
        onOpenChange={setCommandOpen}
        title={t.commandPalette.title}
        description={t.commandPalette.placeholder}
      >
        <CommandInput placeholder={t.commandPalette.placeholder} />
        <CommandList>
          <CommandEmpty>{t.commandPalette.noResults}</CommandEmpty>

          {/* Navigation Group */}
          <CommandGroup heading={t.commandPalette.navigation}>
            {localizedNavigation.map((item) => {
              const SectionIcon = item.url ? sectionIconMap[item.url.replace('#', '')] : Search;
              return (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleNavClick(item.url)}
                >
                  {SectionIcon && <SectionIcon className="w-4 h-4" />}
                  <span>{t.commandPalette.scrollToSection} {item.label}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>

          <CommandSeparator />

          {/* Quick Actions */}
          <CommandGroup heading={t.commandPalette.actions}>
            <CommandItem
              onSelect={() => {
                setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
                setCommandOpen(false);
              }}
            >
              <Palette className="w-4 h-4" />
              <span>{t.commandPalette.toggleTheme}</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setLanguage(language === 'ar' ? 'en' : 'ar');
                setCommandOpen(false);
              }}
            >
              <Languages className="w-4 h-4" />
              <span>{t.commandPalette.switchLanguage}</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
