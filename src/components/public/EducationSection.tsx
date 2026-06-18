'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform, useSpring, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { type Section, type SectionItem } from '@/store/site-store';
import { useLanguageStore } from '@/store/language-store';
import { getTranslations } from '@/lib/i18n';
import { localizeSection, localizeSectionItem } from '@/lib/localize';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  MapPin,
  Calendar,
  Award,
  ExternalLink,
  School,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Trophy,
  Clock,
  Certificate,
  Hash,
  Globe,
  Users,
  Star,
} from 'lucide-react';

interface EducationSectionProps {
  section: Section;
}

// Animated counter
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

// Circular progress ring for grade/GPA visualization
function GradeRing({
  value,
  maxValue = 100,
  size = 64,
  strokeWidth = 5,
  color = '#10B981',
  label,
}: {
  value: number;
  maxValue?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / maxValue) * circumference;
  const center = size / 2;

  return (
    <div className="relative inline-flex flex-col items-center" style={{ width: size, height: size }}>
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
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
        />
        {/* Glow ring */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth + 3}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference, opacity: 0.15 }}
          animate={{ strokeDashoffset: circumference - progress, opacity: 0.1 }}
          transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
          style={{ filter: 'blur(4px)' }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold" style={{ color }}>
          {label || value}
        </span>
      </div>
    </div>
  );
}

