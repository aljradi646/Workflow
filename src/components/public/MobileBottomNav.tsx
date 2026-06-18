'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSiteStore } from '@/store/site-store';
import {
  Home,
  FolderKanban,
  Wrench,
  BookOpen,
  Mail,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  url: string;
}

const defaultNavItems: NavItem[] = [
  { id: 'hero', label: 'الرئيسية', icon: Home, url: '#hero' },
  { id: 'projects', label: 'المشاريع', icon: FolderKanban, url: '#projects' },
  { id: 'services', label: 'الخدمات', icon: Wrench, url: '#services' },
  { id: 'blog', label: 'المدونة', icon: BookOpen, url: '#blog' },
  { id: 'contact', label: 'تواصل', icon: Mail, url: '#contact' },
];

export function MobileBottomNav() {
  const { activeSection } = useSiteStore();
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleNavClick = (url: string) => {
    const el = document.querySelector(url);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed bottom-0 left-0 right-0 z-40 md:hidden mobile-bottom-nav"
        >
          {/* Blur backdrop */}
          <div className="glass-header-scrolled border-t border-border/50">
            <div className="flex items-center justify-around py-2 px-2">
              {defaultNavItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.url)}
                    className={`relative flex flex-col items-center justify-center gap-0.5 py-2 px-3 rounded-xl transition-all duration-200 min-w-[56px] min-h-[44px] ${
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }`}
                    aria-label={item.label}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="mobileActiveNav"
                        className="absolute inset-0 rounded-xl bg-primary/10"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                    <item.icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-primary' : ''}`} />
                    <span className={`text-[10px] font-medium relative z-10 ${isActive ? 'text-primary' : ''}`}>
                      {item.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="mobileActiveDot"
                        className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full gradient-emerald"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
