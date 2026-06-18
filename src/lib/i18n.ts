export type Language = 'ar' | 'en';

export interface Translations {
  // Navigation
  nav: {
    home: string;
    about: string;
    skills: string;
    projects: string;
    services: string;
    experience: string;
    education: string;
    blog: string;
    contact: string;
    faq: string;
    testimonials: string;
  };
  // Section titles
  sections: {
    hero: string;
    about: string;
    skills: string;
    projects: string;
    services: string;
    experience: string;
    education: string;
    blog: string;
    contact: string;
    faq: string;
    testimonials: string;
  };
  // Common buttons
  buttons: {
    readMore: string;
    viewAll: string;
    sendMessage: string;
    sending: string;
    downloadCv: string;
    hireMe: string;
    share: string;
    copyLink: string;
    copied: string;
    shareOnTwitter: string;
    shareOnLinkedIn: string;
    close: string;
    viewProject: string;
    viewCertificate: string;
  };
  // Blog
  blog: {
    readTime: string;
    minRead: string;
    minReadSingular: string;
    minReadDual: string;
    minReadPlural: string;
    tableOfContents: string;
    relatedPosts: string;
    publishedOn: string;
    by: string;
    category: string;
    backToBlog: string;
    articles: string;
    latest: string;
    searchPlaceholder: string;
    loadMore: string;
    noPostsFound: string;
    noPostsDescription: string;
    allCategories: string;
    featured: string;
    readMore: string;
    badge: string;
    categoryDevelopment: string;
    categoryDesign: string;
    categoryMarketing: string;
    categoryBusiness: string;
    categoryTech: string;
    categorySecurity: string;
    categoryAI: string;
  };
  // Contact
  contact: {
    name: string;
    email: string;
    subject: string;
    message: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    subjectPlaceholder: string;
    messagePlaceholder: string;
    required: string;
    followMe: string;
    letsWorkTogether: string;
    availableForWork: string;
    currentlyAvailable: string;
    notAvailable: string;
    successTitle: string;
    successMessage: string;
    errorRequired: string;
    errorSending: string;
    errorConnection: string;
    emailLabel: string;
    phoneLabel: string;
    locationLabel: string;
    avgResponseTime: string;
    faqTitle: string;
    faq1q: string;
    faq1a: string;
    faq2q: string;
    faq2a: string;
    faq3q: string;
    faq3a: string;
    thankYou: string;
    mapTitle: string;
    emailDetail: string;
    phoneDetail: string;
    locationDetail: string;
    sendAnother: string;
    validEmail: string;
    messageTooLong: string;
    maxRetriesExceeded: string;
    retryAfter: string;
    contactSeconds: string;
    responseTime: string;
    availableHours: string;
    phoneNumber: string;
    attachFile: string;
    draftSaved: string;
  };
  // Experience
  experience: {
    current: string;
    currentJob: string;
    work: string;
    education: string;
    present: string;
    achievements: string;
    duration: string;
    details: string;
    yearsAgo: string;
  };
  // Education
  education: {
    grade: string;
    certificate: string;
    present: string;
    totalDegrees: string;
    certifications: string;
    yearsOfEducation: string;
    courses: string;
    details: string;
    showDetails: string;
    hideDetails: string;
    gpa: string;
    educationalJourney: string;
  };
  // Skills
  skills: {
    search: string;
    searchPlaceholder: string;
    compare: string;
    compareSkills: string;
    selectSkillsToCompare: string;
    skillTree: string;
    treeView: string;
    cardView: string;
    barsView: string;
    radarView: string;
    yearsExperience: string;
    relatedProjects: string;
    relatedSkills: string;
    proficiencyLevel: string;
    beginner: string;
    intermediate: string;
    advanced: string;
    expert: string;
    skillDetails: string;
    noSkillsFound: string;
    noSkillsFoundDesc: string;
    years: string;
    projects: string;
    deselect: string;
    selectCompare: string;
    categoryStats: string;
    totalSkills: string;
    avgProficiency: string;
    category: string;
    skillCount: string;
    projectsUsing: string;
  };
  // Footer
  footer: {
    rights: string;
    newsletter: string;
    newsletterPlaceholder: string;
    subscribe: string;
    quickLinks: string;
    quickStats: string;
    madeWith: string;
    using: string;
    contactUs: string;
    confirmEmail: string;
    confirmEmailMsg: string;
    subscribedSuccess: string;
    invalidEmail: string;
    followers: string;
    joinSubscribers: string;
    subscribersCount: string;
    madeWithLoveAndCoffee: string;
    projectsStat: string;
    clientsStat: string;
    yearsStat: string;
    backToTopAria: string;
    yearsExperience: string;
    projectsCompleted: string;
    happyClients: string;
    awards: string;
    defaultSiteName: string;
    defaultSiteDesc: string;
    emailLabel: string;
    phoneLabel: string;
    visitorNumber: string;
    copyright: string;
  };
  // FAQ
  faq: {
    searchPlaceholder: string;
    noResults: string;
    noResultsDesc: string;
    showingOf: string;
    questions: string;
    all: string;
    general: string;
    pricing: string;
    technical: string;
    support: string;
    stillHaveQuestions: string;
    stillHaveQuestionsDesc: string;
    contactUs: string;
    wasThisHelpful: string;
    yes: string;
    no: string;
    thanksForFeedback: string;
    feedbackRecorded: string;
  };
  // Newsletter
  newsletter: {
    title: string;
    placeholder: string;
    subscribe: string;
    subscribed: string;
    privacyNotice: string;
    errorInvalid: string;
    errorExists: string;
    successMessage: string;
    doubleOptIn: string;
    unsubscribe: string;
    unsubscribed: string;
    enterEmail: string;
    genericError: string;
    connectionError: string;
    back: string;
    cardDescription: string;
    nameOptional: string;
  };
  // Projects
  projects: {
    all: string;
    noProjectsInCategory: string;
    viewDemo: string;
    viewCode: string;
    viewDetails: string;
    statusFeatured: string;
    statusPublished: string;
    statusDraft: string;
    statusInProgress: string;
    statusCompleted: string;
    technologies: string;
    images: string;
    close: string;
    gridView: string;
    listView: string;
    projectDetails: string;
    demoUrl: string;
    repoUrl: string;
    projectStats: string;
    linesOfCode: string;
    completion: string;
    teamSize: string;
    projectDuration: string;
    shareProject: string;
    shareOnTwitter: string;
    shareOnLinkedIn: string;
    copyLink: string;
    copied: string;
    previousProject: string;
    nextProject: string;
    startProject: string;
    endProject: string;
    featured: string;
    inProgress: string;
    completed: string;
    preview: string;
    published: string;
    draft: string;
    client: string;
    noProjects: string;
    noTestimonials: string;
    noFAQ: string;
    noTimeline: string;
    categoryWebDev: string;
    categoryApps: string;
    categoryDesign: string;
    myWork: string;
    tryAnotherCategory: string;
  };
  // Chat Widget
  chat: {
    title: string;
    placeholder: string;
    thinkingPlaceholder: string;
    typing: string;
    online: string;
    soundOn: string;
    soundOff: string;
    suggestedQ1: string;
    suggestedQ2: string;
    suggestedQ3: string;
    suggestedQ4: string;
    now: string;
    minuteAgo: string;
    minutesAgo: string;
    errorMessage: string;
    welcomeMessage: string;
  };
  // Notifications
  notifications: {
    title: string;
    markAllRead: string;
    clearAll: string;
    empty: string;
    emptyDesc: string;
    newMessage: string;
    newMessageDesc: string;
    newComment: string;
    newCommentDesc: string;
    systemUpdate: string;
    systemUpdateDesc: string;
    justNow: string;
    minuteAgo: string;
    minutesAgo: string;
    hourAgo: string;
    hoursAgo: string;
  };
  // Loading
  loading: {
    heroSection: string;
    aboutSection: string;
    skillsSection: string;
    projectsSection: string;
    contactSection: string;
    loadingContent: string;
    preparingPlatform: string;
  };
  // Services
  services: {
    myServices: string;
    learnMore: string;
    startingFrom: string;
    gridView: string;
    listView: string;
    process: string;
    discovery: string;
    design: string;
    development: string;
    delivery: string;
    keyFeatures: string;
    technologies: string;
    startingPrice: string;
    contactUs: string;
    serviceDetails: string;
    compareServices: string;
    selectServicesToCompare: string;
    compare: string;
    requestQuote: string;
    scope: string;
    small: string;
    medium: string;
    enterprise: string;
    projectDetails: string;
    timeline: string;
    budget: string;
    description: string;
    contactInfo: string;
    next: string;
    previous: string;
    submit: string;
    portfolio: string;
    clientTestimonials: string;
    faq: string;
    deliveryTimeline: string;
    mostPopular: string;
    category: string;
    feature: string;
    available: string;
    notAvailable: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    phonePlaceholder: string;
    descriptionPlaceholder: string;
    week: string;
    weeks: string;
    month: string;
    months: string;
    quoteSuccess: string;
    quoteSuccessMsg: string;
    selectService: string;
    step: string;
    phone: string;
    budgetRange: string;
    timelineRange: string;
    cancel: string;
    featured: string;
    published: string;
    draft: string;
    inProgress: string;
    completed: string;
    client: string;
    noServices: string;
    noTestimonials: string;
    noFAQ: string;
    noTimeline: string;
    categoryWebDev: string;
    categoryApps: string;
    categoryDesign: string;
    categoryBackend: string;
    categoryAI: string;
    categoryDevOps: string;
    noPortfolio: string;
  };
  // About
  about: {
    getToKnowMe: string;
    readMore: string;
    readLess: string;
    downloadVCard: string;
    techStack: string;
    proficiency: string;
    availableForWork: string;
    notAvailable: string;
    bookACall: string;
    viewAllStats: string;
    yearsExp: string;
    projectsDone: string;
    happyClients: string;
    awards: string;
    statsDetail: string;
    category: string;
    beginner: string;
    intermediate: string;
    advanced: string;
    expert: string;
    allStats: string;
    statHistory: string;
    codeSnippet: string;
    notAvailableForWork: string;
  };
  // Command Palette
  commandPalette: {
    title: string;
    placeholder: string;
    noResults: string;
    navigation: string;
    actions: string;
    toggleTheme: string;
    switchLanguage: string;
    scrollToSection: string;
  };
  // Misc
  misc: {
    loading: string;
    error: string;
    retry: string;
    underConstruction: string;
    underConstructionMsg: string;
    adminHint: string;
    theme: string;
    language: string;
    darkMode: string;
    lightMode: string;
    backToTop: string;
    readingProgress: string;
    printPage: string;
    sectionJump: string;
  };
  // Keyboard Shortcuts
  shortcuts: {
    title: string;
    sectionJump: string;
    themeToggle: string;
    languageToggle: string;
    searchCommand: string;
    printPage: string;
    adminPanel: string;
    showShortcuts: string;
    scrollToTop: string;
    closeWindow: string;
    sectionPrefix: string;
    hintMessage: string;
    dismissHint: string;
  };
  // Theme Customizer
  themeCustomizer: {
    title: string;
    colorTheme: string;
    fontSize: string;
    borderRadius: string;
    layout: string;
    compact: string;
    normal: string;
    comfortable: string;
    animationSpeed: string;
    reduced: string;
    enhanced: string;
    reset: string;
    resetConfirm: string;
  };
  // Resume
  resume: {
    profile: string;
    experience: string;
    education: string;
    skills: string;
    downloadPdf: string;
    printResume: string;
    shareResume: string;
    contactInfo: string;
    summary: string;
    workExperience: string;
    educationHistory: string;
    technicalSkills: string;
    proficiency: string;
    years: string;
    present: string;
    noData: string;
  };
  // Hero
  hero: {
    yearsExperience: string;
    projectsCompleted: string;
    happyClients: string;
    awardsWon: string;
    viewResume: string;
    topRated: string;
    jss: string;
    fiveStars: string;
    title1: string;
    title2: string;
    title3: string;
    exploreWork: string;
    contactMe: string;
    defaultName: string;
    externalLink: string;
    scrollDown: string;
    discover: string;
  };
  // Cookie Consent
  cookie: {
    title: string;
    description: string;
    customize: string;
    acceptAll: string;
    reject: string;
    rejectAll: string;
    savePreferences: string;
    privacySettings: string;
    necessary: string;
    necessaryDesc: string;
    analytics: string;
    analyticsDesc: string;
    marketing: string;
    marketingDesc: string;
    required: string;
  };
  // Newsletter Admin
  newsletterAdmin: {
    title: string;
    searchPlaceholder: string;
    export: string;
    bulkActions: string;
    selectAll: string;
    active: string;
    inactive: string;
    all: string;
    email: string;
    name: string;
    source: string;
    status: string;
    subscribedDate: string;
    actions: string;
    totalSubscribers: string;
    activeCount: string;
    inactiveCount: string;
    newThisMonth: string;
    edit: string;
    delete: string;
    deleteConfirm: string;
    bulkDeleteConfirm: string;
    markActive: string;
    markInactive: string;
    noSubscribers: string;
    refresh: string;
    exportCSV: string;
    previous: string;
    next: string;
    showingOf: string;
    editSubscriber: string;
    saveChanges: string;
    cancel: string;
    namePlaceholder: string;
    allSources: string;
    selected: string;
    activate: string;
    deactivate: string;
    deleteSelected: string;
  };
  // Analytics Widget
  analytics: {
    title: string;
    siteStats: string;
    totalVisits: string;
    visitsToday: string;
    topPages: string;
    deviceBreakdown: string;
    avgDuration: string;
    bounceRate: string;
    desktop: string;
    mobile: string;
    tablet: string;
    unknown: string;
    lastUpdated: string;
    secondsAgo: string;
    minuteAgo: string;
    minutesAgo: string;
    refresh: string;
    noData: string;
    views: string;
    seconds: string;
    minute: string;
    minutes: string;
    hour: string;
  };
  // Testimonials
  testimonials: {
    badge: string;
    carouselView: string;
    gridView: string;
    previous: string;
    next: string;
    testimonial: string;
    sectionTitle: string;
    sectionSubtitle: string;
  };
  // Accessibility
  accessibility: {
    skipToContent: string;
  };
}