// Stats Summary Bar
function StatsSummary({
  items,
  isInView,
  t,
  language,
}: {
  items: SectionItem[];
  isInView: boolean;
  t: ReturnType<typeof getTranslations>;
  language: 'ar' | 'en';
}) {
  const stats = useMemo(() => {
    let totalDegrees = items.length;
    let certifications = 0;
    let totalYears = 0;

    items.forEach((item) => {
      try {
        const config = JSON.parse(item.config || '{}');
        if (config.certificate) certifications++;
        if (item.startDate) {
          const startYear = new Date(item.startDate).getFullYear();
          const endYear = item.endDate ? new Date(item.endDate).getFullYear() : new Date().getFullYear();
          totalYears += endYear - startYear;
        }
      } catch {}
    });

    return { totalDegrees, certifications, totalYears };
  }, [items]);

  const statItems = [
    {
      icon: <GraduationCap className="w-5 h-5 text-teal-500" />,
      value: stats.totalDegrees,
      label: t.education.totalDegrees,
      color: '#14B8A6',
    },
    {
      icon: <Award className="w-5 h-5 text-emerald-500" />,
      value: stats.certifications,
      label: t.education.certifications,
      color: '#10B981',
    },
    {
      icon: <Clock className="w-5 h-5 text-teal-500" />,
      value: stats.totalYears,
      label: t.education.yearsOfEducation,
      color: '#14B8A6',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mb-12">
      {statItems.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="glass-card card-shadow-elevation card-border-glow rounded-xl p-4 text-center group hover-lift"
        >
          <div className="flex justify-center mb-2">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: `${stat.color}15` }}
            >
              {stat.icon}
            </div>
          </div>
          <div className="text-2xl font-bold" style={{ color: stat.color }}>
            <AnimatedCounter value={stat.value} duration={1.2} delay={0.3 + i * 0.1} />
          </div>
          <p className="text-xs text-muted-foreground font-medium mt-1">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}

// Education Card Component (Enhanced)
function EducationCard({
  item,
  index,
  isInView,
  isLast,
  language,
  allItems,
}: {
  item: SectionItem;
  index: number;
  isInView: boolean;
  isLast: boolean;
  language: 'ar' | 'en';
  allItems: SectionItem[];
}) {
  const t = getTranslations(language);
  const isRtl = language === 'ar';
  const [isExpanded, setIsExpanded] = useState(false);

  const config = useMemo(() => {
    try { return JSON.parse(item.config || '{}'); } catch { return {}; }
  }, [item.config]);

  const grade = config.grade;
  const location = config.location;
  const certificate = config.certificate;
  const institution = config.institution || item.subtitle;
  const isCurrent = !item.endDate;
  const courses = config.courses as string[] | undefined;
  const gpaValue = config.gpa as number | undefined;
  const gpaMax = config.gpaMax as number | undefined;

  // Calculate grade percentage for the ring
  const gradePercent = useMemo(() => {
    if (gpaValue && gpaMax) return Math.round((gpaValue / gpaMax) * 100);
    if (typeof grade === 'string') {
      // Try to parse numeric grade
      const num = parseFloat(grade);
      if (!isNaN(num)) return num > 10 ? num : num * 10; // If <10 assume it's out of 10
    }
    if (typeof grade === 'number') return grade > 10 ? grade : grade * 10;
    return 85; // default
  }, [grade, gpaValue, gpaMax]);

  // Alternating layout for desktop
  const isEven = index % 2 === 0;

  // Parse course tags
  const courseTags = useMemo(() => {
    if (courses && Array.isArray(courses)) return courses;
    if (item.tags) {
      try { return JSON.parse(item.tags); } catch { return []; }
    }
    return [];
  }, [courses, item.tags]);

  // Calculate duration
  const duration = useMemo(() => {
    if (!item.startDate) return null;
    const startYear = new Date(item.startDate).getFullYear();
    const endYear = item.endDate ? new Date(item.endDate).getFullYear() : new Date().getFullYear();
    const diff = endYear - startYear;
    if (diff <= 0) return null;
    return diff;
  }, [item.startDate, item.endDate]);

  return (
    <motion.div
      initial={{ opacity: 0, x: isRtl ? 30 : -30 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className={`relative flex gap-6 ${!isRtl ? 'md:flex-row' : 'md:flex-row-reverse'}`}
    >
      {/* Desktop: Alternating layout */}
      <div className="hidden md:flex w-full items-start">
        {/* Left side content (for even items) or spacer */}
        {isEven ? (
          <div className="flex-1 pe-8">
            <EducationCardContent
              item={item}
              index={index}
              isInView={isInView}
              isExpanded={isExpanded}
              setIsExpanded={setIsExpanded}
              config={config}
              grade={grade}
              location={location}
              certificate={certificate}
              institution={institution}
              isCurrent={isCurrent}
              gradePercent={gradePercent}
              gpaValue={gpaValue}
              gpaMax={gpaMax}
              courseTags={courseTags}
              duration={duration}
              language={language}
              t={t}
              isRtl={isRtl}
            />
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* Timeline center */}
        <div className="flex flex-col items-center shrink-0 relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ duration: 0.4, delay: index * 0.15 + 0.2, type: 'spring' }}
            className="relative z-10"
          >
            <div className="w-12 h-12 rounded-full bg-teal-500/10 border-2 border-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <GraduationCap className="w-5 h-5 text-teal-500" />
            </div>
            {/* Pulse ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-teal-500"
              animate={isInView ? { scale: [0.8, 1.3], opacity: [0.6, 0] } : {}}
              transition={{ duration: 1.5, delay: index * 0.15 + 0.5, repeat: 2, ease: 'easeOut' }}
            />
            {/* Current indicator pulse */}
            {isCurrent && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-teal-500"
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              />
            )}
          </motion.div>
          {/* Timeline line */}
          {!isLast && (
            <motion.div
              className="w-0.5 flex-1 origin-top"
              style={{ background: 'linear-gradient(to bottom, #14B8A6, transparent)' }}
              initial={{ scaleY: 0 }}
              animate={isInView ? { scaleY: 1 } : {}}
              transition={{ duration: 0.8, delay: index * 0.15 + 0.3, ease: 'easeOut' }}
            />
          )}
        </div>

        {/* Right side content (for odd items) or spacer */}
        {!isEven ? (
          <div className="flex-1 ps-8">
            <EducationCardContent
              item={item}
              index={index}
              isInView={isInView}
              isExpanded={isExpanded}
              setIsExpanded={setIsExpanded}
              config={config}
              grade={grade}
              location={location}
              certificate={certificate}
              institution={institution}
              isCurrent={isCurrent}
              gradePercent={gradePercent}
              gpaValue={gpaValue}
              gpaMax={gpaMax}
              courseTags={courseTags}
              duration={duration}
              language={language}
              t={t}
              isRtl={isRtl}
            />
          </div>
        ) : (
          <div className="flex-1" />
        )}
      </div>

      {/* Mobile: Standard timeline layout */}
      <div className="flex md:hidden gap-4">
        {/* Timeline line & dot */}
        <div className="flex flex-col items-center shrink-0">
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ duration: 0.4, delay: index * 0.15 + 0.2, type: 'spring' }}
            className="relative"
          >
            <div className="w-10 h-10 rounded-full bg-teal-500/10 border-2 border-teal-500 flex items-center justify-center z-10 shadow-lg shadow-teal-500/20">
              <GraduationCap className="w-4 h-4 text-teal-500" />
            </div>
            {/* Pulse ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-teal-500"
              animate={isInView ? { scale: [0.8, 1.3], opacity: [0.6, 0] } : {}}
              transition={{ duration: 1.5, delay: index * 0.15 + 0.5, repeat: 2, ease: 'easeOut' }}
            />
            {isCurrent && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-teal-500"
                animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              />
            )}
          </motion.div>
          {!isLast && (
            <motion.div
              className="w-0.5 flex-1 origin-top"
              style={{ background: 'linear-gradient(to bottom, #14B8A6, transparent)' }}
              initial={{ scaleY: 0 }}
              animate={isInView ? { scaleY: 1 } : {}}
              transition={{ duration: 0.8, delay: index * 0.15 + 0.3, ease: 'easeOut' }}
            />
          )}
        </div>

        {/* Card */}
        <div className="flex-1 mb-6">
          <EducationCardContent
            item={item}
            index={index}
            isInView={isInView}
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
            config={config}
            grade={grade}
            location={location}
            certificate={certificate}
            institution={institution}
            isCurrent={isCurrent}
            gradePercent={gradePercent}
            gpaValue={gpaValue}
            gpaMax={gpaMax}
            courseTags={courseTags}
            duration={duration}
            language={language}
            t={t}
            isRtl={isRtl}
          />
        </div>
      </div>
    </motion.div>
  );
}

// Extracted card content for reuse in alternating layout
function EducationCardContent({
  item,
  index,
  isInView,
  isExpanded,
  setIsExpanded,
  config,
  grade,
  location,
  certificate,
  institution,
  isCurrent,
  gradePercent,
  gpaValue,
  gpaMax,
  courseTags,
  duration,
  language,
  t,
  isRtl,
}: {
  item: SectionItem;
  index: number;
  isInView: boolean;
  isExpanded: boolean;
  setIsExpanded: (v: boolean) => void;
  config: Record<string, unknown>;
  grade: string | undefined;
  location: string | undefined;
  certificate: string | undefined;
  institution: string | undefined;
  isCurrent: boolean;
  gradePercent: number;
  gpaValue: number | undefined;
  gpaMax: number | undefined;
  courseTags: string[];
  duration: number | null;
  language: 'ar' | 'en';
  t: ReturnType<typeof getTranslations>;
  isRtl: boolean;
}) {
  return (
    <Card className="glass-card card-hover card-shadow-elevation card-border-glow overflow-hidden group">
      {/* Top gradient line */}
      <div className="h-1 bg-gradient-to-l from-teal-500 to-emerald-400" />

      <CardContent className="p-5 space-y-4">
        {/* Header: Institution Logo Placeholder + Title */}
        <div className="flex items-start gap-4">
          {/* Institution logo placeholder */}
          <motion.div
            className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border border-teal-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform relative overflow-hidden"
            whileHover={{ scale: 1.08 }}
          >
            <School className="w-7 h-7 text-teal-500" />
            {/* Animated shimmer on logo */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(110deg, transparent 30%, rgba(16,185,129,0.1) 50%, transparent 70%)',
                backgroundSize: '200% 100%',
              }}
              animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: index * 0.5 }}
            />
          </motion.div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg group-hover:text-teal-500 transition-colors">{item.title}</h3>
            {institution && (
              <p className="text-sm text-primary font-medium mt-0.5">{institution}</p>
            )}
          </div>
          {/* Grade ring */}
          {(grade || gpaValue) && (
            <div className="shrink-0">
              <GradeRing
                value={gradePercent}
                size={56}
                strokeWidth={4}
                color="#14B8A6"
                label={gpaValue ? `${gpaValue}` : (grade || '')}
              />
            </div>
          )}
        </div>

        {/* Date & Location */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-teal-500/70" />
            <span>
              {item.startDate} - {item.endDate || t.education.present}
            </span>
          </div>
          {isCurrent && (
            <Badge variant="outline" className="text-xs border-teal-500 text-teal-600 dark:text-teal-400 gap-1">
              <Sparkles className="w-3 h-3" />
              {t.experience.current}
            </Badge>
          )}
          {duration && (
            <Badge variant="outline" className="text-xs border-emerald-500/50 text-emerald-600 dark:text-emerald-400 gap-1">
              <Clock className="w-3 h-3" />
              {duration} {language === 'ar' ? 'سنوات' : 'years'}
            </Badge>
          )}
          {location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-teal-500/70" />
              <span>{location}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
        )}

        {/* Course/Subject Tags */}
        {courseTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {courseTags.slice(0, isExpanded ? undefined : 4).map((tag: string, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.3, delay: 0.5 + i * 0.05 }}
              >
                <Badge
                  variant="outline"
                  className="text-[10px] border-teal-500/30 text-teal-600 dark:text-teal-400 bg-teal-500/5 gap-1 px-2 py-0.5"
                >
                  <BookOpen className="w-2.5 h-2.5" />
                  {tag}
                </Badge>
              </motion.div>
            ))}
            {courseTags.length > 4 && !isExpanded && (
              <Badge
                variant="outline"
                className="text-[10px] border-primary/20 text-muted-foreground px-2 py-0.5 cursor-pointer hover:bg-primary/10"
                onClick={() => setIsExpanded(true)}
              >
                +{courseTags.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Grade & Certificate row */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {grade && (
            <Badge
              variant="outline"
              className="text-xs border-teal-500/50 text-teal-600 dark:text-teal-400 bg-teal-500/5 gap-1"
            >
              <Award className="w-3 h-3" />
              {t.education.grade}: {grade}
            </Badge>
          )}
          {gpaValue && (
            <Badge
              variant="outline"
              className="text-xs border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 gap-1"
            >
              <Trophy className="w-3 h-3" />
              {t.education.gpa}: {gpaValue}{gpaMax ? `/${gpaMax}` : ''}
            </Badge>
          )}
          {certificate && (
            <motion.a
              href={certificate}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium px-2 py-1 rounded-md bg-primary/5 hover:bg-primary/10 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
              >
                <ExternalLink className="w-3 h-3" />
              </motion.div>
              {t.buttons.viewCertificate}
            </motion.a>
          )}
        </div>

        {/* Expandable Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-2 border-t border-primary/10 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">{t.education.details}</p>
                {item.content && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.content}</p>
                )}
                {/* Additional details from config */}
                {config.achievements && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Star className="w-3 h-3 text-emerald-500" />
                      {language === 'ar' ? 'الإنجازات' : 'Achievements'}
                    </p>
                    <p className="text-sm text-muted-foreground">{config.achievements as string}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expand/Collapse button */}
        {(item.content || courseTags.length > 4) && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-teal-500 hover:text-teal-600 transition-colors font-medium min-h-[44px]"
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                {t.education.hideDetails}
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                {t.education.showDetails}
              </>
            )}
          </button>
        )}
      </CardContent>
    </Card>
  );
}

