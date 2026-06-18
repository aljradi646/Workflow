'use client';

import { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { type Section, type SectionItem } from '@/store/site-store';
import { useLanguageStore } from '@/store/language-store';
import { getTranslations } from '@/lib/i18n';
import { localizeSection, localizeSectionItem } from '@/lib/localize';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Briefcase,
  GraduationCap,
  MapPin,
  Calendar,
  Code2,
  Building2,
  Sparkles,
  Star,
  Trophy,
  Award,
  Zap,
  ChevronDown,
} from 'lucide-react';

interface ExperienceSectionProps {
  section: Section;
}

const achievementIcons = [Star, Trophy, Award, Zap];

function TimelineProgressIndicator({
  scrollProgress,
  totalItems,
}: {
  scrollProgress: number;
  totalItems: number;
}) {
  return (
    <div className="hidden lg:block absolute start-1/2 top-0 bottom-0 -translate-x-1/2 w-1 z-0">
      {/* Background track */}
      <div className="absolute inset-0 rounded-full bg-primary/5" />
      {/* Filled progress */}
      <motion.div
        className="absolute top-0 start-0 end-0 rounded-full"
        style={{
          height: `${Math.min(scrollProgress * 100, 100)}%`,
          background: 'linear-gradient(to bottom, oklch(0.55 0.17 160), oklch(0.6 0.15 175))',
        }}
      />
    </div>
  );
}

