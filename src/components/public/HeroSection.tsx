'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useSiteStore, type Section } from '@/store/site-store';
import { useLanguageStore } from '@/store/language-store';
import { getTranslations } from '@/lib/i18n';
import { localizeSection } from '@/lib/localize';
import { Button } from '@/components/ui/button';
import { TextReveal } from '@/components/public/TextReveal';
import { ParallaxWrapper } from '@/components/public/ParallaxWrapper';
import { ParticleButton } from '@/components/public/ParticleButton';
import {
  ArrowDown,
  Download,
  MessageCircle,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  ExternalLink,
  Sparkles,
  Heart,
  Star,
  Code2,
  Award,
  FileText,
  TrendingUp,
  Users,
  Trophy,
} from 'lucide-react';

interface HeroSectionProps {
  section: Section;
  onViewResume?: () => void;
}

const socialIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Github,
  Linkedin,
  Twitter,
  Instagram,
};

const socialBrandColors: Record<string, string> = {
  Github: 'hover:text-gray-800 dark:hover:text-gray-300',
  Linkedin: 'hover:text-blue-600 dark:hover:text-blue-400',
  Twitter: 'hover:text-sky-500 dark:hover:text-sky-400',
  Instagram: 'hover:text-pink-500 dark:hover:text-pink-400',
};

function FloatingShape({ className, delay = 0, duration = 6, parallaxSpeed, children }: {
  className?: string;
  delay?: number;
  duration?: number;
  parallaxSpeed?: number;
  children: React.ReactNode;
}) {
  return (
    <ParallaxWrapper speed={parallaxSpeed || 0.2} className={`absolute pointer-events-none ${className}`}>
      <motion.div
        animate={{
          y: [-20, 20, -20],
          x: [0, 10, 0],
          rotate: [0, 360],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
          delay,
        }}
      >
        {children}
      </motion.div>
    </ParallaxWrapper>
  );
}

function Sparkle({ style }: { style: React.CSSProperties }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={style}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 2 + Math.random() * 2,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: Math.random() * 3,
      }}
    >
      <Sparkles className="w-3 h-3 text-emerald-400/60" />
    </motion.div>
  );
}

// Floating code symbols particle
function CodeParticle({ symbol, style, duration, delay }: {
  symbol: string;
  style: React.CSSProperties;
  duration: number;
  delay: number;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none font-mono"
      style={style}
      initial={{ opacity: 0, y: 0 }}
      animate={{
        y: [0, -120, -240],
        x: [0, Math.random() * 30 - 15, Math.random() * 20 - 10],
        opacity: [0, 0.6, 0],
        rotate: [0, Math.random() * 40 - 20],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeOut',
        delay,
      }}
    >
      <span className="text-emerald-500/40 dark:text-emerald-400/30" style={{ fontSize: style.fontSize as string || '14px' }}>
        {symbol}
      </span>
    </motion.div>
  );
}

function StatusPulse() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
    </span>
  );
}

// Animated counter that counts up when in view
function AnimatedCounter({ value, suffix = '', duration = 2000 }: { value: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    const el = ref.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const stepDuration = duration / steps;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepDuration);
    return () => clearInterval(timer);
  }, [isVisible, value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}{suffix}
    </span>
  );
}

