'use client';

import { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { motion, useInView, AnimatePresence, useReducedMotion } from 'framer-motion';
import { type Section, type SectionItem } from '@/store/site-store';
import { useLanguageStore } from '@/store/language-store';
import { getTranslations } from '@/lib/i18n';
import { localizeSection, localizeSectionItem, localizeProject } from '@/lib/localize';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TiltCard } from '@/components/public/TiltCard';
import { MagneticButton } from '@/components/public/MagneticButton';
import {
  ShoppingCart,
  CheckSquare,
  BarChart3,
  Heart,
  LayoutDashboard,
  GraduationCap,
  ExternalLink,
  Github,
  Eye,
  Grid3X3,
  List,
  X,
  ChevronLeft,
  ChevronRight,
  Code2,
  FolderOpen,
  Globe,
  GitBranch,
  Calendar,
  ArrowUpRight,
  Share2,
  Link2,
  Check,
  Users,
  FileCode2,
  TrendingUp,
  Clock,
  Sparkles,
  Braces,
  GitCommitHorizontal,
  Terminal,
} from 'lucide-react';

interface ProjectsSectionProps {
  section: Section;
}

interface ProjectImage {
  id: string;
  url: string;
  alt: string | null;
  caption: string | null;
  isFeatured: boolean;
  order: number;
}

interface ProjectDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string | null;
  category: string | null;
  status: string;
  featured: boolean;
  startDate: string | null;
  endDate: string | null;
  clientName: string | null;
  demoUrl: string | null;
  repoUrl: string | null;
  technologies: string | null;
  order: number;
  isVisible: boolean;
  images: ProjectImage[];
}

interface ProjectStats {
  linesOfCode: number;
  completion: number;
  teamSize: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingCart,
  CheckSquare,
  BarChart3,
  Heart,
  LayoutDashboard,
  GraduationCap,
};

const tagColors = [
  'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
  'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
];

const statusConfig: Record<string, { className: string; dotColor: string }> = {
  featured: {
    className: 'bg-amber-500/90 text-white border-0 shadow-md shadow-amber-500/20',
    dotColor: 'bg-amber-400',
  },
  published: {
    className: 'bg-emerald-500/90 text-white border-0 shadow-md shadow-emerald-500/20',
    dotColor: 'bg-emerald-400',
  },
  draft: {
    className: 'bg-zinc-500/90 text-white border-0 shadow-md shadow-zinc-500/20',
    dotColor: 'bg-zinc-400',
  },
  in_progress: {
    className: 'bg-blue-500/90 text-white border-0 shadow-md shadow-blue-500/20',
    dotColor: 'bg-blue-400',
  },
  completed: {
    className: 'bg-teal-500/90 text-white border-0 shadow-md shadow-teal-500/20',
    dotColor: 'bg-teal-400',
  },
};

/* ───────────────────────────────────────────────
   i18n HELPERS
   ─────────────────────────────────────────────── */
function getStatusLabel(status: string, t: ReturnType<typeof getTranslations>): string {
  switch (status) {
    case 'featured': return t.projects.featured;
    case 'published': return t.projects.published;
    case 'draft': return t.projects.draft;
    case 'in_progress': return t.projects.inProgress;
    case 'completed': return t.projects.completed;
    default: return t.projects.published;
  }
}

function getCategoryLabel(category: string, t: ReturnType<typeof getTranslations>): string {
  switch (category) {
    case 'تطوير ويب': return t.projects.categoryWebDev;
    case 'تطبيقات': return t.projects.categoryApps;
    case 'تصميم': return t.projects.categoryDesign;
    default: return category;
  }
}

/* ───────────────────────────────────────────────
   MOCK STATS GENERATOR (based on project id hash)
   ─────────────────────────────────────────────── */
function generateProjectStats(projectId: string): ProjectStats {
  let hash = 0;
  for (let i = 0; i < projectId.length; i++) {
    hash = ((hash << 5) - hash) + projectId.charCodeAt(i);
    hash |= 0;
  }
  const abs = Math.abs(hash);
  return {
    linesOfCode: (abs % 45000) + 500,
    completion: ((abs % 30) + 70),
    teamSize: (abs % 5) + 1,
  };
}

/* ───────────────────────────────────────────────
   LIGHTBOX (image viewer)
   ─────────────────────────────────────────────── */
