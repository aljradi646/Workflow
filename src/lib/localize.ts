type Language = 'ar' | 'en';

/**
 * Get localized string - returns English version if available and language is 'en',
 * otherwise returns the default (Arabic) version
 */
export function localize(
  arValue: string | null | undefined,
  enValue: string | null | undefined,
  language: Language
): string {
  if (language === 'en' && enValue) return enValue;
  return arValue || '';
}

/**
 * Get localized section title/subtitle/description
 */
export function localizeSection(
  section: {
    title: string;
    subtitle?: string | null;
    description?: string | null;
    titleEn?: string | null;
    subtitleEn?: string | null;
    descriptionEn?: string | null;
  },
  language: Language
) {
  return {
    title: localize(section.title, section.titleEn, language),
    subtitle: localize(section.subtitle, section.subtitleEn, language),
    description: localize(section.description, section.descriptionEn, language),
  };
}

/**
 * Get localized section item title/subtitle/description
 */
export function localizeSectionItem(
  item: {
    title?: string | null;
    subtitle?: string | null;
    description?: string | null;
    titleEn?: string | null;
    subtitleEn?: string | null;
    descriptionEn?: string | null;
  },
  language: Language
) {
  return {
    title: localize(item.title, item.titleEn, language),
    subtitle: localize(item.subtitle, item.subtitleEn, language),
    description: localize(item.description, item.descriptionEn, language),
  };
}

/**
 * Get localized project fields
 */
export function localizeProject(
  project: {
    title: string;
    description: string;
    content?: string | null;
    titleEn?: string | null;
    descriptionEn?: string | null;
    contentEn?: string | null;
  },
  language: Language
) {
  return {
    title: localize(project.title, project.titleEn, language),
    description: localize(project.description, project.descriptionEn, language),
    content: localize(project.content, project.contentEn, language),
  };
}

/**
 * Get localized navigation label
 */
export function localizeNavigation(
  nav: {
    label: string;
    labelEn?: string | null;
  },
  language: Language
) {
  return {
    label: localize(nav.label, nav.labelEn, language),
  };
}
