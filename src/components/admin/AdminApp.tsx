'use client';

import { useEffect, useState, useCallback } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminLogin } from './AdminLogin';
import { useAdminStore } from '@/store/admin-store';
import { DashboardPage } from './pages/DashboardPage';
import { SectionsPage } from './pages/SectionsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ServicesPage } from './pages/ServicesPage';
import { SkillsPage } from './pages/SkillsPage';
import { TestimonialsPage } from './pages/TestimonialsPage';
import { ExperiencePage } from './pages/ExperiencePage';
import { EducationPage } from './pages/EducationPage';
import { BlogPage } from './pages/BlogPage';
import { FAQPage } from './pages/FAQPage';
import { ThemesPage } from './pages/ThemesPage';
import { FontsPage } from './pages/FontsPage';
import { SocialLinksPage } from './pages/SocialLinksPage';
import { NavigationPage } from './pages/NavigationPage';
import { SettingsPage } from './pages/SettingsPage';
import { SEOPage } from './pages/SEOPage';
import { MediaPage } from './pages/MediaPage';
import { ContactMessagesPage } from './pages/ContactMessagesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { UsersPage } from './pages/UsersPage';
import { NewsletterSubscribersPage } from './pages/NewsletterSubscribersPage';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  LogOut, User, ExternalLink, Menu, Search, Bell, Sun, Moon,
  X,
} from 'lucide-react';
import { Toaster } from 'sonner';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';

const PAGE_MAP: Record<string, React.ComponentType> = {
  dashboard: DashboardPage,
  sections: SectionsPage,
  projects: ProjectsPage,
  services: ServicesPage,
  skills: SkillsPage,
  testimonials: TestimonialsPage,
  experience: ExperiencePage,
  education: EducationPage,
  blog: BlogPage,
  faq: FAQPage,
  themes: ThemesPage,
  fonts: FontsPage,
  'social-links': SocialLinksPage,
  navigation: NavigationPage,
  settings: SettingsPage,
  seo: SEOPage,
  media: MediaPage,
  'contact-messages': ContactMessagesPage,
  analytics: AnalyticsPage,
  'audit-logs': AuditLogsPage,
  users: UsersPage,
  newsletter: NewsletterSubscribersPage,
};

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'الرئيسية',
  sections: 'الأقسام',
  projects: 'المشاريع',
  services: 'الخدمات',
  skills: 'المهارات',
  testimonials: 'الشهادات',
  experience: 'الخبرات',
  education: 'التعليم',
  blog: 'المدونة',
  faq: 'الأسئلة الشائعة',
  themes: 'الثيمات',
  fonts: 'الخطوط',
  'social-links': 'وسائل التواصل',
  navigation: 'القوائم',
  settings: 'الإعدادات',
  seo: 'SEO',
  media: 'الوسائط',
  'contact-messages': 'الرسائل',
  analytics: 'التحليلات',
  'audit-logs': 'سجل العمليات',
  users: 'المستخدمين',
  newsletter: 'النشرة البريدية',
};

const PAGE_GROUPS: Record<string, string> = {
  dashboard: 'الرئيسية',
  sections: 'المحتوى',
  projects: 'المحتوى',
  services: 'المحتوى',
  skills: 'المحتوى',
  testimonials: 'المحتوى',
  experience: 'المحتوى',
  education: 'المحتوى',
  blog: 'المحتوى',
  faq: 'المحتوى',
  themes: 'التصميم',
  fonts: 'التصميم',
  'social-links': 'التصميم',
  navigation: 'التصميم',
  settings: 'النظام',
  seo: 'النظام',
  media: 'النظام',
  'contact-messages': 'النظام',
  analytics: 'النظام',
  'audit-logs': 'النظام',
  users: 'النظام',
  newsletter: 'النظام',
};

interface AdminAppProps {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string | null;
  };
  onLogout: () => void;
}

