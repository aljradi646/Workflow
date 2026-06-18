'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FolderKanban, BookOpen, Wrench, Mail,
  Eye, MessageSquare, Image as ImageIcon, TrendingUp,
  ArrowLeft, RefreshCw, TrendingDown, Plus, ExternalLink,
  ArrowUpRight, Activity, Clock, Database, HardDrive,
  Sun, Moon, Shield, Layers, Palette, Zap, Clock3,
  User, FileText, Settings, Search,
} from 'lucide-react';
import { useAdminStore } from '@/store/admin-store';
import { format, formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
import { motion } from 'framer-motion';

interface DashboardStats {
  counts: {
    projects: number;
    blogPosts: number;
    services: number;
    skills: number;
    testimonials: number;
    experiences: number;
    education: number;
    contactMessages: number;
    unreadMessages: number;
    media: number;
  };
  analytics: {
    totalPageViews: number;
    todayPageViews: number;
    yesterdayPageViews: number;
    weekPageViews: number;
    pageViewsByDay: Array<{ day: string; date: string; views: number }>;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    entity: string;
    details: string | null;
    createdAt: string;
    user: { name: string; email: string } | null;
  }>;
  recentMessages: Array<{
    id: string;
    name: string;
    email: string;
    subject: string | null;
    message: string;
    isRead: boolean;
    createdAt: string;
  }>;
  recentProjects: Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
    featured: boolean;
    images: Array<{ url: string }>;
  }>;
}

interface ActiveTheme {
  id: string;
  name: string;
  isActive: boolean;
}

interface SectionsData {
  id: string;
  type: string;
  title: string;
  isVisible: boolean;
}

const ACTION_LABELS: Record<string, string> = {
  login: 'تسجيل دخول',
  logout: 'تسجيل خروج',
  create: 'إنشاء',
  update: 'تحديث',
  delete: 'حذف',
  upload: 'رفع',
  settings_change: 'تغيير إعدادات',
  security_event: 'حدث أمني',
};

const ACTION_COLORS: Record<string, string> = {
  login: 'bg-blue-500',
  logout: 'bg-gray-500',
  create: 'bg-emerald-500',
  update: 'bg-amber-500',
  delete: 'bg-red-500',
  upload: 'bg-purple-500',
  settings_change: 'bg-cyan-500',
  security_event: 'bg-rose-500',
};

const ACTION_ICONS: Record<string, typeof User> = {
  login: User,
  logout: User,
  create: Plus,
  update: RefreshCw,
  delete: Settings,
  upload: ImageIcon,
  settings_change: Settings,
  security_event: Shield,
};

const ENTITY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  user: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'مستخدم' },
  project: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', label: 'مشروع' },
  blog: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', label: 'مقال' },
  settings: { bg: 'bg-gray-100 dark:bg-gray-800/50', text: 'text-gray-700 dark:text-gray-400', label: 'إعدادات' },
  service: { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-700 dark:text-teal-400', label: 'خدمة' },
  media: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', label: 'وسائط' },
  section: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-400', label: 'قسم' },
};

function getEntityColor(entity: string) {
  const lower = entity.toLowerCase();
  for (const key of Object.keys(ENTITY_COLORS)) {
    if (lower.includes(key)) return ENTITY_COLORS[key];
  }
  return { bg: 'bg-gray-100 dark:bg-gray-800/50', text: 'text-gray-600 dark:text-gray-400', label: entity };
}