// Floating decorative background elements
function EducationDecorations() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Floating graduation caps */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-teal-500/5"
          style={{
            top: `${25 + i * 25}%`,
            left: `${5 + i * 35}%`,
            fontSize: 24 + i * 8,
          }}
          animate={{
            y: [-10, 10, -10],
            rotate: [0, 5, -5, 0],
            opacity: [0.04, 0.08, 0.04],
          }}
          transition={{
            duration: 7 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 2,
          }}
        >
          🎓
        </motion.div>
      ))}
      {/* Floating circles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`circle-${i}`}
          className="absolute rounded-full border border-teal-500/5"
          style={{
            width: 30 + i * 15,
            height: 30 + i * 15,
            top: `${15 + i * 18}%`,
            right: `${8 + i * 18}%`,
          }}
          animate={{
            y: [-8, 8, -8],
            scale: [1, 1.05, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 6 + i,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 1.2,
          }}
        />
      ))}
    </div>
  );
}

export function EducationSection({ section }: EducationSectionProps) {
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

  return (
    <section
      id="education"
      ref={sectionRef}
      aria-labelledby="education-heading"
      className="section-padding relative overflow-hidden dark-mesh-bg"
    >
      {/* Decorative background */}
      <div className="absolute top-0 start-0 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 end-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none translate-x-1/2 translate-y-1/2" />
      <EducationDecorations />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card-sm text-xs font-medium text-primary mb-4"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>{t.education.educationalJourney}</span>
          </motion.div>
          <h2 id="education-heading" className="text-3xl sm:text-4xl font-bold mb-4 text-shimmer-heading">{localizedSection.title}</h2>
          {localizedSection.subtitle && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {localizedSection.subtitle}
            </p>
          )}
        </motion.div>

        {/* Stats Summary */}
        <StatsSummary items={localizedItems} isInView={isInView} t={t} language={language} />

        {/* Timeline */}
        <div className="max-w-4xl mx-auto">
          {localizedItems.map((item, index) => (
            <EducationCard
              key={item.id}
              item={item}
              index={index}
              isInView={isInView}
              isLast={index === localizedItems.length - 1}
              language={language}
              allItems={localizedItems}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