export function AdminApp({ user, onLogout }: AdminAppProps) {
  const { currentPage, sidebarCollapsed, setSidebarCollapsed } = useAdminStore();
  const { theme, setTheme } = useTheme();
  const [initialCheck, setInitialCheck] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setInitialCheck(false), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarCollapsed]);

  // Fetch unread messages count
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/dashboard/stats');
        const json = await res.json();
        if (json.success) {
          setUnreadCount(json.data?.counts?.unreadMessages || 0);
        }
      } catch {
        // ignore
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleExitAdmin = useCallback(() => {
    window.location.href = '/';
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    // Navigate to matching page
    if (!query.trim()) return;
    const match = Object.entries(PAGE_TITLES).find(([, title]) =>
      title.includes(query) || query.includes(title)
    );
    if (match) {
      useAdminStore.getState().setPage(match[0] as typeof currentPage);
      setSearchOpen(false);
      setSearchQuery('');
    }
  }, [currentPage]);

  if (initialCheck) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const PageComponent = PAGE_MAP[currentPage] || DashboardPage;

  // Search results
  const searchResults = searchQuery.trim()
    ? Object.entries(PAGE_TITLES).filter(([, title]) =>
        title.includes(searchQuery) || searchQuery.toLowerCase().includes(title.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen flex bg-background" dir="rtl">
      {/* Mobile overlay */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Sidebar - RTL uses translate-x-full for hiding on right side */}
      <div className={`
        fixed md:sticky top-0 z-50 md:z-auto transition-transform duration-300
        ${sidebarCollapsed ? 'translate-x-full md:translate-x-0' : 'translate-x-0'}
      `}>
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 border-b bg-card/80 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden shrink-0"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            {/* Breadcrumbs */}
            <Breadcrumb className="hidden sm:flex">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink onClick={() => useAdminStore.getState().setPage('dashboard')} className="cursor-pointer text-muted-foreground hover:text-foreground">
                    لوحة التحكم
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {currentPage !== 'dashboard' && (
                  <>
                    <BreadcrumbSeparator />
                    {PAGE_GROUPS[currentPage] && PAGE_GROUPS[currentPage] !== 'الرئيسية' && (
                      <>
                        <BreadcrumbItem>
                          <span className="text-xs text-muted-foreground">{PAGE_GROUPS[currentPage]}</span>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                      </>
                    )}
                    <BreadcrumbItem>
                      <span className="font-medium text-sm">{PAGE_TITLES[currentPage] || 'لوحة التحكم'}</span>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
            {/* Mobile title */}
            <h2 className="font-semibold sm:hidden truncate">{PAGE_TITLES[currentPage] || 'لوحة التحكم'}</h2>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Search */}
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} className="shrink-0">
              <Search className="h-4 w-4" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="shrink-0 relative" onClick={() => useAdminStore.getState().setPage('contact-messages')}>
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>

            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="shrink-0">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2 shrink-0">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs">
                      {user?.name?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm">{user?.name}</span>
                  <Badge variant="outline" className="hidden sm:inline text-xs">
                    {user?.role === 'admin' ? 'مدير' : user?.role === 'editor' ? 'محرر' : 'مشاهد'}
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2">
                  <User className="h-4 w-4" />
                  الملف الشخصي
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExitAdmin} className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  العرض العام
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="gap-2 text-red-600 focus:text-red-600">
                  <LogOut className="h-4 w-4" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Search Modal */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50"
              onClick={() => setSearchOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-card rounded-2xl p-4 shadow-xl max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث في لوحة التحكم..."
                    className="border-0 focus-visible:ring-0 text-lg"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSearch(searchQuery);
                      if (e.key === 'Escape') setSearchOpen(false);
                    }}
                  />
                  <Button variant="ghost" size="icon" onClick={() => setSearchOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {searchQuery.trim() && searchResults.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {searchResults.map(([key, title]) => (
                      <button
                        key={key}
                        className="w-full text-right p-2 rounded-lg hover:bg-accent text-sm flex items-center gap-2"
                        onClick={() => {
                          useAdminStore.getState().setPage(key as typeof currentPage);
                          setSearchOpen(false);
                          setSearchQuery('');
                        }}
                      >
                        <Search className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{title}</span>
                        <Badge variant="outline" className="text-xs mr-auto">{PAGE_GROUPS[key]}</Badge>
                      </button>
                    ))}
                  </div>
                )}
                {searchQuery.trim() && searchResults.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">لا توجد نتائج</p>
                )}
                {!searchQuery.trim() && (
                  <p className="text-xs text-muted-foreground text-center py-2">ابحث بالعنوان مثل: مشاريع، مدونة، إعدادات</p>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          <PageComponent />
        </main>

        {/* Footer */}
        <footer className="border-t px-4 lg:px-6 py-3 text-center text-xs text-muted-foreground">
          لوحة التحكم © {new Date().getFullYear()} — جميع الحقوق محفوظة
        </footer>
      </div>

      <Toaster position="top-center" richColors />
    </div>
  );
}
