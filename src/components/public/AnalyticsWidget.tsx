'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, X, RefreshCw, Eye, Clock, MousePointerClick, TrendingDown, Monitor, Smartphone, Tablet } from 'lucide-react';
import { useLanguageStore } from '@/store/language-store';
import { getTranslations } from '@/lib/i18n';

// ============================================
// Types
// ============================================

interface AnalyticsStats {
  totalVisits: number;
  visitsToday: number;
  topPages: { page: string; views: number }[];
  deviceBreakdown: { device: string; count: number }[];
  avgDuration: number;
  bounceRate: number;
}

// ============================================
// Animated Counter
// ============================================

function AnimatedCounter({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(value);

  useEffect(() => {
    const start = prevValue.current;
    const diff = value - start;
    if (diff === 0) return;

    const startTime = performance.now();
    let raf: number;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      }
    };

    raf = requestAnimationFrame(animate);
    prevValue.current = value;

    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span>{display.toLocaleString()}</span>;
}

// ============================================
// Mini Bar Chart (CSS/SVG)
// ============================================

function MiniBarChart({ data, label }: { data: { page: string; views: number }[]; label: string }) {
  const maxViews = Math.max(...data.map(d => d.views), 1);
  const isRTL = typeof document !== 'undefined' && document.documentElement.dir === 'rtl';

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="space-y-1.5">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="text-[10px] text-muted-foreground truncate w-20 text-end" dir="ltr">
              {item.page === '/' ? '/' : item.page.replace(/^\//, '')}
            </div>
            <div className="flex-1 h-4 bg-muted/10 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.views / maxViews) * 100}%` }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-500/70 to-teal-500/70"
                style={{ originX: isRTL ? 1 : 0 }}
              />
            </div>
            <div className="text-[10px] text-muted-foreground w-8 tabular-nums">{item.views}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Mini Pie Chart (SVG)
// ============================================

function MiniPieChart({ data, labels }: { data: { device: string; count: number }[]; labels: Record<string, string> }) {
  const total = data.reduce((sum, d) => sum + d.count, 0) || 1;

  const colors: Record<string, string> = {
    desktop: '#10b981',
    mobile: '#14b8a6',
    tablet: '#06b6d4',
    unknown: '#6b7280',
  };

  const icons: Record<string, React.ReactNode> = {
    desktop: <Monitor className="w-3.5 h-3.5" />,
    mobile: <Smartphone className="w-3.5 h-3.5" />,
    tablet: <Tablet className="w-3.5 h-3.5" />,
    unknown: <MousePointerClick className="w-3.5 h-3.5" />,
  };

  // SVG Pie chart - compute cumulative angles using reduce
  const slices = data.reduce<{ items: Array<{ device: string; count: number; pct: number; path: string }>; cumulative: number }>(
    (acc, item) => {
      const pct = (item.count / total) * 100;
      const angle = (item.count / total) * 360;
      const startAngle = acc.cumulative;
      const nextCumulative = startAngle + angle;

      const startRad = (startAngle * Math.PI) / 180;
      const endRad = ((startAngle + angle) * Math.PI) / 180;
      const x1 = 40 + 30 * Math.cos(startRad);
      const y1 = 40 + 30 * Math.sin(startRad);
      const x2 = 40 + 30 * Math.cos(endRad);
      const y2 = 40 + 30 * Math.sin(endRad);
      const largeArc = angle > 180 ? 1 : 0;

      acc.items.push({
        device: item.device,
        count: item.count,
        pct,
        path: angle >= 359.9
          ? `M 40 10 A 30 30 0 1 1 39.99 10 Z`
          : `M 40 40 L ${x1} ${y1} A 30 30 0 ${largeArc} 1 ${x2} ${y2} Z`,
      });

      acc.cumulative = nextCumulative;
      return acc;
    },
    { items: [], cumulative: -90 }
  ).items;

  return (
    <div className="flex items-center gap-4">
      <svg width="80" height="80" viewBox="0 0 80 80" className="shrink-0">
        {slices.map((slice, i) => (
          <motion.path
            key={i}
            d={slice.path}
            fill={colors[slice.device] || colors.unknown}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.85, scale: 1 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            style={{ transformOrigin: '40px 40px' }}
          />
        ))}
        {/* Center circle for donut effect */}
        <circle cx="40" cy="40" r="16" fill="var(--background)" />
      </svg>
      <div className="space-y-1.5 flex-1 min-w-0">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: colors[item.device] || colors.unknown }}
            />
            <div className="flex items-center gap-1 text-muted-foreground">
              {icons[item.device] || icons.unknown}
            </div>
            <span className="text-xs truncate">{labels[item.device] || item.device}</span>
            <span className="text-xs font-medium tabular-nums ms-auto">{Math.round((item.count / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Duration Formatter
// ============================================

function formatDuration(seconds: number, t: ReturnType<typeof getTranslations>['analytics']): string {
  if (seconds === 0) return `0 ${t.seconds}`;
  if (seconds < 60) return `${seconds} ${t.seconds}`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 1) return secs > 0 ? `1 ${t.minute} ${secs} ${t.seconds}` : `1 ${t.minute}`;
  if (mins < 60) return secs > 0 ? `${mins} ${t.minutes} ${secs} ${t.seconds}` : `${mins} ${t.minutes}`;
  const hrs = Math.floor(mins / 60);
  return `${hrs} ${t.hour} ${mins % 60} ${t.minutes}`;
}

// ============================================
// Time Ago Formatter
// ============================================

function formatTimeAgo(seconds: number, t: ReturnType<typeof getTranslations>['analytics']): string {
  if (seconds < 60) return `${seconds} ${t.secondsAgo}`;
  if (seconds < 120) return t.minuteAgo;
  const mins = Math.floor(seconds / 60);
  return `${mins} ${t.minutesAgo}`;
}

// ============================================
// Stat Card
// ============================================

function StatCard({
  icon,
  value,
  label,
  suffix,
  delay = 0,
  color = 'emerald',
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
  suffix?: string;
  delay?: number;
  color?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-muted/10 rounded-xl p-3 space-y-1"
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
        color === 'emerald' ? 'bg-emerald-500/15 text-emerald-500' :
        color === 'teal' ? 'bg-teal-500/15 text-teal-500' :
        color === 'cyan' ? 'bg-cyan-500/15 text-cyan-500' :
        color === 'rose' ? 'bg-rose-500/15 text-rose-500' :
        'bg-amber-500/15 text-amber-500'
      }`}>
        {icon}
      </div>
      <div className="text-xl font-bold tabular-nums leading-tight">
        {value}
        {suffix && <span className="text-sm font-normal text-muted-foreground ms-1">{suffix}</span>}
      </div>
      <div className="text-[11px] text-muted-foreground leading-tight">{label}</div>
    </motion.div>
  );
}

// ============================================
// Main AnalyticsWidget Component
// ============================================

export function AnalyticsWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const { language } = useLanguageStore();
  const t = getTranslations(language);
  const ta = t.analytics;

  // Check first visit for pulse animation
  useEffect(() => {
    try {
      const seen = localStorage.getItem('analytics-widget-seen');
      if (!seen) {
        setIsFirstVisit(true);
        localStorage.setItem('analytics-widget-seen', '1');
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics/public-stats');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setStats(data.data);
          setLastUpdated(new Date());
          setElapsed(0);
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on open
  useEffect(() => {
    if (isOpen && !stats) {
      fetchStats();
    }
  }, [isOpen, stats, fetchStats]);

  // Update elapsed time
  useEffect(() => {
    if (!lastUpdated || !isOpen) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated, isOpen]);

  // Device labels
  const deviceLabels: Record<string, string> = {
    desktop: ta.desktop,
    mobile: ta.mobile,
    tablet: ta.tablet,
    unknown: ta.unknown,
  };

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 md:bottom-6 start-4 z-40 w-11 h-11 rounded-full bg-background/80 backdrop-blur-md border border-border shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center text-muted-foreground hover:text-foreground group min-w-[44px] min-h-[44px]"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={ta.siteStats}
      >
        <BarChart3 className="w-5 h-5 group-hover:text-emerald-500 transition-colors" />
        {/* Pulse animation for first visit */}
        {isFirstVisit && (
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-emerald-500/50"
            animate={{ scale: [1, 1.4], opacity: [0.8, 0] }}
            transition={{ duration: 1.5, repeat: 3, repeatDelay: 0.5 }}
            onAnimationComplete={() => setIsFirstVisit(false)}
          />
        )}
        {/* Tooltip */}
        <span className="absolute start-full ms-2 top-1/2 -translate-y-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md border border-border">
          {ta.siteStats}
        </span>
      </motion.button>

      {/* Slide-up Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 start-0 end-0 md:bottom-6 md:start-4 md:end-auto md:w-[380px] z-50"
            >
              <div className="bg-background/85 backdrop-blur-xl border border-border rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{ta.title}</h3>
                      {lastUpdated && (
                        <p className="text-[10px] text-muted-foreground">
                          {ta.lastUpdated}: {formatTimeAgo(elapsed, ta)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <motion.button
                      onClick={fetchStats}
                      disabled={loading}
                      className="w-8 h-8 rounded-lg hover:bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 min-w-[44px] min-h-[44px]"
                      whileTap={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      aria-label={ta.refresh}
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </motion.button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-8 h-8 rounded-lg hover:bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors min-w-[44px] min-h-[44px]"
                      aria-label={t.buttons.close}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 max-h-[70vh] md:max-h-[500px] overflow-y-auto custom-scrollbar space-y-4" aria-live="polite">
                  {loading && !stats ? (
                    // Loading state
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="bg-muted/10 rounded-xl p-3 space-y-2 animate-pulse">
                            <div className="w-8 h-8 rounded-lg bg-muted/20" />
                            <div className="h-5 w-16 bg-muted/20 rounded" />
                            <div className="h-3 w-20 bg-muted/15 rounded" />
                          </div>
                        ))}
                      </div>
                      <div className="bg-muted/10 rounded-xl p-3 space-y-2 animate-pulse">
                        <div className="h-3 w-24 bg-muted/20 rounded" />
                        {[1, 2, 3].map(i => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="h-3 w-16 bg-muted/15 rounded" />
                            <div className="flex-1 h-4 bg-muted/10 rounded-full" />
                            <div className="h-3 w-6 bg-muted/15 rounded" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : stats ? (
                    <>
                      {/* Stat Cards Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <StatCard
                          icon={<Eye className="w-4 h-4" />}
                          value={<AnimatedCounter value={stats.totalVisits} />}
                          label={ta.totalVisits}
                          delay={0.05}
                          color="emerald"
                        />
                        <StatCard
                          icon={<MousePointerClick className="w-4 h-4" />}
                          value={<AnimatedCounter value={stats.visitsToday} />}
                          label={ta.visitsToday}
                          delay={0.1}
                          color="teal"
                        />
                        <StatCard
                          icon={<Clock className="w-4 h-4" />}
                          value={formatDuration(stats.avgDuration, ta)}
                          label={ta.avgDuration}
                          delay={0.15}
                          color="cyan"
                        />
                        <StatCard
                          icon={<TrendingDown className="w-4 h-4" />}
                          value={<AnimatedCounter value={stats.bounceRate} />}
                          label={ta.bounceRate}
                          suffix="%"
                          delay={0.2}
                          color={stats.bounceRate > 60 ? 'rose' : 'amber'}
                        />
                      </div>

                      {/* Top Pages Bar Chart */}
                      {stats.topPages.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="bg-muted/10 rounded-xl p-3"
                        >
                          <MiniBarChart data={stats.topPages} label={ta.topPages} />
                        </motion.div>
                      )}

                      {/* Device Breakdown Pie Chart */}
                      {stats.deviceBreakdown.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="bg-muted/10 rounded-xl p-3"
                        >
                          <MiniPieChart data={stats.deviceBreakdown} labels={deviceLabels} />
                        </motion.div>
                      )}
                    </>
                  ) : (
                    // No data / error state
                    <div className="py-8 text-center">
                      <BarChart3 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">{ta.noData}</p>
                      <button
                        onClick={fetchStats}
                        className="mt-3 text-xs text-emerald-500 hover:text-emerald-400 transition-colors"
                      >
                        {ta.refresh}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default AnalyticsWidget;