function TimelineItem({
  item,
  index,
  isInView,
  isLast,
  totalItems,
  language,
  scrollProgress,
}: {
  item: SectionItem;
  index: number;
  isInView: boolean;
  isLast: boolean;
  totalItems: number;
  language: 'ar' | 'en';
  scrollProgress: number;
}) {
  const numberedBadge = String(index + 1).padStart(2, '0');
  const t = getTranslations(language);

  const config = useMemo(() => {
    try { return JSON.parse(item.config || '{}'); } catch { return {}; }
  }, [item.config]);

  const tags: string[] = useMemo(() => {
    try { return JSON.parse(item.tags || '[]'); } catch { return []; }
  }, [item.tags]);

  const achievements: string[] = useMemo(() => {
    try { return JSON.parse(config.achievements || '[]'); } catch { return []; }
  }, [config.achievements]);

  const type = config.type || 'work';
  const location = config.location;
  const companyName = config.companyName as string | undefined;
  const isEducation = type === 'education';
  const isCurrent = !item.endDate;

  // Alternating layout on desktop (every other card on opposite side)
  const isEven = index % 2 === 0;

  // Tag color rotation
  const tagColors = [
    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  ];

  // Calculate if this item is "active" based on scroll
  const itemProgress = (scrollProgress * totalItems) - index;
  const isActive = itemProgress >= 0 && itemProgress <= 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="relative"
    >
      {/* Desktop: Alternating layout */}
      <div className="hidden lg:grid grid-cols-[1fr_auto_1fr] gap-6 items-start">
        {/* Left side content (even items) */}
        <div className={`${isEven ? '' : 'order-3'}`}>
          {isEven ? (
            <TimelineCard
              numberedBadge={numberedBadge}
              item={item}
              config={config}
              tags={tags}
              tagColors={tagColors}
              isEducation={isEducation}
              isCurrent={isCurrent}
              location={location}
              t={t}
              language={language}
              align="end"
              achievements={achievements}
            />
          ) : (
            <div className="py-6">
              {/* Empty spacer for odd items on the right */}
              <div className="text-end">
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="numbered-badge">{numberedBadge}</span>
                  <Calendar className="w-4 h-4" />
                  <span>{item.startDate} - {item.endDate || t.experience.present}</span>
                </div>
                {isCurrent && (
                  <div className="mt-2 flex justify-end">
                    <CurrentJobBadge t={t} isEducation={isEducation} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Center timeline line & dot */}
        <div className="flex flex-col items-center order-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ duration: 0.4, delay: index * 0.15 + 0.1, type: 'spring' }}
            className="relative z-10"
          >
            {/* Animated glowing dot */}
            <motion.div
              className="absolute -inset-2 rounded-full"
              animate={isActive ? {
                boxShadow: [
                  isEducation ? '0 0 10px rgba(20,184,166,0.3)' : '0 0 10px rgba(16,185,129,0.3)',
                  isEducation ? '0 0 25px rgba(20,184,166,0.6)' : '0 0 25px rgba(16,185,129,0.6)',
                  isEducation ? '0 0 10px rgba(20,184,166,0.3)' : '0 0 10px rgba(16,185,129,0.3)',
                ],
              } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg relative ${
                isEducation
                  ? 'bg-teal-500/10 border-2 border-teal-500'
                  : 'bg-emerald-500/10 border-2 border-emerald-500'
              }`}
            >
              {isEducation ? (
                <GraduationCap className="w-5 h-5 text-teal-500" />
              ) : (
                <Briefcase className="w-5 h-5 text-emerald-500" />
              )}
            </div>
            {/* Pulse ring for current positions */}
            {isCurrent && (
              <>
                <motion.div
                  className={`absolute inset-0 rounded-full border-2 ${
                    isEducation ? 'border-teal-500' : 'border-emerald-500'
                  }`}
                  animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                />
                <motion.div
                  className={`absolute inset-0 rounded-full border-2 ${
                    isEducation ? 'border-teal-500' : 'border-emerald-500'
                  }`}
                  animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
                />
              </>
            )}
            {/* Glowing timeline dot for active item */}
            {isActive && (
              <motion.div
                className="absolute -inset-1 rounded-full"
                style={{
                  background: isEducation
                    ? 'radial-gradient(circle, rgba(20,184,166,0.2) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)',
                }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.div>
          {!isLast && (
            <div
              className="w-0.5 flex-1 min-h-8 timeline-line-animate"
              style={{
                backgroundImage: isEducation
                  ? 'linear-gradient(to bottom, rgba(20,184,166,0.4), rgba(20,184,166,0.1), transparent)'
                  : 'linear-gradient(to bottom, rgba(16,185,129,0.4), rgba(16,185,129,0.1), transparent)',
                animationDelay: `${index * 0.15 + 0.4}s`,
              }}
            />
          )}
        </div>

        {/* Right side content (odd items) */}
        <div className={`${isEven ? 'order-3' : ''}`}>
          {!isEven ? (
            <TimelineCard
              numberedBadge={numberedBadge}
              item={item}
              config={config}
              tags={tags}
              tagColors={tagColors}
              isEducation={isEducation}
              isCurrent={isCurrent}
              location={location}
              t={t}
              language={language}
              align="start"
              achievements={achievements}
            />
          ) : (
            <div className="py-6">
              {/* Date for even items on the left side */}
              <div>
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="numbered-badge">{numberedBadge}</span>
                  <Calendar className="w-4 h-4" />
                  <span>{item.startDate} - {item.endDate || t.experience.present}</span>
                </div>
                {isCurrent && (
                  <div className="mt-2">
                    <CurrentJobBadge t={t} isEducation={isEducation} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: Single column layout */}
      <div className="lg:hidden relative flex gap-6 pb-8">
        {/* Timeline Line & Dot */}
        <div className="flex flex-col items-center shrink-0">
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ duration: 0.4, delay: index * 0.15 + 0.1, type: 'spring' }}
            className="relative"
          >
            {/* Glowing dot for mobile */}
            <motion.div
              className="absolute -inset-1 rounded-full"
              style={{
                background: isEducation
                  ? 'radial-gradient(circle, rgba(20,184,166,0.15) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
              }}
              animate={isActive ? { scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center z-10 shadow-lg relative ${
                isEducation
                  ? 'bg-teal-500/10 border-2 border-teal-500'
                  : 'bg-emerald-500/10 border-2 border-emerald-500'
              }`}
            >
              {isEducation ? (
                <GraduationCap className="w-5 h-5 text-teal-500" />
              ) : (
                <Briefcase className="w-5 h-5 text-emerald-500" />
              )}
            </div>
            {isCurrent && (
              <>
                <motion.div
                  className={`absolute inset-0 rounded-full border-2 ${
                    isEducation ? 'border-teal-500' : 'border-emerald-500'
                  }`}
                  animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                />
                <motion.div
                  className={`absolute inset-0 rounded-full border-2 ${
                    isEducation ? 'border-teal-500' : 'border-emerald-500'
                  }`}
                  animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
                />
              </>
            )}
          </motion.div>
          {!isLast && (
            <div
              className="w-0.5 flex-1 timeline-line-animate"
              style={{
                backgroundImage: isEducation
                  ? 'linear-gradient(to bottom, rgba(20,184,166,0.4), rgba(20,184,166,0.1), transparent)'
                  : 'linear-gradient(to bottom, rgba(16,185,129,0.4), rgba(16,185,129,0.1), transparent)',
                animationDelay: `${index * 0.15 + 0.4}s`,
              }}
            />
          )}
        </div>

        {/* Content */}
        <TimelineCard
          numberedBadge={numberedBadge}
          item={item}
          config={config}
          tags={tags}
          tagColors={tagColors}
          isEducation={isEducation}
          isCurrent={isCurrent}
          location={location}
          t={t}
          language={language}
          align="start"
          achievements={achievements}
        />
      </div>
    </motion.div>
  );
}

function CurrentJobBadge({
  t,
  isEducation,
}: {
  t: ReturnType<typeof getTranslations>;
  isEducation: boolean;
}) {
  return (
    <Badge
      variant="outline"
      className="text-xs border-emerald-500 text-emerald-600 dark:text-emerald-400 gap-1.5 px-2.5 py-1"
    >
      <motion.span
        className="w-2 h-2 rounded-full bg-emerald-500 inline-block"
        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      {t.experience.current}
    </Badge>
  );
}

function CompanyLogoPlaceholder({
  companyName,
  isEducation,
}: {
  companyName: string | undefined;
  isEducation: boolean;
}) {
  const firstLetter = companyName ? companyName.charAt(0).toUpperCase() : '?';

  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm shadow-md ${
        isEducation
          ? 'bg-gradient-to-br from-teal-500 to-emerald-400'
          : 'bg-gradient-to-br from-emerald-500 to-teal-400'
      }`}
    >
      {firstLetter}
    </div>
  );
}

function DurationBadge({
  startDate,
  endDate,
  t,
}: {
  startDate: string | null;
  endDate: string | null;
  t: ReturnType<typeof getTranslations>;
}) {
  const duration = useMemo(() => {
    if (!startDate) return null;
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);
    if (diffYears < 1) {
      const diffMonths = Math.floor(diffYears * 12);
      return `${diffMonths}+`;
    }
    return `${Math.floor(diffYears)}+`;
  }, [startDate, endDate]);

  if (!duration) return null;

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-500/20">
      <Calendar className="w-3 h-3" />
      <span>{duration} {t.experience.yearsAgo}</span>
    </div>
  );
}

function TimelineCard({
  item,
  config,
  tags,
  tagColors,
  isEducation,
  isCurrent,
  location,
  t,
  language,
  align,
  numberedBadge,
  achievements,
}: {
  item: SectionItem;
  config: Record<string, unknown>;
  tags: string[];
  tagColors: string[];
  isEducation: boolean;
  isCurrent: boolean;
  location: string | undefined;
  t: ReturnType<typeof getTranslations>;
  language: 'ar' | 'en';
  align: 'start' | 'end';
  numberedBadge?: string;
  achievements: string[];
}) {
  const companyName = config.companyName as string | undefined;
  const [isExpanded, setIsExpanded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePos({ x: 0, y: 0 });
  }, []);

  const hasExtraContent = achievements.length > 0 || item.description;

  return (
    <div ref={cardRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <Card className="glass-card card-hover card-accent-top border-glow card-shadow-elevation flex-1 mb-0 overflow-hidden group card-shimmer-hover relative">
        {/* Rotating gradient border on hover */}
        <motion.div
          className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
          style={{
            background: isEducation
              ? 'linear-gradient(var(--angle, 135deg), rgba(20,184,166,0.15), rgba(16,185,129,0.05), rgba(20,184,166,0.15))'
              : 'linear-gradient(var(--angle, 135deg), rgba(16,185,129,0.15), rgba(20,184,166,0.05), rgba(16,185,129,0.15))',
            padding: '1px',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
          animate={{ '--angle': `${135 + (Date.now() % 360)}deg` } as Record<string, string>}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />

        {/* Top gradient line */}
        <div className={`h-1 ${isEducation ? 'bg-gradient-to-l from-teal-500 to-emerald-400' : 'bg-gradient-to-l from-emerald-500 to-teal-400'}`} />

        <CardContent className="p-5 space-y-3 relative z-10">
          {/* Parallax content wrapper */}
          <motion.div
            style={{
              x: mousePos.x * 5,
              y: mousePos.y * 5,
              transition: 'transform 0.15s ease-out',
            }}
          >
            {/* Company Logo Placeholder + Title */}
            <div className="flex items-start gap-3">
              <div className="relative">
                <CompanyLogoPlaceholder companyName={companyName} isEducation={isEducation} />
                {/* Numbered badge overlay */}
                {numberedBadge && (
                  <div className="absolute -top-2 -start-2 numbered-badge text-[10px] w-5 h-5 flex items-center justify-center">
                    {numberedBadge}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-sm text-primary font-medium">{item.subtitle}</p>
              </div>
              {/* Current Job Indicator - pulsing green dot badge */}
              {isCurrent && (
                <div className="shrink-0">
                  <CurrentJobBadge t={t} isEducation={isEducation} />
                </div>
              )}
            </div>

            {/* Date Range & Duration Badge */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-2">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>
                  {item.startDate} - {item.endDate || t.experience.present}
                </span>
              </div>
              <DurationBadge startDate={item.startDate} endDate={item.endDate} t={t} />
            </div>

            {/* Location */}
            {location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{location}</span>
              </div>
            )}
          </motion.div>

          {/* Description (always visible if short, or expandable) */}
          {item.description && (
            <motion.div
              initial={false}
              animate={{ height: isExpanded ? 'auto' : (item.description.length > 120 ? '1.5rem' : 'auto') }}
              className="overflow-hidden relative"
            >
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          )}

          {/* Expand button */}
          {hasExtraContent && item.description && item.description.length > 120 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors min-h-[44px]"
              aria-expanded={isExpanded}
            >
              <span>{isExpanded ? t.experience.details : t.experience.details}</span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </motion.div>
            </button>
          )}

          {/* Expanded content - Achievements */}
          {achievements.length > 0 && (
            <motion.div
              initial={false}
              animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="space-y-1.5 pt-1">
                <p className="text-xs font-semibold text-foreground/80">{t.experience.achievements}</p>
                {achievements.map((achievement, i) => {
                  const IconComponent = achievementIcons[i % achievementIcons.length];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={isExpanded ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        isEducation ? 'bg-teal-500/10' : 'bg-emerald-500/10'
                      }`}>
                        <IconComponent className={`w-3 h-3 ${isEducation ? 'text-teal-500' : 'text-emerald-500'}`} />
                      </div>
                      <span>{achievement}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Tech Tags - with staggered animation */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((tag, i) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  whileHover={{ scale: 1.05 }}
                  className={`px-2.5 py-1 text-xs rounded-md border font-medium cursor-default ${tagColors[i % tagColors.length]}`}
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function ExperienceSection({ section }: ExperienceSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const { language } = useLanguageStore();
  const t = getTranslations(language);

  const localizedSection = localizeSection(section, language);

  // Create localized items
  const localizedItems = useMemo(() =>
    section.items.map((item) => {
      const localized = localizeSectionItem(item, language);
      return { ...item, title: localized.title, subtitle: localized.subtitle, description: localized.description };
    }),
  [section.items, language]);

  // Scroll progress for timeline
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const scrollProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      id="experience"
      ref={sectionRef}
      aria-labelledby="experience-heading"
      className="section-padding relative overflow-hidden dark-mesh-bg"
    >
      {/* Decorative backgrounds */}
      <div className="absolute top-0 end-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 start-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none -translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
            <Briefcase className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'خبراتي' : 'My Experience'}</span>
          </motion.div>
          <h2 id="experience-heading" className="text-3xl sm:text-4xl font-bold mb-4 text-shimmer-heading">{localizedSection.title}</h2>
          {localizedSection.subtitle && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {localizedSection.subtitle}
            </p>
          )}
        </motion.div>

        {/* Timeline with progress indicator */}
        <div className="max-w-4xl mx-auto relative">
          <TimelineProgressIndicator scrollProgress={scrollProgress as unknown as number} totalItems={localizedItems.length} />
          {localizedItems.map((item, index) => (
            <TimelineItem
              key={item.id}
              item={item}
              index={index}
              isInView={isInView}
              isLast={index === localizedItems.length - 1}
              totalItems={localizedItems.length}
              language={language}
              scrollProgress={scrollProgress as unknown as number}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