function Lightbox({ images, currentIndex, onClose, onPrev, onNext }: {
  images: ProjectImage[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose, onPrev, onNext]);

  const image = images[currentIndex];
  if (!image) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative max-w-5xl max-h-[85vh] mx-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-8 h-8" />
        </button>

        <AnimatePresence mode="wait">
          <motion.img
            key={image.id}
            src={image.url}
            alt={image.alt || ''}
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          />
        </AnimatePresence>

        {image.caption && (
          <p className="text-center text-white/60 mt-4 text-sm">{image.caption}</p>
        )}

        {images.length > 1 && (
          <>
            <button
              onClick={onPrev}
              className="absolute right-[-50px] top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
              aria-label="Previous"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
            <button
              onClick={onNext}
              className="absolute left-[-50px] top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
              aria-label="Next"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <div className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 flex items-center gap-2 text-white/50 text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

/* ───────────────────────────────────────────────
   SHARE DROPDOWN
   ─────────────────────────────────────────────── */
function ShareDropdown({ projectTitle, projectUrl, language }: {
  projectTitle: string;
  projectUrl: string;
  language: 'ar' | 'en';
}) {
  const t = getTranslations(language);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(projectUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [projectUrl]);

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(projectTitle)}&url=${encodeURIComponent(projectUrl)}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(projectUrl)}`;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Share2 className="w-3.5 h-3.5" />
        {t.projects.shareProject}
      </Button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 end-0 z-50 min-w-[180px] rounded-lg bg-card border border-border shadow-xl p-1"
          >
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Link2 className="w-3.5 h-3.5" />}
              {copied ? t.projects.copied : t.projects.copyLink}
            </button>
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              {t.projects.shareOnTwitter}
            </a>
            <a
              href={linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
            >
              <LinkedinIcon className="w-3.5 h-3.5" />
              {t.projects.shareOnLinkedIn}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

/* ───────────────────────────────────────────────
   PROJECT DETAIL MODAL (ENHANCED)
   ─────────────────────────────────────────────── */
function ProjectDetailModal({
  item,
  projectImages,
  projectDetails,
  onClose,
  onImageClick,
  onPrevProject,
  onNextProject,
  hasPrev,
  hasNext,
}: {
  item: SectionItem;
  projectImages: Record<string, ProjectImage[]>;
  projectDetails: Record<string, ProjectDetail>;
  onClose: () => void;
  onImageClick: (images: ProjectImage[], index: number) => void;
  onPrevProject?: () => void;
  onNextProject?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}) {
  const { language } = useLanguageStore();
  const t = getTranslations(language);
  const shouldReduceMotion = useReducedMotion();
  const config = (() => {
    try { return JSON.parse(item.config || '{}'); } catch { return {}; }
  })();
  const tags: string[] = (() => {
    try { return JSON.parse(item.tags || '[]'); } catch { return []; }
  })();
  const images = projectImages[item.id] || [];
  const detail = projectDetails[item.id];
  const detailImages = detail?.images || images;
  const coverImage = detailImages.find(img => img.isFeatured) || detailImages[0] || null;
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const activeImage = detailImages[activeImageIndex] || coverImage;
  const [galleryHovered, setGalleryHovered] = useState(false);

  // Determine status for badge
  const status = config.featured ? 'featured' : (config.status || 'published');
  const statusInfo = statusConfig[status] || statusConfig.published;

  // Project stats
  const stats = useMemo(() => generateProjectStats(item.id), [item.id]);

  // Timeline calculation
  const timelineProgress = useMemo(() => {
    const startStr = detail?.startDate || item.startDate;
    const endStr = detail?.endDate || item.endDate;
    if (!startStr) return 0;
    const start = new Date(startStr).getTime();
    const end = endStr ? new Date(endStr).getTime() : Date.now();
    const total = end - start;
    if (total <= 0) return 100;
    const elapsed = Date.now() - start;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  }, [detail, item]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onPrevProject?.();
      if (e.key === 'ArrowRight' && hasNext) onNextProject?.();
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose, onPrevProject, onNextProject, hasPrev, hasNext]);

  // Auto-advance gallery
  useEffect(() => {
    if (detailImages.length <= 1 || galleryHovered) return;
    const timer = setInterval(() => {
      setActiveImageIndex(prev => (prev + 1) % detailImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [detailImages.length, galleryHovered]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Gradient Border */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-emerald-500/40 via-teal-500/20 to-cyan-500/40 animate-gradient-x" />
          <div className="absolute inset-[2px] rounded-[14px] bg-card" />
        </div>

        {/* Relative content wrapper */}
        <div className="relative z-10">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 transition-all"
            aria-label={t.projects.close}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Prev / Next project navigation */}
          {hasPrev && (
            <button
              onClick={(e) => { e.stopPropagation(); onPrevProject?.(); }}
              className="absolute top-1/2 -translate-y-1/2 start-2 z-30 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/50 transition-all"
              aria-label={t.projects.previousProject}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
          {hasNext && (
            <button
              onClick={(e) => { e.stopPropagation(); onNextProject?.(); }}
              className="absolute top-1/2 -translate-y-1/2 end-2 z-30 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/50 transition-all"
              aria-label={t.projects.nextProject}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Hero Image / Gallery Carousel */}
          <div
            className="relative"
            onMouseEnter={() => setGalleryHovered(true)}
            onMouseLeave={() => setGalleryHovered(false)}
          >
            {activeImage ? (
              <div
                className="relative h-64 sm:h-80 overflow-hidden cursor-pointer"
                onClick={() => onImageClick(detailImages, activeImageIndex)}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImage.id}
                    src={activeImage.url}
                    alt={activeImage.alt || item.title || ''}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Image counter */}
                {detailImages.length > 1 && (
                  <div className="absolute top-4 end-4 z-10 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs font-medium">
                    {activeImageIndex + 1} / {detailImages.length}
                  </div>
                )}
              </div>
            ) : item.imageUrl ? (
              <div className="relative h-64 sm:h-80 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title || ''}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </div>
            ) : (
              <div className="relative h-48 gradient-emerald-subtle flex items-center justify-center">
                <div className="w-20 h-20 rounded-2xl gradient-emerald flex items-center justify-center shadow-lg">
                  <Code2 className="w-10 h-10 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            )}

            {/* Status badge on image */}
            <Badge className={`absolute top-4 start-4 z-10 ${statusInfo.className} text-xs gap-1`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor} animate-pulse`} />
              {getStatusLabel(status, t)}
            </Badge>

            {/* Image gallery thumbnails (carousel) */}
            {detailImages.length > 1 && (
              <div className="absolute bottom-4 start-4 end-14 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {detailImages.map((img, i) => (
                  <motion.button
                    key={img.id}
                    onClick={(e) => { e.stopPropagation(); setActiveImageIndex(i); }}
                    className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                      i === activeImageIndex ? 'border-emerald-500 ring-2 ring-emerald-500/30 scale-105' : 'border-white/30 opacity-70 hover:opacity-100'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover" />
                  </motion.button>
                ))}
              </div>
            )}

            {/* Title overlay on image */}
            <div className="absolute bottom-4 end-4 start-16">
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">{item.title}</h2>
              {item.subtitle && (
                <p className="text-white/80 text-sm mt-1">{item.subtitle}</p>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Category & Date Row */}
            <div className="flex flex-wrap items-center gap-3">
              {config.category && (
                <Badge variant="outline" className="text-xs text-primary border-primary/30">
                  {getCategoryLabel(config.category, t)}
                </Badge>
              )}
              {(detail?.startDate || item.startDate) && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{detail?.startDate || item.startDate}</span>
                  {(detail?.endDate || item.endDate) && (
                    <span> — {detail?.endDate || item.endDate}</span>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <p className="text-muted-foreground leading-relaxed">
                {detail?.content || item.description || ''}
              </p>
            </div>

            {/* Project Stats Section */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                {t.projects.projectStats}
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: shouldReduceMotion ? 0 : 0.1 }}
                  className="text-center p-3 rounded-xl bg-muted/50 border border-border/50"
                >
                  <FileCode2 className="w-4 h-4 mx-auto mb-1.5 text-emerald-500" />
                  <div className="text-lg font-bold text-primary">
                    {stats.linesOfCode.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{t.projects.linesOfCode}</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: shouldReduceMotion ? 0 : 0.2 }}
                  className="text-center p-3 rounded-xl bg-muted/50 border border-border/50"
                >
                  <TrendingUp className="w-4 h-4 mx-auto mb-1.5 text-teal-500" />
                  <div className="text-lg font-bold text-primary">{stats.completion}%</div>
                  <div className="text-[10px] text-muted-foreground">{t.projects.completion}</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: shouldReduceMotion ? 0 : 0.3 }}
                  className="text-center p-3 rounded-xl bg-muted/50 border border-border/50"
                >
                  <Users className="w-4 h-4 mx-auto mb-1.5 text-cyan-500" />
                  <div className="text-lg font-bold text-primary">{stats.teamSize}</div>
                  <div className="text-[10px] text-muted-foreground">{t.projects.teamSize}</div>
                </motion.div>
              </div>
            </div>

            {/* Completion Progress Bar / Timeline */}
            {(detail?.startDate || item.startDate) && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {t.projects.projectDuration}
                  </span>
                  <span>{Math.round(timelineProgress)}%</span>
                </div>
                <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 start-0 rounded-full gradient-emerald"
                    initial={{ width: 0 }}
                    animate={{ width: `${timelineProgress}%` }}
                    transition={{ duration: shouldReduceMotion ? 0 : 1, delay: 0.3, ease: 'easeOut' }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{detail?.startDate || item.startDate}</span>
                  <span>{detail?.endDate || item.endDate || '—'}</span>
                </div>
              </div>
            )}

            {/* Technologies with staggered entrance */}
            {tags.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-primary" />
                  {t.projects.technologies}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, i) => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{
                        delay: shouldReduceMotion ? 0 : 0.05 * i,
                        type: 'spring',
                        damping: 15,
                        stiffness: 200,
                      }}
                      className={`px-3 py-1 text-xs rounded-full border font-medium cursor-default hover:scale-105 transition-transform ${tagColors[i % tagColors.length]}`}
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            {/* Client Name */}
            {detail?.clientName && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">{t.projects.client}:</span>{' '}
                {detail.clientName}
              </div>
            )}

            {/* Action Buttons + Share */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {(item.link || detail?.demoUrl) && (
                <MagneticButton>
                  <Button
                    className="gradient-emerald text-white border-0 shadow-md shadow-emerald-500/20 gap-2"
                    asChild
                  >
                    <a href={item.link || detail?.demoUrl} target="_blank" rel="noopener noreferrer">
                      <Globe className="w-4 h-4" />
                      {t.projects.demoUrl}
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </Button>
                </MagneticButton>
              )}
              {(config.repoUrl || detail?.repoUrl) && (
                <MagneticButton>
                  <Button variant="outline" className="gap-2" asChild>
                    <a href={config.repoUrl || detail?.repoUrl} target="_blank" rel="noopener noreferrer">
                      <GitBranch className="w-4 h-4" />
                      {t.projects.repoUrl}
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </Button>
                </MagneticButton>
              )}
              <ShareDropdown
                projectTitle={item.title || ''}
                projectUrl={shareUrl}
                language={language}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ───────────────────────────────────────────────
   PROJECT CARD (grid mode) - ENHANCED
   ─────────────────────────────────────────────── */
function ProjectCard({
  item,
  index,
  isInView,
  onImageClick,
  onCardClick,
  projectImages,
}: {
  item: SectionItem;
  index: number;
  isInView: boolean;
  onImageClick: (images: ProjectImage[], index: number) => void;
  onCardClick: (item: SectionItem) => void;
  projectImages: Record<string, ProjectImage[]>;
}) {
  const { language } = useLanguageStore();
  const t = getTranslations(language);
  const shouldReduceMotion = useReducedMotion();
  const config = (() => {
    try { return JSON.parse(item.config || '{}'); } catch { return {}; }
  })();
  const tags: string[] = (() => {
    try { return JSON.parse(item.tags || '[]'); } catch { return []; }
  })();
  const IconComponent = item.icon ? iconMap[item.icon] : ExternalLink;
  const images = projectImages[item.id] || [];
  const coverImage = images.find(img => img.isFeatured) || images[0] || null;

  // Determine status
  const status = config.featured ? 'featured' : (config.status || 'published');
  const statusInfo = statusConfig[status] || statusConfig.published;
  const isFeatured = config.featured === true;

  // Hover tooltip state
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = useCallback(() => {
    tooltipTimeoutRef.current = setTimeout(() => setShowTooltip(true), 600);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    setShowTooltip(false);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: shouldReduceMotion ? 0 : 0.6, delay: shouldReduceMotion ? 0 : index * 0.1 }}
      layout
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <TiltCard maxTilt={8} glareEnabled glareOpacity={0.1} scale={1.01} spotlightEnabled glassSweepEnabled className="rounded-xl">
        <Card
          className={`glass-card overflow-hidden group h-full hover-lift card-shine rounded-xl cursor-pointer relative ${
            isFeatured ? 'ring-1 ring-amber-500/40' : 'border-glow'
          }`}
          onClick={() => onCardClick(item)}
        >
          {/* Featured Badge with Glow */}
          {isFeatured && (
            <div className="absolute top-3 left-3 z-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 12 }}
                className="relative"
              >
                <Badge className="bg-amber-500 text-white border-0 text-xs gap-1 shadow-lg shadow-amber-500/30">
                  <Sparkles className="w-3 h-3" />
                  {t.projects.featured}
                </Badge>
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-md bg-amber-500/20 blur-md animate-pulse -z-10" />
              </motion.div>
            </div>
          )}

          {/* Project Image / Cover with parallax zoom */}
          <div className="relative h-52 gradient-emerald-subtle flex items-center justify-center overflow-hidden">
            {coverImage ? (
              <motion.img
                src={coverImage.url}
                alt={coverImage.alt || item.title || ''}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.15]"
                animate={{}}
              />
            ) : item.imageUrl ? (
              <motion.img
                src={item.imageUrl}
                alt={item.title || ''}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.15]"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl gradient-emerald flex items-center justify-center shadow-lg">
                {IconComponent && <IconComponent className="w-8 h-8 text-white" />}
              </div>
            )}

            {/* Shimmer overlay on hover */}
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            </div>

            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
                <div className="flex gap-2">
                  {item.link && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="rounded-full h-8 text-xs gap-1"
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a href={item.link} target="_blank" rel="noopener noreferrer">
                        <Eye className="w-3.5 h-3.5" />
                        {t.projects.viewDemo}
                      </a>
                    </Button>
                  )}
                  {config.repoUrl && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="rounded-full h-8 text-xs gap-1"
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a href={config.repoUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="w-3.5 h-3.5" />
                        {t.projects.viewCode}
                      </a>
                    </Button>
                  )}
                </div>
                {images.length > 1 && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs backdrop-blur-sm">
                    {images.length} {t.projects.images}
                  </Badge>
                )}
              </div>
            </div>

            {/* View details button on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <Button
                size="sm"
                className="gradient-emerald text-white border-0 rounded-full shadow-lg shadow-emerald-500/30 gap-1.5 translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                onClick={(e) => { e.stopPropagation(); onCardClick(item); }}
              >
                <Eye className="w-3.5 h-3.5" />
                {t.projects.viewDetails}
              </Button>
            </div>

            {/* Status badge with dot indicator */}
            {!isFeatured && (
              <Badge className={`absolute top-3 right-3 ${statusInfo.className} text-xs gap-1`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor}`} />
                {getStatusLabel(status, t)}
              </Badge>
            )}

            {/* Image count indicator */}
            {images.length > 0 && (
              <div className="absolute top-3 left-3 flex gap-1">
                {images.slice(0, 3).map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/60" />
                ))}
              </div>
            )}
          </div>

          <CardContent className="p-5 space-y-3">
            {/* Category */}
            {config.category && (
              <Badge variant="outline" className="text-xs text-primary border-primary/30">
                {getCategoryLabel(config.category, t)}
              </Badge>
            )}

            {/* Title & Subtitle */}
            <div>
              <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              {item.subtitle && (
                <p className="text-sm text-muted-foreground">{item.subtitle}</p>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.description}
            </p>

            {/* Tech Tags with pill design */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.slice(0, 4).map((tag, i) => (
                  <span
                    key={tag}
                    className={`px-2.5 py-0.5 text-xs rounded-full border font-medium ${tagColors[i % tagColors.length]}`}
                  >
                    {tag}
                  </span>
                ))}
                {tags.length > 4 && (
                  <span className="px-2.5 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
                    +{tags.length - 4}
                  </span>
                )}
              </div>
            )}
          </CardContent>

          {/* Hover-to-preview tooltip */}
          <AnimatePresence>
            {showTooltip && item.description && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute -top-2 left-4 right-4 z-30 -translate-y-full"
              >
                <div className="bg-popover border border-border rounded-lg shadow-xl p-3 text-xs text-muted-foreground line-clamp-3">
                  <div className="font-semibold text-foreground mb-1">{t.projects.preview}</div>
                  {item.description}
                  <div className="absolute bottom-0 left-6 translate-y-1/2 rotate-45 w-2.5 h-2.5 bg-popover border-b border-r border-border" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </TiltCard>
    </motion.div>
  );
}

/* ───────────────────────────────────────────────
   PROJECT LIST ITEM (list mode) - ENHANCED
   ─────────────────────────────────────────────── */
function ProjectListItem({
  item,
  index,
  isInView,
  onImageClick,
  onCardClick,
  projectImages,
}: {
  item: SectionItem;
  index: number;
  isInView: boolean;
  onImageClick: (images: ProjectImage[], index: number) => void;
  onCardClick: (item: SectionItem) => void;
  projectImages: Record<string, ProjectImage[]>;
}) {
  const { language } = useLanguageStore();
  const t = getTranslations(language);
  const shouldReduceMotion = useReducedMotion();
  const config = (() => {
    try { return JSON.parse(item.config || '{}'); } catch { return {}; }
  })();
  const tags: string[] = (() => {
    try { return JSON.parse(item.tags || '[]'); } catch { return []; }
  })();
  const images = projectImages[item.id] || [];
  const coverImage = images.find(img => img.isFeatured) || images[0] || null;
  const IconComponent = item.icon ? iconMap[item.icon] : ExternalLink;

  // Determine status
  const status = config.featured ? 'featured' : (config.status || 'published');
  const statusInfo = statusConfig[status] || statusConfig.published;
  const isFeatured = config.featured === true;

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: shouldReduceMotion ? 0 : index * 0.08 }}
      layout
    >
      <TiltCard maxTilt={5} glareEnabled glareOpacity={0.08} scale={1.005} spotlightEnabled glassSweepEnabled className="rounded-xl">
        <Card
          className={`glass-card overflow-hidden group h-full hover-lift card-shine rounded-xl cursor-pointer ${
            isFeatured ? 'ring-1 ring-amber-500/40' : 'border-glow'
          }`}
          onClick={() => onCardClick(item)}
        >
          <div className="flex flex-col sm:flex-row">
            {/* Image with parallax zoom */}
            <div
              className="relative w-full sm:w-56 h-40 sm:h-auto shrink-0 gradient-emerald-subtle flex items-center justify-center overflow-hidden"
              onClick={(e) => { e.stopPropagation(); if (images.length > 0) onImageClick(images, 0); }}
            >
              {coverImage ? (
                <img
                  src={coverImage.url}
                  alt={coverImage.alt || ''}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.15]"
                />
              ) : item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title || ''}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.15]"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl gradient-emerald flex items-center justify-center">
                  {IconComponent && <IconComponent className="w-6 h-6 text-white" />}
                </div>
              )}

              {/* Shimmer overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
              </div>

              {/* Featured badge */}
              {isFeatured && (
                <div className="absolute top-2 left-2 z-10">
                  <Badge className="bg-amber-500 text-white border-0 text-xs gap-1 shadow-lg shadow-amber-500/30">
                    <Sparkles className="w-3 h-3" />
                    {t.projects.featured}
                  </Badge>
                </div>
              )}

              {/* Status badge */}
              {!isFeatured && (
                <Badge className={`absolute top-2 right-2 ${statusInfo.className} text-xs gap-1`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor}`} />
                  {getStatusLabel(status, t)}
                </Badge>
              )}

              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
            </div>

            <CardContent className="p-4 sm:p-5 flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  {config.category && (
                    <Badge variant="outline" className="text-xs text-primary border-primary/30 mb-1">
                      {getCategoryLabel(config.category, t)}
                    </Badge>
                  )}
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{item.title}</h3>
                  {item.subtitle && <p className="text-sm text-muted-foreground">{item.subtitle}</p>}
                </div>
                <div className="flex gap-1.5">
                  {item.link && (
                    <Button size="icon" variant="ghost" className="h-8 w-8" asChild onClick={(e) => e.stopPropagation()}>
                      <a href={item.link} target="_blank" rel="noopener noreferrer"><Eye className="w-4 h-4" /></a>
                    </Button>
                  )}
                  {config.repoUrl && (
                    <Button size="icon" variant="ghost" className="h-8 w-8" asChild onClick={(e) => e.stopPropagation()}>
                      <a href={config.repoUrl} target="_blank" rel="noopener noreferrer"><Github className="w-4 h-4" /></a>
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.slice(0, 5).map((tag, i) => (
                  <span
                    key={tag}
                    className={`px-2.5 py-0.5 text-xs rounded-full border font-medium ${tagColors[i % tagColors.length]}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </div>
        </Card>
      </TiltCard>
    </motion.div>
  );
}

/* ───────────────────────────────────────────────
   EMPTY STATE
   ─────────────────────────────────────────────── */
function EmptyState({ message, subMessage }: { message: string; subMessage?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-20 h-20 rounded-2xl gradient-emerald-subtle flex items-center justify-center mb-4">
        <FolderOpen className="w-10 h-10 text-primary/50" />
      </div>
      <p className="text-lg font-medium text-muted-foreground">{message}</p>
      {subMessage && (
        <p className="text-sm text-muted-foreground/60 mt-1">{subMessage}</p>
      )}
    </motion.div>
  );
}

/* ───────────────────────────────────────────────
   FLOATING DECORATIVE ELEMENTS
   ─────────────────────────────────────────────── */
function FloatingDecorations() {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Code brackets */}
      <motion.div
        className="absolute top-[15%] left-[8%] text-emerald-500/10 dark:text-emerald-400/8"
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Braces className="w-10 h-10" />
      </motion.div>
      <motion.div
        className="absolute top-[60%] right-[10%] text-teal-500/10 dark:text-teal-400/8"
        animate={{ y: [0, 12, 0], rotate: [0, -3, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      >
        <GitCommitHorizontal className="w-8 h-8" />
      </motion.div>
      <motion.div
        className="absolute top-[35%] right-[5%] text-emerald-500/8 dark:text-emerald-400/6"
        animate={{ y: [0, -10, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      >
        <Terminal className="w-12 h-12" />
      </motion.div>
      <motion.div
        className="absolute bottom-[20%] left-[5%] text-cyan-500/8 dark:text-cyan-400/6"
        animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      >
        <GitBranch className="w-9 h-9" />
      </motion.div>
      <motion.div
        className="absolute top-[80%] left-[45%] text-emerald-500/6 dark:text-emerald-400/5"
        animate={{ y: [0, -8, 0], rotate: [0, 4, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
      >
        <Code2 className="w-7 h-7" />
      </motion.div>
    </div>
  );
}

/* ───────────────────────────────────────────────
   MAIN SECTION
   ─────────────────────────────────────────────── */
export function ProjectsSection({ section }: ProjectsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const { language } = useLanguageStore();
  const t = getTranslations(language);
  const shouldReduceMotion = useReducedMotion();

  const localizedSection = localizeSection(section, language);

  // Create localized items by merging localized text fields into each item
  const localizedItems = useMemo(() =>
    section.items.map((item) => {
      const localized = localizeSectionItem(item, language);
      return { ...item, title: localized.title, subtitle: localized.subtitle, description: localized.description };
    }),
  [section.items, language]);

  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [projectImages, setProjectImages] = useState<Record<string, ProjectImage[]>>({});
  const [projectDetails, setProjectDetails] = useState<Record<string, ProjectDetail>>({});
  const [lightbox, setLightbox] = useState<{ images: ProjectImage[]; index: number } | null>(null);
  const [selectedProject, setSelectedProject] = useState<SectionItem | null>(null);

  // Fetch project images and details from API
  useEffect(() => {
    async function fetchProjectData() {
      try {
        const response = await fetch('/api/public/projects');
        if (!response.ok) return;
        const data = await response.json();
        const projects = data.data || data;
        if (!Array.isArray(projects)) return;

        const imagesMap: Record<string, ProjectImage[]> = {};
        const detailsMap: Record<string, ProjectDetail> = {};
        projects.forEach((project: ProjectDetail & { titleEn?: string | null; descriptionEn?: string | null; contentEn?: string | null }) => {
          // Localize project data
          const localized = localizeProject(project, language);
          const localizedProject = {
            ...project,
            title: localized.title,
            description: localized.description,
            content: localized.content,
          };
          if (project.images && project.images.length > 0) {
            imagesMap[project.id] = project.images;
          }
          detailsMap[project.id] = localizedProject;
        });
        setProjectImages(imagesMap);
        setProjectDetails(detailsMap);
      } catch {
        // silently fail
      }
    }
    fetchProjectData();
  }, [language]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    localizedItems.forEach((item) => {
      try {
        const config = JSON.parse(item.config || '{}');
        if (config.category) cats.add(config.category);
      } catch {
        // ignore
      }
    });
    return ['all', ...Array.from(cats)];
  }, [localizedItems]);

  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return localizedItems;
    return localizedItems.filter((item) => {
      try {
        const config = JSON.parse(item.config || '{}');
        return config.category === activeCategory;
      } catch { return false; }
    });
  }, [localizedItems, activeCategory]);

  const handleImageClick = (images: ProjectImage[], index: number) => {
    setLightbox({ images, index });
  };

  const handleCardClick = useCallback((item: SectionItem) => {
    setSelectedProject(item);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedProject(null);
  }, []);

  // Project navigation in modal
  const currentProjectIndex = useMemo(() => {
    if (!selectedProject) return -1;
    return filteredItems.findIndex(item => item.id === selectedProject.id);
  }, [selectedProject, filteredItems]);

  const handlePrevProject = useCallback(() => {
    if (currentProjectIndex > 0) {
      setSelectedProject(filteredItems[currentProjectIndex - 1]);
    }
  }, [currentProjectIndex, filteredItems]);

  const handleNextProject = useCallback(() => {
    if (currentProjectIndex < filteredItems.length - 1) {
      setSelectedProject(filteredItems[currentProjectIndex + 1]);
    }
  }, [currentProjectIndex, filteredItems]);

  const handlePrev = () => {
    setLightbox(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        index: (prev.index - 1 + prev.images.length) % prev.images.length,
      };
    });
  };

  const handleNext = () => {
    setLightbox(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        index: (prev.index + 1) % prev.images.length,
      };
    });
  };

  return (
    <section
      id="projects"
      ref={sectionRef}
      aria-labelledby="projects-heading"
      className="section-padding relative overflow-hidden dark-card-gradient"
    >
      {/* Grid background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-50" />

      {/* Floating decorative elements */}
      <FloatingDecorations />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: shouldReduceMotion ? 0 : 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card-sm text-xs font-medium text-primary mb-4"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{t.projects.myWork}</span>
          </motion.div>
          <h2 id="projects-heading" className="text-3xl sm:text-4xl font-bold mb-4 text-shimmer-heading">{localizedSection.title}</h2>
          {localizedSection.subtitle && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {localizedSection.subtitle}
            </p>
          )}
        </motion.div>

        {/* Controls Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: shouldReduceMotion ? 0 : 0.6, delay: shouldReduceMotion ? 0 : 0.1 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10"
        >
          {/* Category Filter Tabs with animated underline */}
          <div className="flex flex-wrap justify-center gap-1">
            {categories.map((cat) => (
              <motion.button
                key={cat}
                whileHover={!shouldReduceMotion ? { scale: 1.05 } : undefined}
                whileTap={!shouldReduceMotion ? { scale: 0.95 } : undefined}
                onClick={() => setActiveCategory(cat)}
                className={`tab-underline relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                  activeCategory === cat
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                } ${activeCategory === cat ? 'active' : ''}`}
              >
                {cat === 'all' ? t.projects.all : getCategoryLabel(cat, t)}
                {activeCategory === cat && (
                  <motion.div
                    layoutId="categoryUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 gradient-emerald rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 glass-card-sm rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all duration-200 flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'gradient-emerald text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label={t.projects.gridView}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all duration-200 flex items-center gap-1.5 ${
                viewMode === 'list'
                  ? 'gradient-emerald text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label={t.projects.listView}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Projects Grid/List with animated transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode + activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
          >
            {filteredItems.length > 0 ? (
              viewMode === 'grid' ? (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  layout
                >
                  <AnimatePresence>
                    {filteredItems.map((item, index) => (
                      <ProjectCard
                        key={item.id}
                        item={item}
                        index={index}
                        isInView={isInView}
                        onImageClick={handleImageClick}
                        onCardClick={handleCardClick}
                        projectImages={projectImages}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  className="space-y-4"
                  layout
                >
                  <AnimatePresence>
                    {filteredItems.map((item, index) => (
                      <ProjectListItem
                        key={item.id}
                        item={item}
                        index={index}
                        isInView={isInView}
                        onImageClick={handleImageClick}
                        onCardClick={handleCardClick}
                        projectImages={projectImages}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )
            ) : (
              <EmptyState message={t.projects.noProjectsInCategory} subMessage={t.projects.tryAnotherCategory} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightbox && (
          <Lightbox
            images={lightbox.images}
            currentIndex={lightbox.index}
            onClose={() => setLightbox(null)}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        )}
      </AnimatePresence>

      {/* Project Detail Modal (Enhanced) */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectDetailModal
            item={selectedProject}
            projectImages={projectImages}
            projectDetails={projectDetails}
            onClose={handleCloseModal}
            onImageClick={handleImageClick}
            onPrevProject={handlePrevProject}
            onNextProject={handleNextProject}
            hasPrev={currentProjectIndex > 0}
            hasNext={currentProjectIndex < filteredItems.length - 1}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
