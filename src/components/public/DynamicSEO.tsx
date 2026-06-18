'use client';

import { useEffect } from 'react';
import { useSiteStore } from '@/store/site-store';
import { useLanguageStore } from '@/store/language-store';
import { getTranslations } from '@/lib/i18n';

export function DynamicSEO() {
  const { siteData } = useSiteStore();
  const { language } = useLanguageStore();
  const t = getTranslations(language);

  useEffect(() => {
    if (!siteData) return;

    const settings = siteData.settings;
    const seo = siteData.seoSettings?.find(s => s.page === 'home') || siteData.seoSettings?.[0];

    // Update title
    const title = seo?.title || settings.site_name || t.hero.defaultName;
    document.title = title;

    // Helper to set or create meta tag
    const setMeta = (name: string, content: string, isProperty = false) => {
      if (!content) return;
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Standard meta tags
    setMeta('description', seo?.description || settings.site_description || '');
    setMeta('keywords', seo?.keywords || '');

    // Open Graph
    setMeta('og:title', seo?.ogTitle || title, true);
    setMeta('og:description', seo?.ogDesc || seo?.description || '', true);
    setMeta('og:type', seo?.ogType || 'website', true);
    if (seo?.ogImage) setMeta('og:image', seo.ogImage, true);

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', seo?.description || '');

    // Canonical URL
    if (seo?.canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = seo.canonical;
    }

    // Robots
    if (seo?.robots) {
      setMeta('robots', seo.robots);
    }

    // Structured Data
    if (seo?.structured) {
      let script = document.getElementById('structured-data') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'structured-data';
        document.head.appendChild(script);
      }
      script.textContent = seo.structured;
    } else {
      // Default structured data
      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: settings.owner_name || settings.site_name || t.hero.defaultName,
        jobTitle: settings.owner_title || (language === 'en' ? 'Software Developer' : 'مطوّر برمجيات'),
        url: window.location.origin,
        sameAs: siteData.socialLinks?.map(l => l.url) || [],
      };
      let script = document.getElementById('structured-data') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'structured-data';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }
  }, [siteData, language, t.hero.defaultName]);

  return null;
}
