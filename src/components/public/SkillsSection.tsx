'use client';

import { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { motion, useInView, AnimatePresence, useMotionValue, useTransform, animate, useScroll, useSpring } from 'framer-motion';
import { useSiteStore, type Section, type SectionItem } from '@/store/site-store';
import { useLanguageStore } from '@/store/language-store';
import { getTranslations } from '@/lib/i18n';
import { localizeSection, localizeSectionItem } from '@/lib/localize';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Code2,
  Atom,
  Globe,
  FileCode2,
  Server,
  Terminal,
  Database,
  Container,
  Cloud,
  Paintbrush,
  Workflow,
  Cpu,
  BarChart3,
  LayoutGrid,
  Sparkles,
  Search,
  FolderOpen,
  X,
  GitBranch,
  ArrowLeftRight,
  Network,
  LayoutGrid as LayoutGridIcon,
  Clock,
  Briefcase,
  Eye,
  AlignJustify,
  Radar,
  TrendingUp,
  Users,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Award,
  Layers,
} from 'lucide-react';

interface SkillsSectionProps {
  section: Section;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Code2,
  Atom,
  Globe,
  FileCode2,
  Server,
  Terminal,
  Database,
  Container,
  Cloud,
  Paintbrush,
  Workflow,
  Cpu,
  BarChart3,
  LayoutGrid,
  Sparkles,
};

const categoryLabels: Record<string, Record<string, string>> = {
  ar: {
    all: 'الكل',
    frontend: 'الواجهة الأمامية',
    backend: 'الخادم الخلفي',
    database: 'قواعد البيانات',
    devops: 'DevOps',
    language: 'اللغات',
    design: 'التصميم',
    mobile: 'تطبيقات الجوال',
    tools: 'الأدوات',
    general: 'عام',
  },
  en: {
    all: 'All',
    frontend: 'Frontend',
    backend: 'Backend',
    database: 'Database',
    devops: 'DevOps',
    language: 'Languages',
    design: 'Design',
    mobile: 'Mobile',
    tools: 'Tools',
    general: 'General',
  },
};

function getSkillLevelInfo(level: number, t: ReturnType<typeof getTranslations>) {
  if (level >= 90) return { label: t.skills.expert, className: 'skill-expert' };
  if (level >= 70) return { label: t.skills.advanced, className: 'skill-advanced' };
  if (level >= 40) return { label: t.skills.intermediate, className: 'skill-intermediate' };
  return { label: t.skills.beginner, className: 'skill-beginner' };
}

// Animated counter component
function AnimatedCounter({ value, duration = 1.5, delay = 0 }: { value: number; duration?: number; delay?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest));

  useEffect(() => {
    const unsubscribe = rounded.on('change', (v) => {
      setDisplayValue(v);
    });
    return unsubscribe;
  }, [rounded]);

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      delay,
      ease: 'easeOut',
    });
    return controls.stop;
  }, [motionValue, value, duration, delay]);

  return <span>{displayValue}</span>;
}

// Circular gauge (speedometer style)
function CircularGauge({ value, size = 48, strokeWidth = 4, color = '#10B981' }: { value: number; size?: number; strokeWidth?: number; color?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI; // half circle (semicircle)
  const progress = (value / 100) * circumference;
  const centerX = size / 2;
  const centerY = size / 2;

  return (
    <svg width={size} height={size / 2 + 6} viewBox={`0 0 ${size} ${size / 2 + 6}`}>
      {/* Background arc */}
      <path
        d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
        fill="none"
        stroke="currentColor"
        className="text-primary/10"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Progress arc */}
      <motion.path
        d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference - progress }}
        transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
        style={{ pathLength: 1 }}
      />
    </svg>
  );
}

// Large animated ring for modal
function ProficiencyRing({ value, size = 140, strokeWidth = 10, color = '#10B981' }: { value: number; size?: number; strokeWidth?: number; color?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-primary/10"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Progress ring */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (value / 100) * circumference }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
        {/* Glow ring */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth + 4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference, opacity: 0.2 }}
          animate={{ strokeDashoffset: circumference - (value / 100) * circumference, opacity: 0.15 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{ filter: `blur(6px)` }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color }}>
          <AnimatedCounter value={value} duration={1.5} />
        </span>
        <span className="text-xs text-muted-foreground font-medium">%</span>
      </div>
    </div>
  );
}

// Hexagonal shape behind skill icon
function HexagonShape({ color, size = 44 }: { color: string; size?: number }) {
  const hexPoints = useMemo(() => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      points.push(`${size / 2 + (size / 2 - 2) * Math.cos(angle)},${size / 2 + (size / 2 - 2) * Math.sin(angle)}`);
    }
    return points.join(' ');
  }, [size]);

  return (
    <svg width={size} height={size} className="absolute inset-0 opacity-20" style={{ color }}>
      <polygon
        points={hexPoints}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />
    </svg>
  );
}

