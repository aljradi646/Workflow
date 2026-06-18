'use client';

import { useRef, useState, useMemo } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { type Section, type SectionItem } from '@/store/site-store';
import { useLanguageStore } from '@/store/language-store';
import { getTranslations } from '@/lib/i18n';
import { localizeSection, localizeSectionItem } from '@/lib/localize';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BlogPostModal } from '@/components/public/BlogPostModal';
import {
  FileText,
  ArrowLeft,
  ArrowRight,
  Clock,
  Tag,
  Calendar,
  Star,
  Eye,
  BookOpen,
  Search,
  Loader2,
  Sparkles,
  Newspaper,
  TrendingUp,
} from 'lucide-react';

interface BlogSectionProps {
  section: Section;
}

function estimateReadTime(content: string | null): number {
  if (!content) return 3;
  const wordCount = content.trim().split(/\s+/).length;
  const isArabic = /[\u0600-\u06FF]/.test(content);
  const wpm = isArabic ? 150 : 200;
  return Math.max(1, Math.ceil(wordCount / wpm));
}

function formatReadTime(minutes: number, language: 'ar' | 'en', t: ReturnType<typeof getTranslations>): string {
  if (language === 'ar') {
    // Arabic plural rules:
    // 1 = singular (دقيقة), 2 = dual (دقيقتان), 3-10 = plural (دقائق), 11+ = singular (دقيقة)
    if (minutes === 1) {
      return `${minutes} ${t.blog.minReadSingular}`;
    } else if (minutes === 2) {
      return `${minutes} ${t.blog.minReadDual}`;
    } else if (minutes >= 3 && minutes <= 10) {
      return `${minutes} ${t.blog.minReadPlural}`;
    } else {
      return `${minutes} ${t.blog.minReadSingular}`;
    }
  }
  // English: always "X min read"
  return `${minutes} ${t.blog.minRead}`;
}

