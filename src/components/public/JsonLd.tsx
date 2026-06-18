'use client';

import { useMemo } from 'react';
import { useSiteStore } from '@/store/site-store';
import { useLanguageStore } from '@/store/language-store';
import { getTranslations, type Language } from '@/lib/i18n';

// Default values for SSR when siteData is not yet loaded
const DEFAULTS = {
  ar: {
    name: 'أحمد المطيري',
    alternateName: 'Ahmed Al-Mutairi',
    jobTitle: 'مطوّر برمجيات',
    description: 'مطوّر برمجيات متخصص في بناء تطبيقات ويب حديثة وسريعة باستخدام أحدث التقنيات',
    siteName: 'أحمد المطيري | مطوّر برمجيات',
    services: [
      'تطوير تطبيقات الويب',
      'تطوير تطبيقات الجوال',
      'تصميم واجهات المستخدم',
      'تطوير الخلفية والأنظمة',
      'حلول الذكاء الاصطناعي',
      'البنية التحتية و DevOps',
    ],
  },
  en: {
    name: 'Ahmed Al-Mutairi',
    alternateName: 'أحمد المطيري',
    jobTitle: 'Full-Stack Developer',
    description:
      'A specialized software developer focused on building modern and fast web applications using the latest technologies',
    siteName: 'Ahmed Al-Mutairi | Full-Stack Developer',
    services: [
      'Web Application Development',
      'Mobile App Development',
      'UI/UX Design',
      'Backend & Systems Development',
      'AI/ML Solutions',
      'DevOps & Infrastructure',
    ],
  },
};

const SITE_URL = 'https://ahmed-almutairi.dev';

interface PersonSchema {
  '@context': 'https://schema.org';
  '@type': 'Person';
  name: string;
  alternateName?: string;
  jobTitle: string;
  description: string;
  url: string;
  image?: string;
  sameAs: string[];
  knowsAbout: string[];
  worksFor?: {
    '@type': 'Organization';
    name: string;
  };
  address?: {
    '@type': 'PostalAddress';
    addressCountry: string;
    addressLocality?: string;
  };
}

interface WebSiteSchema {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  alternateName?: string;
  url: string;
  description?: string;
  inLanguage: string;
  potentialAction: {
    '@type': 'SearchAction';
    target: string;
    'query-input': string;
  };
}

interface ProfessionalServiceSchema {
  '@context': 'https://schema.org';
  '@type': 'ProfessionalService';
  name: string;
  description: string;
  url: string;
  provider: {
    '@type': 'Person';
    name: string;
  };
  serviceType: string[];
  areaServed: {
    '@type': 'Country';
    name: string;
  };
  hasOfferCatalog: {
    '@type': 'OfferCatalog';
    name: string;
    itemListElement: Array<{
      '@type': 'Offer';
      itemOffered: {
        '@type': 'Service';
        name: string;
      };
    }>;
  };
}

interface ItemListSchema {
  '@context': 'https://schema.org';
  '@type': 'ItemList';
  name: string;
  description: string;
  numberOfItems: number;
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    url?: string;
    description?: string;
  }>;
}

function buildPersonSchema(
  language: Language,
  settings: Record<string, string>,
  socialLinks: Array<{ platform: string; url: string }>,
  sections: Array<{ type: string; items: Array<{ title: string | null; tags: string | null }> }>
): PersonSchema {
  const defaults = DEFAULTS[language];
  const t = getTranslations(language);

  const name = settings.owner_name || settings.site_name || defaults.name;
  const jobTitle = settings.owner_title || defaults.jobTitle;
  const description = settings.site_description || defaults.description;

  // Collect sameAs from social links
  const sameAs = socialLinks.map((link) => link.url).filter(Boolean);

  // Collect skills/knowledge from skills sections
  const knowsAbout: string[] = [];
  for (const section of sections) {
    if (section.type === 'skills') {
      for (const item of section.items) {
        if (item.title) knowsAbout.push(item.title);
        if (item.tags) {
          try {
            const tags = JSON.parse(item.tags);
            if (Array.isArray(tags)) knowsAbout.push(...tags.filter((t: unknown) => typeof t === 'string'));
          } catch {
            // Ignore invalid JSON
          }
        }
      }
    }
  }

  const schema: PersonSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    alternateName: language === 'ar' ? DEFAULTS.en.name : DEFAULTS.ar.name,
    jobTitle,
    description,
    url: settings.site_url || SITE_URL,
    sameAs,
    knowsAbout: knowsAbout.length > 0 ? knowsAbout : ['Web Development', 'React', 'Next.js', 'TypeScript', 'Node.js'],
  };

  // Add image if available
  if (settings.owner_avatar || settings.site_logo) {
    schema.image = settings.owner_avatar || settings.site_logo;
  }

  // Add location
  if (settings.owner_location || settings.owner_country) {
    schema.address = {
      '@type': 'PostalAddress',
      addressCountry: settings.owner_country || 'SA',
      addressLocality: settings.owner_location || undefined,
    };
  }

  // Add works for
  if (settings.owner_company) {
    schema.worksFor = {
      '@type': 'Organization',
      name: settings.owner_company,
    };
  }

  return schema;
}