// Floating achievement badge
function FloatingAchievementBadge({
  label,
  icon: Icon,
  delay = 0,
  className = '',
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={`absolute pointer-events-none z-20 ${className}`}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: [0, 1, 1, 0.9, 1],
        scale: [0.5, 1, 1, 0.97, 1],
        y: [0, -6, 0, -4, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      <div className="glass-card-sm px-2.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/10 border border-emerald-500/20">
        <Icon className="w-3 h-3" />
        <span>{label}</span>
      </div>
    </motion.div>
  );
}

function TechOrbit({ technologies }: { technologies: string[] }) {
  const radius = 80;
  const displayedTechs = technologies.slice(0, 6);
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        {displayedTechs.map((tech, i) => {
          const angle = (2 * Math.PI * i) / displayedTechs.length - Math.PI / 2;
          const x = 50 + (radius / 2) * Math.cos(angle);
          const y = 50 + (radius / 2) * Math.sin(angle);
          return (
            <motion.div
              key={tech}
              className="absolute w-8 h-8 rounded-lg glass-card-sm flex items-center justify-center text-xs font-bold text-primary"
              style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
              animate={{ rotate: -360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            >
              {tech.slice(0, 2)}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const heroEl = document.getElementById('hero');
      if (!heroEl) return;
      const rect = heroEl.getBoundingClientRect();
      const heroHeight = heroEl.offsetHeight;
      const scrolled = Math.max(0, -rect.top);
      setProgress(Math.min(100, (scrolled / heroHeight) * 100));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (progress === 0) return null;

  return (
    <div className="absolute top-0 left-0 right-0 h-1 z-20">
      <motion.div
        className="h-full gradient-emerald"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.1 }}
      />
    </div>
  );
}

function MouseGlow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 200 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    const container = containerRef.current?.parentElement;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    };

    container.addEventListener('mousemove', handleMouseMove);
    return () => container.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          x,
          y,
          translateX: '-50%',
          translateY: '-50%',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-full h-full rounded-full bg-gradient-radial from-emerald-500/10 via-teal-500/5 to-transparent" />
      </motion.div>
    </div>
  );
}

// Pulsing ring component for avatar
function PulsingRing({ delay, size, borderWidth }: { delay: number; size: number; borderWidth: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: `calc(50% - ${size / 2}px)`,
        top: `calc(50% - ${size / 2}px)`,
        border: `${borderWidth}px solid rgba(16, 185, 129, 0.3)`,
      }}
      animate={{
        scale: [1, 1.15, 1],
        opacity: [0.6, 0.15, 0.6],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    />
  );
}

export function HeroSection({ section, onViewResume }: HeroSectionProps) {
  const { siteData } = useSiteStore();
  const { language } = useLanguageStore();
  const t = getTranslations(language);
  const isRTL = language === 'ar';
  const settings = siteData?.settings || {};
  const socialLinks = siteData?.socialLinks || [];

  const content = (() => {
    try { return JSON.parse(section.content || '{}'); } catch { return {}; }
  })();

  const contentEn = (() => {
    if (language === 'en' && section.contentEn) {
      try { return JSON.parse(section.contentEn); } catch { return null; }
    }
    return null;
  })();

  // Use English content when available, fall back to Arabic content, then to defaults
  const activeContent = contentEn || content;

  const technologies: string[] = activeContent.technologies || ['React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'AWS'];

  const typingTexts: string[] = activeContent.typingTexts || [
    t.hero.title1,
    t.hero.title2,
    t.hero.title3,
  ];

  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  const handleTyping = useCallback(() => {
    const currentText = typingTexts[currentTextIndex];

    if (!isDeleting) {
      setDisplayText(currentText.substring(0, displayText.length + 1));
      setTypingSpeed(80 + Math.random() * 40);

      if (displayText === currentText) {
        setTypingSpeed(2000);
        setIsDeleting(true);
      }
    } else {
      setDisplayText(currentText.substring(0, displayText.length - 1));
      setTypingSpeed(40);

      if (displayText === '') {
        setIsDeleting(false);
        setCurrentTextIndex((prev) => (prev + 1) % typingTexts.length);
        setTypingSpeed(400);
      }
    }
  }, [displayText, isDeleting, currentTextIndex, typingTexts]);

  useEffect(() => {
    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [handleTyping, typingSpeed]);

  const localizedSection = localizeSection(section, language);
  const title = activeContent.title || settings.hero_title || localizedSection.title;
  const subtitle = activeContent.subtitle || settings.hero_subtitle || localizedSection.subtitle;
  const ctaPrimary = activeContent.ctaPrimary || { text: settings.hero_cta_primary || t.hero.exploreWork, url: '#projects' };
  const ctaSecondary = activeContent.ctaSecondary || { text: settings.hero_cta_secondary || t.hero.contactMe, url: '#contact' };
  const avatarUrl = settings.owner_avatar || activeContent.avatarUrl || null;
  const ownerName = settings.owner_name || settings.site_name || t.hero.defaultName;

  const scrollToSection = (url: string) => {
    const el = document.querySelector(url);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const sparklePositions = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      style: {
        top: `${10 + Math.random() * 80}%`,
        left: `${5 + Math.random() * 90}%`,
      },
      key: i,
    })), []);

  // Code particle positions for background
  const codeParticles = useMemo(() => {
    const symbols = ['{', '}', '<', '/>', '(', ')', '=', ';', '=>', '[]', '&&', '||', '++', '{}', '!='];
    return Array.from({ length: 18 }, (_, i) => ({
      symbol: symbols[i % symbols.length],
      style: {
        top: `${60 + Math.random() * 40}%`,
        left: `${5 + Math.random() * 90}%`,
        fontSize: `${10 + Math.random() * 14}px`,
      },
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 8,
      key: i,
    }));
  }, []);

  // Social link tooltip state
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative min-h-screen flex items-center justify-center section-padding overflow-hidden"
    >
      {/* Scroll Progress Indicator */}
      <ScrollProgress />

      {/* Gradient mesh background overlay */}
      <div className="absolute inset-0 bg-mesh-emerald pointer-events-none z-0" />

      {/* Mouse-reactive glow effect */}
      <MouseGlow />

      {/* Decorative gradient orbs */}
      <div className="absolute top-20 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] gradient-emerald-radial pointer-events-none" />

      {/* Code Particle Background */}
      {codeParticles.map((p) => (
        <CodeParticle
          key={p.key}
          symbol={p.symbol}
          style={p.style}
          duration={p.duration}
          delay={p.delay}
        />
      ))}

      {/* Floating geometric shapes with parallax */}
      <FloatingShape className="top-[15%] right-[10%] opacity-20" delay={0} duration={8} parallaxSpeed={0.3}>
        <svg width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="28" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-500" />
        </svg>
      </FloatingShape>

      <FloatingShape className="top-[25%] left-[8%] opacity-15" delay={1} duration={7} parallaxSpeed={0.2}>
        <svg width="50" height="50" viewBox="0 0 50 50">
          <rect x="5" y="5" width="40" height="40" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-teal-500" transform="rotate(45 25 25)" />
        </svg>
      </FloatingShape>

      <FloatingShape className="bottom-[20%] right-[15%] opacity-15" delay={2} duration={9} parallaxSpeed={0.25}>
        <svg width="55" height="55" viewBox="0 0 55 55">
          <polygon points="27.5,5 50,45 5,45" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-400" />
        </svg>
      </FloatingShape>

      <FloatingShape className="top-[60%] left-[5%] opacity-10" delay={3} duration={10} parallaxSpeed={0.15}>
        <svg width="40" height="40" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="8" fill="currentColor" className="text-emerald-500" />
        </svg>
      </FloatingShape>

      <FloatingShape className="top-[10%] left-[40%] opacity-10" delay={1.5} duration={11} parallaxSpeed={0.35}>
        <svg width="30" height="30" viewBox="0 0 30 30">
          <rect x="5" y="5" width="20" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="1" className="text-teal-400" />
        </svg>
      </FloatingShape>

      <FloatingShape className="bottom-[30%] left-[25%] opacity-10" delay={2.5} duration={7.5} parallaxSpeed={0.18}>
        <svg width="35" height="35" viewBox="0 0 35 35">
          <polygon points="17.5,3 32,30 3,30" fill="none" stroke="currentColor" strokeWidth="1" className="text-emerald-300" />
        </svg>
      </FloatingShape>

      {/* Heart shape floating */}
      <FloatingShape className="top-[35%] right-[5%] opacity-15" delay={0.5} duration={9} parallaxSpeed={0.2}>
        <Heart className="w-8 h-8 text-rose-400/40" />
      </FloatingShape>

      {/* Star shape floating */}
      <FloatingShape className="bottom-[15%] left-[12%] opacity-15" delay={1.8} duration={8} parallaxSpeed={0.3}>
        <Star className="w-7 h-7 text-amber-400/40" />
      </FloatingShape>

      {/* Code brackets floating */}
      <FloatingShape className="top-[20%] right-[25%] opacity-12" delay={3.2} duration={10} parallaxSpeed={0.25}>
        <Code2 className="w-10 h-10 text-emerald-500/30" />
      </FloatingShape>

      {/* Another star */}
      <FloatingShape className="bottom-[40%] right-[8%] opacity-10" delay={2.8} duration={7.5} parallaxSpeed={0.22}>
        <Star className="w-5 h-5 text-teal-400/40" fill="currentColor" />
      </FloatingShape>

      {/* Sparkle effects */}
      {sparklePositions.map((pos, i) => (
        <Sparkle key={pos.key} style={pos.style} />
      ))}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Profile Avatar with Enhanced Pulsing Rings & Glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, type: 'spring', stiffness: 200 }}
            className="mb-8 relative"
          >
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center">
              {/* Floating Achievement Badges */}
              <FloatingAchievementBadge
                label={t.hero.topRated}
                icon={TrendingUp}
                delay={0.5}
                className="top-0 -right-6 sm:-right-10"
              />
              <FloatingAchievementBadge
                label={t.hero.jss}
                icon={Award}
                delay={1.2}
                className="bottom-2 -left-6 sm:-left-10"
              />
              <FloatingAchievementBadge
                label={t.hero.fiveStars}
                icon={Star}
                delay={1.8}
                className="bottom-10 -right-4 sm:-right-8"
              />

              {/* Tech Orbit Ring */}
              <TechOrbit technologies={technologies} />

              {/* Glow effect behind avatar - subtle pulsing */}
              <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: '160px',
                  height: '160px',
                  left: 'calc(50% - 80px)',
                  top: 'calc(50% - 80px)',
                  background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, rgba(20, 184, 166, 0.15) 40%, transparent 70%)',
                  filter: 'blur(15px)',
                }}
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* 3 Concentric pulsing rings with staggered delays */}
              <PulsingRing delay={0} size={180} borderWidth={1.5} />
              <PulsingRing delay={0.8} size={200} borderWidth={1} />
              <PulsingRing delay={1.6} size={220} borderWidth={0.75} />

              {/* Decorative ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-emerald-500/20 animate-spin-slow" />
              <div className="absolute rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-500 opacity-60" style={{ inset: '6px' }} />

              {avatarUrl ? (
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden ring-4 ring-background z-10">
                  <img
                    src={avatarUrl}
                    alt={ownerName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full gradient-emerald flex items-center justify-center ring-4 ring-background z-10">
                  <span className="text-3xl sm:text-4xl font-bold text-white">
                    {ownerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Enhanced Status Badge with shimmer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full glass-card text-sm font-medium text-primary mb-6 relative overflow-hidden">
              {/* Shimmer animation */}
              <motion.div
                className="absolute inset-0 -translate-x-full"
                animate={{ translateX: ['100%', '-100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              >
                <div className="w-full h-full bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent" />
              </motion.div>
              <StatusPulse />
              <span>{t.contact.currentlyAvailable}</span>
            </div>
          </motion.div>

          {/* Title with Animated Gradient Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-4"
          >
            <h1
              id="hero-heading"
              className="inline-block bg-clip-text text-transparent animate-gradient-flow"
              style={{
                backgroundImage: 'linear-gradient(90deg, #10b981, #14b8a6, #06b6d4, #10b981)',
                backgroundSize: '200% auto',
              }}
            >
              <TextReveal
                text={title}
                type="fade-up"
                as="span"
                className="bg-clip-text text-transparent"
                staggerDelay={0.04}
                delay={0.3}
              />
            </h1>
          </motion.div>

          {/* Enhanced Typing Subtitle with gradient text and smoother cursor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-xl sm:text-2xl md:text-3xl mb-6 h-10 sm:h-12 flex items-center"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 bg-clip-text text-transparent">
              {displayText}
            </span>
            <motion.span
              className="inline-block w-0.5 h-8 mr-1 origin-center"
              style={{
                background: 'linear-gradient(to bottom, #10b981, #14b8a6)',
              }}
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="text-base sm:text-lg text-muted-foreground max-w-2xl mb-8 leading-relaxed"
          >
            {subtitle}
          </motion.p>

          {/* Enhanced CTA Buttons with Shine Sweep and Breathing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 mb-8 w-full sm:w-auto"
          >
            <ParticleButton
              onClick={() => scrollToSection(ctaPrimary.url)}
              className="rounded-lg"
            >
              <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Button
                  size="lg"
                  className="gradient-emerald text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/50 transition-all duration-300 text-base px-8 py-6 hover-glow breathing-glow group pointer-events-none relative overflow-hidden"
                >
                  {/* Shine sweep effect on hover */}
                  <span className="absolute inset-0 overflow-hidden rounded-lg">
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </span>
                  <ArrowDown className="w-5 h-5 ml-2 group-hover:translate-y-0.5 transition-transform relative z-10" />
                  <span className="relative z-10">{ctaPrimary.text}</span>
                </Button>
              </motion.div>
            </ParticleButton>

            <ParticleButton
              onClick={() => scrollToSection(ctaSecondary.url)}
              className="rounded-lg"
            >
              <Button
                size="lg"
                variant="outline"
                className="relative glass-card hover:bg-accent text-base px-8 py-6 group overflow-hidden pointer-events-none"
              >
                {/* Shine sweep effect on hover */}
                <span className="absolute inset-0 overflow-hidden rounded-lg">
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-emerald-500/15 to-transparent" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                <MessageCircle className="w-5 h-5 ml-2 relative z-10" />
                <span className="relative z-10">{ctaSecondary.text}</span>
              </Button>
            </ParticleButton>
          </motion.div>

          {/* Resume Download & View Resume */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="mb-6 flex flex-wrap items-center justify-center gap-3"
          >
            {onViewResume && (
              <Button
                size="default"
                className="relative glass-card hover:bg-accent/80 text-sm px-6 py-3 group overflow-hidden border border-emerald-500/30 hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300"
                onClick={onViewResume}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <FileText className="w-4 h-4 ml-2 group-hover:-translate-y-0.5 transition-transform duration-300 relative z-10" />
                <span className="relative z-10 font-semibold">{t.hero.viewResume}</span>
              </Button>
            )}
            <Button
              size="default"
              className="relative glass-card hover:bg-accent/80 text-sm px-6 py-3 group overflow-hidden border border-emerald-500/30 hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300"
              asChild
            >
              <a href="/api/resume/download" download>
                <span className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Download className="w-4 h-4 ml-2 group-hover:-translate-y-0.5 transition-transform duration-300 relative z-10" />
                <span className="relative z-10 font-semibold">{t.buttons.downloadCv}</span>
              </a>
            </Button>
            {settings.resume_url && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary group"
                asChild
              >
                <a href={settings.resume_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                  <span className="text-xs">{t.hero.externalLink}</span>
                </a>
              </Button>
            )}
          </motion.div>

          {/* Animated Counter Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-2xl"
          >
            {[
              { value: 8, suffix: '+', label: t.hero.yearsExperience, icon: TrendingUp },
              { value: 150, suffix: '+', label: t.hero.projectsCompleted, icon: Code2 },
              { value: 80, suffix: '+', label: t.hero.happyClients, icon: Users },
              { value: 12, suffix: '', label: t.hero.awardsWon, icon: Trophy },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.9 + idx * 0.1 }}
                className="glass-card p-3 sm:p-4 rounded-xl text-center border border-emerald-500/10 hover:border-emerald-500/30 transition-all duration-300 group hover:shadow-lg hover:shadow-emerald-500/5"
              >
                <stat.icon className="w-4 h-4 mx-auto mb-1.5 text-emerald-500/60 group-hover:text-emerald-500 transition-colors" />
                <p className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Enhanced Social Links Row with branded colors, tooltips, and connecting line */}
          {socialLinks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.8 }}
              className="flex items-center gap-3 mb-8"
            >
              <span className="text-xs text-muted-foreground">{t.contact.followMe}</span>
              <div className="w-8 h-px bg-border" />
              <div className="flex items-center gap-0 relative">
                {/* Connecting line animation between social icons */}
                <motion.div
                  className="absolute top-1/2 h-px bg-gradient-to-r from-emerald-500/0 via-emerald-500/30 to-emerald-500/0"
                  initial={{ width: 0, left: '50%' }}
                  animate={{ width: '100%', left: 0 }}
                  transition={{ duration: 1.2, delay: 1, ease: 'easeInOut' }}
                  style={{ transform: 'translateY(-50%)' }}
                />

                {socialLinks.map((link, idx) => {
                  const IconComponent = link.icon ? socialIconMap[link.icon] : ExternalLink;
                  if (!IconComponent) return null;
                  const brandColor = link.icon ? socialBrandColors[link.icon] || '' : '';
                  return (
                    <motion.div
                      key={link.id}
                      className="relative"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.9 + idx * 0.1 }}
                      onHoverStart={() => setHoveredSocial(link.id)}
                      onHoverEnd={() => setHoveredSocial(null)}
                    >
                      <motion.a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-11 h-11 rounded-lg glass-card-sm flex items-center justify-center text-muted-foreground transition-all duration-300 ${brandColor}`}
                        whileHover={{ scale: 1.15, y: -3 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={link.platform}
                        data-cursor-hover
                      >
                        <IconComponent className="w-4 h-4" />
                      </motion.a>
                      {/* Tooltip */}
                      <AnimatePresence>
                        {hoveredSocial === link.id && (
                          <motion.div
                            initial={{ opacity: 0, y: 4, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.9 }}
                            transition={{ duration: 0.15 }}
                            className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-card border border-border text-[10px] font-medium text-primary whitespace-nowrap shadow-lg z-30"
                          >
                            {link.platform}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Enhanced Scroll Indicator - Mouse icon with progress ring */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.button
              onClick={() => scrollToSection('#about')}
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-muted-foreground hover:text-primary transition-colors group min-w-[44px] min-h-[44px]"
              aria-label={t.hero.scrollDown}
              data-cursor-hover
            >
              <div className="flex flex-col items-center gap-2 relative">
                {/* Progress ring around mouse */}
                <div className="relative">
                  <svg
                    className="absolute -inset-1.5 w-[calc(100%+12px)] h-[calc(100%+12px)] -rotate-90"
                    viewBox="0 0 36 56"
                    fill="none"
                  >
                    <motion.circle
                      cx="18"
                      cy="28"
                      r="16"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-muted-foreground/20"
                      fill="none"
                    />
                    <motion.circle
                      cx="18"
                      cy="28"
                      r="16"
                      stroke="url(#scroll-progress-gradient)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 16}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 16 }}
                      animate={{
                        strokeDashoffset: 2 * Math.PI * 16 * (1 - Math.min(1, typeof window !== 'undefined' ? window.scrollY / (document.body.scrollHeight - window.innerHeight || 1) : 0)),
                      }}
                      transition={{ duration: 0.3 }}
                    />
                    <defs>
                      <linearGradient id="scroll-progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="50%" stopColor="#14b8a6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* Pulse animation behind mouse */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-emerald-500/10"
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.3, 0, 0.3],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  {/* Mouse icon with animated scroll wheel */}
                  <div className="relative w-6 h-10 rounded-full border-2 border-muted-foreground/40 group-hover:border-primary/60 transition-colors flex items-start justify-center p-1.5">
                    <motion.div
                      className="w-1 h-2 rounded-full bg-emerald-500"
                      animate={{ y: [0, 10, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </div>
                </div>
                <span className="text-[10px] uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                  {t.hero.discover}
                </span>
              </div>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
