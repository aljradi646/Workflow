'use client';

import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useSiteStore, type Section } from '@/store/site-store';
import { useLanguageStore } from '@/store/language-store';
import { getTranslations } from '@/lib/i18n';
import { localizeSection, localizeSectionItem } from '@/lib/localize';
import { ParallaxWrapper } from '@/components/public/ParallaxWrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Briefcase,
  Users,
  Award,
  Code2,
  Coffee,
  Zap,
  Sparkles,
  Star,
  Hexagon,
  Download,
  Phone,
  ChevronDown,
  ChevronUp,
  Circle,
  ExternalLink,
  Activity,
  BarChart3,
  TrendingUp,
  X,
} from 'lucide-react';

interface AboutSectionProps {
  section: Section;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Calendar,
  Briefcase,
  Users,
  Award,
  Code2,
  Coffee,
  Zap,
};

const tagDotColors = [
  'bg-emerald-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-amber-500',
  'bg-emerald-400',
  'bg-teal-400',
];

/* Tech stack data with proficiency and categories */
interface TechItem {
  name: string;
  proficiency: number; // 0-100
  category: string;
  categoryAr: string;
}

const techStackData: TechItem[] = [
  { name: 'React', proficiency: 95, category: 'Frontend', categoryAr: 'الواجهة الأمامية' },
  { name: 'Next.js', proficiency: 90, category: 'Frontend', categoryAr: 'الواجهة الأمامية' },
  { name: 'TypeScript', proficiency: 92, category: 'Frontend', categoryAr: 'الواجهة الأمامية' },
  { name: 'Node.js', proficiency: 85, category: 'Backend', categoryAr: 'الواجهة الخلفية' },
  { name: 'Python', proficiency: 80, category: 'Backend', categoryAr: 'الواجهة الخلفية' },
  { name: 'PostgreSQL', proficiency: 78, category: 'Database', categoryAr: 'قواعد البيانات' },
  { name: 'Docker', proficiency: 75, category: 'DevOps', categoryAr: 'العمليات' },
  { name: 'AWS', proficiency: 70, category: 'DevOps', categoryAr: 'العمليات' },
  { name: 'Figma', proficiency: 82, category: 'Design', categoryAr: 'التصميم' },
  { name: 'Tailwind CSS', proficiency: 95, category: 'Frontend', categoryAr: 'الواجهة الأمامية' },
];

