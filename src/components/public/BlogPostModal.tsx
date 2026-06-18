'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { type SectionItem } from '@/store/site-store';
import { useLanguageStore } from '@/store/language-store';
import { getTranslations } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  X,
  Clock,
  Calendar,
  Share2,
  Link2,
  Twitter,
  Linkedin,
  FileText,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';

interface BlogPostModalProps {
  post: SectionItem;
  allPosts: SectionItem[];
  onClose: () => void;
}

interface Heading {
  id: string;
  text: string;
  level: number;
}

function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

function estimateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const arabicWordsPerMinute = 150;
  const isArabic = /[\u0600-\u06FF]/.test(content);
  const wordCount = content.trim().split(/\s+/).length;
  const wpm = isArabic ? arabicWordsPerMinute : wordsPerMinute;
  return Math.max(1, Math.ceil(wordCount / wpm));
}

function formatDate(dateStr: string | null, lang: 'ar' | 'en'): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function BlogPostModal({ post, allPosts, onClose }: BlogPostModalProps) {
  const { language } = useLanguageStore();
  const t = getTranslations(language);
  const isRtl = language === 'ar';

  const [activeHeading, setActiveHeading] = useState<string>('');
  const [readingProgress, setReadingProgress] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [fullContent, setFullContent] = useState<string>(post.content || '');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Resolve full post content
  useEffect(() => {
    const resolveContent = async () => {
      // Parse content from SectionItem config first
      try {
        const configData = JSON.parse(post.config || '{}');
        if (configData.fullContent && configData.fullContent.length > 100) {
          setFullContent(configData.fullContent);
          return;
        }
      } catch { /* ignore */ }

      // If we already have substantial content, use it
      if (post.content && post.content.length > 100) {
        setFullContent(post.content);
        return;
      }

      // Build rich content from available fields if no full content exists
      const builtContent = [
        post.description ? `## ${language === 'ar' ? 'نظرة عامة' : 'Overview'}\n\n${post.description}` : '',
        post.content && post.content !== '{}' ? post.content : '',
      ].filter(Boolean).join('\n\n');

      if (builtContent.length > 50) {
        setFullContent(builtContent);
        return;
      }

      // Final fallback - generate placeholder content from title
      setFullContent(
        `# ${post.title || ''}\n\n${post.description || ''}\n\n${
          language === 'ar'
            ? 'سيتم إضافة المحتوى الكامل قريبًا. تابعونا للمزيد من التفاصيل حول هذا الموضوع.'
            : 'Full content will be added soon. Stay tuned for more details on this topic.'
        }`
      );
    };

    resolveContent();
  }, [post.id, post.content, post.config, post.description, post.title, language]);

  // Extract headings from markdown content (derived from fullContent)
  const headings = useMemo<Heading[]>(() => {
    if (!fullContent) return [];
    const headingRegex = /^(#{1,4})\s+(.+)$/gm;
    const extracted: Heading[] = [];
    let match;
    while ((match = headingRegex.exec(fullContent)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = generateHeadingId(text);
      extracted.push({ id, text, level });
    }
    return extracted;
  }, [fullContent]);

  // Track reading progress
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || !contentRef.current) return;
    const scrollTop = scrollRef.current.scrollTop;
    const scrollHeight = scrollRef.current.scrollHeight - scrollRef.current.clientHeight;
    if (scrollHeight > 0) {
      setReadingProgress(Math.min(100, (scrollTop / scrollHeight) * 100));
    }

    // Update active heading
    if (headings.length > 0) {
      for (let i = headings.length - 1; i >= 0; i--) {
        const el = document.getElementById(`heading-${headings[i].id}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveHeading(headings[i].id);
            break;
          }
        }
      }
    }
  }, [headings]);

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  // Scroll to heading
  const scrollToHeading = (headingId: string) => {
    const el = document.getElementById(`heading-${headingId}`);
    if (el && scrollRef.current) {
      const containerTop = scrollRef.current.getBoundingClientRect().top;
      const elementTop = el.getBoundingClientRect().top;
      const scrollOffset = elementTop - containerTop + scrollRef.current.scrollTop - 80;
      scrollRef.current.scrollTo({ top: scrollOffset, behavior: 'smooth' });
    }
  };

  // Share functions
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(t.buttons.copied);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title || '')}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
  };

  // Parse tags
  const tags: string[] = useMemo(() => {
    try { return JSON.parse(post.tags || '[]'); } catch { return []; }
  }, [post.tags]);

  // Parse config
  const config = useMemo(() => {
    try { return JSON.parse(post.config || '{}'); } catch { return {}; }
  }, [post.config]);

  // Related posts
  const relatedPosts = useMemo(() => {
    return allPosts
      .filter((p) => p.id !== post.id)
      .slice(0, 3);
  }, [allPosts, post.id]);

  const readTime = (config as Record<string, unknown>).readTime as number || estimateReadTime(fullContent);
  const category = (config as Record<string, unknown>).category as string || post.subtitle || '';
  const publishDate = post.startDate || post.endDate || '';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Reading Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 z-[101]">
          <div
            className="h-full gradient-emerald transition-all duration-150 ease-out"
            style={{ width: `${readingProgress}%` }}
          />
        </div>

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-5xl h-[90vh] bg-background rounded-2xl shadow-2xl overflow-hidden flex"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 z-50 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-accent transition-colors"
            style={{ [isRtl ? 'left' : 'right']: 16 }}
            aria-label={t.buttons.close}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Table of Contents Sidebar - Desktop only */}
          {headings.length > 2 && (
            <div className="hidden lg:block w-64 shrink-0 border-e border-border/50 bg-muted/20">
              <div className="p-6 sticky top-0">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  {t.blog.tableOfContents}
                </h3>
                <nav className="space-y-1 max-h-[70vh] overflow-y-auto">
                  {headings.map((heading) => (
                    <button
                      key={heading.id}
                      onClick={() => scrollToHeading(heading.id)}
                      className={`block w-full text-start text-sm py-1.5 px-2 rounded-md transition-all duration-200 ${
                        activeHeading === heading.id
                          ? 'text-primary bg-primary/10 font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      } ${heading.level === 2 ? 'ps-2' : heading.level === 3 ? 'ps-5' : 'ps-8'}`}
                    >
                      {heading.text}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Cover Image */}
            {post.imageUrl && (
              <div className="relative h-56 sm:h-72 shrink-0 overflow-hidden">
                <img
                  src={post.imageUrl}
                  alt={post.title || ''}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  {category && (
                    <Badge className="mb-3 gradient-emerald text-white border-0 text-xs">
                      {category}
                    </Badge>
                  )}
                  <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg line-clamp-2">
                    {post.title}
                  </h1>
                </div>
              </div>
            )}

            {/* Post Header - if no cover image */}
            {!post.imageUrl && (
              <div className="p-6 sm:p-8 pb-0">
                {category && (
                  <Badge className="mb-3 gradient-emerald text-white border-0 text-xs">
                    {category}
                  </Badge>
                )}
                <h1 className="text-2xl sm:text-3xl font-bold mb-4">{post.title}</h1>
              </div>
            )}

            {/* Post Meta */}
            <div className="px-6 sm:px-8 py-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-b border-border/30">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{readTime} {t.blog.minRead}</span>
              </div>
              {publishDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(publishDate, language)}</span>
                </div>
              )}
              {/* Share Button */}
              <div className="relative ms-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="gap-1.5 text-muted-foreground"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.buttons.share}</span>
                </Button>
                <AnimatePresence>
                  {showShareMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className={`absolute top-full mt-1 ${isRtl ? 'start-0' : 'end-0'} w-48 bg-background border border-border rounded-xl shadow-xl overflow-hidden z-50`}
                    >
                      <button
                        onClick={copyLink}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-accent transition-colors"
                      >
                        <Link2 className="w-4 h-4" />
                        {t.buttons.copyLink}
                      </button>
                      <button
                        onClick={shareOnTwitter}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-accent transition-colors"
                      >
                        <Twitter className="w-4 h-4" />
                        {t.buttons.shareOnTwitter}
                      </button>
                      <button
                        onClick={shareOnLinkedIn}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-accent transition-colors"
                      >
                        <Linkedin className="w-4 h-4" />
                        {t.buttons.shareOnLinkedIn}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="px-6 sm:px-8 pt-4 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs border-primary/20 text-primary/70"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Scrollable Content */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto"
              style={{ scrollBehavior: 'smooth' }}
            >
              <div ref={contentRef} className="px-6 sm:px-8 py-6 sm:py-8 max-w-none">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <article
                    className={`prose prose-sm sm:prose-base dark:prose-invert max-w-none
                      prose-headings:scroll-mt-8
                      prose-h2:text-xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4
                      prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3
                      prose-p:leading-7 prose-p:text-muted-foreground
                      prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                      prose-strong:text-foreground
                      prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
                      prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-border/20 prose-pre:rounded-xl prose-pre:shadow-lg
                      prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-lg prose-blockquote:py-1
                      prose-img:rounded-xl prose-img:shadow-md
                      prose-li:text-muted-foreground
                      prose-hr:border-border/30`}
                    dir={isRtl ? 'rtl' : 'ltr'}
                  >
                    <ReactMarkdown
                      components={{
                        h2: ({ children }) => {
                          const text = String(children);
                          const id = generateHeadingId(text);
                          return <h2 id={`heading-${id}`}>{children}</h2>;
                        },
                        h3: ({ children }) => {
                          const text = String(children);
                          const id = generateHeadingId(text);
                          return <h3 id={`heading-${id}`}>{children}</h3>;
                        },
                        h4: ({ children }) => {
                          const text = String(children);
                          const id = generateHeadingId(text);
                          return <h4 id={`heading-${id}`}>{children}</h4>;
                        },
                        code: ({ className, children }) => {
                          const match = /language-(\w+)/.exec(className || '');
                          const codeString = String(children).replace(/\n$/, '');
                          if (match) {
                            return (
                              <SyntaxHighlighter
                                style={oneDark}
                                language={match[1]}
                                PreTag="div"
                                customStyle={{
                                  borderRadius: '0.75rem',
                                  fontSize: '0.875rem',
                                  padding: '1.25rem',
                                }}
                              >
                                {codeString}
                              </SyntaxHighlighter>
                            );
                          }
                          return (
                            <code className={className}>
                              {children}
                            </code>
                          );
                        },
                        a: ({ href, children }) => (
                          <a href={href} target="_blank" rel="noopener noreferrer">
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {fullContent || post.description || ''}
                    </ReactMarkdown>
                  </article>
                )}
              </div>

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="px-6 sm:px-8 pb-8">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    {t.blog.relatedPosts}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {relatedPosts.map((related) => (
                      <div
                        key={related.id}
                        className="glass-card rounded-xl overflow-hidden p-4 cursor-pointer card-hover"
                        onClick={() => {
                          toast.info(related.title || '');
                        }}
                      >
                        {related.imageUrl && (
                          <div className="h-24 rounded-lg overflow-hidden mb-3">
                            <img
                              src={related.imageUrl}
                              alt={related.title || ''}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <h4 className="font-semibold text-sm line-clamp-2 mb-1">{related.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {related.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
