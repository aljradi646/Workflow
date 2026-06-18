'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { useLanguageStore } from '@/store/language-store';
import { useSiteStore } from '@/store/site-store';
import { getTranslations } from '@/lib/i18n';
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
  Home,
  User,
  Code2,
  FolderOpen,
  Briefcase,
  GraduationCap,
  MessageCircle,
  HelpCircle,
  Star,
  Sun,
  Moon,
  Languages,
  Printer,
  BookOpen,
} from 'lucide-react';

const sectionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  hero: Home,
  about: User,
  skills: Code2,
  projects: FolderOpen,
  services: Briefcase,
  experience: Briefcase,
  education: GraduationCap,
  contact: MessageCircle,
  faq: HelpCircle,
  testimonials: Star,
  blog: BookOpen,
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const { language, setLanguage } = useLanguageStore();
  const { siteData } = useSiteStore();
  const { setTheme, theme } = useTheme();
  const t = getTranslations(language);

  const sections = siteData?.sections?.filter((s) => s.isVisible) ?? [];

  // Listen for custom event from keyboard shortcuts
  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener('open-command-palette', handleOpen);
    return () => window.removeEventListener('open-command-palette', handleOpen);
  }, []);

  // Listen for / key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      if (e.key === '/' && !isTyping && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        // Only handle if the command palette itself isn't open (to avoid double-trigger)
        if (!open) {
          e.preventDefault();
          setOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const scrollToSection = useCallback((sectionType: string) => {
    const el = document.getElementById(sectionType);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setOpen(false);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    setOpen(false);
  }, [theme, setTheme]);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
    setOpen(false);
  }, [language, setLanguage]);

  const printPage = useCallback(() => {
    window.print();
    setOpen(false);
  }, []);

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title={t.commandPalette.title}
      description={t.commandPalette.placeholder}
    >
      <CommandInput placeholder={t.commandPalette.placeholder} />
      <CommandList>
        <CommandEmpty>{t.commandPalette.noResults}</CommandEmpty>

        {/* Navigation group */}
        {sections.length > 0 && (
          <CommandGroup heading={t.commandPalette.navigation}>
            {sections.map((section) => {
              const Icon = sectionIcons[section.type] || Home;
              return (
                <CommandItem
                  key={section.id}
                  onSelect={() => scrollToSection(section.type)}
                  className="cursor-pointer"
                >
                  <Icon className="size-4" />
                  <span>{section.title || section.type}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        <CommandSeparator />

        {/* Actions group */}
        <CommandGroup heading={t.commandPalette.actions}>
          <CommandItem onSelect={toggleTheme} className="cursor-pointer">
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            <span>{t.commandPalette.toggleTheme}</span>
          </CommandItem>
          <CommandItem onSelect={toggleLanguage} className="cursor-pointer">
            <Languages className="size-4" />
            <span>{t.commandPalette.switchLanguage}</span>
          </CommandItem>
          <CommandItem onSelect={printPage} className="cursor-pointer">
            <Printer className="size-4" />
            <span>{t.misc.printPage}</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
