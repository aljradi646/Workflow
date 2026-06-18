'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useSiteStore, type SocialLink } from '@/store/site-store';
import { useLanguageStore } from '@/store/language-store';
import { getTranslations } from '@/lib/i18n';
import { localizeNavigation } from '@/lib/localize';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Code2,
  Heart,
  ExternalLink,
  Send,
  Calendar,
  Briefcase,
  Users,
  Award,
  ArrowUp,
  Eye,
  Sparkles,
  ArrowLeft,
  Check,
  AlertCircle,
  ChevronLeft,
  Coffee,
} from 'lucide-react';
import { toast } from 'sonner';
import { NewsletterForm } from '@/components/public/NewsletterForm';

const socialIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Youtube,
};

const socialColors: Record<string, string> = {
  Github: 'hover:text-white hover:bg-gray-800 dark:hover:bg-gray-700',
  Linkedin: 'hover:text-white hover:bg-blue-600',
  Twitter: 'hover:text-white hover:bg-sky-500',
  Instagram: 'hover:text-white hover:bg-pink-600',
  Youtube: 'hover:text-white hover:bg-red-600',
};

/* Social icon hover glow shadows */
const socialGlow: Record<string, string> = {
  Github: 'group-hover/social:shadow-gray-500/30',
  Linkedin: 'group-hover/social:shadow-blue-500/30',
  Twitter: 'group-hover/social:shadow-sky-500/30',
  Instagram: 'group-hover/social:shadow-pink-500/30',
  Youtube: 'group-hover/social:shadow-red-500/30',
};

const socialTooltips: Record<string, string> = {
  Github: 'GitHub',
  Linkedin: 'LinkedIn',
  Twitter: 'Twitter / X',
  Instagram: 'Instagram',
  Youtube: 'YouTube',
};

const socialFollowers: Record<string, number> = {
  Github: 2400,
  Linkedin: 1800,
  Twitter: 5200,
  Instagram: 960,
  Youtube: 1400,
};

/* Social brand colors for the animated circle */
const socialBrandColors: Record<string, string> = {
  Github: '#333333',
  Linkedin: '#0A66C2',
  Twitter: '#1DA1F2',
  Instagram: '#E4405F',
  Youtube: '#FF0000',
};

/* ===== Visitor Counter Hook ===== */
function useVisitorCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('site_visitor_count');
      const storedDate = localStorage.getItem('site_visitor_date');
      const today = new Date().toDateString();

      let newCount: number;
      if (stored && storedDate === today) {
        newCount = parseInt(stored, 10);
      } else {
        const base = stored ? parseInt(stored, 10) : 1247;
        newCount = base + 1;
        localStorage.setItem('site_visitor_count', String(newCount));
        localStorage.setItem('site_visitor_date', today);
      }
      queueMicrotask(() => setCount(newCount));
    } catch {
      queueMicrotask(() => setCount(1248));
    }
  }, []);

  return count;
}

/* ===== Subscriber Count Hook ===== */
function useSubscriberCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch('/api/newsletter?count=true');
        if (res.ok) {
          const data = await res.json();
          setCount(data.data?.count || 256);
        } else {
          setCount(256);
        }
      } catch {
        setCount(256);
      }
    };
    fetchCount();
  }, []);

  return count;
}

/* ===== Scroll Progress Back-to-Top Button ===== */
function ScrollProgressTop() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const { language } = useLanguageStore();
  const t = getTranslations(language);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(scrollPercent);
      setVisible(scrollTop > 500);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    // Spring physics-like smooth scroll
    const startPosition = window.scrollY;
    const startTime = performance.now();
    const duration = Math.min(1200, startPosition * 0.5);

    function easeOutSpring(t: number): number {
      const c4 = (2 * Math.PI) / 3;
      return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    }

    function animateScroll(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progressVal = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutSpring(progressVal);
      window.scrollTo(0, startPosition * (1 - easedProgress));
      if (progressVal < 1) {
        requestAnimationFrame(animateScroll);
      }
    }

    requestAnimationFrame(animateScroll);
  }, []);

  if (!visible) return null;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      onClick={scrollToTop}
      className="fixed bottom-8 left-8 z-40 w-12 h-12 rounded-full glass-card flex items-center justify-center shadow-lg hover:shadow-emerald-500/20 transition-shadow group"
      aria-label={t.footer.backToTopAria}
    >
      <svg className="w-12 h-12 -rotate-90 absolute" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" className="text-muted/30" strokeWidth="2" />
        <circle
          cx="24" cy="24" r="20" fill="none" stroke="currentColor"
          className="text-emerald-500"
          strokeWidth="2"
          strokeDasharray={`${2 * Math.PI * 20}`}
          strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress / 100)}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.15s ease-out' }}
        />
      </svg>
      <ArrowUp className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
    </motion.button>
  );
}