const ar: Translations = {
  nav: {
    home: 'الرئيسية',
    about: 'عني',
    skills: 'المهارات',
    projects: 'المشاريع',
    services: 'الخدمات',
    experience: 'الخبرات',
    education: 'التعليم',
    blog: 'المدونة',
    contact: 'تواصل',
    faq: 'الأسئلة',
    testimonials: 'آراء العملاء',
  },
  sections: {
    hero: 'الرئيسية',
    about: 'عني',
    skills: 'المهارات',
    projects: 'المشاريع',
    services: 'الخدمات',
    experience: 'الخبرات',
    education: 'التعليم',
    blog: 'المدونة',
    contact: 'تواصل معي',
    faq: 'الأسئلة الشائعة',
    testimonials: 'آراء العملاء',
  },
  buttons: {
    readMore: 'اقرأ المزيد',
    viewAll: 'عرض الكل',
    sendMessage: 'إرسال الرسالة',
    sending: 'جارِ الإرسال...',
    downloadCv: 'تحميل السيرة الذاتية',
    hireMe: 'تواصل معي',
    share: 'مشاركة',
    copyLink: 'نسخ الرابط',
    copied: 'تم النسخ!',
    shareOnTwitter: 'مشاركة على تويتر',
    shareOnLinkedIn: 'مشاركة على لينكدإن',
    close: 'إغلاق',
    viewProject: 'عرض المشروع',
    viewCertificate: 'الشهادة',
  },
  blog: {
    readTime: 'وقت القراءة',
    minRead: 'دقيقة قراءة',
    minReadSingular: 'دقيقة قراءة',
    minReadDual: 'دقيقتان قراءة',
    minReadPlural: 'دقائق قراءة',
    tableOfContents: 'فهرس المحتوى',
    relatedPosts: 'مقالات ذات صلة',
    publishedOn: 'نُشر في',
    by: 'بواسطة',
    category: 'التصنيف',
    backToBlog: 'العودة للمدونة',
    articles: 'مقالة',
    latest: 'الأحدث',
    searchPlaceholder: 'ابحث في المقالات...',
    loadMore: 'تحميل المزيد',
    noPostsFound: 'لا توجد مقالات',
    noPostsDescription: 'لم يتم العثور على مقات مطابقة. جرّب تصنيفًا مختلفًا أو كلمة بحث أخرى.',
    allCategories: 'الكل',
    featured: 'مميز',
    readMore: 'اقرأ المزيد',
    badge: 'المدونة',
    categoryDevelopment: 'تطوير',
    categoryDesign: 'تصميم',
    categoryMarketing: 'تسويق',
    categoryBusiness: 'أعمال',
    categoryTech: 'تقنية',
    categorySecurity: 'أمن',
    categoryAI: 'ذكاء اصطناعي',
  },
  contact: {
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    subject: 'الموضوع',
    message: 'الرسالة',
    namePlaceholder: 'اسمك الكامل',
    emailPlaceholder: 'example@email.com',
    subjectPlaceholder: 'موضوع الرسالة',
    messagePlaceholder: 'اكتب رسالتك هنا...',
    required: '*',
    followMe: 'تابعني على',
    letsWorkTogether: 'لنعمل معًا',
    availableForWork: 'متاح للعمل',
    currentlyAvailable: 'متاح حاليًا للمشاريع الجديدة',
    notAvailable: 'غير متاح حاليًا',
    successTitle: 'تم الإرسال بنجاح!',
    successMessage: 'شكرًا لتواصلك! سأرد عليك في أقرب وقت.',
    errorRequired: 'يرجى ملء الحقول المطلوبة',
    errorSending: 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.',
    errorConnection: 'حدث خطأ في الاتصال. يرجى المحاولة لاحقًا.',
    emailLabel: 'البريد الإلكتروني',
    phoneLabel: 'رقم الهاتف',
    locationLabel: 'الموقع',
    avgResponseTime: 'متوسط وقت الرد: 24 ساعة',
    faqTitle: 'الأسئلة الشائعة',
    faq1q: 'ما هي مدة التنفيذ المعتادة؟',
    faq1a: 'تختلف حسب حجم المشروع، عادةً من 2-8 أسابيع.',
    faq2q: 'هل تقدمون دعمًا بعد التسليم؟',
    faq2a: 'نعم، نقدم دعمًا فنيًا مجانيًا لمدة 3 أشهر بعد التسليم.',
    faq3q: 'كيف يمكنني بدء مشروع؟',
    faq3a: 'أرسل رسالة عبر النموذج أعلاه وسنتواصل معك خلال 24 ساعة.',
    thankYou: 'شكرًا لك',
    mapTitle: 'موقعي على الخريطة',
    emailDetail: 'أرسل لي بريدًا إلكترونيًا وسأرد في أقرب وقت',
    phoneDetail: 'اتصل بي خلال ساعات العمل',
    locationDetail: 'موقعي الحالي للعمل',
    sendAnother: 'إرسال رسالة أخرى',
    validEmail: 'يرجى إدخال بريد إلكتروني صحيح',
    messageTooLong: 'الرسالة طويلة جدًا (الحد الأقصى {max} حرف)',
    maxRetriesExceeded: 'تم تجاوز الحد الأقصى للمحاولات',
    retryAfter: 'إعادة المحاولة بعد',
    contactSeconds: 'ثانية',
    responseTime: 'عادةً الرد خلال ساعتين',
    availableHours: 'متاح من 9 ص - 6 م',
    phoneNumber: 'رقم الهاتف',
    attachFile: 'إرفاق ملف',
    draftSaved: 'تم الحفظ تلقائيًا كمسودة',
  },
  experience: {
    current: 'حالي',
    currentJob: 'الوظيفة الحالية',
    work: 'عمل',
    education: 'تعليم',
    present: 'الحالي',
    achievements: 'الإنجازات',
    duration: 'المدة',
    details: 'التفاصيل',
    yearsAgo: 'منذ سنة',
  },
  skills: {
    search: 'بحث',
    searchPlaceholder: 'ابحث عن مهارة...',
    compare: 'مقارنة',
    compareSkills: 'مقارنة المهارات',
    selectSkillsToCompare: 'اختر مهارتين للمقارنة',
    skillTree: 'شجرة المهارات',
    treeView: 'عرض شجرة',
    cardView: 'عرض بطاقات',
    barsView: 'عرض أشرطة',
    radarView: 'عرض رادار',
    yearsExperience: 'سنوات الخبرة',
    relatedProjects: 'مشاريع ذات صلة',
    relatedSkills: 'مهارات ذات صلة',
    proficiencyLevel: 'مستوى الإتقان',
    beginner: 'مبتدئ',
    intermediate: 'متوسط',
    advanced: 'متقدم',
    expert: 'خبير',
    skillDetails: 'تفاصيل المهارة',
    noSkillsFound: 'لا توجد مهارات مطابقة',
    noSkillsFoundDesc: 'جرّب كلمة بحث أخرى',
    years: 'سنوات',
    projects: 'مشاريع',
    deselect: 'إلغاء الاختيار',
    selectCompare: 'اختر للمقارنة',
    categoryStats: 'إحصائيات التصنيف',
    totalSkills: 'إجمالي المهارات',
    avgProficiency: 'متوسط الإتقان',
    category: 'التصنيف',
    skillCount: 'عدد المهارات',
    projectsUsing: 'مشاريع تستخدم هذه المهارة',
  },
  education: {
    grade: 'التقدير',
    certificate: 'الشهادة',
    present: 'الحالي',
    totalDegrees: 'إجمالي الشهادات',
    certifications: 'الشهادات المهنية',
    yearsOfEducation: 'سنوات التعليم',
    courses: 'المقررات',
    details: 'التفاصيل',
    showDetails: 'عرض التفاصيل',
    hideDetails: 'إخفاء التفاصيل',
    gpa: 'المعدل',
    educationalJourney: 'رحلتي التعليمية',
  },
  projects: {
    all: 'الكل',
    noProjectsInCategory: 'لا توجد مشاريع في هذا التصنيف',
    viewDemo: 'معاينة',
    viewCode: 'الكود',
    viewDetails: 'عرض التفاصيل',
    statusFeatured: 'مميز',
    statusPublished: 'منشور',
    statusDraft: 'مسودة',
    statusInProgress: 'قيد التنفيذ',
    statusCompleted: 'مكتمل',
    technologies: 'التقنيات',
    images: 'صور',
    close: 'إغلاق',
    gridView: 'عرض شبكي',
    listView: 'عرض قائمة',
    projectDetails: 'تفاصيل المشروع',
    demoUrl: 'رابط المعاينة',
    repoUrl: 'رابط الكود',
    projectStats: 'إحصائيات المشروع',
    linesOfCode: 'أسطر الكود',
    completion: 'نسبة الإنجاز',
    teamSize: 'حجم الفريق',
    projectDuration: 'مدة المشروع',
    shareProject: 'مشاركة المشروع',
    shareOnTwitter: 'مشاركة على تويتر',
    shareOnLinkedIn: 'مشاركة على لينكدإن',
    copyLink: 'نسخ الرابط',
    copied: 'تم النسخ!',
    previousProject: 'المشروع السابق',
    nextProject: 'المشروع التالي',
    startProject: 'بداية المشروع',
    endProject: 'نهاية المشروع',
    featured: 'مميز',
    inProgress: 'قيد التنفيذ',
    completed: 'مكتمل',
    preview: 'معاينة',
    published: 'منشور',
    draft: 'مسودة',
    client: 'العميل',
    noProjects: 'لا توجد أعمال سابقة بعد',
    noTestimonials: 'لا توجد آراء عملاء بعد',
    noFAQ: 'لا توجد أسئلة شائعة بعد',
    noTimeline: 'لا يوجد جدول تسليم بعد',
    categoryWebDev: 'تطوير ويب',
    categoryApps: 'تطبيقات',
    categoryDesign: 'تصميم',
    myWork: 'أعمالي',
    tryAnotherCategory: 'جرّب تصنيفًا آخر',
  },
  footer: {
    rights: 'جميع الحقوق محفوظة',
    newsletter: 'النشرة البريدية',
    newsletterPlaceholder: 'بريدك الإلكتروني',
    subscribe: 'اشترك',
    quickLinks: 'روابط سريعة',
    quickStats: 'إحصائيات',
    madeWith: 'صنع بـ',
    using: 'باستخدام',
    contactUs: 'تواصل معنا',
    confirmEmail: 'تأكيد البريد',
    confirmEmailMsg: 'تم إرسال رابط التأكيد إلى بريدك الإلكتروني',
    subscribedSuccess: 'تم الاشتراك بنجاح!',
    invalidEmail: 'بريد إلكتروني غير صالح',
    followers: 'متابع',
    joinSubscribers: 'انضم إلى',
    subscribersCount: 'مشترك',
    madeWithLoveAndCoffee: 'صنع بـ ❤️ و ☕',
    projectsStat: 'مشروع',
    clientsStat: 'عميل',
    yearsStat: 'سنوات خبرة',
    backToTopAria: 'العودة للأعلى',
    yearsExperience: 'سنوات خبرة',
    projectsCompleted: 'مشروع منجز',
    happyClients: 'عميل سعيد',
    awards: 'جائزة',
    defaultSiteName: 'أحمد المطيري',
    defaultSiteDesc: 'مطوّر برمجيات متخصص في بناء تطبيقات ويب حديثة وسريعة',
    emailLabel: 'البريد الإلكتروني:',
    phoneLabel: 'الهاتف:',
    visitorNumber: 'زائر رقم',
    copyright: 'أحمد المطيري',
  },
  faq: {
    searchPlaceholder: 'ابحث في الأسئلة الشائعة...',
    noResults: 'لا توجد نتائج',
    noResultsDesc: 'جرّب كلمات بحث مختلفة',
    showingOf: 'عرض',
    questions: 'سؤال من',
    all: 'الكل',
    general: 'عام',
    pricing: 'التسعير',
    technical: 'تقني',
    support: 'الدعم',
    stillHaveQuestions: 'لا تزال لديك أسئلة؟',
    stillHaveQuestionsDesc: 'لم تجد إجابة لسؤالك؟ تواصل معنا وسنساعدك',
    contactUs: 'تواصل معنا',
    wasThisHelpful: 'هل كان هذا مفيدًا؟',
    yes: 'نعم',
    no: 'لا',
    thanksForFeedback: 'شكرًا لملاحظاتك!',
    feedbackRecorded: 'تم تسجيل ملاحظاتك',
  },
  newsletter: {
    title: 'النشرة البريدية',
    placeholder: 'أدخل بريدك الإلكتروني',
    subscribe: 'اشترك الآن',
    subscribed: 'مشترك بالفعل',
    privacyNotice: 'نحترم خصوصيتك ولن نشارك بريدك مع أي طرف ثالث',
    errorInvalid: 'بريد إلكتروني غير صالح',
    errorExists: 'هذا البريد مشترك بالفعل في النشرة البريدية',
    successMessage: 'تم الاشتراك بنجاح! تحقق من بريدك الإلكتروني للتأكيد.',
    doubleOptIn: 'تم إرسال رابط تأكيد إلى بريدك الإلكتروني. يرجى النقر عليه لتفعيل الاشتراك.',
    unsubscribe: 'إلغاء الاشتراك',
    unsubscribed: 'تم إلغاء الاشتراك بنجاح',
    enterEmail: 'يرجى إدخال البريد الإلكتروني',
    genericError: 'حدث خطأ، حاول مرة أخرى',
    connectionError: 'حدث خطأ في الاتصال',
    back: 'العودة',
    cardDescription: 'اشترك لتصلك آخر الأخبار والمقالات مباشرة',
    nameOptional: 'اسمك (اختياري)',
  },
  chat: {
    title: 'دردشة ذكية',
    placeholder: 'اكتب رسالتك...',
    thinkingPlaceholder: 'يفكر في الإجابة...',
    typing: 'يكتب',
    online: 'متصل الآن',
    soundOn: 'الصوت مفعل',
    soundOff: 'الصوت مكتوم',
    suggestedQ1: 'ما هي مهاراتك؟',
    suggestedQ2: 'كيف يمكنني التواصل؟',
    suggestedQ3: 'ما أحدث مشاريعك؟',
    suggestedQ4: 'ما هي خبراتك؟',
    now: 'الآن',
    minuteAgo: 'منذ دقيقة',
    minutesAgo: 'منذ دقائق',
    errorMessage: 'عذرًا، حدث خطأ. يرجى المحاولة لاحقًا.',
    welcomeMessage: 'مرحبًا! أنا المساعد الذكي لأحمد. كيف يمكنني مساعدتك؟',
  },
  notifications: {
    title: 'الإشعارات',
    markAllRead: 'قراءة الكل',
    clearAll: 'مسح الكل',
    empty: 'لا توجد إشعارات',
    emptyDesc: 'ستظهر الإشعارات الجديدة هنا',
    newMessage: 'رسالة تواصل جديدة',
    newMessageDesc: 'تلقيت رسالة جديدة من نموذج التواصل',
    newComment: 'تعليق جديد على المدونة',
    newCommentDesc: 'تم إضافة تعليق جديد على مقالك',
    systemUpdate: 'تحديث النظام',
    systemUpdateDesc: 'تم تحديث المنصة بنجاح',
    justNow: 'الآن',
    minuteAgo: 'منذ دقيقة',
    minutesAgo: 'منذ {count} دقائق',
    hourAgo: 'منذ ساعة',
    hoursAgo: 'منذ {count} ساعات',
  },
  loading: {
    heroSection: 'القسم الرئيسي',
    aboutSection: 'نبذة عني',
    skillsSection: 'المهارات',
    projectsSection: 'المشاريع',
    contactSection: 'التواصل',
    loadingContent: 'جارِ التحميل',
    preparingPlatform: 'تجهيز المنصة',
  },
  services: {
    myServices: 'خدماتي',
    learnMore: 'اعرف المزيد',
    startingFrom: 'يبدأ من',
    gridView: 'عرض شبكي',
    listView: 'عرض قائمة',
    process: 'مراحل العمل',
    discovery: 'اكتشاف',
    design: 'تصميم',
    development: 'تطوير',
    delivery: 'تسليم',
    keyFeatures: 'الميزات الرئيسية',
    technologies: 'التقنيات المستخدمة',
    startingPrice: 'السعر المبدئي',
    contactUs: 'تواصل معنا',
    serviceDetails: 'تفاصيل الخدمة',
    compareServices: 'مقارنة الخدمات',
    selectServicesToCompare: 'اختر 2-3 خدمات للمقارنة',
    compare: 'مقارنة',
    requestQuote: 'طلب عرض سعر',
    scope: 'النطاق',
    small: 'صغير',
    medium: 'متوسط',
    enterprise: 'مؤسسي',
    projectDetails: 'تفاصيل المشروع',
    timeline: 'الجدول الزمني',
    budget: 'الميزانية',
    description: 'الوصف',
    contactInfo: 'معلومات التواصل',
    next: 'التالي',
    previous: 'السابق',
    submit: 'إرسال',
    portfolio: 'أعمال سابقة',
    clientTestimonials: 'آراء العملاء',
    faq: 'الأسئلة الشائعة',
    deliveryTimeline: 'جدول التسليم',
    mostPopular: 'الأكثر طلباً',
    category: 'التصنيف',
    feature: 'الميزة',
    available: 'متاح',
    notAvailable: 'غير متاح',
    namePlaceholder: 'الاسم الكامل',
    emailPlaceholder: 'البريد الإلكتروني',
    phonePlaceholder: 'رقم الهاتف',
    descriptionPlaceholder: 'وصف المشروع...',
    week: 'أسبوع',
    weeks: 'أسابيع',
    month: 'شهر',
    months: 'أشهر',
    quoteSuccess: 'تم إرسال الطلب!',
    quoteSuccessMsg: 'سنتواصل معك قريباً لمناقشة تفاصيل المشروع',
    selectService: 'اختر الخدمة',
    step: 'خطوة',
    phone: 'الهاتف',
    budgetRange: 'نطاق الميزانية',
    timelineRange: 'الجدول الزمني',
    cancel: 'إلغاء',
    featured: 'مميز',
    published: 'منشور',
    draft: 'مسودة',
    inProgress: 'قيد التنفيذ',
    completed: 'مكتمل',
    client: 'العميل',
    noServices: 'لا توجد خدمات بعد',
    noTestimonials: 'لا توجد آراء عملاء بعد',
    noFAQ: 'لا توجد أسئلة شائعة بعد',
    noTimeline: 'لا يوجد جدول تسليم بعد',
    categoryWebDev: 'تطوير ويب',
    categoryApps: 'تطبيقات',
    categoryDesign: 'تصميم',
    categoryBackend: 'خلفية',
    categoryAI: 'ذكاء اصطناعي',
    categoryDevOps: 'بنية تحتية',
    noPortfolio: 'لا توجد أعمال سابقة بعد',
  },
  about: {
    getToKnowMe: 'تعرّف عليّ',
    readMore: 'اقرأ المزيد',
    readLess: 'عرض أقل',
    downloadVCard: 'تحميل بطاقة التواصل',
    techStack: 'التقنيات',
    proficiency: 'مستوى الإتقان',
    availableForWork: 'متاح للعمل',
    notAvailable: 'غير متاح حالياً',
    bookACall: 'احجز مكالمة',
    viewAllStats: 'عرض كل الإحصائيات',
    yearsExp: 'سنوات خبرة',
    projectsDone: 'مشاريع منجزة',
    happyClients: 'عملاء سعداء',
    awards: 'جوائز',
    statsDetail: 'تفاصيل الإحصائيات',
    category: 'التصنيف',
    beginner: 'مبتدئ',
    intermediate: 'متوسط',
    advanced: 'متقدم',
    expert: 'خبير',
    allStats: 'جميع الإحصائيات',
    statHistory: 'سجل الإحصائيات',
    codeSnippet: 'مقتطف كود',
    notAvailableForWork: 'غير متاح للعمل حالياً',
  },
  commandPalette: {
    title: 'لوحة الأوامر',
    placeholder: 'ابحث عن أمر أو انتقل إلى...',
    noResults: 'لا توجد نتائج',
    navigation: 'التنقل',
    actions: 'إجراءات سريعة',
    toggleTheme: 'تبديل السمة',
    switchLanguage: 'تبديل اللغة',
    scrollToSection: 'انتقال إلى',
  },
  themeCustomizer: {
    title: 'تخصيص المظهر',
    colorTheme: 'لون السمة',
    fontSize: 'حجم الخط',
    borderRadius: 'حواف مستديرة',
    layout: 'كثافة التخطيط',
    compact: 'مضغوط',
    normal: 'عادي',
    comfortable: 'مريح',
    animationSpeed: 'سرعة الحركة',
    reduced: 'مخفضة',
    enhanced: 'مُحسّنة',
    reset: 'إعادة تعيين',
    resetConfirm: 'هل تريد إعادة تعيين جميع التخصيصات؟',
  },
  resume: {
    profile: 'الملف الشخصي',
    experience: 'الخبرات',
    education: 'التعليم',
    skills: 'المهارات',
    downloadPdf: 'تحميل PDF',
    printResume: 'طباعة السيرة',
    shareResume: 'مشاركة السيرة',
    contactInfo: 'معلومات التواصل',
    summary: 'نبذة موجزة',
    workExperience: 'الخبرة العملية',
    educationHistory: 'المسار التعليمي',
    technicalSkills: 'المهارات التقنية',
    proficiency: 'الإتقان',
    years: 'سنوات',
    present: 'الحالي',
    noData: 'لا توجد بيانات',
  },
  hero: {
    yearsExperience: '+سنوات خبرة',
    projectsCompleted: '+مشروع منجز',
    happyClients: '+عميل سعيد',
    awardsWon: '+جائزة',
    viewResume: 'عرض السيرة الذاتية',
    topRated: 'الأعلى تقييماً',
    jss: '100% JSS',
    fiveStars: 'تقييم 5 نجوم',
    title1: 'مطوّر Full-Stack',
    title2: 'مصمم واجهات مستخدم',
    title3: 'خبير React & Next.js',
    exploreWork: 'استكشف أعمالي',
    contactMe: 'تواصل معي',
    defaultName: 'أحمد المطيري',
    externalLink: 'رابط خارجي',
    scrollDown: 'انتقل للأسفل',
    discover: 'اكتشف المزيد',
  },
  analytics: {
    title: 'إحصائيات الموقع',
    siteStats: 'إحصائيات الموقع',
    totalVisits: 'إجمالي الزيارات',
    visitsToday: 'زيارات اليوم',
    topPages: 'أكثر الصفحات زيارة',
    deviceBreakdown: 'الأجهزة المستخدمة',
    avgDuration: 'متوسط مدة الزيارة',
    bounceRate: 'معدل الارتداد',
    desktop: 'حاسوب',
    mobile: 'جوال',
    tablet: 'لوحي',
    unknown: 'غير معروف',
    lastUpdated: 'آخر تحديث',
    secondsAgo: 'منذ ثانية',
    minuteAgo: 'منذ دقيقة',
    minutesAgo: 'منذ دقائق',
    refresh: 'تحديث',
    noData: 'لا توجد بيانات',
    views: 'مشاهدة',
    seconds: 'ثانية',
    minute: 'دقيقة',
    minutes: 'دقائق',
    hour: 'ساعة',
  },
  testimonials: {
    badge: 'آراء العملاء',
    carouselView: 'شرائح',
    gridView: 'شبكة',
    previous: 'السابق',
    next: 'التالي',
    testimonial: 'الشهادة',
    sectionTitle: 'ماذا يقول عملائي',
    sectionSubtitle: 'تجارب حقيقية من عملاء سعداء',
  },
  cookie: {
    title: 'نستخدم ملفات تعريف الارتباط لتحسين تجربتك',
    description: 'نحتاج موافقتك لاستخدام ملفات تعريف الارتباط للتحليلات والتسويق',
    customize: 'تخصيص',
    acceptAll: 'قبول الكل',
    reject: 'رفض',
    rejectAll: 'رفض الكل',
    savePreferences: 'حفظ التفضيلات',
    privacySettings: 'إعدادات الخصوصية',
    necessary: 'ملفات ضرورية',
    necessaryDesc: 'مطلوبة لعمل الموقع بشكل صحيح',
    analytics: 'ملفات التحليلات',
    analyticsDesc: 'تساعدنا في فهم استخدام الموقع',
    marketing: 'ملفات التسويق',
    marketingDesc: 'تستخدم لعرض إعلانات مناسبة',
    required: 'مطلوب',
  },
  newsletterAdmin: {
    title: 'مشتركي النشرة البريدية',
    searchPlaceholder: 'ابحث بالبريد الإلكتروني أو الاسم...',
    export: 'تصدير',
    bulkActions: 'إجراءات جماعية',
    selectAll: 'تحديد الكل',
    active: 'نشط',
    inactive: 'غير نشط',
    all: 'الكل',
    email: 'البريد الإلكتروني',
    name: 'الاسم',
    source: 'المصدر',
    status: 'الحالة',
    subscribedDate: 'تاريخ الاشتراك',
    actions: 'إجراءات',
    totalSubscribers: 'إجمالي المشتركين',
    activeCount: 'نشط',
    inactiveCount: 'غير نشط',
    newThisMonth: 'جدد هذا الشهر',
    edit: 'تعديل',
    delete: 'حذف',
    deleteConfirm: 'هل أنت متأكد من حذف هذا المشترك؟',
    bulkDeleteConfirm: 'هل أنت متأكد من حذف المشتركين المحددين؟',
    markActive: 'تفعيل',
    markInactive: 'تعطيل',
    noSubscribers: 'لا يوجد مشتركون',
    refresh: 'تحديث',
    exportCSV: 'تصدير CSV',
    previous: 'السابق',
    next: 'التالي',
    showingOf: 'عرض',
    editSubscriber: 'تعديل المشترك',
    saveChanges: 'حفظ',
    cancel: 'إلغاء',
    namePlaceholder: 'اسم المشترك',
    allSources: 'جميع المصادر',
    selected: 'محدد',
    activate: 'تفعيل',
    deactivate: 'تعطيل',
    deleteSelected: 'حذف المحدد',
  },
  misc: {
    loading: 'جارِ التحميل...',
    error: 'حدث خطأ',
    retry: 'إعادة المحاولة',
    underConstruction: 'الموقع قيد الإنشاء',
    underConstructionMsg: 'يتم تجهيز المحتوى، تفضل بزيارتنا لاحقًا',
    adminHint: 'للوحة التحكم',
    theme: 'السمة',
    language: 'اللغة',
    darkMode: 'الوضع الداكن',
    lightMode: 'الوضع الفاتح',
    backToTop: 'العودة للأعلى',
    readingProgress: 'تقدم القراءة',
    printPage: 'طباعة الصفحة',
    sectionJump: 'انتقال سريع',
  },
  shortcuts: {
    title: 'اختصارات لوحة المفاتيح',
    sectionJump: 'الانتقال إلى قسم',
    themeToggle: 'تبديل السمة',
    languageToggle: 'تبديل اللغة',
    searchCommand: 'فتح لوحة الأوامر',
    printPage: 'طباعة الصفحة',
    adminPanel: 'لوحة التحكم',
    showShortcuts: 'عرض الاختصارات',
    scrollToTop: 'العودة للأعلى',
    closeWindow: 'إغلاق النافذة',
    sectionPrefix: 'قسم',
    hintMessage: 'اضغط ? لعرض الاختصارات المتاحة',
    dismissHint: 'إخفاء',
  },
  accessibility: {
    skipToContent: 'تخطي إلى المحتوى الرئيسي',
  },
};

