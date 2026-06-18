'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line,
} from 'recharts';
import {
  RefreshCw, Users, Monitor, Globe, Smartphone, Download,
  TrendingUp, Eye, Activity,
} from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#10b981', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899', '#6366f1'];

const DEVICE_LABELS: Record<string, string> = { desktop: 'حاسوب', mobile: 'هاتف', tablet: 'لوحي' };

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  fontSize: '12px',
};

export function AnalyticsPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [liveVisitors, setLiveVisitors] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics/stats?period=${period}`);
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (err) {
      console.error('Failed:', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Simulated real-time visitor count
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveVisitors(Math.floor(Math.random() * 3) + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) {
    return <div className="flex items-center justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" /></div>;
  }

  const totalPageViews = (data.totalPageViews as number) || 0;
  const uniqueVisitors = (data.uniqueVisitors7Days as number) || 0;
  const pageViews7d = (data.pageViewsLast7Days as number) || 0;
  const pageViews30d = (data.pageViewsLast30Days as number) || 0;
  const pageViewsToday = (data.pageViewsToday as number) || 0;

  const topPages = (data.topPages as Array<{ page: string | null; _count: { page: number } }>) || [];
  const topBrowsers = (data.topBrowsers as Array<{ browser: string | null; _count: { browser: number } }>) || [];
  const topDevices = (data.topDevices as Array<{ device: string | null; _count: { device: number } }>) || [];
  const topCountries = (data.topCountries as Array<{ country: string | null; _count: { country: number } }>) || [];
  const pageViewsByDay = (data.pageViewsByDay as Array<{ day: string; date: string; views: number }>) || [];
  const sessionsByDay = (data.sessionsByDay as Array<{ day: string; date: string; sessions: number }>) || [];

  const deviceData = topDevices.map((d) => ({ device: DEVICE_LABELS[d.device || 'unknown'] || d.device || 'غير معروف', count: d._count.page }));
  const browserData = topBrowsers.map((b) => ({ browser: b.browser || 'غير معروف', count: b._count.browser }));
  const countryData = topCountries.map((c) => ({ country: c.country || 'غير معروف', count: c._count.country }));
  const pageData = topPages.map((p) => ({ page: p.page || '/', views: p._count.page }));

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">التحليلات</h1>
          <p className="text-muted-foreground">إحصائيات الزيارات والأداء</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">اليوم</SelectItem>
              <SelectItem value="7d">7 أيام</SelectItem>
              <SelectItem value="30d">30 يوم</SelectItem>
              <SelectItem value="90d">90 يوم</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchData} className="gap-2">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'إجمالي المشاهدات', value: totalPageViews, icon: Monitor, color: 'from-emerald-500 to-teal-600' },
          { label: 'زيارات اليوم', value: pageViewsToday, icon: Eye, color: 'from-blue-500 to-cyan-600' },
          { label: 'آخر 7 أيام', value: pageViews7d, icon: TrendingUp, color: 'from-amber-500 to-orange-600' },
          { label: 'آخر 30 يوم', value: pageViews30d, icon: Activity, color: 'from-purple-500 to-pink-600' },
          { label: 'زائرون فريدون', value: uniqueVisitors, icon: Globe, color: 'from-rose-500 to-red-600' },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="relative overflow-hidden border-0 shadow-md">
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-10`} />
              <CardContent className="p-4 relative">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                    <p className="text-xl font-bold">{card.value.toLocaleString('ar-SA')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Live Visitors Badge */}
      <motion.div variants={item} className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{liveVisitors} زائر حاليًا</span>
        </div>
      </motion.div>

      {/* Page Views Area Chart */}
      <motion.div variants={item}>
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" />
              مشاهدات الصفحات
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pageViewsByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={pageViewsByDay}>
                  <defs>
                    <linearGradient id="colorPV" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'hsl(var(--foreground))' }} />
                  <Area type="monotone" dataKey="views" stroke="#10b981" fill="url(#colorPV)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">لا توجد بيانات</div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sessions Line Chart */}
        <motion.div variants={item}>
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                الجلسات
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sessionsByDay.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={sessionsByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'hsl(var(--foreground))' }} />
                    <Line type="monotone" dataKey="sessions" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-muted-foreground">لا توجد بيانات</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Device Breakdown PieChart */}
        <motion.div variants={item}>
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-amber-500" />
                توزيع الأجهزة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deviceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={deviceData} dataKey="count" nameKey="device" cx="50%" cy="50%" outerRadius={100} label={({ device, percent }) => `${device} ${(percent * 100).toFixed(0)}%`}>
                      {deviceData.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-muted-foreground">لا توجد بيانات</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Pages BarChart */}
        <motion.div variants={item}>
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Monitor className="h-4 w-4 text-emerald-500" />
                أكثر الصفحات زيارة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pageData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={pageData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="page" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="views" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-muted-foreground">لا توجد بيانات</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Browsers */}
        <motion.div variants={item}>
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4 text-purple-500" />
                المتصفحات
              </CardTitle>
            </CardHeader>
            <CardContent>
              {browserData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={browserData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="browser" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-muted-foreground">لا توجد بيانات</div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Country Stats */}
      {countryData.length > 0 && (
        <motion.div variants={item}>
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4 text-amber-500" />
                الدول
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={countryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis type="category" dataKey="country" tick={{ fontSize: 11 }} width={80} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