/* ===== Counter Animation Hook ===== */
function useCounterAnimation(target: string, isInView: boolean) {
  const numericMatch = target.match(/(\d+)/);
  const isNumeric = !!numericMatch;
  const initialValue = isNumeric ? '0' : target;
  const [displayed, setDisplayed] = useState(initialValue);

  useEffect(() => {
    if (!isInView || !isNumeric) return;
    const endValue = parseInt(numericMatch![1], 10);
    const suffix = target.replace(numericMatch![1], '');
    const duration = 2000;
    const startTime = Date.now();
    let rafId: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progressVal = Math.min(elapsed / duration, 1);
      const eased = progressVal === 1 ? 1 : 1 - Math.pow(2, -10 * progressVal);
      const currentValue = Math.round(eased * endValue);
      setDisplayed(`${currentValue}${suffix}`);
      if (progressVal < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [target, isInView, isNumeric, numericMatch]);

  return displayed;
}

/* ===== Animated Stat Item ===== */
function AnimatedStat({ stat, index }: { stat: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const displayedValue = useCounterAnimation(stat.value, isInView);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="flex items-center gap-3 justify-center py-3"
    >
      <div className="w-10 h-10 rounded-xl gradient-emerald flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
        <stat.icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <div className="text-xl font-bold text-gradient-emerald">{displayedValue}</div>
        <div className="text-xs text-muted-foreground">{stat.label}</div>
      </div>
    </motion.div>
  );
}

/* ===== Quick Stats Row with animated counters & emerald dots ===== */
function QuickStatsBar({ stats }: { stats: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }[] }) {
  return (
    <div className="py-8">
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center gap-4">
            <AnimatedStat stat={stat} index={index} />
            {index < stats.length - 1 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500/60 shrink-0 hidden sm:block" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== Tech Stack Badge ===== */
function TechBadge({ name, color }: { name: string; color: string }) {
  return (
    <motion.span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium glass-card-sm ${color} transition-transform hover:scale-110`}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      {name}
    </motion.span>
  );
}

/* ===== Ripple Effect Component ===== */
function RippleButton({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
    props.onClick?.(e);
  };

  return (
    <button {...props} className={`relative overflow-hidden ${className}`} onClick={handleClick}>
      {children}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 pointer-events-none"
          style={{ left: ripple.x, top: ripple.y, width: 0, height: 0, transform: 'translate(-50%, -50%)' }}
          initial={{ width: 0, height: 0, opacity: 0.5 }}
          animate={{ width: 80, height: 80, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
    </button>
  );
}

/* ===== Animated Heart ===== */
function AnimatedHeart() {
  return (
    <motion.span
      animate={{
        scale: [1, 1.3, 1],
      }}
      transition={{
        repeat: Infinity,
        duration: 1.2,
        ease: 'easeInOut',
      }}
      className="inline-flex"
    >
      <Heart className="w-4 h-4 text-red-500 fill-red-500" />
    </motion.span>
  );
}

/* ===== Animated Coffee ===== */
function AnimatedCoffee() {
  return (
    <motion.span
      animate={{
        rotate: [0, -5, 5, -3, 0],
        y: [0, -1, 0],
      }}
      transition={{
        repeat: Infinity,
        duration: 2.5,
        ease: 'easeInOut',
        delay: 0.3,
      }}
      className="inline-flex"
    >
      <Coffee className="w-4 h-4 text-amber-700 dark:text-amber-500" />
    </motion.span>
  );
}

/* ===== Footer Component ===== */
export function Footer() {
  const { siteData } = useSiteStore();
  const { language } = useLanguageStore();
  const t = getTranslations(language);
  const settings = siteData?.settings || {};
  const socialLinks: SocialLink[] = siteData?.socialLinks || [];
  const navigation = siteData?.navigation || [];

  // Secret admin access: track rapid clicks on copyright text
  const [clickTimes, setClickTimes] = useState<number[]>([]);

  const handleSecretClick = useCallback(() => {
    const now = Date.now();
    setClickTimes(prev => {
      const recent = [...prev, now].filter(t => now - t < 3000);
      if (recent.length >= 7) {
        // Secret access triggered!
        window.dispatchEvent(new CustomEvent('admin-secret-access'));
        return [];
      }
      return recent;
    });
  }, []);

  // Localize navigation labels
  const localizedNavigation = useMemo(() =>
    navigation.map((nav) => {
      const localized = localizeNavigation(nav, language);
      return { ...nav, label: localized.label };
    }),
  [navigation, language]);

  const [parallaxOffset, setParallaxOffset] = useState(0);
  const visitorCount = useVisitorCount();
  const subscriberCount = useSubscriberCount();

  const currentYear = new Date().getFullYear();

  const quickStats = [
    { label: t.footer.yearsExperience, value: settings.owner_years_experience || '8+', icon: Calendar },
    { label: t.footer.projectsCompleted, value: settings.owner_projects_count || '150+', icon: Briefcase },
    { label: t.footer.happyClients, value: settings.owner_clients_count || '80+', icon: Users },
    { label: t.footer.awards, value: settings.owner_awards_count || '12+', icon: Award },
  ];

  const techStack = [
    { name: 'Next.js', color: 'text-foreground' },
    { name: 'TypeScript', color: 'text-blue-500' },
    { name: 'Tailwind CSS', color: 'text-cyan-500' },
    { name: 'Prisma', color: 'text-indigo-400' },
    { name: 'Framer Motion', color: 'text-purple-400' },
  ];

  // Subtle parallax effect
  useEffect(() => {
    const handleScroll = () => {
      const footer = document.getElementById('main-footer');
      if (!footer) return;
      const rect = footer.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        setParallaxOffset((window.innerHeight - rect.top) * 0.03);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <ScrollProgressTop />
      <footer
        id="main-footer"
        role="contentinfo"
        className="relative border-t border-border/50 bg-card/30 mt-auto overflow-hidden"
      >
        {/* Animated gradient blobs background */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ transform: `translateY(${parallaxOffset}px)` }}
        >
          <motion.div
            className="absolute top-20 right-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"
            animate={{
              x: [0, 30, -20, 0],
              y: [0, -20, 15, 0],
              scale: [1, 1.1, 0.95, 1],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-20 left-1/4 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl"
            animate={{
              x: [0, -25, 20, 0],
              y: [0, 25, -15, 0],
              scale: [1, 0.95, 1.1, 1],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-36 h-36 bg-emerald-600/3 rounded-full blur-3xl"
            animate={{
              x: [0, 40, -30, 0],
              y: [0, -30, 25, 0],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Subtle background dot pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
          <svg width="100%" height="100%">
            <pattern id="footer-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="currentColor" className="text-emerald-500" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#footer-dots)" />
          </svg>
        </div>

        {/* Animated Wave SVG Divider */}
        <div className="relative -mt-1">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 108C120 96 240 72 360 72C480 72 600 96 720 102C840 108 960 96 1080 84C1200 72 1320 60 1380 54L1440 48V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="currentColor" className="text-card/30" />
          </svg>
        </div>

        {/* Decorative gradient line at top */}
        <div className="relative h-1.5 w-full overflow-hidden">
          <div className="absolute inset-0 gradient-emerald" />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Quick Stats Row with animated counters & emerald dot separators */}
          <QuickStatsBar stats={quickStats} />

          {/* Gradient separator */}
          <div className="section-divider" />

          {/* Main footer content */}
          <div className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg gradient-emerald flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <Code2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-gradient-emerald">
                  {settings.site_name || t.footer.defaultSiteName}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                {settings.site_description || t.footer.defaultSiteDesc}
              </p>
              {/* Social links with animated branded circles, bounce, glow, tooltips, and follower counts */}
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((link) => {
                  const IconComponent = link.icon ? socialIconMap[link.icon] : ExternalLink;
                  if (!IconComponent) return null;
                  const followerCount = socialFollowers[link.icon] || 0;
                  const brandColor = socialBrandColors[link.icon] || '#10b981';

                  return (
                    <motion.a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`relative group/social inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg glass-card-sm text-muted-foreground transition-all duration-300 shadow-sm ${socialColors[link.icon] || 'hover:text-primary'} ${socialGlow[link.icon] || ''} group-hover/social:shadow-md`}
                      whileHover={{ scale: 1.08, y: -4 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label={`${socialTooltips[link.icon] || link.platform} - ${link.platform}`}
                    >
                      {/* Branded background circle that appears on hover */}
                      <motion.div
                        className="absolute inset-0 rounded-lg opacity-0 group-hover/social:opacity-100 transition-opacity duration-300"
                        style={{ backgroundColor: `${brandColor}15` }}
                      />
                      <motion.div
                        whileHover={{ rotate: [0, -10, 10, -5, 0] }}
                        transition={{ duration: 0.4 }}
                        className="relative z-10"
                      >
                        <IconComponent className="w-4 h-4" />
                      </motion.div>
                      {/* Animated follower count */}
                      <motion.span
                        className="text-[10px] text-muted-foreground/60 relative z-10"
                        initial={{ opacity: 0.6 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                      >
                        {followerCount >= 1000 ? `${(followerCount / 1000).toFixed(1)}K` : followerCount}
                      </motion.span>
                      {/* Tooltip */}
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-medium bg-popper text-popover-foreground opacity-0 group-hover/social:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                        {socialTooltips[link.icon] || link.platform}
                      </span>
                    </motion.a>
                  );
                })}
              </div>
            </div>

            {/* Quick Links - Enhanced with animated hover effects */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">{t.footer.quickLinks}</h3>
              <nav className="flex flex-col gap-1">
                {localizedNavigation.slice(0, 6).map((item) => (
                  <motion.a
                    key={item.id}
                    href={item.url || '#'}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group py-1"
                    whileHover={{ x: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/30 group-hover:bg-primary transition-colors shrink-0" />
                    <span className="relative">
                      {item.label}
                      <span className="absolute bottom-0 right-0 w-0 h-px gradient-emerald group-hover:w-full transition-all duration-300" />
                    </span>
                    <ArrowLeft className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 mr-auto" />
                  </motion.a>
                ))}
              </nav>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">{t.footer.contactUs}</h3>
              <div className="space-y-3">
                {settings.owner_email && (
                  <a
                    href={`mailto:${settings.owner_email}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                    aria-label={`${t.footer.emailLabel} ${settings.owner_email}`}
                  >
                    <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Mail className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="truncate">{settings.owner_email}</span>
                  </a>
                )}
                {settings.owner_phone && (
                  <a
                    href={`tel:${settings.owner_phone}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                    aria-label={`${t.footer.phoneLabel} ${settings.owner_phone}`}
                  >
                    <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Phone className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span dir="ltr">{settings.owner_phone}</span>
                  </a>
                )}
                {settings.owner_location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground group">
                    <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span>{settings.owner_location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Newsletter - Using NewsletterForm component with subscriber count */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">{t.footer.newsletter}</h3>
              {/* Subscriber count indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="flex items-center gap-1.5 text-xs text-muted-foreground/70"
              >
                <Users className="w-3.5 h-3.5 text-emerald-500" />
                <span>
                  {t.footer.joinSubscribers}{' '}
                  <span className="font-bold text-gradient-emerald">{subscriberCount.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>{' '}
                  {t.footer.subscribersCount}
                </span>
              </motion.div>
              <NewsletterForm variant="card" showTitle={false} />
            </div>
          </div>

          {/* Gradient separator */}
          <div className="section-divider" />

          {/* Made with ❤️ and ☕ + Tech Stack + Visitor Counter */}
          <div className="py-6 flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              {t.footer.madeWithLoveAndCoffee.split('❤️')[0]}
              <AnimatedHeart />
              {t.footer.madeWithLoveAndCoffee.split('❤️')[1]?.split('☕')[0]}
              <AnimatedCoffee />
              {t.footer.madeWithLoveAndCoffee.split('☕')[1]}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {techStack.map((tech) => (
                <TechBadge key={tech.name} name={tech.name} color={tech.color} />
              ))}
            </div>
            {/* Visitor Counter */}
            <div className="flex items-center gap-2 mt-2 glass-card-sm rounded-full px-4 py-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs text-muted-foreground">
                {t.footer.visitorNumber}
                <span className="font-bold text-gradient-emerald font-mono"> {visitorCount.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
              </span>
              <Sparkles className="w-3 h-3 text-emerald-400" />
            </div>
          </div>

          {/* Gradient separator */}
          <div className="section-divider" />

          {/* Bottom Bar */}
          <div className="py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground select-none" onClick={handleSecretClick}>
                {settings.footer_text || `© ${currentYear} ${t.footer.copyright}. ${t.footer.rights}.`}
              </p>
              <div className="flex items-center gap-4">
                <p className="text-xs text-muted-foreground/50">
                  Powered by Next.js & TypeScript
                </p>
                {/* Back to top link */}
                <button
                  onClick={scrollToTop}
                  className="text-xs text-muted-foreground/30 hover:text-muted-foreground transition-colors flex items-center gap-1 min-w-[44px] min-h-[44px] justify-center"
                  aria-label={t.footer.backToTopAria}
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