function buildWebSiteSchema(
  language: Language,
  settings: Record<string, string>
): WebSiteSchema {
  const defaults = DEFAULTS[language];
  const siteName = settings.site_name || defaults.siteName;
  const description = settings.site_description || defaults.description;
  const siteUrl = settings.site_url || SITE_URL;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    alternateName: language === 'ar' ? DEFAULTS.en.siteName : DEFAULTS.ar.siteName,
    url: siteUrl,
    description,
    inLanguage: language === 'ar' ? 'ar-SA' : 'en-US',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

function buildProfessionalServiceSchema(
  language: Language,
  settings: Record<string, string>,
  sections: Array<{ type: string; items: Array<{ title: string | null; description: string | null }> }>
): ProfessionalServiceSchema {
  const defaults = DEFAULTS[language];
  const t = getTranslations(language);
  const name = settings.owner_name || settings.site_name || defaults.name;
  const description = settings.site_description || defaults.description;
  const siteUrl = settings.site_url || SITE_URL;

  // Collect services from the services section
  const services: string[] = [];
  for (const section of sections) {
    if (section.type === 'services') {
      for (const item of section.items) {
        if (item.title) services.push(item.title);
      }
    }
  }

  const serviceNames = services.length > 0 ? services : defaults.services;

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name,
    description,
    url: siteUrl,
    provider: {
      '@type': 'Person',
      name,
    },
    serviceType: [t.sections.services],
    areaServed: {
      '@type': 'Country',
      name: language === 'ar' ? 'المملكة العربية السعودية' : 'Saudi Arabia',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: t.sections.services,
      itemListElement: serviceNames.map((serviceName) => ({
        '@type': 'Offer' as const,
        itemOffered: {
          '@type': 'Service' as const,
          name: serviceName,
        },
      })),
    },
  };
}

function buildItemListSchema(
  language: Language,
  settings: Record<string, string>,
  sections: Array<{
    type: string;
    items: Array<{
      title: string | null;
      description: string | null;
      link: string | null;
    }>;
  }>
): ItemListSchema | null {
  const t = getTranslations(language);
  const siteUrl = settings.site_url || SITE_URL;

  // Collect projects from the projects section
  const projects: Array<{ name: string; url?: string; description?: string }> = [];
  for (const section of sections) {
    if (section.type === 'projects') {
      for (const item of section.items) {
        if (item.title) {
          projects.push({
            name: item.title,
            url: item.link || undefined,
            description: item.description || undefined,
          });
        }
      }
    }
  }

  if (projects.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: t.sections.projects,
    description: language === 'ar' ? 'معرض الأعمال والمشاريع' : 'Portfolio of projects and work',
    numberOfItems: projects.length,
    itemListElement: projects.map((project, index) => ({
      '@type': 'ListItem' as const,
      position: index + 1,
      name: project.name,
      url: project.url || `${siteUrl}/#projects`,
      description: project.description,
    })),
  };
}

export function JsonLd() {
  const { siteData } = useSiteStore();
  const { language } = useLanguageStore();

  const schemas = useMemo(() => {
    const settings = siteData?.settings || {};
    const socialLinks = siteData?.socialLinks || [];
    const sections = siteData?.sections || [];

    const personSchema = buildPersonSchema(language, settings, socialLinks, sections);
    const websiteSchema = buildWebSiteSchema(language, settings);
    const professionalServiceSchema = buildProfessionalServiceSchema(language, settings, sections);
    const itemListSchema = buildItemListSchema(language, settings, sections);

    return {
      person: personSchema,
      website: websiteSchema,
      professionalService: professionalServiceSchema,
      itemList: itemListSchema,
    };
  }, [siteData, language]);

  return (
    <>
      <script
        type="application/ld+json"
        id="jsonld-person"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.person) }}
      />
      <script
        type="application/ld+json"
        id="jsonld-website"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.website) }}
      />
      <script
        type="application/ld+json"
        id="jsonld-professional-service"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.professionalService) }}
      />
      {schemas.itemList && (
        <script
          type="application/ld+json"
          id="jsonld-item-list"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.itemList) }}
        />
      )}
    </>
  );
}
