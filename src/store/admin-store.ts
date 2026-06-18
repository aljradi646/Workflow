import { create } from 'zustand';

export type AdminPage =
  | 'dashboard'
  | 'sections'
  | 'projects'
  | 'services'
  | 'skills'
  | 'testimonials'
  | 'experience'
  | 'education'
  | 'blog'
  | 'faq'
  | 'themes'
  | 'fonts'
  | 'social-links'
  | 'navigation'
  | 'settings'
  | 'seo'
  | 'media'
  | 'contact-messages'
  | 'analytics'
  | 'audit-logs'
  | 'users'
  | 'newsletter';

interface AdminState {
  currentPage: AdminPage;
  sidebarCollapsed: boolean;
  isAuthenticated: boolean;
  user: { id: string; email: string; name: string; role: string; avatar?: string | null } | null;
  setPage: (page: AdminPage) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setAuth: (user: AdminState['user']) => void;
  logout: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  currentPage: 'dashboard',
  sidebarCollapsed: false,
  isAuthenticated: false,
  user: null,

  setPage: (page) => set({ currentPage: page }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setAuth: (user) => set({ isAuthenticated: !!user, user }),
  logout: () => set({ isAuthenticated: false, user: null, currentPage: 'dashboard' }),
}));