/** Color map for category accent dots and pill backgrounds */
const categoryColors: Record<string, { dot: string; bg: string; text: string }> = {
  'تطوير': { dot: 'bg-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
  'تصميم': { dot: 'bg-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400' },
  'تسويق': { dot: 'bg-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
  'أعمال': { dot: 'bg-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
  'تقنية': { dot: 'bg-cyan-500', bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400' },
  'أمن': { dot: 'bg-red-500', bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400' },
  'ذكاء اصطناعي': { dot: 'bg-pink-500', bg: 'bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400' },
  dev: { dot: 'bg-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
  design: { dot: 'bg-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400' },
  marketing: { dot: 'bg-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
  business: { dot: 'bg-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
  tech: { dot: 'bg-cyan-500', bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400' },
  security: { dot: 'bg-red-500', bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400' },
  ai: { dot: 'bg-pink-500', bg: 'bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400' },
};

const defaultCategoryStyle = { dot: 'bg-teal-500', bg: 'bg-teal-500/10', text: 'text-teal-600 dark:text-teal-400' };

function getCategoryStyle(category: string) {
  const lower = category.toLowerCase();
  for (const [key, val] of Object.entries(categoryColors)) {
    if (lower.includes(key)) return val;
  }
  return defaultCategoryStyle;
}

// Shine animation overlay for cards
function ShineOverlay() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.1) 55%, transparent 60%)',
          backgroundSize: '200% 100%',
        }}
        initial={{ backgroundPosition: '200% 0%' }}
        whileHover={{ backgroundPosition: '-200% 0%' }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />
    </div>
  );
}

// Category Pill with colored background
function CategoryPill({ category }: { category: string }) {
  const style = getCategoryStyle(category);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {category}
    </span>
  );
}

// Empty State Component
function BlogEmptyState({ language }: { language: 'ar' | 'en' }) {
  const t = getTranslations(language);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 gap-6"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="relative"
      >
        <div className="w-24 h-24 rounded-2xl glass-card flex items-center justify-center">
          <Newspaper className="w-12 h-12 text-muted-foreground/30" />
        </div>
        {/* Floating decorative elements */}
        <motion.div
          className="absolute -top-2 -end-2 w-6 h-6 rounded-full gradient-emerald flex items-center justify-center shadow-md"
          animate={{ y: [0, -4, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Sparkles className="w-3 h-3 text-white" />
        </motion.div>
        <motion.div
          className="absolute -bottom-1 -start-3 w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center"
          animate={{ y: [0, -3, 0], x: [0, 2, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        >
          <FileText className="w-2.5 h-2.5 text-teal-500" />
        </motion.div>
      </motion.div>
      <div className="text-center space-y-2">
        <h3 className="font-semibold text-lg">{t.blog.noPostsFound}</h3>
        <p className="text-sm text-muted-foreground max-w-sm">{t.blog.noPostsDescription}</p>
      </div>
    </motion.div>
  );
}

function BlogCard({
  item,
  index,
  isInView,
  isFeatured,
  isLatest,
  onReadMore,
  language,
}: {
  item: SectionItem;
  index: number;
  isInView: boolean;
  isFeatured: boolean;
  isLatest: boolean;
  onReadMore: () => void;
  language: 'ar' | 'en';
}) {
  const t = getTranslations(language);
  const isRtl = language === 'ar';

  const tags: string[] = useMemo(() => {
    try { return JSON.parse(item.tags || '[]'); } catch { return []; }
  }, [item.tags]);

  const config = useMemo(() => {
    try { return JSON.parse(item.config || '{}'); } catch { return {}; }
  }, [item.config]);

  const readTime = config.readTime || estimateReadTime(item.content || item.description);
  const category = config.category || item.subtitle || '';

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  // Featured card is larger
  if (isFeatured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: index * 0.1 }}
        className="md:col-span-2 lg:col-span-2"
      >
        <Card
          className="glass-card card-hover card-accent-top card-shadow-elevation card-border-glow overflow-hidden group cursor-pointer h-full relative"
          onClick={onReadMore}
        >
          <ShineOverlay />
          <div className="grid grid-cols-1 md:grid-cols-2 h-full">
            {/* Image with gradient overlay and parallax */}
            <div className="h-56 md:h-full gradient-emerald-subtle flex items-center justify-center relative overflow-hidden">
              {item.imageUrl ? (
                <motion.img
                  src={item.imageUrl}
                  alt={item.title || ''}
                  className="w-full h-full object-cover transition-transform duration-700"
                  whileHover={{ scale: 1.08, y: -8 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl gradient-emerald flex items-center justify-center shadow-lg">
                  <FileText className="w-10 h-10 text-white" />
                </div>
              )}
              {/* Gradient overlay at bottom for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

              {/* Featured Badge (gradient amber) */}
              <div className="absolute top-4 start-4 flex items-center gap-2">
                <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 gap-1 shadow-lg shadow-amber-500/30">
                  <Star className="w-3 h-3" />
                  {t.blog.featured}
                </Badge>
                {isLatest && (
                  <Badge className="gradient-emerald text-white border-0 gap-1 shadow-md">
                    <TrendingUp className="w-3 h-3" />
                    {t.blog.latest}
                  </Badge>
                )}
              </div>
              {/* Category pill overlay */}
              {category && (
                <div className="absolute bottom-4 start-4">
                  <CategoryPill category={category} />
                </div>
              )}
              {/* Hover read-more overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 via-emerald-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-end justify-center pb-6 pointer-events-none">
                <span className="text-white text-sm font-medium flex items-center gap-1.5 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <BookOpen className="w-4 h-4" />
                  {t.blog.readMore}
                </span>
              </div>
            </div>

            {/* Content */}
            <CardContent className="p-6 sm:p-8 flex flex-col justify-center space-y-4">
              {/* Category & Read Time */}
              <div className="flex items-center gap-3 flex-wrap">
                {category && <CategoryPill category={category} />}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatReadTime(readTime, language, t)}</span>
                </div>
              </div>

              {/* Title */}
              <h3 className="font-bold text-xl sm:text-2xl group-hover:text-primary transition-colors line-clamp-2 hover-gradient-text">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {item.description}
              </p>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.slice(0, 4).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs border-primary/20 text-primary/70">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Read More */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReadMore();
                }}
                className="inline-flex items-center gap-1.5 text-sm text-primary font-medium mt-auto group/btn animated-underline"
              >
                <span>{t.buttons.readMore}</span>
                <ArrowIcon className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            </CardContent>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Regular card
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Card
        className="glass-card card-hover card-accent-top card-shadow-elevation card-border-glow overflow-hidden group cursor-pointer h-full flex flex-col relative"
        onClick={onReadMore}
      >
        <ShineOverlay />
        {/* Image */}
        <div className="h-44 gradient-emerald-subtle flex items-center justify-center relative overflow-hidden">
          {item.imageUrl ? (
            <motion.img
              src={item.imageUrl}
              alt={item.title || ''}
              className="w-full h-full object-cover transition-transform duration-500"
              whileHover={{ scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl gradient-emerald flex items-center justify-center shadow-lg">
              <FileText className="w-7 h-7 text-white" />
            </div>
          )}
          {/* Gradient overlay at bottom for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Reading time indicator with clock icon */}
          <div className="absolute top-3 end-3">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs">
              <Clock className="w-3 h-3" />
              <span>{formatReadTime(readTime, language, t)}</span>
            </div>
          </div>

          {/* Latest badge */}
          {isLatest && !isFeatured && (
            <div className="absolute top-3 start-3">
              <Badge className="gradient-emerald text-white border-0 gap-1 text-xs shadow-md">
                <TrendingUp className="w-2.5 h-2.5" />
                {t.blog.latest}
              </Badge>
            </div>
          )}

          {/* Category pill overlay on image */}
          {category && (
            <div className="absolute bottom-3 start-3">
              <CategoryPill category={category} />
            </div>
          )}
          {/* Hover read-more overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 via-emerald-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-end justify-center pb-5 pointer-events-none">
            <span className="text-white text-sm font-medium flex items-center gap-1.5 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <BookOpen className="w-4 h-4" />
              {language === 'ar' ? 'اقرأ المزيد' : 'Read More'}
            </span>
          </div>
        </div>

        <CardContent className="p-5 space-y-3 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-2 hover-gradient-text">
            {item.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
            {item.description}
          </p>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs border-primary/20 text-primary/70">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Read More */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReadMore();
            }}
            className="inline-flex items-center gap-1.5 text-sm text-primary font-medium mt-auto pt-2 group/btn animated-underline"
          >
            <span>{t.buttons.readMore}</span>
            <ArrowIcon className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function BlogSection({ section }: BlogSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const { language } = useLanguageStore();
  const t = getTranslations(language);
  const isRtl = language === 'ar';

  const localizedSection = localizeSection(section, language);

  // Create localized items
  const localizedItems = useMemo(() =>
    section.items.map((item) => {
      const localized = localizeSectionItem(item, language);
      return { ...item, title: localized.title, subtitle: localized.subtitle, description: localized.description };
    }),
  [section.items, language]);

  const [selectedPost, setSelectedPost] = useState<SectionItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const config = useMemo(() => {
    try { return JSON.parse(section.config || '{}'); } catch { return {}; }
  }, [section.config]);

  const maxPosts = config.maxPosts || 12;

  // Extract all unique categories from items
  const categories = useMemo(() => {
    const cats = new Set<string>();
    localizedItems.forEach((item) => {
      try {
        const c = JSON.parse(item.config || '{}');
        const cat = c.category || item.subtitle;
        if (cat) cats.add(cat);
      } catch { /* skip */ }
    });
    return Array.from(cats);
  }, [localizedItems]);

  // Filter items by search and category
  const filteredItems = useMemo(() => {
    let items = localizedItems;
    if (activeCategory) {
      items = items.filter((item) => {
        try {
          const c = JSON.parse(item.config || '{}');
          const cat = c.category || item.subtitle;
          return cat === activeCategory;
        } catch { return false; }
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      items = items.filter((item) =>
        (item.title || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q)
      );
    }
    return items;
  }, [localizedItems, activeCategory, searchQuery]);

  const displayItems = filteredItems.slice(0, visibleCount);
  const hasMore = filteredItems.length > visibleCount;

  // Find the featured post (first item with featured flag, or just the first)
  const featuredIndex = localizedItems.findIndex((item) => {
    try {
      const c = JSON.parse(item.config || '{}');
      return c.featured === true;
    } catch { return false; }
  });

  const openPost = (item: SectionItem) => {
    setSelectedPost(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    // Delay clearing to allow close animation
    setTimeout(() => setSelectedPost(null), 300);
  };

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 3);
      setIsLoadingMore(false);
    }, 600);
  };

  const totalPosts = localizedItems.length;

  return (
    <section
      id="blog"
      ref={sectionRef}
      className="section-padding relative overflow-hidden dark-mesh-bg"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card-sm text-xs font-medium text-primary mb-4"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t.blog.badge}</span>
          </motion.div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-shimmer-heading">{localizedSection.title}</h2>
            {/* Blog post count badge */}
            {totalPosts > 0 && (
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium"
              >
                {totalPosts} {t.blog.articles}
              </motion.span>
            )}
          </div>
          {localizedSection.subtitle && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {localizedSection.subtitle}
            </p>
          )}
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 space-y-4"
        >
          {/* Search Input */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.blog.searchPlaceholder}
              className="bg-background/50 border-border/50 focus:border-primary/50 h-11 ps-10 pe-4 rounded-xl"
              aria-label={t.blog.searchPlaceholder}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {/* Category Filter Tabs */}
          {categories.length > 1 && (
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {/* All categories tab */}
              <button
                onClick={() => setActiveCategory(null)}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeCategory === null
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.blog.allCategories}
                {activeCategory === null && (
                  <motion.div
                    layoutId="categoryIndicator"
                    className="absolute bottom-0 start-1 end-1 h-0.5 rounded-full gradient-emerald"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeCategory === cat
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {cat}
                  {activeCategory === cat && (
                    <motion.div
                      layoutId="categoryIndicator"
                      className="absolute bottom-0 start-1 end-1 h-0.5 rounded-full gradient-emerald"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Blog Grid or Empty State */}
        {displayItems.length === 0 ? (
          <BlogEmptyState language={language} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-fade">
            {displayItems.map((item, index) => (
              <BlogCard
                key={item.id}
                item={item}
                index={index}
                isInView={isInView}
                isFeatured={featuredIndex === section.items.indexOf(item)}
                isLatest={index === 0 && !searchQuery && !activeCategory}
                onReadMore={() => openPost(item)}
                language={language}
              />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-10"
          >
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="gradient-border-animated inline-flex items-center gap-2 px-7 py-3 rounded-xl text-white font-medium text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 transition-all duration-300 relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)' }}
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {/* Animated loading dots */}
                  <span className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1 h-1 rounded-full bg-white"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </span>
                </>
              ) : (
                <>
                  <span>{t.blog.loadMore}</span>
                  {/* Static dots */}
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-white/70" />
                    <span className="w-1 h-1 rounded-full bg-white/70" />
                    <span className="w-1 h-1 rounded-full bg-white/70" />
                  </span>
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* View All Link (only show if we're at max and there's more) */}
        {section.items.length > maxPosts && !hasMore && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-10"
          >
            <a
              href="/blog"
              className="gradient-border-animated inline-flex items-center gap-2 px-7 py-3 rounded-xl text-white font-medium text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 transition-all duration-300 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)' }}
            >
              <span>{t.buttons.viewAll}</span>
              {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </a>
          </motion.div>
        )}
      </div>

      {/* Blog Post Modal */}
      <AnimatePresence>
        {modalOpen && selectedPost && (
          <BlogPostModal
            post={selectedPost}
            allPosts={displayItems}
            onClose={closeModal}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