const en: Translations = {
  nav: {
    home: 'Home',
    about: 'About',
    skills: 'Skills',
    projects: 'Projects',
    services: 'Services',
    experience: 'Experience',
    education: 'Education',
    blog: 'Blog',
    contact: 'Contact',
    faq: 'FAQ',
    testimonials: 'Testimonials',
  },
  sections: {
    hero: 'Home',
    about: 'About Me',
    skills: 'Skills',
    projects: 'Projects',
    services: 'Services',
    experience: 'Experience',
    education: 'Education',
    blog: 'Blog',
    contact: 'Contact Me',
    faq: 'FAQ',
    testimonials: 'Testimonials',
  },
  buttons: {
    readMore: 'Read More',
    viewAll: 'View All',
    sendMessage: 'Send Message',
    sending: 'Sending...',
    downloadCv: 'Download CV',
    hireMe: 'Hire Me',
    share: 'Share',
    copyLink: 'Copy Link',
    copied: 'Copied!',
    shareOnTwitter: 'Share on Twitter',
    shareOnLinkedIn: 'Share on LinkedIn',
    close: 'Close',
    viewProject: 'View Project',
    viewCertificate: 'Certificate',
  },
  blog: {
    readTime: 'Read time',
    minRead: 'min read',
    minReadSingular: 'min read',
    minReadDual: 'min read',
    minReadPlural: 'min read',
    tableOfContents: 'Table of Contents',
    relatedPosts: 'Related Posts',
    publishedOn: 'Published on',
    by: 'by',
    category: 'Category',
    backToBlog: 'Back to Blog',
    articles: 'articles',
    latest: 'Latest',
    searchPlaceholder: 'Search articles...',
    loadMore: 'Load More',
    noPostsFound: 'No Posts Found',
    noPostsDescription: 'No matching articles found. Try a different category or search term.',
    allCategories: 'All',
    featured: 'Featured',
    readMore: 'Read More',
    badge: 'Blog',
    categoryDevelopment: 'Development',
    categoryDesign: 'Design',
    categoryMarketing: 'Marketing',
    categoryBusiness: 'Business',
    categoryTech: 'Tech',
    categorySecurity: 'Security',
    categoryAI: 'AI',
  },
  contact: {
    name: 'Name',
    email: 'Email',
    subject: 'Subject',
    message: 'Message',
    namePlaceholder: 'Your full name',
    emailPlaceholder: 'example@email.com',
    subjectPlaceholder: 'Message subject',
    messagePlaceholder: 'Write your message here...',
    required: '*',
    followMe: 'Follow me on',
    letsWorkTogether: "Let's Work Together",
    availableForWork: 'Available for Work',
    currentlyAvailable: 'Currently available for new projects',
    notAvailable: 'Not available at the moment',
    successTitle: 'Sent Successfully!',
    successMessage: "Thanks for reaching out! I'll get back to you soon.",
    errorRequired: 'Please fill in the required fields',
    errorSending: 'An error occurred while sending. Please try again.',
    errorConnection: 'Connection error. Please try again later.',
    emailLabel: 'Email',
    phoneLabel: 'Phone',
    locationLabel: 'Location',
    avgResponseTime: 'Avg. response time: 24 hours',
    faqTitle: 'Frequently Asked Questions',
    faq1q: 'What is the typical project timeline?',
    faq1a: 'It varies by project scope, typically 2-8 weeks.',
    faq2q: 'Do you provide post-delivery support?',
    faq2a: 'Yes, we offer 3 months of free technical support after delivery.',
    faq3q: 'How can I start a project?',
    faq3a: 'Send a message using the form above and we\'ll get back to you within 24 hours.',
    thankYou: 'Thank you',
    mapTitle: 'My Location on Map',
    emailDetail: 'Send me an email and I\'ll respond as soon as possible',
    phoneDetail: 'Call me during business hours',
    locationDetail: 'My current work location',
    sendAnother: 'Send Another Message',
    validEmail: 'Please enter a valid email address',
    messageTooLong: 'Message is too long (max {max} characters)',
    maxRetriesExceeded: 'Maximum retry attempts reached',
    retryAfter: 'Retrying in',
    contactSeconds: 'seconds',
    responseTime: 'Usually responds within 2 hours',
    availableHours: 'Available 9 AM - 6 PM',
    phoneNumber: 'Phone Number',
    attachFile: 'Attach file',
    draftSaved: 'Auto-saved as draft',
  },
  experience: {
    current: 'Current',
    currentJob: 'Current Position',
    work: 'Work',
    education: 'Education',
    present: 'Present',
    achievements: 'Achievements',
    duration: 'Duration',
    details: 'Details',
    yearsAgo: 'years ago',
  },
  skills: {
    search: 'Search',
    searchPlaceholder: 'Search for a skill...',
    compare: 'Compare',
    compareSkills: 'Compare Skills',
    selectSkillsToCompare: 'Select two skills to compare',
    skillTree: 'Skill Tree',
    treeView: 'Tree View',
    cardView: 'Card View',
    barsView: 'Bars View',
    radarView: 'Radar View',
    yearsExperience: 'Years of Experience',
    relatedProjects: 'Related Projects',
    relatedSkills: 'Related Skills',
    proficiencyLevel: 'Proficiency Level',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    expert: 'Expert',
    skillDetails: 'Skill Details',
    noSkillsFound: 'No matching skills',
    noSkillsFoundDesc: 'Try a different search term',
    years: 'years',
    projects: 'projects',
    deselect: 'Deselect',
    selectCompare: 'Select to Compare',
    categoryStats: 'Category Stats',
    totalSkills: 'Total Skills',
    avgProficiency: 'Avg. Proficiency',
    category: 'Category',
    skillCount: 'Skill Count',
    projectsUsing: 'Projects using this skill',
  },
  education: {
    grade: 'Grade',
    certificate: 'Certificate',
    present: 'Present',
    totalDegrees: 'Total Degrees',
    certifications: 'Certifications',
    yearsOfEducation: 'Years of Education',
    courses: 'Courses',
    details: 'Details',
    showDetails: 'Show Details',
    hideDetails: 'Hide Details',
    gpa: 'GPA',
    educationalJourney: 'My Educational Journey',
  },
  projects: {
    all: 'All',
    noProjectsInCategory: 'No projects in this category',
    viewDemo: 'Demo',
    viewCode: 'Code',
    viewDetails: 'View Details',
    statusFeatured: 'Featured',
    statusPublished: 'Published',
    statusDraft: 'Draft',
    statusInProgress: 'In Progress',
    statusCompleted: 'Completed',
    technologies: 'Technologies',
    images: 'images',
    close: 'Close',
    gridView: 'Grid View',
    listView: 'List View',
    projectDetails: 'Project Details',
    demoUrl: 'Demo URL',
    repoUrl: 'Repo URL',
    projectStats: 'Project Stats',
    linesOfCode: 'Lines of Code',
    completion: 'Completion',
    teamSize: 'Team Size',
    projectDuration: 'Project Duration',
    shareProject: 'Share Project',
    shareOnTwitter: 'Share on Twitter',
    shareOnLinkedIn: 'Share on LinkedIn',
    copyLink: 'Copy Link',
    copied: 'Copied!',
    previousProject: 'Previous Project',
    nextProject: 'Next Project',
    startProject: 'Project Start',
    endProject: 'Project End',
    featured: 'Featured',
    inProgress: 'In Progress',
    completed: 'Completed',
    preview: 'Preview',
    published: 'Published',
    draft: 'Draft',
    client: 'Client',
    noProjects: 'No projects yet',
    noTestimonials: 'No testimonials yet',
    noFAQ: 'No FAQ yet',
    noTimeline: 'No delivery timeline yet',
    categoryWebDev: 'Web Development',
    categoryApps: 'Apps',
    categoryDesign: 'Design',
    myWork: 'My Work',
    tryAnotherCategory: 'Try another category',
  },
  footer: {
    rights: 'All rights reserved',
    newsletter: 'Newsletter',
    newsletterPlaceholder: 'Your email',
    subscribe: 'Subscribe',
    quickLinks: 'Quick Links',
    quickStats: 'Quick Stats',
    madeWith: 'Made with',
    using: 'using',
    contactUs: 'Contact Us',
    confirmEmail: 'Confirm Email',
    confirmEmailMsg: 'A confirmation link has been sent to your email',
    subscribedSuccess: 'Successfully subscribed!',
    invalidEmail: 'Invalid email address',
    followers: 'followers',
    joinSubscribers: 'Join',
    subscribersCount: 'subscribers',
    madeWithLoveAndCoffee: 'Made with ❤️ and ☕',
    projectsStat: 'Projects',
    clientsStat: 'Clients',
    yearsStat: 'Years Experience',
    backToTopAria: 'Back to top',
    yearsExperience: 'Years Experience',
    projectsCompleted: 'Projects Completed',
    happyClients: 'Happy Clients',
    awards: 'Awards',
    defaultSiteName: 'Ahmed Al-Mutairi',
    defaultSiteDesc: 'A specialized software developer focused on building modern and fast web applications',
    emailLabel: 'Email:',
    phoneLabel: 'Phone:',
    visitorNumber: 'Visitor #',
    copyright: 'Ahmed Al-Mutairi',
  },
  faq: {
    searchPlaceholder: 'Search frequently asked questions...',
    noResults: 'No results found',
    noResultsDesc: 'Try different search terms',
    showingOf: 'Showing',
    questions: 'of',
    all: 'All',
    general: 'General',
    pricing: 'Pricing',
    technical: 'Technical',
    support: 'Support',
    stillHaveQuestions: 'Still have questions?',
    stillHaveQuestionsDesc: "Didn't find what you were looking for? Contact us and we'll help",
    contactUs: 'Contact Us',
    wasThisHelpful: 'Was this helpful?',
    yes: 'Yes',
    no: 'No',
    thanksForFeedback: 'Thanks for your feedback!',
    feedbackRecorded: 'Your feedback has been recorded',
  },
  newsletter: {
    title: 'Newsletter',
    placeholder: 'Enter your email',
    subscribe: 'Subscribe Now',
    subscribed: 'Already subscribed',
    privacyNotice: 'We respect your privacy and will never share your email with any third party',
    errorInvalid: 'Invalid email address',
    errorExists: 'This email is already subscribed to the newsletter',
    successMessage: 'Successfully subscribed! Please check your email to confirm.',
    doubleOptIn: 'A confirmation link has been sent to your email. Please click it to activate your subscription.',
    unsubscribe: 'Unsubscribe',
    unsubscribed: 'Successfully unsubscribed',
    enterEmail: 'Please enter your email',
    genericError: 'An error occurred, please try again',
    connectionError: 'Connection error',
    back: 'Back',
    cardDescription: 'Subscribe to get the latest news and articles delivered directly',
    nameOptional: 'Your name (optional)',
  },
  chat: {
    title: 'AI Chat',
    placeholder: 'Type your message...',
    thinkingPlaceholder: 'Thinking...',
    typing: 'Typing',
    online: 'Online now',
    soundOn: 'Sound on',
    soundOff: 'Sound off',
    suggestedQ1: 'What are your skills?',
    suggestedQ2: 'How can I contact you?',
    suggestedQ3: 'What are your latest projects?',
    suggestedQ4: 'What is your experience?',
    now: 'Now',
    minuteAgo: '1 min ago',
    minutesAgo: 'min ago',
    errorMessage: 'Sorry, an error occurred. Please try again later.',
    welcomeMessage: 'Hello! I am Ahmed\'s smart assistant. How can I help you?',
  },
  notifications: {
    title: 'Notifications',
    markAllRead: 'Mark all read',
    clearAll: 'Clear all',
    empty: 'No notifications',
    emptyDesc: 'New notifications will appear here',
    newMessage: 'New Contact Message',
    newMessageDesc: 'You received a new message from the contact form',
    newComment: 'New Blog Comment',
    newCommentDesc: 'A new comment was added to your post',
    systemUpdate: 'System Update',
    systemUpdateDesc: 'The platform has been updated successfully',
    justNow: 'Just now',
    minuteAgo: '1 min ago',
    minutesAgo: '{count} min ago',
    hourAgo: '1 hour ago',
    hoursAgo: '{count} hours ago',
  },
  loading: {
    heroSection: 'Hero Section',
    aboutSection: 'About Me',
    skillsSection: 'Skills',
    projectsSection: 'Projects',
    contactSection: 'Contact',
    loadingContent: 'Loading',
    preparingPlatform: 'Preparing Platform',
  },
  services: {
    myServices: 'My Services',
    learnMore: 'Learn More',
    startingFrom: 'Starting from',
    gridView: 'Grid View',
    listView: 'List View',
    process: 'Work Process',
    discovery: 'Discovery',
    design: 'Design',
    development: 'Development',
    delivery: 'Delivery',
    keyFeatures: 'Key Features',
    technologies: 'Technologies Used',
    startingPrice: 'Starting Price',
    contactUs: 'Contact Us',
    serviceDetails: 'Service Details',
    compareServices: 'Compare Services',
    selectServicesToCompare: 'Select 2-3 services to compare',
    compare: 'Compare',
    requestQuote: 'Request Quote',
    scope: 'Scope',
    small: 'Small',
    medium: 'Medium',
    enterprise: 'Enterprise',
    projectDetails: 'Project Details',
    timeline: 'Timeline',
    budget: 'Budget',
    description: 'Description',
    contactInfo: 'Contact Info',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    portfolio: 'Portfolio',
    clientTestimonials: 'Client Testimonials',
    faq: 'FAQ',
    deliveryTimeline: 'Delivery Timeline',
    mostPopular: 'Most Popular',
    category: 'Category',
    feature: 'Feature',
    available: 'Available',
    notAvailable: 'Not Available',
    namePlaceholder: 'Full name',
    emailPlaceholder: 'Email address',
    phonePlaceholder: 'Phone number',
    descriptionPlaceholder: 'Project description...',
    week: 'week',
    weeks: 'weeks',
    month: 'month',
    months: 'months',
    quoteSuccess: 'Quote Requested!',
    quoteSuccessMsg: 'We\'ll get back to you soon to discuss project details',
    selectService: 'Select Service',
    step: 'Step',
    phone: 'Phone',
    budgetRange: 'Budget Range',
    timelineRange: 'Timeline',
    cancel: 'Cancel',
    featured: 'Featured',
    published: 'Published',
    draft: 'Draft',
    inProgress: 'In Progress',
    completed: 'Completed',
    client: 'Client',
    noServices: 'No services yet',
    noTestimonials: 'No testimonials yet',
    noFAQ: 'No FAQ yet',
    noTimeline: 'No delivery timeline yet',
    categoryWebDev: 'Web Development',
    categoryApps: 'Apps',
    categoryDesign: 'Design',
    categoryBackend: 'Backend',
    categoryAI: 'AI/ML',
    categoryDevOps: 'DevOps',
    noPortfolio: 'No portfolio items yet',
  },
  about: {
    getToKnowMe: 'Get to know me',
    readMore: 'Read More',
    readLess: 'Read Less',
    downloadVCard: 'Download vCard',
    techStack: 'Tech Stack',
    proficiency: 'Proficiency',
    availableForWork: 'Available for Work',
    notAvailable: 'Not Available Right Now',
    bookACall: 'Book a Call',
    viewAllStats: 'View All Stats',
    yearsExp: 'years exp',
    projectsDone: 'Projects Done',
    happyClients: 'Happy Clients',
    awards: 'Awards',
    statsDetail: 'Stats Detail',
    category: 'Category',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    expert: 'Expert',
    allStats: 'All Stats',
    statHistory: 'Stats History',
    codeSnippet: 'Code Snippet',
    notAvailableForWork: 'Not Available for Work',
  },
  commandPalette: {
    title: 'Command Palette',
    placeholder: 'Search for a command or navigate to...',
    noResults: 'No results found',
    navigation: 'Navigation',
    actions: 'Quick Actions',
    toggleTheme: 'Toggle Theme',
    switchLanguage: 'Switch Language',
    scrollToSection: 'Go to',
  },
  themeCustomizer: {
    title: 'Customize Theme',
    colorTheme: 'Color Theme',
    fontSize: 'Font Size',
    borderRadius: 'Border Radius',
    layout: 'Layout Density',
    compact: 'Compact',
    normal: 'Normal',
    comfortable: 'Comfortable',
    animationSpeed: 'Animation Speed',
    reduced: 'Reduced',
    enhanced: 'Enhanced',
    reset: 'Reset',
    resetConfirm: 'Reset all customizations?',
  },
  resume: {
    profile: 'Profile',
    experience: 'Experience',
    education: 'Education',
    skills: 'Skills',
    downloadPdf: 'Download PDF',
    printResume: 'Print Resume',
    shareResume: 'Share Resume',
    contactInfo: 'Contact Info',
    summary: 'Summary',
    workExperience: 'Work Experience',
    educationHistory: 'Education History',
    technicalSkills: 'Technical Skills',
    proficiency: 'Proficiency',
    years: 'years',
    present: 'Present',
    noData: 'No data available',
  },
  hero: {
    yearsExperience: 'Years Experience',
    projectsCompleted: 'Projects Completed',
    happyClients: 'Happy Clients',
    awardsWon: 'Awards Won',
    viewResume: 'View Resume',
    topRated: 'Top Rated',
    jss: '100% JSS',
    fiveStars: '5★ Reviews',
    title1: 'Full-Stack Developer',
    title2: 'UI/UX Designer',
    title3: 'React & Next.js Expert',
    exploreWork: 'Explore My Work',
    contactMe: 'Contact Me',
    defaultName: 'Ahmed Al-Mutairi',
    externalLink: 'External Link',
    scrollDown: 'Scroll down',
    discover: 'Discover',
  },
  analytics: {
    title: 'Site Stats',
    siteStats: 'Site Statistics',
    totalVisits: 'Total Visits',
    visitsToday: 'Visits Today',
    topPages: 'Top Pages',
    deviceBreakdown: 'Device Breakdown',
    avgDuration: 'Avg. Duration',
    bounceRate: 'Bounce Rate',
    desktop: 'Desktop',
    mobile: 'Mobile',
    tablet: 'Tablet',
    unknown: 'Unknown',
    lastUpdated: 'Last updated',
    secondsAgo: 'seconds ago',
    minuteAgo: 'minute ago',
    minutesAgo: 'minutes ago',
    refresh: 'Refresh',
    noData: 'No data available',
    views: 'views',
    seconds: 'seconds',
    minute: 'minute',
    minutes: 'minutes',
    hour: 'hour',
  },
  testimonials: {
    badge: 'Client Testimonials',
    carouselView: 'Carousel',
    gridView: 'Grid',
    previous: 'Previous',
    next: 'Next',
    testimonial: 'Testimonial',
    sectionTitle: 'What My Clients Say',
    sectionSubtitle: 'Real experiences from happy clients',
  },
  cookie: {
    title: 'We use cookies to improve your experience',
    description: 'We need your consent to use analytics and marketing cookies',
    customize: 'Customize',
    acceptAll: 'Accept All',
    reject: 'Reject',
    rejectAll: 'Reject All',
    savePreferences: 'Save Preferences',
    privacySettings: 'Privacy Settings',
    necessary: 'Necessary Cookies',
    necessaryDesc: 'Required for the website to function properly',
    analytics: 'Analytics Cookies',
    analyticsDesc: 'Help us understand how the site is used',
    marketing: 'Marketing Cookies',
    marketingDesc: 'Used to display relevant advertisements',
    required: 'Required',
  },
  newsletterAdmin: {
    title: 'Newsletter Subscribers',
    searchPlaceholder: 'Search by email or name...',
    export: 'Export',
    bulkActions: 'Bulk Actions',
    selectAll: 'Select All',
    active: 'Active',
    inactive: 'Inactive',
    all: 'All',
    email: 'Email',
    name: 'Name',
    source: 'Source',
    status: 'Status',
    subscribedDate: 'Subscribed Date',
    actions: 'Actions',
    totalSubscribers: 'Total Subscribers',
    activeCount: 'Active',
    inactiveCount: 'Inactive',
    newThisMonth: 'New This Month',
    edit: 'Edit',
    delete: 'Delete',
    deleteConfirm: 'Are you sure you want to delete this subscriber?',
    bulkDeleteConfirm: 'Are you sure you want to delete the selected subscribers?',
    markActive: 'Mark Active',
    markInactive: 'Mark Inactive',
    noSubscribers: 'No subscribers found',
    refresh: 'Refresh',
    exportCSV: 'Export CSV',
    previous: 'Previous',
    next: 'Next',
    showingOf: 'Showing',
    editSubscriber: 'Edit Subscriber',
    saveChanges: 'Save',
    cancel: 'Cancel',
    namePlaceholder: 'Subscriber name',
    allSources: 'All Sources',
    selected: 'selected',
    activate: 'Activate',
    deactivate: 'Deactivate',
    deleteSelected: 'Delete Selected',
  },
  misc: {
    loading: 'Loading...',
    error: 'An error occurred',
    retry: 'Retry',
    underConstruction: 'Under Construction',
    underConstructionMsg: 'Content is being prepared, please visit us later',
    adminHint: 'for Admin Panel',
    theme: 'Theme',
    language: 'Language',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    backToTop: 'Back to top',
    readingProgress: 'Reading Progress',
    printPage: 'Print Page',
    sectionJump: 'Quick Section Jump',
  },
  shortcuts: {
    title: 'Keyboard Shortcuts',
    sectionJump: 'Jump to section',
    themeToggle: 'Toggle Theme',
    languageToggle: 'Switch Language',
    searchCommand: 'Open Command Palette',
    printPage: 'Print Page',
    adminPanel: 'Admin Panel',
    showShortcuts: 'Show Shortcuts',
    scrollToTop: 'Scroll to Top',
    closeWindow: 'Close Window',
    sectionPrefix: 'Section',
    hintMessage: 'Press ? to see available shortcuts',
    dismissHint: 'Dismiss',
  },
  accessibility: {
    skipToContent: 'Skip to main content',
  },
};

const translations: Record<Language, Translations> = { ar, en };

export function getTranslations(lang: Language): Translations {
  return translations[lang] || translations.ar;
}

export function getDirection(lang: Language): 'rtl' | 'ltr' {
  return lang === 'ar' ? 'rtl' : 'ltr';
}
