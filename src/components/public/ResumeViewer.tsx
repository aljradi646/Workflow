'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSiteStore } from '@/store/site-store';
import { useLanguageStore } from '@/store/language-store';
import { getTranslations } from '@/lib/i18n';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  Download,
  Printer,
  Share2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronUp,
  X,
  Award,
  Link2,
} from 'lucide-react';

// Types
interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string | null;
  description?: string;
  current?: boolean;
}

interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location?: string;
  startDate: string;
  endDate: string | null;
  description?: string;
  grade?: string;
}

interface SkillItem {
  id: string;
  name: string;
  category?: string;
  level: number;
  years?: number;
}

type ResumeTab = 'profile' | 'experience' | 'education' | 'skills';

// Mock data fallbacks
const mockExperiences: ExperienceItem[] = [
  {
    id: '1',
    title: 'Senior Full-Stack Developer',
    company: 'Tech Solutions Inc.',
    location: 'Riyadh, Saudi Arabia',
    startDate: '2021-01',
    endDate: null,
    description: 'Leading development of enterprise web applications using React, Next.js, and Node.js. Mentoring junior developers and establishing coding standards.',
    current: true,
  },
  {
    id: '2',
    title: 'Full-Stack Developer',
    company: 'Digital Agency',
    location: 'Cairo, Egypt',
    startDate: '2018-06',
    endDate: '2020-12',
    description: 'Built and maintained multiple client projects using modern web technologies. Implemented CI/CD pipelines and improved development workflows.',
  },
  {
    id: '3',
    title: 'Frontend Developer',
    company: 'Startup Hub',
    location: 'Dubai, UAE',
    startDate: '2016-03',
    endDate: '2018-05',
    description: 'Developed responsive web applications and implemented pixel-perfect UI designs. Collaborated with UX designers and backend developers.',
  },
];

const mockEducation: EducationItem[] = [
  {
    id: '1',
    degree: 'Master of Computer Science',
    institution: 'King Saud University',
    location: 'Riyadh, Saudi Arabia',
    startDate: '2014',
    endDate: '2016',
    description: 'Specialized in Software Engineering and Web Technologies.',
    grade: '4.8/5.0',
  },
  {
    id: '2',
    degree: 'Bachelor of Computer Science',
    institution: 'Cairo University',
    location: 'Cairo, Egypt',
    startDate: '2010',
    endDate: '2014',
    description: 'Major in Computer Science with focus on algorithms and data structures.',
    grade: '4.2/5.0',
  },
];

const mockSkills: SkillItem[] = [
  { id: '1', name: 'React', category: 'Frontend', level: 95, years: 7 },
  { id: '2', name: 'Next.js', category: 'Frontend', level: 90, years: 5 },
  { id: '3', name: 'TypeScript', category: 'Frontend', level: 92, years: 6 },
  { id: '4', name: 'Node.js', category: 'Backend', level: 88, years: 7 },
  { id: '5', name: 'Python', category: 'Backend', level: 82, years: 5 },
  { id: '6', name: 'PostgreSQL', category: 'Database', level: 85, years: 6 },
  { id: '7', name: 'MongoDB', category: 'Database', level: 80, years: 5 },
  { id: '8', name: 'Docker', category: 'DevOps', level: 78, years: 4 },
  { id: '9', name: 'AWS', category: 'DevOps', level: 75, years: 4 },
  { id: '10', name: 'GraphQL', category: 'Backend', level: 82, years: 3 },
  { id: '11', name: 'Tailwind CSS', category: 'Frontend', level: 93, years: 4 },
  { id: '12', name: 'Git', category: 'DevOps', level: 90, years: 8 },
];

// Animated counter for numbers
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayed(value);
        clearInterval(timer);
      } else {
        setDisplayed(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span ref={ref} className="tabular-nums">
      {displayed}
      {suffix}
    </span>
  );
}

