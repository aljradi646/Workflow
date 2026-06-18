'use client';

import { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { type Section, type SectionItem } from '@/store/site-store';
import { useLanguageStore } from '@/store/language-store';
import { getTranslations } from '@/lib/i18n';
import { localizeSection, localizeSectionItem } from '@/lib/localize';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Clock,
  DollarSign,
  Headphones,
  Wifi,
  Code2,
  HelpCircle,
  Search,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Settings,
  Tag,
  ChevronRight,
  Sparkles,
  Mail,
} from 'lucide-react';

interface FAQSectionProps {
  section: Section;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Clock,
  DollarSign,
  Headphones,
  Wifi,
  Code2,
  HelpCircle,
};

/* ===== Category Definitions ===== */
interface FAQCategory {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
}

const categories: FAQCategory[] = [
  { id: 'all', icon: Sparkles, color: 'text-emerald-600', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30' },
  { id: 'general', icon: HelpCircle, color: 'text-teal-600', bgColor: 'bg-teal-500/10', borderColor: 'border-teal-500/30' },
  { id: 'pricing', icon: DollarSign, color: 'text-amber-600', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30' },
  { id: 'technical', icon: Settings, color: 'text-violet-600', bgColor: 'bg-violet-500/10', borderColor: 'border-violet-500/30' },
  { id: 'support', icon: Headphones, color: 'text-rose-600', bgColor: 'bg-rose-500/10', borderColor: 'border-rose-500/30' },
];

/* ===== FAQ item category assignment based on icon mapping ===== */
function getCategoryForItem(item: SectionItem): string {
  if (item.tags) {
    const tagLower = item.tags.toLowerCase();
    if (tagLower.includes('pricing') || tagLower.includes('price') || tagLower.includes('cost')) return 'pricing';
    if (tagLower.includes('technical') || tagLower.includes('tech')) return 'technical';
    if (tagLower.includes('support') || tagLower.includes('help')) return 'support';
  }
  // Fallback: assign based on icon
  const iconCategoryMap: Record<string, string> = {
    DollarSign: 'pricing',
    Clock: 'general',
    Headphones: 'support',
    Wifi: 'technical',
    Code2: 'technical',
    HelpCircle: 'general',
  };
  if (item.icon) {
    return iconCategoryMap[item.icon] || 'general';
  }
  return 'general';
}

/* ===== Feedback Persistence Hook ===== */
function useFAQFeedback() {
  const getInitialFeedback = (): Record<string, 'up' | 'down' | null> => {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem('faq_feedback');
      if (stored) return JSON.parse(stored);
    } catch {
      // Ignore
    }
    return {};
  };

  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down' | null>>(getInitialFeedback);

  const recordFeedback = useCallback((itemId: string, type: 'up' | 'down') => {
    setFeedback((prev) => {
      const updated = { ...prev, [itemId]: type };
      try {
        localStorage.setItem('faq_feedback', JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  }, []);

  return { feedback, recordFeedback };
}

/* ===== Highlight Matching Text ===== */
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-emerald-500/20 text-inherit rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

/* ===== Floating Question Mark Decoration ===== */
function FloatingQuestionMark({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none text-emerald-500/[0.07] font-bold"
      style={{ left: x, top: y, fontSize: size }}
      animate={{
        y: [0, -15, 0],
        rotate: [0, 5, -5, 0],
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration: 6 + delay,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      ?
    </motion.div>
  );
}

/* ===== Feedback Row Component ===== */
function FeedbackRow({ itemId, feedback, onFeedback, t }: {
  itemId: string;
  feedback: Record<string, 'up' | 'down' | null>;
  onFeedback: (id: string, type: 'up' | 'down') => void;
  t: ReturnType<typeof getTranslations>;
}) {
  const existing = feedback[itemId];
  const [showThanks, setShowThanks] = useState(false);

  const handleClick = (type: 'up' | 'down') => {
    if (existing) return; // Already voted
    onFeedback(itemId, type);
    setShowThanks(true);
    setTimeout(() => setShowThanks(false), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="flex items-center gap-3 pt-3 mt-3 border-t border-border/30"
    >
      <span className="text-xs text-muted-foreground">{t.faq.wasThisHelpful}</span>
      <div className="flex items-center gap-1">
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleClick('up')}
          className={`p-1.5 rounded-md transition-colors ${
            existing === 'up'
              ? 'bg-emerald-500/20 text-emerald-600'
              : 'hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-600'
          }`}
          disabled={!!existing}
          aria-label={t.faq.yes}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleClick('down')}
          className={`p-1.5 rounded-md transition-colors ${
            existing === 'down'
              ? 'bg-rose-500/20 text-rose-600'
              : 'hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600'
          }`}
          disabled={!!existing}
          aria-label={t.faq.no}
        >
          <ThumbsDown className="w-3.5 h-3.5" />
        </motion.button>
      </div>
      <AnimatePresence>
        {showThanks && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="text-[10px] text-emerald-600 font-medium flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            {t.faq.thanksForFeedback}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ===== Main FAQSection Component ===== */
export function FAQSection({ section }: FAQSectionProps) {
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

  const [searchQuery, setSearchQuery] = useState('');
  const [activeItem, setActiveItem] = useState<string | undefined>(undefined);
  const [activeCategory, setActiveCategory] = useState('all');
  const { feedback, recordFeedback } = useFAQFeedback();

  // Assign categories to items
  const itemsWithCategory = useMemo(() => {
    return localizedItems.map((item) => ({
      ...item,
      category: getCategoryForItem(item),
    }));
  }, [localizedItems]);

  const filteredItems = useMemo(() => {
    let items = itemsWithCategory;
    // Filter by category
    if (activeCategory !== 'all') {
      items = items.filter((item) => item.category === activeCategory);
    }
    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter((item) =>
        (item.title || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q)
      );
    }
    return items;
  }, [itemsWithCategory, activeCategory, searchQuery]);

  const totalCount = activeCategory === 'all'
    ? localizedItems.length
    : itemsWithCategory.filter((item) => item.category === activeCategory).length;

  return (
    <section
      id="faq"
      ref={sectionRef}
      className="section-padding relative overflow-hidden dark-mesh-bg"
    >
      {/* Gradient mesh background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern" />
        <motion.div
          className="absolute -top-40 -start-40 w-80 h-80 bg-emerald-500/[0.04] rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -end-40 w-96 h-96 bg-teal-500/[0.04] rounded-full blur-3xl"
          animate={{ scale: [1, 0.9, 1.1, 1], x: [0, -20, 10, 0], y: [0, 25, -15, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-600/[0.02] rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Floating question mark decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <FloatingQuestionMark delay={0} x="5%" y="10%" size={64} />
        <FloatingQuestionMark delay={1.5} x="85%" y="15%" size={48} />
        <FloatingQuestionMark delay={3} x="15%" y="60%" size={56} />
        <FloatingQuestionMark delay={2} x="75%" y="55%" size={40} />
        <FloatingQuestionMark delay={4} x="45%" y="80%" size={72} />
        <FloatingQuestionMark delay={1} x="92%" y="75%" size={36} />
      </div>

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
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{t.sections.faq}</span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-shimmer-heading">{localizedSection.title}</h2>
          {localizedSection.subtitle && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {localizedSection.subtitle}
            </p>
          )}
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="flex flex-wrap items-center justify-center gap-2 mb-6"
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            const CatIcon = cat.icon;
            return (
              <motion.button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setActiveItem(undefined);
                }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? `${cat.bgColor} ${cat.color} ${cat.borderColor} border shadow-sm`
                    : 'glass-card-sm text-muted-foreground border border-transparent hover:border-border/50'
                }`}
              >
                <CatIcon className="w-4 h-4" />
                <span>
                  {cat.id === 'all'
                    ? t.faq.all
                    : cat.id === 'general'
                    ? t.faq.general
                    : cat.id === 'pricing'
                    ? t.faq.pricing
                    : cat.id === 'technical'
                    ? t.faq.technical
                    : t.faq.support}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="faq-category-indicator"
                    className="absolute inset-0 rounded-xl border-2 border-current/20"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Search/Filter Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-xl mx-auto mb-4"
        >
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.faq.searchPlaceholder}
              className="w-full ps-10 pe-4 py-3 rounded-xl glass-card text-sm border border-border/50 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 placeholder:text-muted-foreground/60"
            />
          </div>
        </motion.div>

        {/* Count Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="text-center mb-6"
        >
          <span className="text-xs text-muted-foreground/70">
            {t.faq.showingOf} {filteredItems.length} {t.faq.questions} {totalCount}
          </span>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <AnimatePresence mode="wait">
            {filteredItems.length > 0 ? (
              <motion.div
                key={`${activeCategory}-${searchQuery}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Accordion
                  type="single"
                  collapsible
                  value={activeItem}
                  onValueChange={setActiveItem}
                  className="space-y-3"
                >
                  {filteredItems.map((item, index) => {
                    const IconComponent = item.icon ? iconMap[item.icon] : HelpCircle;
                    const numberedIndex = String(index + 1).padStart(2, '0');
                    const isActive = activeItem === item.id;
                    const catInfo = categories.find((c) => c.id === item.category) || categories[1];

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4, delay: 0.03 + index * 0.04 }}
                      >
                        <AccordionItem
                          value={item.id}
                          className={`glass-card rounded-xl border-0 overflow-hidden transition-all duration-300 relative ${
                            isActive
                              ? 'ring-1 ring-emerald-500/30 shadow-lg shadow-emerald-500/5'
                              : ''
                          }`}
                        >
                          {/* Animated left border accent */}
                          <motion.div
                            className="absolute top-0 bottom-0 start-0 w-1 rounded-s-xl"
                            initial={{ opacity: 0 }}
                            animate={isActive ? { opacity: 1 } : { opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{
                              background: isActive
                                ? `linear-gradient(to bottom, var(--color-emerald-500), var(--color-teal-500))`
                                : 'transparent',
                            }}
                          />

                          {/* Gradient border on active (top) */}
                          {isActive && (
                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-l from-emerald-500 via-teal-500 to-emerald-400" />
                          )}

                          <AccordionTrigger className="text-right hover:no-underline py-5 px-6 gap-3">
                            <div className="flex items-center gap-3 flex-1">
                              {/* Animated number badge */}
                              <motion.span
                                className={`shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold ${
                                  isActive
                                    ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20'
                                    : 'numbered-badge'
                                }`}
                                animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                                transition={{ duration: 0.3 }}
                              >
                                {numberedIndex}
                              </motion.span>
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-300 ${
                                  isActive ? catInfo.bgColor : 'bg-primary/10'
                                }`}
                              >
                                <motion.div
                                  animate={isActive ? { rotate: [0, -10, 10, 0], scale: [1, 1.15, 1] } : { rotate: 0, scale: 1 }}
                                  transition={{ duration: 0.4 }}
                                >
                                  {IconComponent && (
                                    <IconComponent className={`w-4 h-4 transition-colors duration-300 ${isActive ? catInfo.color : 'text-primary'}`} />
                                  )}
                                </motion.div>
                              </div>
                              <span className="font-semibold text-sm sm:text-base">
                                <HighlightText text={item.title || ''} query={searchQuery} />
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground leading-relaxed pb-5 px-6 ps-17">
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3, ease: 'easeInOut' }}
                            >
                              <div className="pb-1">
                                <HighlightText text={item.description || ''} query={searchQuery} />
                              </div>
                              {/* Feedback Row */}
                              <FeedbackRow
                                itemId={item.id}
                                feedback={feedback}
                                onFeedback={recordFeedback}
                                t={t}
                              />
                            </motion.div>
                          </AccordionContent>
                        </AccordionItem>
                      </motion.div>
                    );
                  })}
                </Accordion>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-16"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-emerald-subtle mb-4">
                  <Search className="w-8 h-8 text-primary/60" />
                </div>
                <p className="text-muted-foreground text-lg font-medium">{t.faq.noResults}</p>
                <p className="text-muted-foreground/60 text-sm mt-1">{t.faq.noResultsDesc}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Still have questions? CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-2xl mx-auto mt-12"
        >
          <div className="relative rounded-2xl overflow-hidden p-6 sm:p-8">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-emerald-600/10" />
            <div className="absolute inset-0 glass-card" />

            {/* Decorative elements */}
            <div className="absolute top-0 end-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
            <div className="absolute bottom-0 start-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="w-14 h-14 rounded-2xl gradient-emerald flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div className="text-center sm:text-start flex-1">
                <h3 className="text-lg font-bold text-foreground mb-1">{t.faq.stillHaveQuestions}</h3>
                <p className="text-sm text-muted-foreground">{t.faq.stillHaveQuestionsDesc}</p>
              </div>
              <motion.a
                href="#contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-emerald text-white text-sm font-medium shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-shadow"
              >
                <Mail className="w-4 h-4" />
                {t.faq.contactUs}
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