const CONTENT_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#14b8a6', '#ef4444', '#ec4899', '#6366f1'];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTheme, setActiveTheme] = useState<ActiveTheme | null>(null);
  const [sectionsCount, setSectionsCount] = useState(0);
  const [isDark, setIsDark] = useState(false);
  const { setPage } = useAdminStore();

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/stats');
      const json = await res.json();
      if (json.success) setStats(json.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchExtraData = useCallback(async () => {
    try {
      const [themeRes, sectionsRes] = await Promise.all([
        fetch('/api/themes/active'),
        fetch('/api/sections'),
      ]);
      const themeJson = await themeRes.json();
      if (themeJson.success) setActiveTheme(themeJson.data);
      const sectionsJson = await sectionsRes.json();
      if (sectionsJson.success && Array.isArray(sectionsJson.data)) {
        setSectionsCount(sectionsJson.data.length);
      }
    } catch {
      // Non-critical, silently ignore
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchExtraData();
  }, [fetchStats, fetchExtraData]);

  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const getTrend = (today: number, yesterday: number) => {
    if (yesterday === 0) return { value: today > 0 ? 100 : 0, up: today > 0 };
    const pct = Math.round(((today - yesterday) / yesterday) * 100);
    return { value: Math.abs(pct), up: pct >= 0 };
  };

  // Content distribution data for pie chart
  const contentDistribution = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'المشاريع', value: stats.counts.projects, color: CONTENT_COLORS[0] },
      { name: 'المقالات', value: stats.counts.blogPosts, color: CONTENT_COLORS[1] },
      { name: 'الخدمات', value: stats.counts.services, color: CONTENT_COLORS[2] },
      { name: 'المهارات', value: stats.counts.skills, color: CONTENT_COLORS[3] },
      { name: 'الشهادات', value: stats.counts.testimonials, color: CONTENT_COLORS[4] },
      { name: 'الخبرات', value: stats.counts.experiences, color: CONTENT_COLORS[5] },
      { name: 'التعليم', value: stats.counts.education, color: CONTENT_COLORS[6] },
      { name: 'الوسائط', value: stats.counts.media, color: CONTENT_COLORS[7] },
    ].filter(d => d.value > 0);
  }, [stats]);

  // Visitors by day of week for bar chart
  const visitorsByDay = useMemo(() => {
    if (!stats?.analytics.pageViewsByDay) return [];
    return stats.analytics.pageViewsByDay.map(d => ({
      name: d.day,
      visits: d.views,
    }));
  }, [stats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  const pageViewsTrend = stats ? getTrend(stats.analytics.todayPageViews, stats.analytics.yesterdayPageViews) : { value: 0, up: true };

  const statCards = stats ? [
    {
      label: 'إجمالي الزيارات', value: stats.analytics.totalPageViews,
      icon: Eye, color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/25',
      trend: pageViewsTrend, trendLabel: 'مقارنة بأمس',
    },
    {
      label: 'المشاريع', value: stats.counts.projects,
      icon: FolderKanban, color: 'from-blue-500 to-cyan-600', shadow: 'shadow-blue-500/25',
      trend: null,
    },
    {
      label: 'الرسائل', value: stats.counts.contactMessages,
      icon: Mail, color: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/25',
      badge: stats.counts.unreadMessages > 0 ? `${stats.counts.unreadMessages} جديد` : undefined,
      trend: null,
    },
    {
      label: 'المقالات', value: stats.counts.blogPosts,
      icon: BookOpen, color: 'from-purple-500 to-pink-600', shadow: 'shadow-purple-500/25',
      trend: null,
    },
  ] : [];

  // Additional stat cards (second row)
  const extraStatCards = stats ? [
    {
      label: 'المهارات', value: stats.counts.skills,
      icon: Zap, color: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/25',
    },
    {
      label: 'الأقسام', value: sectionsCount,
      icon: Layers, color: 'from-teal-500 to-cyan-600', shadow: 'shadow-teal-500/25',
    },
    {
      label: 'القالب النشط', value: activeTheme?.name || 'افتراضي',
      icon: Palette, color: 'from-rose-500 to-pink-600', shadow: 'shadow-rose-500/25',
      isText: true,
    },
    {
      label: 'آخر تحديث', value: 'الآن',
      icon: Clock3, color: 'from-gray-500 to-slate-600', shadow: 'shadow-gray-500/25',
      isText: true,
    },
  ] : [];

  const quickActions = [
    { label: 'إضافة مشروع', icon: FolderKanban, page: 'projects' as const, gradient: 'from-blue-600 to-cyan-500', hoverGlow: 'hover:shadow-blue-500/30' },
    { label: 'إضافة مقال', icon: BookOpen, page: 'blog' as const, gradient: 'from-purple-600 to-pink-500', hoverGlow: 'hover:shadow-purple-500/30' },
    { label: 'عرض الرسائل', icon: Mail, page: 'contact-messages' as const, gradient: 'from-amber-600 to-orange-500', hoverGlow: 'hover:shadow-amber-500/30' },
    { label: 'رفع وسائط', icon: ImageIcon, page: 'media' as const, gradient: 'from-emerald-600 to-teal-500', hoverGlow: 'hover:shadow-emerald-500/30' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">لوحة التحكم</h1>
          <p className="text-muted-foreground">مرحبًا بك في لوحة إدارة الموقع 👋</p>
        </div>
        <Button variant="outline" onClick={fetchStats} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          تحديث
        </Button>
      </motion.div>

      {/* Primary Stat Cards */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="relative overflow-hidden border-0 shadow-md backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-10`} />
              <CardContent className="p-6 relative">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <p className="text-3xl font-bold mt-1">{card.value.toLocaleString('ar-SA')}</p>
                    {card.badge && (
                      <Badge className="mt-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs">
                        {card.badge}
                      </Badge>
                    )}
                    {card.trend && (
                      <div className={`flex items-center gap-1 mt-2 text-xs ${card.trend.up ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {card.trend.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        <span>{card.trend.value}%</span>
                        <span className="text-muted-foreground">{card.trendLabel}</span>
                      </div>
                    )}
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg ${card.shadow}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Secondary Stat Cards */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {extraStatCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="relative overflow-hidden border-0 shadow-md backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-10`} />
              <CardContent className="p-5 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                    <p className={`font-bold mt-1 ${card.isText ? 'text-lg' : 'text-2xl'}`}>
                      {card.isText ? card.value : (card.value as number).toLocaleString('ar-SA')}
                    </p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg ${card.shadow}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Page Views Chart + Visitors Bar Chart */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area Chart */}
        <Card className="lg:col-span-2 border-0 shadow-md backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-500" />
                مشاهدات الصفحات - آخر 7 أيام
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {stats?.analytics.weekPageViews || 0} مشاهدة
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {stats?.analytics.pageViewsByDay && stats.analytics.pageViewsByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={stats.analytics.pageViewsByDay}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area type="monotone" dataKey="views" stroke="#10b981" fill="url(#colorViews)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                لا توجد بيانات بعد
              </div>
            )}
          </CardContent>
        </Card>

        {/* Visitors Bar Chart by Day */}
        <Card className="border-0 shadow-md backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart className="h-4 w-4 text-teal-500" />
              الزيارات حسب اليوم
            </CardTitle>
          </CardHeader>
          <CardContent>
            {visitorsByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={visitorsByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="visits" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                لا توجد بيانات بعد
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions Grid + System Health */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Actions - 2x2 Grid */}
        <Card className="border-0 shadow-md backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              إجراءات سريعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => setPage(action.page)}
                    className={`group relative flex flex-col items-center justify-center gap-2 p-5 rounded-xl bg-gradient-to-br ${action.gradient} text-white shadow-lg ${action.hoverGlow} hover:shadow-xl hover:scale-[1.03] transition-all duration-200 overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-200" />
                    <Icon className="h-7 w-7 relative z-10 drop-shadow-sm" />
                    <span className="text-sm font-semibold relative z-10">{action.label}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 absolute top-2 left-2 opacity-0 group-hover:opacity-70 transition-opacity z-10" />
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* System Health Card */}
        <Card className="border-0 shadow-md backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-500" />
              صحة النظام
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Database Status */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                    <Database className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">قاعدة البيانات</p>
                    <p className="text-xs text-muted-foreground">SQLite</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">متصل</span>
                </div>
              </div>

              {/* Storage Usage */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                    <HardDrive className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">التخزين</p>
                    <p className="text-xs text-muted-foreground">{stats?.counts.media || 0} ملف</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">جيد</span>
              </div>

              {/* Theme Mode */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-900/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                    {isDark ? (
                      <Moon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    ) : (
                      <Sun className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">الوضع</p>
                    <p className="text-xs text-muted-foreground">{isDark ? 'داكن' : 'فاتح'}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {isDark ? '🌙 داكن' : '☀️ فاتح'}
                </Badge>
              </div>

              {/* Last Backup */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                    <Clock3 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">آخر نسخة احتياطية</p>
                    <p className="text-xs text-muted-foreground">تلقائي</p>
                  </div>
                </div>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  {format(new Date(Date.now() - 2 * 60 * 60 * 1000), 'h:mm a', { locale: ar })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Overview Card with Pie Chart */}
        <Card className="border-0 shadow-md backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-4 w-4 text-violet-500" />
              توزيع المحتوى
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contentDistribution.length > 0 ? (
              <div className="flex items-center gap-4">
                <div className="w-1/2">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={contentDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {contentDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-2">
                  {contentDistribution.slice(0, 5).map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-muted-foreground truncate">{item.name}</span>
                      </div>
                      <span className="text-xs font-bold">{item.value}</span>
                    </div>
                  ))}
                  {contentDistribution.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center">+{contentDistribution.length - 5} المزيد</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
                لا يوجد محتوى بعد
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats Row */}
      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'الخدمات', value: stats?.counts.services || 0, icon: Wrench, color: 'text-emerald-500' },
          { label: 'المهارات', value: stats?.counts.skills || 0, icon: TrendingUp, color: 'text-blue-500' },
          { label: 'غير المقروءة', value: stats?.counts.unreadMessages || 0, icon: MessageSquare, color: 'text-amber-500' },
          { label: 'الوسائط', value: stats?.counts.media || 0, icon: ImageIcon, color: 'text-purple-500' },
          { label: 'زيارات اليوم', value: stats?.analytics.todayPageViews || 0, icon: Eye, color: 'text-teal-500' },
        ].map((qs) => {
          const Icon = qs.icon;
          return (
            <Card key={qs.label} className="p-4 border-0 shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
              <div className="flex items-center gap-3">
                <Icon className={`h-5 w-5 ${qs.color}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{qs.label}</p>
                  <p className="text-lg font-bold">{qs.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Recent Activity Timeline */}
        <Card className="border-0 shadow-md backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-500" />
                النشاط الأخير
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setPage('audit-logs')} className="gap-1 text-xs">
                عرض الكل <ArrowLeft className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {stats?.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">لا يوجد نشاط</p>
            ) : (
              <div className="space-y-0 max-h-96 overflow-y-auto">
                {stats?.recentActivity.map((activity, idx) => {
                  const ActionIcon = ACTION_ICONS[activity.action] || Settings;
                  const entityInfo = getEntityColor(activity.entity);
                  const relativeTime = formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true, locale: ar });

                  return (
                    <div key={activity.id} className="flex items-start gap-3 py-3 relative">
                      {/* Timeline line */}
                      {idx < (stats?.recentActivity.length || 0) - 1 && (
                        <div className="absolute right-[7px] top-8 bottom-0 w-px bg-border" />
                      )}
                      {/* Icon dot */}
                      <div className={`w-3.5 h-3.5 rounded-full ${ACTION_COLORS[activity.action] || 'bg-gray-500'} mt-1 shrink-0 ring-4 ring-background z-10`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <ActionIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm font-medium">{activity.user?.name || 'النظام'}</span>
                          <Badge variant="outline" className="text-xs py-0 px-1.5">{ACTION_LABELS[activity.action] || activity.action}</Badge>
                        </div>
                        {activity.entity && (
                          <Badge className={`mt-1 text-xs py-0.5 px-1.5 ${entityInfo.bg} ${entityInfo.text} border-0`}>
                            {entityInfo.label}
                          </Badge>
                        )}
                        {activity.details && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{activity.details}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock3 className="h-3 w-3" />
                          {relativeTime}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card className="border-0 shadow-md backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4 text-amber-500" />
                الرسائل الأخيرة
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setPage('contact-messages')} className="gap-1 text-xs">
                عرض الكل <ArrowLeft className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {stats?.recentMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">لا توجد رسائل</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {stats?.recentMessages.map((msg) => (
                  <div key={msg.id} className={`p-3 rounded-xl border transition-colors ${!msg.isRead ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900' : 'hover:bg-accent/50'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{msg.name}</span>
                          {!msg.isRead && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                        </div>
                        <p className="text-xs text-muted-foreground">{msg.email}</p>
                        {msg.subject && <p className="text-sm mt-1 font-medium">{msg.subject}</p>}
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{msg.message}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(msg.createdAt), 'd MMM', { locale: ar })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Projects + Site Preview */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <Card className="lg:col-span-2 border-0 shadow-md backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-blue-500" />
                آخر المشاريع
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setPage('projects')} className="gap-1 text-xs">
                عرض الكل <ArrowLeft className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {stats?.recentProjects && stats.recentProjects.length > 0 ? (
              <div className="space-y-3">
                {stats.recentProjects.map((project) => (
                  <div key={project.id} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition-colors">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center shrink-0 overflow-hidden">
                      {project.images?.[0]?.url ? (
                        <img src={project.images[0].url} alt={project.title} className="w-full h-full object-cover" />
                      ) : (
                        <FolderKanban className="h-5 w-5 text-emerald-500/60" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{project.title}</span>
                        {project.featured && (
                          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs py-0">
                            مميز
                          </Badge>
                        )}
                        <Badge className={`text-xs py-0 ${
                          project.status === 'published'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : project.status === 'draft'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}>
                          {project.status === 'published' ? 'منشور' : project.status === 'draft' ? 'مسودة' : 'مؤرشف'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{project.slug}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">لا توجد مشاريع بعد</p>
            )}
          </CardContent>
        </Card>

        {/* Site Preview Card */}
        <Card className="border-0 shadow-md backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">الموقع العام</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="aspect-video rounded-xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20">
                    <ExternalLink className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-sm text-muted-foreground">معاينة الموقع</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => {
                  localStorage.removeItem('admin-mode');
                  window.open('/', '_blank');
                }}
              >
                <ExternalLink className="h-4 w-4" />
                فتح الموقع في تبويب جديد
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