// Proficiency bar component
function ProficiencyBar({ level, color = 'emerald' }: { level: number; color?: string }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(level), 100);
    return () => clearTimeout(timer);
  }, [level]);

  return (
    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color === 'emerald' ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-primary'}`}
        initial={{ width: 0 }}
        animate={{ width: `${width}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </div>
  );
}

// Section toggle component
function SectionToggle({
  title,
  icon: Icon,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border/50 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="font-semibold text-sm">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ResumeViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResumeViewer({ open, onOpenChange }: ResumeViewerProps) {
  const { siteData } = useSiteStore();
  const { language } = useLanguageStore();
  const t = getTranslations(language);
  const isRTL = language === 'ar';

  const [activeTab, setActiveTab] = useState<ResumeTab>('profile');
  const [experiences, setExperiences] = useState<ExperienceItem[]>(mockExperiences);
  const [education, setEducation] = useState<EducationItem[]>(mockEducation);
  const [skills, setSkills] = useState<SkillItem[]>(mockSkills);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    experience: true,
    education: true,
    skills: true,
  });
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  const settings = siteData?.settings || {};
  const ownerName = settings.owner_name || settings.site_name || 'Ahmed Al-Mutairi';
  const ownerTitle = settings.owner_title || 'Senior Full-Stack Developer';
  const ownerEmail = settings.owner_email || 'ahmed@example.com';
  const ownerPhone = settings.owner_phone || '+966 50 123 4567';
  const ownerLocation = settings.owner_location || 'Riyadh, Saudi Arabia';
  const ownerAvatar = settings.owner_avatar || null;
  const ownerBio = settings.owner_bio || settings.site_description || 'Passionate Full-Stack Developer with 8+ years of experience building scalable web applications and leading development teams.';

  // Fetch data from APIs
  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      try {
        const [expRes, eduRes, skillRes] = await Promise.all([
          fetch('/api/public/experiences'),
          fetch('/api/public/education'),
          fetch('/api/public/skills'),
        ]);

        if (expRes.ok) {
          const expData = await expRes.json();
          const items = expData.data?.items || expData.data || [];
          if (Array.isArray(items) && items.length > 0) {
            setExperiences(
              items.map((item: Record<string, unknown>) => ({
                id: String(item.id || Math.random()),
                title: String(item.title || ''),
                company: String(item.company || item.organization || ''),
                location: String(item.location || ''),
                startDate: String(item.startDate || item.start_date || ''),
                endDate: item.endDate ? String(item.endDate) : item.end_date ? String(item.end_date) : null,
                description: String(item.description || ''),
                current: Boolean(item.current || item.isCurrent),
              }))
            );
          }
        }

        if (eduRes.ok) {
          const eduData = await eduRes.json();
          const items = eduData.data?.items || eduData.data || [];
          if (Array.isArray(items) && items.length > 0) {
            setEducation(
              items.map((item: Record<string, unknown>) => ({
                id: String(item.id || Math.random()),
                degree: String(item.degree || item.title || ''),
                institution: String(item.institution || item.organization || ''),
                location: String(item.location || ''),
                startDate: String(item.startDate || item.start_date || ''),
                endDate: item.endDate ? String(item.endDate) : item.end_date ? String(item.end_date) : null,
                description: String(item.description || ''),
                grade: String(item.grade || item.gpa || ''),
              }))
            );
          }
        }

        if (skillRes.ok) {
          const skillData = await skillRes.json();
          const items = skillData.data?.items || skillData.data || skillData.data?.skills || [];
          if (Array.isArray(items) && items.length > 0) {
            setSkills(
              items.map((item: Record<string, unknown>) => ({
                id: String(item.id || Math.random()),
                name: String(item.name || item.title || ''),
                category: String(item.category || ''),
                level: Number(item.level || item.proficiency || 75),
                years: Number(item.years || item.experience || 0),
              }))
            );
          }
        }
      } catch {
        // Use mock data on error
      }
    };

    fetchData();
  }, [open]);

  // Print handler
  const handlePrint = useCallback(() => {
    setIsPrintMode(true);
    setTimeout(() => {
      window.print();
      setIsPrintMode(false);
    }, 300);
  }, []);

  // Share handler
  const handleShare = useCallback(async () => {
    const shareData = {
      title: `${ownerName} - ${isRTL ? 'السيرة الذاتية' : 'Resume'}`,
      text: isRTL
        ? `السيرة الذاتية لـ ${ownerName}`
        : `Resume of ${ownerName}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2000);
      }
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    }
  }, [ownerName, isRTL]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Tab configuration
  const tabs: { id: ResumeTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'profile', label: t.resume.profile, icon: User },
    { id: 'experience', label: t.resume.experience, icon: Briefcase },
    { id: 'education', label: t.resume.education, icon: GraduationCap },
    { id: 'skills', label: t.resume.skills, icon: Wrench },
  ];

  // Format date
  const formatDate = (dateStr: string | null, isEnd = false) => {
    if (!dateStr && isEnd) return t.resume.present;
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  // Group skills by category
  const skillsByCategory = skills.reduce<Record<string, SkillItem[]>>((acc, skill) => {
    const cat = skill.category || (isRTL ? 'أخرى' : 'Other');
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] sm:max-w-[900px] max-h-[95vh] p-0 gap-0 overflow-hidden print:max-w-none print:max-h-none print:m-0 print:p-0 print:rounded-none print:border-0 print:shadow-none"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">
          {isRTL ? 'السيرة الذاتية' : 'Resume'} - {ownerName}
        </DialogTitle>

        {/* Print-only header */}
        <div className="hidden print:block print:mb-6">
          <div className="flex items-center gap-4">
            {ownerAvatar && (
              <img src={ownerAvatar} alt={ownerName} className="w-16 h-16 rounded-full object-cover" />
            )}
            <div>
              <h1 className="text-2xl font-bold">{ownerName}</h1>
              <p className="text-emerald-600">{ownerTitle}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {ownerEmail} · {ownerPhone} · {ownerLocation}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row h-full max-h-[95vh] print:max-h-none print:flex-row">
          {/* Sidebar - Tab Navigation */}
          <div className="print:hidden md:w-56 lg:w-64 border-b md:border-b-0 md:border-e border-border/50 bg-muted/30 flex md:flex-col overflow-x-auto md:overflow-x-visible md:overflow-y-auto shrink-0">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-border/30">
              <div className="flex items-center gap-3">
                {ownerAvatar ? (
                  <img
                    src={ownerAvatar}
                    alt={ownerName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full gradient-emerald flex items-center justify-center ring-2 ring-emerald-500/30">
                    <span className="text-xs font-bold text-white">
                      {ownerName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{ownerName}</p>
                  <p className="text-xs text-muted-foreground truncate">{ownerTitle}</p>
                </div>
              </div>
            </div>

            {/* Tab Buttons */}
            <div className="flex md:flex-col p-2 gap-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="resume-tab-indicator"
                        className="hidden md:block absolute start-0 w-0.5 h-5 bg-emerald-500 rounded-e-full"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Sidebar Footer - Actions */}
            <div className="hidden md:flex flex-col gap-2 p-3 mt-auto border-t border-border/30">
              <Button
                variant="ghost"
                size="sm"
                className="justify-start gap-2 text-xs"
                onClick={handlePrint}
              >
                <Printer className="w-3.5 h-3.5" />
                {t.resume.printResume}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start gap-2 text-xs"
                onClick={handleShare}
              >
                <Share2 className="w-3.5 h-3.5" />
                {t.resume.shareResume}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start gap-2 text-xs"
                asChild
              >
                <a href="/api/resume/download" download>
                  <Download className="w-3.5 h-3.5" />
                  {t.resume.downloadPdf}
                </a>
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto print:overflow-visible">
            {/* Top Bar - Mobile actions & close */}
            <div className="print:hidden sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/30 px-4 py-3 flex items-center justify-between md:justify-end gap-2">
              {/* Mobile tab dropdown */}
              <div className="flex md:hidden items-center gap-2">
                <span className="text-sm font-medium">
                  {tabs.find((t) => t.id === activeTab)?.label}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrint}>
                  <Printer className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleShare}>
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <a href="/api/resume/download" download>
                    <Download className="w-4 h-4" />
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-4 md:p-6 print:p-0">
              {/* Watermark pattern */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.02] print:hidden">
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: `repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)`,
                    backgroundSize: '20px 20px',
                  }}
                />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="relative"
                >
                  {/* Profile Tab */}
                  {activeTab === 'profile' && (
                    <div className="space-y-6">
                      {/* Profile Header */}
                      <div className="flex flex-col sm:flex-row items-start gap-6">
                        <div className="relative">
                          {ownerAvatar ? (
                            <img
                              src={ownerAvatar}
                              alt={ownerName}
                              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-emerald-500/20 shadow-lg"
                            />
                          ) : (
                            <div className="w-24 h-24 rounded-2xl gradient-emerald flex items-center justify-center ring-4 ring-emerald-500/20 shadow-lg">
                              <span className="text-2xl font-bold text-white">
                                {ownerName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                              </span>
                            </div>
                          )}
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-background" />
                        </div>
                        <div className="space-y-1">
                          <h2 className="text-2xl font-bold">{ownerName}</h2>
                          <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                            {ownerTitle}
                          </p>
                          <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                            {ownerBio}
                          </p>
                        </div>
                      </div>

                      {/* Contact Info Grid */}
                      <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                          {t.resume.contactInfo}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                              <Mail className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">{isRTL ? 'البريد الإلكتروني' : 'Email'}</p>
                              <p className="text-sm font-medium">{ownerEmail}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                              <Phone className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">{isRTL ? 'الهاتف' : 'Phone'}</p>
                              <p className="text-sm font-medium" dir="ltr">{ownerPhone}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                              <MapPin className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">{isRTL ? 'الموقع' : 'Location'}</p>
                              <p className="text-sm font-medium">{ownerLocation}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                              <Calendar className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">{isRTL ? 'الخبرة' : 'Experience'}</p>
                              <p className="text-sm font-medium">
                                <AnimatedNumber value={8} suffix={isRTL ? '+ سنوات' : '+ years'} />
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { value: 8, suffix: '+', label: isRTL ? 'سنوات خبرة' : 'Years Exp' },
                          { value: 150, suffix: '+', label: isRTL ? 'مشروع' : 'Projects' },
                          { value: 80, suffix: '+', label: isRTL ? 'عميل' : 'Clients' },
                          { value: 12, suffix: '', label: isRTL ? 'جائزة' : 'Awards' },
                        ].map((stat) => (
                          <div
                            key={stat.label}
                            className="text-center p-3 rounded-xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/10"
                          >
                            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                              <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience Tab */}
                  {activeTab === 'experience' && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-emerald-500" />
                        {t.resume.workExperience}
                      </h2>

                      {experiences.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                          {t.resume.noData}
                        </p>
                      ) : (
                        <div className="relative">
                          {/* Timeline line */}
                          <div className="absolute start-5 top-0 bottom-0 w-px bg-border hidden sm:block" />

                          <div className="space-y-4">
                            {experiences.map((exp, idx) => (
                              <motion.div
                                key={exp.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="relative ps-0 sm:ps-12"
                              >
                                {/* Timeline dot */}
                                <div className="hidden sm:flex absolute start-3 top-4 w-4 h-4 rounded-full bg-emerald-500 border-4 border-background z-10">
                                  {exp.current && (
                                    <span className="absolute -inset-1 rounded-full bg-emerald-400/30 animate-ping" />
                                  )}
                                </div>

                                <div className="p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors">
                                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 mb-2">
                                    <div>
                                      <h3 className="font-semibold text-sm">{exp.title}</h3>
                                      <p className="text-emerald-600 dark:text-emerald-400 text-sm">{exp.company}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                                      <Calendar className="w-3 h-3" />
                                      <span>
                                        {formatDate(exp.startDate)} - {formatDate(exp.endDate, true)}
                                      </span>
                                    </div>
                                  </div>

                                  {exp.location && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                                      <MapPin className="w-3 h-3" />
                                      {exp.location}
                                    </div>
                                  )}

                                  {exp.description && (
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                      {exp.description}
                                    </p>
                                  )}

                                  {exp.current && (
                                    <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                      {t.resume.present}
                                    </span>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Education Tab */}
                  {activeTab === 'education' && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-emerald-500" />
                        {t.resume.educationHistory}
                      </h2>

                      {education.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                          {t.resume.noData}
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {education.map((edu, idx) => (
                            <motion.div
                              key={edu.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 mb-2">
                                <div>
                                  <h3 className="font-semibold text-sm">{edu.degree}</h3>
                                  <p className="text-emerald-600 dark:text-emerald-400 text-sm">
                                    {edu.institution}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                                  <Calendar className="w-3 h-3" />
                                  <span>
                                    {formatDate(edu.startDate)} - {formatDate(edu.endDate, true)}
                                  </span>
                                </div>
                              </div>

                              {edu.location && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                                  <MapPin className="w-3 h-3" />
                                  {edu.location}
                                </div>
                              )}

                              {edu.description && (
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {edu.description}
                                </p>
                              )}

                              {edu.grade && (
                                <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full w-fit">
                                  <Award className="w-3 h-3" />
                                  {isRTL ? 'التقدير' : 'Grade'}: {edu.grade}
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Skills Tab */}
                  {activeTab === 'skills' && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <Wrench className="w-5 h-5 text-emerald-500" />
                        {t.resume.technicalSkills}
                      </h2>

                      {skills.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                          {t.resume.noData}
                        </p>
                      ) : (
                        Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                          <div key={category}>
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {category}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {categorySkills.map((skill, idx) => (
                                <motion.div
                                  key={skill.id}
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                  className="p-3 rounded-lg border border-border/30 bg-muted/20 hover:bg-muted/40 transition-colors"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">{skill.name}</span>
                                    <div className="flex items-center gap-1.5">
                                      {skill.years > 0 && (
                                        <span className="text-xs text-muted-foreground">
                                          {skill.years} {t.resume.years}
                                        </span>
                                      )}
                                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                        {skill.level}%
                                      </span>
                                    </div>
                                  </div>
                                  <ProficiencyBar level={skill.level} />
                                  <div className="flex items-center justify-between mt-1.5">
                                    <span className="text-[10px] text-muted-foreground">
                                      {skill.level >= 90
                                        ? t.skills.expert
                                        : skill.level >= 75
                                        ? t.skills.advanced
                                        : skill.level >= 50
                                        ? t.skills.intermediate
                                        : t.skills.beginner}
                                    </span>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Print sections - all visible when printing */}
              <div className="hidden print:block space-y-8 mt-6">
                {/* Experience */}
                <div>
                  <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> {t.resume.workExperience}
                  </h2>
                  {experiences.map((exp) => (
                    <div key={exp.id} className="mb-3 ps-4 border-s-2 border-emerald-300">
                      <p className="font-semibold text-sm">{exp.title} - {exp.company}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(exp.startDate)} - {formatDate(exp.endDate, true)}</p>
                      {exp.description && <p className="text-xs mt-1">{exp.description}</p>}
                    </div>
                  ))}
                </div>
                {/* Education */}
                <div>
                  <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" /> {t.resume.educationHistory}
                  </h2>
                  {education.map((edu) => (
                    <div key={edu.id} className="mb-3 ps-4 border-s-2 border-emerald-300">
                      <p className="font-semibold text-sm">{edu.degree} - {edu.institution}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(edu.startDate)} - {formatDate(edu.endDate, true)}</p>
                      {edu.grade && <p className="text-xs mt-1">{isRTL ? 'التقدير' : 'Grade'}: {edu.grade}</p>}
                    </div>
                  ))}
                </div>
                {/* Skills */}
                <div>
                  <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Wrench className="w-4 h-4" /> {t.resume.technicalSkills}
                  </h2>
                  <div className="grid grid-cols-2 gap-2">
                    {skills.map((skill) => (
                      <div key={skill.id} className="text-xs">
                        <span className="font-medium">{skill.name}</span> - {skill.level}%
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Share toast */}
        <AnimatePresence>
          {shareToast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium shadow-lg z-50"
            >
              {t.buttons.copied}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