/* Highlight keywords in bio text */
function HighlightedBio({ text, language }: { text: string; language: 'ar' | 'en' }) {
  const keywords = language === 'ar'
    ? ['تطوير', 'تصميم', 'برمجة', 'إبداع', 'حلول', 'تقنية', 'ذكاء اصطناعي', 'ويب', 'تطبيقات', 'إدارة']
    : ['development', 'design', 'programming', 'creative', 'solutions', 'technology', 'AI', 'web', 'applications', 'management'];

  // Split text and highlight keywords
  const parts: Array<{ text: string; highlighted: boolean }> = [];
  let remaining = text;

  // Simple keyword highlighting
  const regex = new RegExp(`(${keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const segments = remaining.split(regex);

  return (
    <>
      {segments.map((segment, i) => {
        const isKeyword = keywords.some(k => segment.toLowerCase() === k.toLowerCase());
        return isKeyword ? (
          <span key={i} className="text-emerald-600 dark:text-emerald-400 font-semibold">{segment}</span>
        ) : (
          <span key={i}>{segment}</span>
        );
      })}
    </>
  );
}

/* Typewriter effect component */
function TypewriterText({ text, isVisible, speed = 25 }: { text: string; isVisible: boolean; speed?: number }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!isVisible || hasStarted.current) return;
    hasStarted.current = true;
    setDisplayedText('');
    setIsComplete(false);

    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, isVisible, speed]);

  // Show full text immediately if not visible yet
  if (!isVisible) {
    return <>{text}</>;
  }

  return (
    <>
      {displayedText}
      {!isComplete && (
        <motion.span
          className="inline-block w-0.5 h-5 bg-emerald-500 mr-1 align-middle"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
        />
      )}
    </>
  );
}

/* Mini sparkline behind stat */
function MiniSparkline({ data, color = '#10b981' }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 80;
  const height = 30;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="opacity-20 group-hover:opacity-40 transition-opacity">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Fill area */}
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={color}
        opacity="0.1"
      />
    </svg>
  );
}

/* Circular progress ring for stat cards */
function CircularProgressRing({ percentage, size = 80, strokeWidth = 4 }: { percentage: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      const progressOffset = circumference - (percentage / 100) * circumference;
      setOffset(progressOffset);
    }, 300);
    return () => clearTimeout(timer);
  }, [percentage, circumference]);

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-emerald-500/10"
      />
      {/* Progress ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#emeraldGradient)"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
      />
      <defs>
        <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* Enhanced AnimatedCounter with pulsing suffix */
function AnimatedCounter({ target, duration = 2000, suffix = '+' }: { target: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current || target <= 0) return;

    const timeout = setTimeout(() => {
      hasAnimated.current = true;
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * target));
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }, 300);

    return () => clearTimeout(timeout);
  }, [target, duration]);

  return (
    <span>
      {count}
      <motion.span
        className="inline-block"
        animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {suffix}
      </motion.span>
    </span>
  );
}

const gradientColors = [
  'from-emerald-500/10 to-teal-500/10',
  'from-teal-500/10 to-cyan-500/10',
  'from-emerald-500/10 to-green-500/10',
  'from-green-500/10 to-emerald-500/10',
];

/* Sparkline data for each stat */
const statSparklineData: Record<string, number[]> = {
  Calendar: [3, 4, 5, 6, 7, 8, 8],
  Briefcase: [20, 45, 70, 95, 120, 140, 150],
  Users: [10, 20, 35, 50, 60, 72, 80],
  Award: [1, 2, 4, 6, 8, 10, 12],
};

/* Stat detail descriptions */
const statDetails: Record<string, { en: string; ar: string }> = {
  Calendar: { en: 'Years of professional experience in web and mobile development', ar: 'سنوات من الخبرة المهنية في تطوير الويب والتطبيقات' },
  Briefcase: { en: 'Projects delivered successfully across various industries', ar: 'مشاريع تم تسليمها بنجاح عبر مختلف القطاعات' },
  Users: { en: 'Satisfied clients with an average rating of 4.9/5', ar: 'عملاء راضون بمتوسط تقييم 4.9/5' },
  Award: { en: 'Industry awards and recognitions received', ar: 'جوائز وتقديرات صناعية تم الحصول عليها' },
};

// Constellation dots and lines for profile image
function ConstellationEffect() {
  const dots = useMemo(() => [
    { x: -35, y: -40, size: 4 },
    { x: 40, y: -35, size: 3 },
    { x: -45, y: 20, size: 3 },
    { x: 45, y: 25, size: 4 },
    { x: -20, y: -50, size: 2 },
    { x: 25, y: -48, size: 2 },
    { x: -50, y: -10, size: 3 },
    { x: 50, y: 10, size: 3 },
    { x: -30, y: 45, size: 2 },
    { x: 35, y: 48, size: 3 },
  ], []);

  const connections = useMemo(() => [
    [0, 2], [0, 4], [1, 5], [1, 3], [2, 6], [3, 7], [4, 5], [6, 8], [7, 9], [8, 9],
  ], []);

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="-60 -60 120 120">
        {/* Connecting lines */}
        {connections.map(([from, to], i) => (
          <motion.line
            key={`line-${i}`}
            x1={dots[from].x}
            y1={dots[from].y}
            x2={dots[to].x}
            y2={dots[to].y}
            stroke="rgba(16, 185, 129, 0.15)"
            strokeWidth="0.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.5 + i * 0.1, ease: 'easeInOut' }}
          />
        ))}
        {/* Dots */}
        {dots.map((dot, i) => (
          <motion.circle
            key={`dot-${i}`}
            cx={dot.x}
            cy={dot.y}
            r={dot.size}
            fill="rgba(16, 185, 129, 0.3)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: [0, 0.6, 0.3] }}
            transition={{ duration: 0.6, delay: 0.3 + i * 0.08 }}
          />
        ))}
      </svg>
    </div>
  );
}

/* ===== Tech Stack Graph Visualization ===== */
function TechStackGraph({ techs, language, t }: { techs: TechItem[]; language: 'ar' | 'en'; t: ReturnType<typeof getTranslations> }) {
  const [hoveredTech, setHoveredTech] = useState<string | null>(null);

  // Group techs by category
  const categories = useMemo(() => {
    const cats: Record<string, TechItem[]> = {};
    techs.forEach(tech => {
      const cat = language === 'ar' ? tech.categoryAr : tech.category;
      if (!cats[cat]) cats[cat] = [];
      cats[cat].push(tech);
    });
    return cats;
  }, [techs, language]);

  const getProficiencyLabel = (prof: number) => {
    if (prof >= 90) return t.about.expert;
    if (prof >= 75) return t.about.advanced;
    if (prof >= 50) return t.about.intermediate;
    return t.about.beginner;
  };

  const getProficiencyColor = (prof: number) => {
    if (prof >= 90) return 'bg-emerald-500';
    if (prof >= 75) return 'bg-teal-500';
    if (prof >= 50) return 'bg-cyan-500';
    return 'bg-amber-500';
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold flex items-center gap-2">
        <Code2 className="w-4 h-4 text-emerald-500" />
        {t.about.techStack}
      </h4>

      <div className="space-y-3">
        {Object.entries(categories).map(([category, techsInCat], catIdx) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIdx * 0.1 }}
          >
            <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider mb-2">
              {category}
            </p>
            <div className="flex flex-wrap gap-2">
              {techsInCat.map((tech, techIdx) => (
                <motion.div
                  key={tech.name}
                  className="relative"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: catIdx * 0.1 + techIdx * 0.05 }}
                  onMouseEnter={() => setHoveredTech(tech.name)}
                  onMouseLeave={() => setHoveredTech(null)}
                >
                  {/* Tech node */}
                  <motion.div
                    className={`px-3 py-1.5 rounded-lg glass-card-sm text-sm font-medium cursor-default inline-flex items-center gap-2 ${
                      hoveredTech === tech.name ? 'border-emerald-500/50 shadow-sm shadow-emerald-500/10' : ''
                    }`}
                    whileHover={{ scale: 1.05, y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Proficiency dot */}
                    <span className={`w-2 h-2 rounded-full ${getProficiencyColor(tech.proficiency)}`} />
                    {tech.name}
                  </motion.div>

                  {/* Proficiency tooltip */}
                  <AnimatePresence>
                    {hoveredTech === tech.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.9 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 px-3 py-2 rounded-lg glass-card-lg shadow-lg min-w-[120px]"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-medium">{t.about.proficiency}</span>
                          <span className="text-[10px] font-bold text-emerald-500">{tech.proficiency}%</span>
                        </div>
                        {/* Proficiency bar */}
                        <div className="h-1.5 bg-emerald-500/10 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${getProficiencyColor(tech.proficiency)}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${tech.proficiency}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                          />
                        </div>
                        <p className="text-[9px] text-muted-foreground mt-1">{getProficiencyLabel(tech.proficiency)}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ===== Availability Badge ===== */
function AvailabilityBadge({ t, language }: { t: ReturnType<typeof getTranslations>; language: 'ar' | 'en' }) {
  const isAvailable = true; // Can be dynamic from settings
  const [showCallOption, setShowCallOption] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="relative"
    >
      <motion.button
        onClick={() => setShowCallOption(!showCallOption)}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card-lg cursor-pointer transition-all min-h-[44px] ${
          isAvailable
            ? 'border-emerald-500/30 hover:border-emerald-500/50'
            : 'border-amber-500/30 hover:border-amber-500/50'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-expanded={showCallOption}
        aria-label={isAvailable ? t.about.availableForWork : t.about.notAvailableForWork}
      >
        {/* Pulsing dot */}
        <motion.span
          className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-amber-500'}`}
          animate={isAvailable ? {
            scale: [1, 1.3, 1],
            opacity: [1, 0.6, 1],
          } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className={`text-sm font-medium ${isAvailable ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
          {isAvailable ? t.about.availableForWork : t.about.notAvailableForWork}
        </span>
      </motion.button>

      {/* Book a Call dropdown */}
      <AnimatePresence>
        {showCallOption && isAvailable && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 z-50 min-w-[180px]"
          >
            <div className="glass-card-lg rounded-xl p-3 shadow-xl border border-emerald-500/20">
              <Button
                size="sm"
                className="w-full gradient-emerald text-white mb-2"
                onClick={() => {
                  const contactSection = document.querySelector('#contact');
                  if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                    setShowCallOption(false);
                  }
                }}
              >
                <Phone className="w-4 h-4 mr-2" />
                {t.about.bookACall}
              </Button>
              <p className="text-[10px] text-muted-foreground text-center">
                {language === 'ar' ? 'متوسط وقت الاستجابة: ساعتان' : 'Avg. response time: 2 hours'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ===== Stats Detail Modal ===== */
function StatsDetailModal({
  open,
  onClose,
  stats,
  t,
  language,
}: {
  open: boolean;
  onClose: () => void;
  stats: Array<{ label: string; value: number; icon: string }>;
  t: ReturnType<typeof getTranslations>;
  language: 'ar' | 'en';
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-500" />
            {t.about.allStats}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t.about.statsDetail}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {stats.map((stat, index) => {
            const IconComponent = iconMap[stat.icon] || Code2;
            const sparkData = statSparklineData[stat.icon] || [0, 10, 20, 30, 50, 70, stat.value];
            const detail = statDetails[stat.icon] || { en: '', ar: '' };

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl glass-card border border-border/50"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl gradient-emerald flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-lg text-gradient-emerald">
                        <AnimatedCounter target={stat.value} />
                      </h4>
                      <MiniSparkline data={sparkData} />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-xs text-muted-foreground/60">
                      {language === 'ar' ? detail.ar : detail.en}
                    </p>
                    {/* Trend indicator */}
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                      <span className="text-[10px] text-emerald-500 font-medium">
                        {language === 'ar' ? 'نمو مستمر' : 'Steady growth'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ===== Code Snippet Watermark ===== */
function CodeSnippetWatermark() {
  return (
    <div className="absolute bottom-8 left-8 opacity-[0.03] pointer-events-none select-none font-mono text-[10px] leading-tight text-foreground hidden lg:block max-w-[300px]" dir="ltr">
      <pre>{`const developer = {
  name: "Ahmed Al-Mutairi",
  skills: ["React", "Next.js"],
  passion: "Building great UX",
  available: true
};`}</pre>
    </div>
  );
}

/* ===== Generate vCard file ===== */
function generateVCard(ownerName: string, settings: Record<string, string>): string {
  const email = settings.owner_email || '';
  const phone = settings.owner_phone || '';
  const website = settings.site_url || '';

  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${ownerName}`,
    email ? `EMAIL:${email}` : '',
    phone ? `TEL:${phone}` : '',
    website ? `URL:${website}` : '',
    'END:VCARD',
  ].filter(Boolean).join('\n');
}

/* ===== Decorative noise texture overlay ===== */
function NoiseTextureOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.015] mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '128px 128px',
      }}
    />
  );
}

