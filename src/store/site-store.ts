import { create } from 'zustand';

// Types for the site data
export interface SiteSettings {
  [key: string]: string;
}

export interface SectionItem {
  id: string;
  sectionId: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  titleEn?: string | null;
  subtitleEn?: string | null;
  descriptionEn?: string | null;
  content: string;
  imageUrl: string | null;
  icon: string | null;
  link: string | null;
  linkText: string | null;
  order: number;
  isVisible: boolean;
  config: string;
  configEn?: string | null;
  tags: string | null;
  startDate: string | null;
  endDate: string | null;
  rating: number | null;
}

export interface Section {
  id: string;
  type: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  titleEn?: string | null;
  subtitleEn?: string | null;
  descriptionEn?: string | null;
  config: string;
  content: string;
  contentEn?: string | null;
  order: number;
  isVisible: boolean;
  layout: string;
  animation: string;
  bgType: string;
  bgValue: string | null;
  customClass: string | null;
  parentId: string | null;
  items: SectionItem[];
}

export interface Navigation {
  id: string;
  label: string;
  labelEn?: string | null;
  url: string | null;
  icon: string | null;
  order: number;
  type: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string | null;
  order: number;
}

export interface ThemeConfig {
  id: string;
  name: string;
  isDefault: boolean;
  isActive: boolean;
  mode: string;
  colors: Record<string, string>;
  fonts: Record<string, string>;
  spacing: Record<string, string>;
  borderRadius: string;
  customCSS: string | null;
}

export interface SiteData {
  settings: SiteSettings;
  sections: Section[];
  navigation: Navigation[];
  socialLinks: SocialLink[];
  theme: ThemeConfig | null;
  seoSettings: Array<{
    id: string;
    page: string;
    title: string | null;
    description: string | null;
    keywords: string | null;
    ogTitle: string | null;
    ogDesc: string | null;
    ogImage: string | null;
    ogType: string | null;
    canonical: string | null;
    robots: string | null;
    structured: string | null;
  }>;
  fonts: Array<{
    id: string;
    name: string;
    family: string;
    category: string;
    usage: string;
    isActive: boolean;
  }>;
}

interface SiteState {
  siteData: SiteData | null;
  loading: boolean;
  error: string | null;
  activeSection: string;
  fetchSiteData: () => Promise<void>;
  setActiveSection: (section: string) => void;
}

function parseJsonField(value: string | null | undefined): Record<string, string> {
  if (!value) return {};
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

export const useSiteStore = create<SiteState>((set) => ({
  siteData: null,
  loading: true,
  error: null,
  activeSection: 'hero',

  fetchSiteData: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/public/site');
      if (!response.ok) throw new Error('Failed to fetch site data');
      const json = await response.json();

      // The API wraps data in { success: true, data: {...} }
      const raw = json.data || json;

      // Parse theme JSON fields
      const theme = raw.theme
        ? {
            ...raw.theme,
            colors: parseJsonField(raw.theme.colors),
            fonts: parseJsonField(raw.theme.fonts),
            spacing: parseJsonField(raw.theme.spacing),
          }
        : null;

      set({
        siteData: {
          settings: raw.settings || {},
          sections: raw.sections || [],
          navigation: raw.navigation || [],
          socialLinks: raw.socialLinks || [],
          theme,
          seoSettings: raw.seoSettings || [],
          fonts: raw.fonts || [],
        },
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false,
      });
    }
  },

  setActiveSection: (section: string) => set({ activeSection: section }),
}));
