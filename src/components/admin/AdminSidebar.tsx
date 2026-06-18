'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAdminStore, type AdminPage } from '@/store/admin-store';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  LayoutDashboard, Layers, FolderKanban, Wrench, Cpu,
  MessageSquareQuote, Briefcase, GraduationCap, BookOpen,
  HelpCircle, Palette, Type, Share2, Navigation,
  Settings, Search, Image, Mail, BarChart3,
  ClipboardList, Users, Code2, ChevronLeft, ChevronRight,
  Megaphone,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  key: AdminPage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const MAIN_NAV: NavItem[] = [
  { key: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
];

const CONTENT_NAV: NavItem[] = [
  { key: 'sections', label: 'الأقسام', icon: Layers },
  { key: 'projects', label: 'المشاريع', icon: FolderKanban },
  { key: 'services', label: 'الخدمات', icon: Wrench },
  { key: 'skills', label: 'المهارات', icon: Cpu },
  { key: 'testimonials', label: 'الشهادات', icon: MessageSquareQuote },
  { key: 'experience', label: 'الخبرات', icon: Briefcase },
  { key: 'education', label: 'التعليم', icon: GraduationCap },
  { key: 'blog', label: 'المدونة', icon: BookOpen },
  { key: 'faq', label: 'الأسئلة الشائعة', icon: HelpCircle },
];

const DESIGN_NAV: NavItem[] = [
  { key: 'themes', label: 'الثيمات', icon: Palette },
  { key: 'fonts', label: 'الخطوط', icon: Type },
  { key: 'social-links', label: 'وسائل التواصل', icon: Share2 },
  { key: 'navigation', label: 'القوائم', icon: Navigation },
];

const SYSTEM_NAV: NavItem[] = [
  { key: 'settings', label: 'الإعدادات', icon: Settings },
  { key: 'seo', label: 'SEO', icon: Search },
  { key: 'media', label: 'الوسائط', icon: Image },
  { key: 'contact-messages', label: 'الرسائل', icon: Mail },
  { key: 'newsletter', label: 'النشرة البريدية', icon: Megaphone },
  { key: 'analytics', label: 'التحليلات', icon: BarChart3 },
  { key: 'audit-logs', label: 'سجل العمليات', icon: ClipboardList },
  { key: 'users', label: 'المستخدمين', icon: Users },
];

interface NavGroupProps {
  title: string;
  items: NavItem[];
  collapsed: boolean;
  messageCount?: number;
}

function NavGroup({ title, items, collapsed, messageCount }: NavGroupProps) {
  const { currentPage, setPage } = useAdminStore();
  const [collapsed_group, setCollapsedGroup] = useState(false);

  return (
    <div className="space-y-0.5">
      {!collapsed && (
        <button
          onClick={() => setCollapsedGroup(!collapsed_group)}
          className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
        >
          <span>{title}</span>
          <ChevronLeft className={cn(
            'h-3 w-3 transition-transform duration-200',
            collapsed_group && '-rotate-90'
          )} />
        </button>
      )}
      <AnimatePresence>
        {!collapsed_group && (
          <motion.div
            initial={{ height: 'auto' }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            {items.map((navItem) => {
              const Icon = navItem.icon;
              const active = currentPage === navItem.key;
              const badgeCount = navItem.key === 'contact-messages' ? messageCount : undefined;

              const navButton = (
                <button
                  key={navItem.key}
                  onClick={() => setPage(navItem.key)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 relative',
                    active
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  {/* Active indicator */}
                  {active && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-l-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <Icon className={cn('h-4 w-4 shrink-0', active && 'text-emerald-500')} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-right">{navItem.label}</span>
                      {badgeCount !== undefined && badgeCount > 0 && (
                        <Badge className="h-5 min-w-[20px] flex items-center justify-center px-1.5 bg-red-500 text-white text-xs">
                          {badgeCount > 9 ? '9+' : badgeCount}
                        </Badge>
                      )}
                    </>
                  )}
                </button>
              );

              if (collapsed) {
                return (
                  <TooltipProvider key={navItem.key} delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {navButton}
                      </TooltipTrigger>
                      <TooltipContent side="left" className="flex items-center gap-2">
                        <span>{navItem.label}</span>
                        {badgeCount !== undefined && badgeCount > 0 && (
                          <Badge className="h-5 min-w-[20px] flex items-center justify-center px-1.5 bg-red-500 text-white text-xs">
                            {badgeCount}
                          </Badge>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              }

              return navButton;
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AdminSidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAdminStore();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      const json = await res.json();
      if (json.success) {
        setUnreadCount(json.data?.counts?.unreadMessages || 0);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  return (
    <aside
      className={cn(
        'h-screen sticky top-0 border-l bg-card/80 backdrop-blur-xl transition-all duration-300 flex flex-col',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b h-16">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
          <Code2 className="h-5 w-5 text-white" />
        </div>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-w-0"
          >
            <h1 className="font-bold text-sm truncate">لوحة التحكم</h1>
            <p className="text-xs text-muted-foreground truncate">إدارة الموقع</p>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-3 px-2">
        <div className="space-y-2">
          <NavGroup title="" items={MAIN_NAV} collapsed={sidebarCollapsed} messageCount={unreadCount} />
          <Separator />
          <NavGroup title="المحتوى" items={CONTENT_NAV} collapsed={sidebarCollapsed} messageCount={unreadCount} />
          <Separator />
          <NavGroup title="التصميم" items={DESIGN_NAV} collapsed={sidebarCollapsed} messageCount={unreadCount} />
          <Separator />
          <NavGroup title="النظام" items={SYSTEM_NAV} collapsed={sidebarCollapsed} messageCount={unreadCount} />
        </div>
      </ScrollArea>

      {/* Collapse Toggle */}
      <div className="border-t p-2">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="w-full justify-center"
              >
                {sidebarCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              {sidebarCollapsed ? 'توسيع القائمة' : 'تصغير القائمة'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  );
}