export function AboutSection({ section }: AboutSectionProps) {
  const { siteData } = useSiteStore();
  const { language } = useLanguageStore();
  const t = getTranslations(language);
  const settings = siteData?.settings || {};
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  // Bio expand state
  const [bioExpanded, setBioExpanded] = useState(false);
  // Stats detail modal
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  // Stat hover expand
  const [expandedStat, setExpandedStat] = useState<number | null>(null);

  const content = (() => {
    try { return JSON.parse(section.content || '{}'); } catch { return {}; }
  })();

  const contentEn = (() => {
    if (language === 'en' && section.contentEn) {
      try { return JSON.parse(section.contentEn); } catch { return null; }
    }
    return null;
  })();

  // Use English content when available, fall back to Arabic content
  const activeContent = contentEn || content;

  const localizedSection = localizeSection(section, language);
  const bio = activeContent.bio || settings.owner_bio || localizedSection.description || '';
  const avatarUrl = settings.owner_avatar || activeContent.avatarUrl || null;
  const ownerName = settings.owner_name || settings.site_name || t.hero.defaultName;
  const stats: Array<{ label: string; value: number; icon: string }> = activeContent.stats || [
    { label: 'سنوات الخبرة', value: 8, icon: 'Calendar' },
    { label: 'مشاريع منجزة', value: 150, icon: 'Briefcase' },
    { label: 'عملاء سعداء', value: 80, icon: 'Users' },
    { label: 'جوائز', value: 12, icon: 'Award' },
  ];

  // Get tech tags from section items data
  const techTags = useMemo(() => {
    const tags: string[] = [];
    section.items.forEach((item) => {
      if (item.tags) {
        try {
          const parsed = JSON.parse(item.tags);
          if (Array.isArray(parsed)) tags.push(...parsed);
        } catch {}
      }
      if (item.title) tags.push(localizeSectionItem(item, language).title);
    });
    if (activeContent.techs && Array.isArray(activeContent.techs)) {
      tags.push(...activeContent.techs);
    }
    if (tags.length === 0) {
      return ['React', 'Next.js', 'TypeScript', 'Node.js', 'Python'];
    }
    return [...new Set(tags)];
  }, [section.items, activeContent.techs]);

  const initials = ownerName.split(' ').map(n => n[0]).join('').slice(0, 2);

  // Calculate percentage for progress ring
  const getStatPercentage = (value: number) => {
    const maxValues: Record<string, number> = { Calendar: 20, Briefcase: 200, Users: 100, Award: 30 };
    const iconKey = stats.find(s => s.value === value)?.icon || 'Briefcase';
    const max = maxValues[iconKey] || 100;
    return Math.min(100, Math.round((value / max) * 100));
  };

  // Bio truncation
  const bioIsLong = bio.length > 300;
  const displayBio = bioIsLong && !bioExpanded ? bio.slice(0, 300) + '...' : bio;

  // vCard download
  const handleDownloadVCard = useCallback(() => {
    const vcard = generateVCard(ownerName, settings);
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ownerName.replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [ownerName, settings]);

  return (
    <section
      id="about"
      ref={sectionRef}
      aria-labelledby="about-heading"
      className="section-padding relative overflow-hidden bg-mesh"
    >
      {/* Noise texture overlay */}
      <NoiseTextureOverlay />

      {/* Gradient mesh background pattern */}
      <div className="absolute inset-0 bg-pattern-dots opacity-[0.03] pointer-events-none" />
      <div className="absolute inset-0 bg-pattern-grid pointer-events-none" />

      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3" />

      {/* Code snippet watermark */}
      <CodeSnippetWatermark />

      {/* Floating decorative elements with ParallaxWrapper */}
      <ParallaxWrapper speed={0.15} className="absolute top-[15%] right-[10%] pointer-events-none">
        <motion.div
          animate={{ y: [-12, 12, -12], rotate: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Hexagon className="w-10 h-10 text-emerald-500/10" />
        </motion.div>
      </ParallaxWrapper>
      <ParallaxWrapper speed={0.25} className="absolute bottom-[20%] left-[8%] pointer-events-none">
        <motion.div
          animate={{ y: [15, -15, 15], rotate: [0, -15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Star className="w-8 h-8 text-teal-500/10" />
        </motion.div>
      </ParallaxWrapper>
      <ParallaxWrapper speed={0.1} className="absolute top-[60%] right-[5%] pointer-events-none">
        <motion.div
          animate={{ y: [-8, 8, -8] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Sparkles className="w-6 h-6 text-emerald-400/10" />
        </motion.div>
      </ParallaxWrapper>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card-sm text-xs font-medium text-primary mb-4"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{t.about.getToKnowMe}</span>
          </motion.div>
          <h2 id="about-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-shimmer-heading">
            {localizedSection.title}
          </h2>
          {localizedSection.subtitle && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {localizedSection.subtitle}
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Profile Image Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col items-center lg:items-start"
          >
            {/* Profile Image with parallax, holographic overlay, and constellation effect */}
            <ParallaxWrapper speed={0.05} className="relative mb-8">
              <div className="relative">
                {/* Background decorative circle */}
                <div className="absolute -inset-6 rounded-full bg-gradient-to-br from-emerald-500/10 to-teal-500/10 blur-xl" />

                {/* Animated gradient border with rotation */}
                <motion.div
                  className="absolute -inset-2 rounded-full"
                  style={{
                    background: 'conic-gradient(from 0deg, #10b981, #14b8a6, #059669, #10b981)',
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                />
                {/* Inner ring to create border effect */}
                <div className="absolute -inset-1.5 rounded-full bg-background" />
                {/* Spinning decorative ring */}
                <div className="absolute -inset-4 rounded-full border-2 border-dashed border-emerald-500/15 animate-spin-slow" />

                {/* Constellation dots and lines */}
                <ConstellationEffect />

                {avatarUrl ? (
                  <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden ring-2 ring-background z-10 group">
                    <img
                      src={avatarUrl}
                      alt={ownerName}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Holographic overlay effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                      <motion.div
                        className="absolute inset-0"
                        style={{
                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(20, 184, 166, 0.1), rgba(6, 182, 212, 0.15), rgba(245, 158, 11, 0.1))',
                          backgroundSize: '300% 300%',
                        }}
                        animate={{
                          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                      {/* Rainbow shimmer */}
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 via-transparent to-cyan-400/10 mix-blend-overlay" />
                    </div>
                  </div>
                ) : (
                  <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full gradient-emerald flex items-center justify-center ring-2 ring-background z-10 group">
                    <span className="text-5xl sm:text-6xl font-bold text-white">{initials}</span>
                    {/* Holographic overlay for initials avatar */}
                    <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(20, 184, 166, 0.15), rgba(6, 182, 212, 0.2), rgba(245, 158, 11, 0.15))',
                          backgroundSize: '300% 300%',
                        }}
                        animate={{
                          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Floating badge */}
                <motion.div
                  className="absolute -bottom-2 -left-2 glass-card-lg rounded-2xl px-4 py-2 flex items-center gap-2 glow-pulse z-20"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Zap className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-semibold text-primary">+{stats[0]?.value || 8} {t.about.yearsExp}</span>
                </motion.div>
              </div>
            </ParallaxWrapper>

            {/* Availability Badge */}
            <div className="mb-6">
              <AvailabilityBadge t={t} language={language} />
            </div>

            {/* Bio section with typewriter, highlights, and read more */}
            <div className="space-y-4 max-w-lg relative">
              {/* Decorative quote mark */}
              <div className="absolute -top-8 -right-4 pointer-events-none select-none">
                <span
                  className="text-8xl font-serif leading-none bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-400 bg-clip-text text-transparent opacity-30"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  &ldquo;
                </span>
              </div>
              {/* Decorative accent line */}
              <div className="w-20 h-1 rounded-full gradient-emerald" />
              {/* Decorative border accent */}
              <div className="absolute -right-4 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500/20 via-teal-500/10 to-transparent hidden lg:block" />

              {/* Bio text with typewriter effect and highlighted keywords */}
              <p
                className="text-lg leading-relaxed text-muted-foreground whitespace-pre-line"
                style={{
                  textShadow: '0 0 20px rgba(16, 185, 129, 0.08)',
                }}
              >
                <TypewriterText text={displayBio} isVisible={isInView} speed={15} />
              </p>

              {/* Read More / Read Less */}
              {bioIsLong && (
                <button
                  onClick={() => setBioExpanded(!bioExpanded)}
                  className="inline-flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:underline cursor-pointer min-h-[44px]"
                  aria-expanded={bioExpanded}
                >
                  {bioExpanded ? t.about.readLess : t.about.readMore}
                  {bioExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              )}

              {/* Download vCard button */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadVCard}
                  className="text-xs border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/5"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  {t.about.downloadVCard}
                </Button>
              </div>

              {/* Enhanced Tech Tags with colored dots */}
              <div className="flex flex-wrap gap-2">
                {techTags.map((tech, idx) => (
                  <motion.span
                    key={tech}
                    className="px-3 py-1.5 text-sm rounded-lg glass-card-emerald text-primary font-medium cursor-default border-glow inline-flex items-center gap-1.5"
                    initial={{ opacity: 0, y: 12 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{
                      duration: 0.4,
                      delay: 0.5 + idx * 0.07,
                      ease: 'easeOut',
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${tagDotColors[idx % tagDotColors.length]}`}
                    />
                    {tech}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Tech Stack Visualization */}
            <div className="mt-8 w-full max-w-lg">
              <TechStackGraph techs={techStackData} language={language} t={t} />
            </div>
          </motion.div>

          {/* Enhanced Stats Side with circular progress rings, sparklines, and hover-expand */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            role="complementary"
            aria-label={language === 'ar' ? 'الإحصائيات' : 'Statistics'}
          >
            <div className="grid grid-cols-2 gap-5">
              {stats.map((stat, index) => {
                const IconComponent = iconMap[stat.icon] || Code2;
                const percentage = getStatPercentage(stat.value);
                const sparkData = statSparklineData[stat.icon] || [0, 10, 20, 30, 50, 70, stat.value];
                const detail = statDetails[stat.icon] || { en: '', ar: '' };
                const isExpanded = expandedStat === index;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="group"
                    onMouseEnter={() => setExpandedStat(index)}
                    onMouseLeave={() => setExpandedStat(null)}
                  >
                    <Card className="relative overflow-hidden glass-card border-0 p-6 h-full hover-lift-enhanced card-shimmer-hover card-shadow-elevation card-border-glow glow-pulse">
                      {/* Gradient background overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${gradientColors[index % gradientColors.length]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                      {/* Glassmorphism backdrop */}
                      <div className="absolute inset-0 bg-card/60 backdrop-blur-sm" />

                      {/* Mini sparkline behind content */}
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MiniSparkline data={sparkData} />
                      </div>

                      <CardContent className="p-0 space-y-3 relative z-10">
                        {/* Icon with bounce animation on hover */}
                        <motion.div
                          className="w-12 h-12 rounded-xl gradient-emerald mx-auto flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 relative"
                          whileHover={{
                            y: [0, -6, 0],
                            transition: { duration: 0.4, repeat: 1 },
                          }}
                        >
                          <IconComponent className="w-6 h-6 text-white" />
                        </motion.div>

                        {/* Circular progress ring behind the stat number */}
                        <div className="relative flex items-center justify-center">
                          <div className="absolute">
                            <CircularProgressRing percentage={percentage} size={80} strokeWidth={3} />
                          </div>
                          <div className="text-3xl font-bold text-gradient-emerald text-center relative z-10">
                            <AnimatedCounter target={stat.value} />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground text-center">{stat.label}</p>

                        {/* Hover-to-expand detail */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <p className="text-[10px] text-muted-foreground/60 text-center mt-2 leading-relaxed">
                                {language === 'ar' ? detail.ar : detail.en}
                              </p>
                              <div className="flex items-center justify-center gap-1 mt-1.5">
                                <TrendingUp className="w-3 h-3 text-emerald-500" />
                                <span className="text-[9px] text-emerald-500 font-medium">
                                  {language === 'ar' ? 'نمو مستمر' : 'Growing'}
                                </span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* View All Stats button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.8 }}
              className="mt-6 text-center"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStatsModalOpen(true)}
                className="text-xs border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/5"
              >
                <Activity className="w-3.5 h-3.5 mr-1.5" />
                {t.about.viewAllStats}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Stats Detail Modal */}
      <StatsDetailModal
        open={statsModalOpen}
        onClose={() => setStatsModalOpen(false)}
        stats={stats}
        t={t}
        language={language}
      />
    </section>
  );
}