// Skill Card Component
function SkillCard({
  item,
  index,
  isInView,
  onSelect,
  isCompareMode,
  isSelected,
  onToggleCompare,
  t,
}: {
  item: SectionItem;
  index: number;
  isInView: boolean;
  onSelect: (item: SectionItem) => void;
  isCompareMode: boolean;
  isSelected: boolean;
  onToggleCompare: (item: SectionItem) => void;
  t: ReturnType<typeof getTranslations>;
}) {
  const config = (() => {
    try { return JSON.parse(item.config || '{}'); } catch { return {}; }
  })();
  const level = config.level || 50;
  const color = config.color || '#10B981';
  const IconComponent = item.icon ? iconMap[item.icon] : Code2;
  const skillLevel = getSkillLevelInfo(level, t);
  const [shimmerComplete, setShimmerComplete] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className={isSelected ? 'ring-2 ring-emerald-500 rounded-xl' : ''}
    >
      <Card
        className={`glass-card hover-lift card-shadow-elevation card-border-glow p-4 h-full group relative overflow-hidden cursor-pointer ${
          isSelected ? 'ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/20' : ''
        }`}
        onClick={() => {
          if (isCompareMode) {
            onToggleCompare(item);
          } else {
            onSelect(item);
          }
        }}
      >
        {/* Hover gradient overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `linear-gradient(135deg, ${color}08, ${color}03)`,
          }}
        />

        {/* Glow effect on hover */}
        <div
          className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl blur-lg"
          style={{
            background: `radial-gradient(circle at center, ${color}15, transparent 70%)`,
          }}
        />

        {/* Compare mode indicator */}
        {isCompareMode && (
          <div className="absolute top-2 end-2 z-20">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-emerald-500 text-white'
                  : 'bg-primary/10 text-muted-foreground'
              }`}
            >
              {isSelected ? <X className="w-3 h-3" /> : <ArrowLeftRight className="w-3 h-3" />}
            </div>
          </div>
        )}

        <CardContent className="p-0 space-y-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center shrink-0">
              <HexagonShape color={color} size={44} />
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 relative z-10"
                style={{ backgroundColor: `${color}15` }}
              >
                {IconComponent && <IconComponent className="w-5 h-5" style={{ color }} />}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-sm truncate">{item.title}</h3>
                <span className={`text-xs font-medium ${skillLevel.className}`}>{skillLevel.label}</span>
              </div>
              {item.subtitle && (
                <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
              )}
            </div>
          </div>

          {/* Progress bar with gradient + animated counter */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <CircularGauge value={level} size={48} strokeWidth={4} color={color} />
              <span className="text-sm font-bold" style={{ color }}>
                <AnimatedCounter value={level} duration={1.2} delay={0.3} />%
              </span>
            </div>
            <div className="relative h-2.5 rounded-full bg-primary/10 overflow-hidden">
              <motion.div
                className="absolute inset-y-0 start-0 rounded-full"
                style={{
                  background: `linear-gradient(90deg, #10B981, #14B8A6)`,
                }}
                initial={{ width: 0 }}
                animate={isInView ? { width: `${level}%` } : { width: 0 }}
                transition={{ duration: 1.2, delay: 0.3 + index * 0.06, ease: 'easeOut' }}
              />
              {/* Shimmer effect after fill */}
              <motion.div
                className="absolute inset-y-0 start-0 rounded-full overflow-hidden"
                style={{ width: `${level}%` }}
                initial={{ width: 0 }}
                animate={isInView ? { width: `${level}%` } : { width: 0 }}
                transition={{ duration: 1.2, delay: 0.3 + index * 0.06, ease: 'easeOut' }}
                onAnimationComplete={() => setShimmerComplete(true)}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${color}33, transparent)`,
                    backgroundSize: '200% 100%',
                  }}
                  animate={shimmerComplete ? {
                    backgroundPosition: ['200% 0', '-200% 0'],
                  } : {}}
                  transition={{ duration: 1.5, ease: 'easeInOut', repeat: 1 }}
                />
              </motion.div>
            </div>
          </div>

          {/* View details hint */}
          {!isCompareMode && (
            <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              <Eye className="w-3 h-3" />
              <span>{t.skills.skillDetails}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Skill Details Modal (Enhanced)
function SkillDetailsModal({
  item,
  isOpen,
  onClose,
  allItems,
  t,
  language,
}: {
  item: SectionItem | null;
  isOpen: boolean;
  onClose: () => void;
  allItems: SectionItem[];
  t: ReturnType<typeof getTranslations>;
  language: 'ar' | 'en';
}) {
  const config = useMemo(() => {
    if (!item) return {} as Record<string, unknown>;
    try { return JSON.parse(item.config || '{}'); } catch { return {}; }
  }, [item]);

  const level = (config.level as number) || 50;
  const color = (config.color as string) || '#10B981';
  const category = (config.category as string) || 'general';
  const yearsExp = (config.years as number) || Math.floor(Math.random() * 5) + 1;
  const IconComponent = item?.icon ? iconMap[item.icon] : Code2;
  const skillLevel = getSkillLevelInfo(level, t);

  // Get related skills (same category, excluding current)
  const relatedSkills = useMemo(() => {
    if (!item) return [];
    return allItems
      .filter((si) => {
        if (si.id === item.id) return false;
        try {
          const c = JSON.parse(si.config || '{}');
          return c.category === category;
        } catch { return false; }
      })
      .slice(0, 4);
  }, [allItems, item, category]);

  // Mock related projects
  const relatedProjects = useMemo(() => {
    const projectNames = [
      { name: language === 'ar' ? 'منصة التجارة الإلكترونية' : 'E-Commerce Platform', year: '2024' },
      { name: language === 'ar' ? 'تطبيق إدارة المهام' : 'Task Management App', year: '2023' },
      { name: language === 'ar' ? 'لوحة تحكم تحليلية' : 'Analytics Dashboard', year: '2023' },
    ];
    return projectNames.slice(0, Math.min(2 + Math.floor(level / 40), 3));
  }, [level, language]);

  if (!item) return null;

  const categoryLabel = (language === 'ar' ? categoryLabels.ar[category] : categoryLabels.en[category]) || category;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg glass-card-lg border-glow max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${color}15` }}
            >
              {IconComponent && <IconComponent className="w-6 h-6" style={{ color }} />}
            </div>
            <div>
              <span>{item.title}</span>
              <p className="text-sm font-normal text-muted-foreground mt-0.5">{item.subtitle}</p>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t.skills.skillDetails} - {item.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Large animated proficiency ring */}
          <div className="flex flex-col items-center gap-4 py-2">
            <ProficiencyRing value={level} size={140} strokeWidth={10} color={color} />
            <div className="text-center">
              <span className={`text-lg font-bold ${skillLevel.className}`}>{skillLevel.label}</span>
              <p className="text-xs text-muted-foreground mt-0.5">{t.skills.proficiencyLevel}</p>
            </div>
          </div>

          {/* Category Badge */}
          <div className="flex items-center justify-center gap-2">
            <Badge
              variant="outline"
              className="text-xs border-teal-500/50 text-teal-600 dark:text-teal-400 bg-teal-500/5 gap-1"
            >
              <Layers className="w-3 h-3" />
              {t.skills.category}: {categoryLabel}
            </Badge>
          </div>

          {/* Proficiency bar in modal */}
          <div className="space-y-2">
            <div className="relative h-3 rounded-full bg-primary/10 overflow-hidden">
              <motion.div
                className="absolute inset-y-0 start-0 rounded-full"
                style={{
                  background: `linear-gradient(90deg, #10B981, #14B8A6)`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${level}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
              <motion.div
                className="absolute inset-y-0 start-0 rounded-full overflow-hidden"
                style={{ width: `${level}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${level}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              >
                <div
                  className="absolute inset-0 animate-shimmer"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${color}33, transparent)`,
                    backgroundSize: '200% 100%',
                  }}
                />
              </motion.div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span className="font-bold" style={{ color }}><AnimatedCounter value={level} duration={1} />%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Years of Experience */}
          <div className="flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${color}15` }}
            >
              <Clock className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.skills.yearsExperience}</p>
              <p className="text-lg font-bold" style={{ color }}>
                <AnimatedCounter value={yearsExp} duration={0.8} /> {t.skills.years}
              </p>
            </div>
          </div>

          {/* Related Projects */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{t.skills.projectsUsing}</span>
            </div>
            <div className="space-y-1.5">
              {relatedProjects.map((project, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  className="flex items-center gap-3 p-2 rounded-lg bg-primary/5"
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm">{project.name}</span>
                  <span className="text-xs text-muted-foreground ms-auto">{project.year}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Related Skills */}
          {relatedSkills.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t.skills.relatedSkills}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {relatedSkills.map((rs, i) => {
                  const rsConfig = (() => {
                    try { return JSON.parse(rs.config || '{}'); } catch { return {}; }
                  })();
                  const rsColor = rsConfig.color || '#10B981';
                  const rsLevel = rsConfig.level || 50;
                  const RsIcon = rs.icon ? iconMap[rs.icon] : Code2;
                  return (
                    <motion.div
                      key={rs.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: i * 0.08 }}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors cursor-default"
                    >
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center"
                        style={{ backgroundColor: `${rsColor}15` }}
                      >
                        <RsIcon className="w-3 h-3" style={{ color: rsColor }} />
                      </div>
                      <span className="text-xs font-medium">{rs.title}</span>
                      <span className="text-[10px] text-muted-foreground">{rsLevel}%</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Description */}
          {item.description && (
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Skill Comparison View
function SkillComparisonView({
  selectedSkills,
  onRemoveSkill,
  t,
}: {
  selectedSkills: SectionItem[];
  onRemoveSkill: (item: SectionItem) => void;
  t: ReturnType<typeof getTranslations>;
}) {
  if (selectedSkills.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-emerald-subtle mb-4">
          <ArrowLeftRight className="w-8 h-8 text-primary/60" />
        </div>
        <p className="text-muted-foreground text-lg font-medium">{t.skills.selectSkillsToCompare}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {selectedSkills.map((item) => {
        const config = (() => {
          try { return JSON.parse(item.config || '{}'); } catch { return {}; }
        })();
        const level = (config.level as number) || 50;
        const color = (config.color as string) || '#10B981';
        const yearsExp = (config.years as number) || Math.floor(Math.random() * 5) + 1;
        const IconComponent = item.icon ? iconMap[item.icon] : Code2;
        const skillLevel = getSkillLevelInfo(level, t);

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card rounded-xl p-6 relative"
          >
            <button
              onClick={() => onRemoveSkill(item)}
              className="absolute top-3 end-3 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${color}15` }}
              >
                {IconComponent && <IconComponent className="w-6 h-6" style={{ color }} />}
              </div>
              <div>
                <h3 className="font-bold text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.subtitle}</p>
              </div>
            </div>

            {/* Comparison metrics */}
            <div className="space-y-4">
              {/* Proficiency */}
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">{t.skills.proficiencyLevel}</span>
                  <span className={`font-bold ${skillLevel.className}`}>
                    <AnimatedCounter value={level} duration={1} />%
                  </span>
                </div>
                <div className="h-3 rounded-full bg-primary/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, #10B981, #14B8A6)` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${level}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Years */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5">
                <span className="text-sm text-muted-foreground">{t.skills.yearsExperience}</span>
                <span className="font-bold" style={{ color }}>
                  <AnimatedCounter value={yearsExp} duration={0.8} /> {t.skills.years}
                </span>
              </div>

              {/* Level */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5">
                <span className="text-sm text-muted-foreground">{t.skills.proficiencyLevel}</span>
                <span className={`font-bold ${skillLevel.className}`}>{skillLevel.label}</span>
              </div>

              {/* Description */}
              {item.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Skill Tree Visualization
function SkillTreeView({
  items,
  categories,
  isInView,
  t,
}: {
  items: SectionItem[];
  categories: string[];
  isInView: boolean;
  t: ReturnType<typeof getTranslations>;
}) {
  // Group items by category
  const grouped = useMemo(() => {
    const groups: Record<string, SectionItem[]> = {};
    items.forEach((item) => {
      try {
        const config = JSON.parse(item.config || '{}');
        const cat = (config.category as string) || 'general';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(item);
      } catch {
        if (!groups['general']) groups['general'] = [];
        groups['general'].push(item);
      }
    });
    return groups;
  }, [items]);

  const categoryColors: Record<string, string> = {
    frontend: '#10B981',
    backend: '#14B8A6',
    database: '#06B6D4',
    devops: '#F59E0B',
    language: '#8B5CF6',
    design: '#EC4899',
    mobile: '#F97316',
    tools: '#6366F1',
    general: '#64748B',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6 }}
      className="relative glass-card-lg rounded-2xl p-6 overflow-x-auto"
    >
      <div className="min-w-[600px]">
        {/* Central node */}
        <div className="flex justify-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ duration: 0.5, type: 'spring' }}
            className="w-20 h-20 rounded-full gradient-emerald flex items-center justify-center shadow-lg shadow-emerald-500/20 z-10 relative"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
        </div>

        {/* Category branches */}
        <div className="grid gap-8" style={{ gridTemplateColumns: `repeat(${Math.min(Object.keys(grouped).length, 4)}, 1fr)` }}>
          {Object.entries(grouped).map(([category, categoryItems], catIndex) => {
            const catColor = categoryColors[category] || '#64748B';
            const catLabel = (t.language === 'ar' ? categoryLabels.ar[category] : categoryLabels.en[category]) || category;

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: catIndex * 0.1 }}
                className="relative"
              >
                {/* Connection line from center to category */}
                <div className="absolute top-0 left-1/2 w-px h-4 -translate-y-4" style={{ background: catColor, opacity: 0.3 }} />

                {/* Category node */}
                <div className="flex justify-center mb-4">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="px-4 py-2 rounded-xl font-semibold text-sm text-white shadow-md relative"
                    style={{ background: catColor }}
                  >
                    <Network className="w-4 h-4 inline-block me-1.5" />
                    {catLabel}
                    <span className="ms-2 text-xs opacity-80">({categoryItems.length})</span>
                  </motion.div>
                </div>

                {/* Skill nodes */}
                <div className="space-y-2">
                  {categoryItems.slice(0, 5).map((skillItem, skillIndex) => {
                    const config = (() => {
                      try { return JSON.parse(skillItem.config || '{}'); } catch { return {}; }
                    })();
                    const level = (config.level as number) || 50;
                    const color = (config.color as string) || catColor;
                    const IconComponent = skillItem.icon ? iconMap[skillItem.icon] : Code2;

                    return (
                      <motion.div
                        key={skillItem.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.3, delay: catIndex * 0.1 + skillIndex * 0.05 + 0.3 }}
                        className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors group"
                      >
                        <div
                          className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${color}15` }}
                        >
                          <IconComponent className="w-3.5 h-3.5" style={{ color }} />
                        </div>
                        <span className="text-xs font-medium truncate flex-1">{skillItem.title}</span>
                        <div className="w-12 h-1.5 rounded-full bg-primary/10 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${level}%`, background: color }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                  {categoryItems.length > 5 && (
                    <div className="text-xs text-muted-foreground text-center py-1">
                      +{categoryItems.length - 5}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// Radar Chart
function SkillRadarChart({ items, isInView }: { items: SectionItem[]; isInView: boolean }) {
  const skills = items.slice(0, 8).map((item) => {
    const config = (() => {
      try { return JSON.parse(item.config || '{}'); } catch { return {}; }
    })();
    return {
      name: item.title || '',
      level: config.level || 50,
      color: config.color || '#10B981',
    };
  });

  if (skills.length < 3) return null;

  const centerX = 120;
  const centerY = 120;
  const radius = 90;

  const points = skills.map((skill, i) => {
    const angle = (2 * Math.PI * i) / skills.length - Math.PI / 2;
    const r = (skill.level / 100) * radius;
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
      labelX: centerX + (radius + 25) * Math.cos(angle),
      labelY: centerY + (radius + 25) * Math.sin(angle),
      ...skill,
    };
  });

  const maxPoints = skills.map((_, i) => {
    const angle = (2 * Math.PI * i) / skills.length - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  const maxPathD = maxPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="flex justify-center mb-10"
    >
      <div className="glass-card-lg rounded-2xl p-6 inline-block">
        <svg width="240" height="240" viewBox="0 0 240 240" className="mx-auto">
          {[0.2, 0.4, 0.6, 0.8, 1].map((scale) => (
            <circle key={scale} cx={centerX} cy={centerY} r={radius * scale} fill="none" className="stroke-emerald-500/10" stroke="currentColor" strokeWidth="1" />
          ))}
          {skills.map((_, i) => {
            const angle = (2 * Math.PI * i) / skills.length - Math.PI / 2;
            return (
              <line key={i} x1={centerX} y1={centerY} x2={centerX + radius * Math.cos(angle)} y2={centerY + radius * Math.sin(angle)} className="stroke-emerald-500/10" strokeWidth="1" />
            );
          })}
          <path d={maxPathD} fill="none" className="stroke-emerald-500/10" strokeWidth="1" />
          <motion.path d={pathD} fill="rgba(16, 185, 129, 0.15)" className="stroke-emerald-500" strokeWidth="2" initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ duration: 0.8, delay: 0.5 }} />
          {points.map((point, i) => (
            <motion.circle key={i} cx={point.x} cy={point.y} r="4" fill="#10B981" initial={{ scale: 0 }} animate={isInView ? { scale: 1 } : {}} transition={{ duration: 0.3, delay: 0.7 + i * 0.05 }} />
          ))}
          {points.map((point, i) => (
            <text key={i} x={point.labelX} y={point.labelY} textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-[9px] font-medium">
              {point.name}
            </text>
          ))}
        </svg>
      </div>
    </motion.div>
  );
}

// Single bar item component (extracted to avoid hooks-in-map issue)
function SkillBarItem({
  item,
  index,
  isInView,
  onSelect,
  t,
}: {
  item: SectionItem;
  index: number;
  isInView: boolean;
  onSelect: (item: SectionItem) => void;
  t: ReturnType<typeof getTranslations>;
}) {
  const config = (() => {
    try { return JSON.parse(item.config || '{}'); } catch { return {}; }
  })();
  const level = config.level || 50;
  const color = config.color || '#10B981';
  const IconComponent = item.icon ? iconMap[item.icon] : Code2;
  const skillLevel = getSkillLevelInfo(level, t);
  const [barShimmerDone, setBarShimmerDone] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onClick={() => onSelect(item)}
      className="group cursor-pointer"
    >
      <div className="glass-card rounded-xl p-4 hover-lift relative overflow-hidden">
        {/* Hover glow */}
        <div
          className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl blur-lg"
          style={{
            background: `radial-gradient(circle at center, ${color}15, transparent 70%)`,
          }}
        />

        <div className="relative z-10 space-y-2.5">
          {/* Header row */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: `${color}15` }}
            >
              {IconComponent && <IconComponent className="w-4 h-4" style={{ color }} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-sm truncate">{item.title}</h3>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-medium ${skillLevel.className}`}>{skillLevel.label}</span>
                  <span className="text-sm font-bold" style={{ color }}>
                    <AnimatedCounter value={level} duration={1.2} delay={0.3 + index * 0.05} />%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Animated proficiency bar */}
          <div className="relative h-3 rounded-full bg-primary/10 overflow-hidden">
            <motion.div
              className="absolute inset-y-0 start-0 rounded-full"
              style={{
                background: `linear-gradient(90deg, #10B981, #14B8A6)`,
              }}
              initial={{ width: 0 }}
              animate={isInView ? { width: `${level}%` } : { width: 0 }}
              transition={{ duration: 1.2, delay: 0.3 + index * 0.06, ease: 'easeOut' }}
            />
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-y-0 start-0 rounded-full overflow-hidden"
              style={{ width: `${level}%` }}
              initial={{ width: 0 }}
              animate={isInView ? { width: `${level}%` } : { width: 0 }}
              transition={{ duration: 1.2, delay: 0.3 + index * 0.06, ease: 'easeOut' }}
              onAnimationComplete={() => setBarShimmerDone(true)}
            >
              <motion.div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(90deg, transparent, ${color}44, transparent)`,
                  backgroundSize: '200% 100%',
                }}
                animate={barShimmerDone ? {
                  backgroundPosition: ['200% 0', '-200% 0'],
                } : {}}
                transition={{ duration: 1.5, ease: 'easeInOut', repeat: 1 }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Bars View - Skills sorted by proficiency with animated bars
function SkillBarsView({
  items,
  isInView,
  onSelect,
  t,
}: {
  items: SectionItem[];
  isInView: boolean;
  onSelect: (item: SectionItem) => void;
  t: ReturnType<typeof getTranslations>;
}) {
  // Sort by level descending
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const aConfig = (() => { try { return JSON.parse(a.config || '{}'); } catch { return {}; } })();
      const bConfig = (() => { try { return JSON.parse(b.config || '{}'); } catch { return {}; } })();
      return (bConfig.level || 50) - (aConfig.level || 50);
    });
  }, [items]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="space-y-3"
    >
      {sortedItems.map((item, index) => (
        <SkillBarItem
          key={item.id}
          item={item}
          index={index}
          isInView={isInView}
          onSelect={onSelect}
          t={t}
        />
      ))}
    </motion.div>
  );
}

// Category Stats Row
function CategoryStatsRow({
  items,
  t,
  language,
}: {
  items: SectionItem[];
  t: ReturnType<typeof getTranslations>;
  language: 'ar' | 'en';
}) {
  const stats = useMemo(() => {
    const catMap: Record<string, { count: number; totalLevel: number }> = {};
    items.forEach((item) => {
      try {
        const config = JSON.parse(item.config || '{}');
        const cat = (config.category as string) || 'general';
        if (!catMap[cat]) catMap[cat] = { count: 0, totalLevel: 0 };
        catMap[cat].count++;
        catMap[cat].totalLevel += config.level || 50;
      } catch {
        if (!catMap['general']) catMap['general'] = { count: 0, totalLevel: 0 };
        catMap['general'].count++;
        catMap['general'].totalLevel += 50;
      }
    });
    return Object.entries(catMap).map(([cat, data]) => ({
      category: cat,
      label: (language === 'ar' ? categoryLabels.ar[cat] : categoryLabels.en[cat]) || cat,
      count: data.count,
      avgProficiency: Math.round(data.totalLevel / data.count),
    }));
  }, [items, language]);

  if (stats.length <= 1) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.category}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.06 }}
          className="glass-card rounded-xl p-3 text-center"
        >
          <p className="text-xs text-muted-foreground font-medium mb-1 truncate">{stat.label}</p>
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-teal-500" />
              <span className="text-sm font-bold text-teal-600 dark:text-teal-400">
                <AnimatedCounter value={stat.count} duration={0.8} delay={0.2 + i * 0.06} />
              </span>
            </div>
            <div className="w-px h-3 bg-primary/10" />
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                <AnimatedCounter value={stat.avgProficiency} duration={0.8} delay={0.2 + i * 0.06} />%
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Floating decorative elements
function FloatingDecorations() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Floating hexagons */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            top: `${20 + i * 20}%`,
            left: `${10 + i * 25}%`,
            width: 20 + i * 5,
            height: 20 + i * 5,
          }}
          animate={{
            y: [-15, 15, -15],
            rotate: [0, 180, 360],
            opacity: [0.03, 0.08, 0.03],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 1.5,
          }}
        >
          <HexagonShape color="#10B981" size={20 + i * 5} />
        </motion.div>
      ))}
      {/* Floating dots */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`dot-${i}`}
          className="absolute rounded-full bg-emerald-500/10"
          style={{
            width: 4 + (i % 3) * 2,
            height: 4 + (i % 3) * 2,
            top: `${15 + i * 14}%`,
            right: `${5 + i * 15}%`,
          }}
          animate={{
            y: [-10, 10, -10],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 5 + i,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.8,
          }}
        />
      ))}
    </div>
  );
}

export function SkillsSection({ section }: SkillsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [activeCategory, setActiveCategory] = useState('all');
  const [showRadar, setShowRadar] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'tree' | 'bars'>('cards');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedCompareSkills, setSelectedCompareSkills] = useState<SectionItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<SectionItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { language } = useLanguageStore();
  const t = getTranslations(language);

  const localizedSection = localizeSection(section, language);

  // Create localized items by merging localized text fields into each item
  const localizedItems = useMemo(() =>
    section.items.map((item) => {
      const localized = localizeSectionItem(item, language);
      return { ...item, title: localized.title, subtitle: localized.subtitle, description: localized.description };
    }),
  [section.items, language]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    localizedItems.forEach((item) => {
      try {
        const config = JSON.parse(item.config || '{}');
        if (config.category) cats.add(config.category);
      } catch {}
    });
    return ['all', ...Array.from(cats)];
  }, [localizedItems]);

  const filteredItems = useMemo(() => {
    let items = localizedItems;
    if (activeCategory !== 'all') {
      items = items.filter((item) => {
        try {
          const config = JSON.parse(item.config || '{}');
          return config.category === activeCategory;
        } catch { return false; }
      });
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter((item) =>
        (item.title || '').toLowerCase().includes(query) ||
        (item.subtitle || '').toLowerCase().includes(query) ||
        (item.description || '').toLowerCase().includes(query)
      );
    }
    return items;
  }, [localizedItems, activeCategory, searchQuery]);

  const totalSkills = localizedItems.length;

  const handleToggleCompare = useCallback((item: SectionItem) => {
    setSelectedCompareSkills((prev) => {
      const exists = prev.find((s) => s.id === item.id);
      if (exists) {
        return prev.filter((s) => s.id !== item.id);
      }
      if (prev.length >= 2) {
        return [prev[1], item];
      }
      return [...prev, item];
    });
  }, []);

  const handleRemoveCompareSkill = useCallback((item: SectionItem) => {
    setSelectedCompareSkills((prev) => prev.filter((s) => s.id !== item.id));
  }, []);

  const handleSelectSkill = useCallback((item: SectionItem) => {
    setSelectedSkill(item);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedSkill(null), 200);
  }, []);

  const toggleCompareMode = useCallback(() => {
    setCompareMode((prev) => !prev);
    if (compareMode) {
      setSelectedCompareSkills([]);
    }
  }, [compareMode]);

  const categoryLabelMap = language === 'ar' ? categoryLabels.ar : categoryLabels.en;

  return (
    <section
      id="skills"
      ref={sectionRef}
      aria-labelledby="skills-heading"
      className="section-padding relative overflow-hidden bg-dot-pattern"
    >
      {/* Decorative elements */}
      <div className="absolute top-1/4 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
      <FloatingDecorations />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card-sm text-xs font-medium text-primary mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'مهاراتي' : 'My Skills'}</span>
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full gradient-emerald text-white text-[10px] font-bold">
              {totalSkills} {language === 'ar' ? 'مهارة' : 'skills'}
            </span>
          </motion.div>
          <h2 id="skills-heading" className="text-3xl sm:text-4xl font-bold mb-4 text-shimmer-heading">{localizedSection.title}</h2>
          {localizedSection.subtitle && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {localizedSection.subtitle}
            </p>
          )}
        </motion.div>

        {/* Category Stats Row */}
        <CategoryStatsRow items={filteredItems} t={t} language={language} />

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="max-w-md mx-auto mb-6"
        >
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t.skills.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-9 glass-card-sm border-glow"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={language === 'ar' ? 'مسح البحث' : 'Clear search'}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Controls Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10"
        >
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <motion.div key={cat} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Badge
                  variant={activeCategory === cat ? 'default' : 'outline'}
                  className={`cursor-pointer px-4 py-2 text-sm transition-all duration-300 ${
                    activeCategory === cat
                      ? 'gradient-emerald text-white border-0 shadow-md shadow-emerald-500/20'
                      : 'hover:bg-accent'
                  }`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {categoryLabelMap[cat] || cat}
                </Badge>
              </motion.div>
            ))}
          </div>

          {/* View mode toggles */}
          <div className="flex items-center gap-1.5">
            {/* Compare mode toggle */}
            <button
              onClick={toggleCompareMode}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 min-h-[44px] ${
                compareMode
                  ? 'gradient-emerald text-white shadow-sm'
                  : 'glass-card-sm text-muted-foreground hover:text-foreground'
              }`}
              aria-pressed={compareMode}
              aria-label={t.skills.compare}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              {t.skills.compare}
            </button>

            {/* View mode buttons */}
            {(['cards', 'tree', 'bars'] as const).map((mode) => {
              const icons = {
                cards: <LayoutGridIcon className="w-3.5 h-3.5" />,
                tree: <GitBranch className="w-3.5 h-3.5" />,
                bars: <AlignJustify className="w-3.5 h-3.5" />,
              };
              const labels = {
                cards: t.skills.cardView,
                tree: t.skills.treeView,
                bars: t.skills.barsView,
              };
              return (
                <button
                  key={mode}
                  onClick={() => {
                    setViewMode(mode);
                    setShowRadar(false);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 min-h-[44px] ${
                    viewMode === mode && !showRadar
                      ? 'gradient-emerald text-white shadow-sm'
                      : 'glass-card-sm text-muted-foreground hover:text-foreground'
                  }`}
                  aria-pressed={viewMode === mode && !showRadar}
                  aria-label={labels[mode]}
                >
                  {icons[mode]}
                  {labels[mode]}
                </button>
              );
            })}

            {/* Chart toggle */}
            <button
              onClick={() => {
                setShowRadar(!showRadar);
                setViewMode('cards');
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 min-h-[44px] ${
                showRadar
                  ? 'gradient-emerald text-white shadow-sm'
                  : 'glass-card-sm text-muted-foreground hover:text-foreground'
              }`}
              aria-pressed={showRadar}
              aria-label={t.skills.radarView}
            >
              <Radar className="w-3.5 h-3.5" />
              {t.skills.radarView}
            </button>
          </div>
        </motion.div>

        {/* Compare Mode View */}
        {compareMode && (
          <div className="mb-8">
            <SkillComparisonView
              selectedSkills={selectedCompareSkills}
              onRemoveSkill={handleRemoveCompareSkill}
              t={t}
            />
          </div>
        )}

        {/* Radar Chart */}
        {showRadar && !compareMode && viewMode === 'cards' && (
          <SkillRadarChart items={filteredItems} isInView={isInView} />
        )}

        {/* Skill Tree View */}
        {viewMode === 'tree' && !compareMode && (
          <SkillTreeView items={filteredItems} categories={categories} isInView={isInView} t={t} />
        )}

        {/* Bars View */}
        {viewMode === 'bars' && !compareMode && (
          <SkillBarsView
            items={filteredItems}
            isInView={isInView}
            onSelect={handleSelectSkill}
            t={t}
          />
        )}

        {/* Skills Grid with AnimatePresence */}
        {(viewMode === 'cards' || compareMode) && !showRadar && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeCategory}-${searchQuery}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredItems.map((item, index) => (
                <SkillCard
                  key={item.id}
                  item={item}
                  index={index}
                  isInView={isInView}
                  onSelect={handleSelectSkill}
                  isCompareMode={compareMode}
                  isSelected={selectedCompareSkills.some((s) => s.id === item.id)}
                  onToggleCompare={handleToggleCompare}
                  t={t}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Empty state */}
        <AnimatePresence>
          {filteredItems.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-16"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-emerald-subtle mb-4">
                {searchQuery ? (
                  <Search className="w-10 h-10 text-primary/60" />
                ) : (
                  <FolderOpen className="w-10 h-10 text-primary/60" />
                )}
              </div>
              <p className="text-muted-foreground text-lg font-medium">
                {searchQuery ? t.skills.noSkillsFound : (language === 'ar' ? 'لا توجد مهارات في هذا التصنيف' : 'No skills in this category')}
              </p>
              <p className="text-muted-foreground/60 text-sm mt-1">
                {searchQuery ? t.skills.noSkillsFoundDesc : (language === 'ar' ? 'جرّب تصنيفًا آخر لعرض المهارات' : 'Try a different category')}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skill Details Modal */}
      <SkillDetailsModal
        item={selectedSkill}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        allItems={section.items}
        t={t}
        language={language}
      />
    </section>
  );
}
