import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Clearing and re-seeding database...')

  // Delete in correct order (respecting foreign keys)
  await prisma.auditLog.deleteMany({})
  await prisma.sectionItem.deleteMany({})
  await prisma.section.deleteMany({})
  await prisma.siteSetting.deleteMany({})
  await prisma.socialLink.deleteMany({})
  await prisma.navigation.deleteMany({})
  await prisma.theme.deleteMany({})
  await prisma.sEOSetting.deleteMany({})
  await prisma.font.deleteMany({})
  await prisma.session.deleteMany({})
  await prisma.user.deleteMany({})

  console.log('✅ Cleared existing data')

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin@123456', 12)
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@platform.com',
      name: 'أحمد المطيري',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
    }
  })
  console.log('✅ Admin user created:', adminUser.email)

  // Create site settings
  const settings = [
    { key: 'site_name', value: 'أحمد المطيري', type: 'text', group: 'general', label: 'اسم الموقع' },
    { key: 'site_title', value: 'مطوّر برمجيات | خبير تقني', type: 'text', group: 'general', label: 'عنوان الموقع' },
    { key: 'site_description', value: 'مطوّر برمجيات متخصص في بناء تطبيقات ويب حديثة وسريعة باستخدام أحدث التقنيات', type: 'text', group: 'general', label: 'وصف الموقع' },
    { key: 'site_url', value: 'https://ahmed-dev.com', type: 'text', group: 'general', label: 'رابط الموقع' },
    { key: 'site_logo', value: '', type: 'text', group: 'general', label: 'شعار الموقع' },
    { key: 'owner_name', value: 'أحمد المطيري', type: 'text', group: 'general', label: 'اسم المالك' },
    { key: 'owner_title', value: 'مطوّر برمجيات Full-Stack', type: 'text', group: 'general', label: 'المسمى الوظيفي' },
    { key: 'owner_bio', value: 'أنا مطوّر برمجيات شغوف بأكثر من 8 سنوات من الخبرة في بناء تطبيقات ويب مبتكرة. أتخصص في React و Next.js و Node.js وأسعى دائمًا لتقديم حلول تقنية متقدمة تلبي احتياجات العملاء وتتجاوز توقعاتهم.', type: 'text', group: 'general', label: 'نبذة عن المالك' },
    { key: 'owner_avatar', value: '', type: 'text', group: 'general', label: 'صورة المالك' },
    { key: 'owner_email', value: 'ahmed@ahmed-dev.com', type: 'text', group: 'contact', label: 'البريد الإلكتروني' },
    { key: 'owner_phone', value: '+966 50 123 4567', type: 'text', group: 'contact', label: 'رقم الهاتف' },
    { key: 'owner_location', value: 'الرياض، المملكة العربية السعودية', type: 'text', group: 'contact', label: 'الموقع' },
    { key: 'hero_title', value: 'مرحبًا، أنا أحمد', type: 'text', group: 'general', label: 'عنوان البطل' },
    { key: 'hero_subtitle', value: 'أبني تجارب رقمية استثنائية', type: 'text', group: 'general', label: 'عنوان البطل الفرعي' },
    { key: 'hero_cta_primary', value: 'استكشف أعمالي', type: 'text', group: 'general', label: 'زر الإجراء الرئيسي' },
    { key: 'hero_cta_secondary', value: 'تواصل معي', type: 'text', group: 'general', label: 'زر الإجراء الثانوي' },
    { key: 'stats_years', value: '8', type: 'number', group: 'general', label: 'سنوات الخبرة' },
    { key: 'stats_projects', value: '150', type: 'number', group: 'general', label: 'المشاريع المنجزة' },
    { key: 'stats_clients', value: '80', type: 'number', group: 'general', label: 'العملاء' },
    { key: 'stats_awards', value: '12', type: 'number', group: 'general', label: 'الجوائز' },
    { key: 'resume_url', value: '', type: 'text', group: 'general', label: 'رابط السيرة الذاتية' },
    { key: 'footer_text', value: '© 2024 أحمد المطيري. جميع الحقوق محفوظة.', type: 'text', group: 'general', label: 'نص التذييل' },
    { key: 'contact_address', value: 'الرياض، المملكة العربية السعودية', type: 'text', group: 'contact', label: 'العنوان' },
    { key: 'contact_email', value: 'ahmed@ahmed-dev.com', type: 'text', group: 'contact', label: 'بريد التواصل' },
    { key: 'contact_phone', value: '+966 50 123 4567', type: 'text', group: 'contact', label: 'هاتف التواصل' },
  ]

  for (const setting of settings) {
    await prisma.siteSetting.create({ data: setting })
  }

  // Create social links
  const socialLinks = [
    { platform: 'github', url: 'https://github.com/ahmed-dev', icon: 'Github', order: 1 },
    { platform: 'linkedin', url: 'https://linkedin.com/in/ahmed-dev', icon: 'Linkedin', order: 2 },
    { platform: 'twitter', url: 'https://twitter.com/ahmed_dev', icon: 'Twitter', order: 3 },
    { platform: 'instagram', url: 'https://instagram.com/ahmed_dev', icon: 'Instagram', order: 4 },
    { platform: 'youtube', url: 'https://youtube.com/@ahmed-dev', icon: 'Youtube', order: 5 },
  ]

  for (const link of socialLinks) {
    await prisma.socialLink.create({ data: link })
  }

  // Create navigation items
  const navItems = [
    { label: 'الرئيسية', url: '#hero', icon: 'Home', order: 1, type: 'main' },
    { label: 'عني', url: '#about', icon: 'User', order: 2, type: 'main' },
    { label: 'المهارات', url: '#skills', icon: 'Code2', order: 3, type: 'main' },
    { label: 'المشاريع', url: '#projects', icon: 'Briefcase', order: 4, type: 'main' },
    { label: 'الخدمات', url: '#services', icon: 'Settings', order: 5, type: 'main' },
    { label: 'الخبرات', url: '#experience', icon: 'Award', order: 6, type: 'main' },
    { label: 'الآراء', url: '#testimonials', icon: 'MessageSquare', order: 7, type: 'main' },
    { label: 'تواصل', url: '#contact', icon: 'Mail', order: 8, type: 'main' },
  ]

  for (const nav of navItems) {
    await prisma.navigation.create({ data: nav })
  }

  // Create sections
  const heroSection = await prisma.section.create({
    data: {
      type: 'hero',
      title: 'الرئيسية',
      subtitle: 'مرحبًا بكم في موقعي الشخصي',
      config: JSON.stringify({ layout: 'fullwidth', animation: 'fade', showParticles: true, typingEffect: true }),
      content: JSON.stringify({
        title: 'مرحبًا، أنا أحمد',
        subtitle: 'أبني تجارب رقمية استثنائية',
        typingTexts: ['مطوّر Full-Stack', 'مصمم واجهات مستخدم', 'خبير React & Next.js', 'محب للتقنية والابتكار'],
        ctaPrimary: { text: 'استكشف أعمالي', url: '#projects' },
        ctaSecondary: { text: 'تواصل معي', url: '#contact' },
        avatarUrl: '',
      }),
      order: 1,
      isVisible: true,
      layout: 'fullwidth',
      animation: 'fade',
      bgType: 'particle',
    },
  })

  const aboutSection = await prisma.section.create({
    data: {
      type: 'about',
      title: 'عني',
      subtitle: 'تعرف عليّ أكثر',
      config: JSON.stringify({ layout: 'split', animation: 'slide', showStats: true, showImage: true }),
      content: JSON.stringify({
        bio: 'أنا مطوّر برمجيات شغوف بأكثر من 8 سنوات من الخبرة في بناء تطبيقات ويب مبتكرة. أتخصص في React و Next.js و Node.js وأسعى دائمًا لتقديم حلول تقنية متقدمة تلبي احتياجات العملاء وتتجاوز توقعاتهم. أحب التعلم المستمر ومشاركة المعرفة مع مجتمع المطورين.',
        stats: [
          { label: 'سنوات الخبرة', value: 8, icon: 'Calendar' },
          { label: 'مشاريع منجزة', value: 150, icon: 'Briefcase' },
          { label: 'عميل سعيد', value: 80, icon: 'Users' },
          { label: 'جائزة', value: 12, icon: 'Award' },
        ],
        imageUrl: '',
      }),
      order: 2,
      isVisible: true,
      layout: 'split',
      animation: 'slide',
      bgType: 'default',
    },
  })

  const skillsSection = await prisma.section.create({
    data: {
      type: 'skills',
      title: 'المهارات',
      subtitle: 'تقنيات أتقنها',
      config: JSON.stringify({ layout: 'grid', animation: 'fade', showProgress: true, columns: 3 }),
      content: JSON.stringify({ showCategory: true }),
      order: 3,
      isVisible: true,
      layout: 'grid',
      animation: 'fade',
      bgType: 'gradient',
      bgValue: 'from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20',
    },
  })

  await prisma.section.create({
    data: {
      type: 'projects',
      title: 'المشاريع',
      subtitle: 'أحدث أعمالي',
      config: JSON.stringify({ layout: 'grid', animation: 'zoom', columns: 3, showFilter: true }),
      content: JSON.stringify({ showCategory: true }),
      order: 4,
      isVisible: true,
      layout: 'grid',
      animation: 'zoom',
      bgType: 'default',
    },
  })

  await prisma.section.create({
    data: {
      type: 'services',
      title: 'الخدمات',
      subtitle: 'كيف يمكنني مساعدتك',
      config: JSON.stringify({ layout: 'cards', animation: 'fade', columns: 3 }),
      content: JSON.stringify({}),
      order: 5,
      isVisible: true,
      layout: 'cards',
      animation: 'fade',
      bgType: 'gradient',
      bgValue: 'from-teal-50/50 to-emerald-50/50 dark:from-teal-950/20 dark:to-emerald-950/20',
    },
  })

  await prisma.section.create({
    data: {
      type: 'experience',
      title: 'الخبرات',
      subtitle: 'مسيرتي المهنية',
      config: JSON.stringify({ layout: 'timeline', animation: 'slide' }),
      content: JSON.stringify({}),
      order: 6,
      isVisible: true,
      layout: 'timeline',
      animation: 'slide',
      bgType: 'default',
    },
  })

  await prisma.section.create({
    data: {
      type: 'testimonials',
      title: 'آراء العملاء',
      subtitle: 'ماذا يقولون عني',
      config: JSON.stringify({ layout: 'carousel', animation: 'fade', autoplay: true }),
      content: JSON.stringify({}),
      order: 7,
      isVisible: true,
      layout: 'carousel',
      animation: 'fade',
      bgType: 'gradient',
      bgValue: 'from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20',
    },
  })

  await prisma.section.create({
    data: {
      type: 'faq',
      title: 'الأسئلة الشائعة',
      subtitle: 'إجابات على أسئلتكم',
      config: JSON.stringify({ layout: 'accordion', animation: 'fade' }),
      content: JSON.stringify({}),
      order: 8,
      isVisible: true,
      layout: 'accordion',
      animation: 'fade',
      bgType: 'default',
    },
  })

  await prisma.section.create({
    data: {
      type: 'blog',
      title: 'المدونة',
      subtitle: 'أحدث المقالات',
      config: JSON.stringify({ layout: 'grid', animation: 'fade', columns: 3, maxPosts: 3 }),
      content: JSON.stringify({}),
      order: 9,
      isVisible: true,
      layout: 'grid',
      animation: 'fade',
      bgType: 'gradient',
      bgValue: 'from-teal-50/50 to-emerald-50/50 dark:from-teal-950/20 dark:to-emerald-950/20',
    },
  })

  await prisma.section.create({
    data: {
      type: 'contact',
      title: 'تواصل معي',
      subtitle: 'لنعمل معًا',
      config: JSON.stringify({ layout: 'split', animation: 'slide', showForm: true, showInfo: true }),
      content: JSON.stringify({
        email: 'ahmed@ahmed-dev.com',
        phone: '+966 50 123 4567',
        location: 'الرياض، المملكة العربية السعودية',
      }),
      order: 10,
      isVisible: true,
      layout: 'split',
      animation: 'slide',
      bgType: 'default',
    },
  })

  // Create skill items
  const skillItems = [
    { sectionId: skillsSection.id, type: 'skill', title: 'React', subtitle: 'واجهات المستخدم', description: 'مكتبة React لبناء واجهات مستخدم تفاعلية', icon: 'Atom', order: 1, tags: JSON.stringify(['frontend', 'react']), config: JSON.stringify({ level: 95, color: '#61DAFB', category: 'frontend' }) },
    { sectionId: skillsSection.id, type: 'skill', title: 'Next.js', subtitle: 'إطار عمل متكامل', description: 'إطار عمل Next.js للتطبيقات المتكاملة', icon: 'Globe', order: 2, tags: JSON.stringify(['frontend', 'fullstack']), config: JSON.stringify({ level: 92, color: '#000000', category: 'frontend' }) },
    { sectionId: skillsSection.id, type: 'skill', title: 'TypeScript', subtitle: 'لغة برمجة آمنة', description: 'TypeScript للكتابة الآمنة', icon: 'FileCode2', order: 3, tags: JSON.stringify(['language']), config: JSON.stringify({ level: 90, color: '#3178C6', category: 'language' }) },
    { sectionId: skillsSection.id, type: 'skill', title: 'Node.js', subtitle: 'الخادم الخلفي', description: 'بيئة Node.js للخوادم', icon: 'Server', order: 4, tags: JSON.stringify(['backend']), config: JSON.stringify({ level: 88, color: '#339933', category: 'backend' }) },
    { sectionId: skillsSection.id, type: 'skill', title: 'Python', subtitle: 'لغة برمجة متعددة', description: 'Python للبرمجة المتعددة الاستخدامات', icon: 'Terminal', order: 5, tags: JSON.stringify(['language', 'backend']), config: JSON.stringify({ level: 82, color: '#3776AB', category: 'backend' }) },
    { sectionId: skillsSection.id, type: 'skill', title: 'PostgreSQL', subtitle: 'قواعد البيانات', description: 'قواعد بيانات PostgreSQL', icon: 'Database', order: 6, tags: JSON.stringify(['database']), config: JSON.stringify({ level: 85, color: '#4169E1', category: 'database' }) },
    { sectionId: skillsSection.id, type: 'skill', title: 'Docker', subtitle: 'الحاويات والنشر', description: 'Docker للحاويات والنشر', icon: 'Container', order: 7, tags: JSON.stringify(['devops']), config: JSON.stringify({ level: 78, color: '#2496ED', category: 'devops' }) },
    { sectionId: skillsSection.id, type: 'skill', title: 'AWS', subtitle: 'الحوسبة السحابية', description: 'خدمات AWS السحابية', icon: 'Cloud', order: 8, tags: JSON.stringify(['devops', 'cloud']), config: JSON.stringify({ level: 75, color: '#FF9900', category: 'devops' }) },
    { sectionId: skillsSection.id, type: 'skill', title: 'Tailwind CSS', subtitle: 'تصميم الواجهات', description: 'إطار Tailwind CSS للتصميم', icon: 'Paintbrush', order: 9, tags: JSON.stringify(['frontend', 'design']), config: JSON.stringify({ level: 93, color: '#06B6D4', category: 'frontend' }) },
    { sectionId: skillsSection.id, type: 'skill', title: 'GraphQL', subtitle: 'واجهة برمجة التطبيقات', description: 'GraphQL لواجهات API', icon: 'Workflow', order: 10, tags: JSON.stringify(['backend', 'api']), config: JSON.stringify({ level: 80, color: '#E10098', category: 'backend' }) },
  ]

  for (const item of skillItems) {
    await prisma.sectionItem.create({ data: item })
  }

  // Create project items
  const projectsSection = await prisma.section.findFirst({ where: { type: 'projects' } })
  if (projectsSection) {
    const projectItems = [
      { sectionId: projectsSection.id, type: 'project', title: 'منصة التجارة الإلكترونية', subtitle: 'متجر إلكتروني متكامل', description: 'منصة تجارة إلكترونية متكاملة تدعم آلاف المنتجات مع نظام دفع آمن ولوحة تحكم متقدمة', imageUrl: '', icon: 'ShoppingCart', link: '#', linkText: 'مشاهدة المشروع', order: 1, tags: JSON.stringify(['Next.js', 'Node.js', 'PostgreSQL', 'Stripe']), config: JSON.stringify({ category: 'تطبيق ويب', featured: true }) },
      { sectionId: projectsSection.id, type: 'project', title: 'تطبيق إدارة المهام', subtitle: 'أداة إنتاجية ذكية', description: 'تطبيق لإدارة المهام والمشاريع مع واجهة سحب وإفلات ودعم فرق العمل المتعددة', imageUrl: '', icon: 'CheckSquare', link: '#', linkText: 'مشاهدة المشروع', order: 2, tags: JSON.stringify(['React', 'TypeScript', 'Firebase']), config: JSON.stringify({ category: 'تطبيق ويب', featured: true }) },
      { sectionId: projectsSection.id, type: 'project', title: 'لوحة تحليلات البيانات', subtitle: 'تحليلات متقدمة', description: 'لوحة تحكم لتحليل البيانات مع رسوم بيانية تفاعلية وتقارير مخصصة', imageUrl: '', icon: 'BarChart3', link: '#', linkText: 'مشاهدة المشروع', order: 3, tags: JSON.stringify(['React', 'D3.js', 'Python', 'FastAPI']), config: JSON.stringify({ category: 'تحليلات', featured: false }) },
      { sectionId: projectsSection.id, type: 'project', title: 'تطبيق موبايل للصحة', subtitle: 'تتبع الصحة واللياقة', description: 'تطبيق موبايل لتتبع التمارين والنظام الغذائي مع توصيات ذكية بالذكاء الاصطناعي', imageUrl: '', icon: 'Heart', link: '#', linkText: 'مشاهدة المشروع', order: 4, tags: JSON.stringify(['React Native', 'Node.js', 'MongoDB']), config: JSON.stringify({ category: 'تطبيق موبايل', featured: true }) },
      { sectionId: projectsSection.id, type: 'project', title: 'نظام إدارة المحتوى', subtitle: 'CMS مخصص', description: 'نظام إدارة محتوى مخصص مع محرر نصوص غني ونظام صلاحيات متقدم', imageUrl: '', icon: 'LayoutDashboard', link: '#', linkText: 'مشاهدة المشروع', order: 5, tags: JSON.stringify(['Next.js', 'Prisma', 'PostgreSQL']), config: JSON.stringify({ category: 'تطبيق ويب', featured: false }) },
      { sectionId: projectsSection.id, type: 'project', title: 'منصة التعلم الإلكتروني', subtitle: 'تعلم تفاعلي', description: 'منصة تعليمية تدعم الدورات التفاعلية والاختبارات والشهادات', imageUrl: '', icon: 'GraduationCap', link: '#', linkText: 'مشاهدة المشروع', order: 6, tags: JSON.stringify(['Next.js', 'WebRTC', 'Redis']), config: JSON.stringify({ category: 'تطبيق ويب', featured: true }) },
    ]

    for (const item of projectItems) {
      await prisma.sectionItem.create({ data: item })
    }
  }

  // Create service items
  const servicesSection = await prisma.section.findFirst({ where: { type: 'services' } })
  if (servicesSection) {
    const serviceItems = [
      { sectionId: servicesSection.id, type: 'service', title: 'تطوير تطبيقات الويب', description: 'بناء تطبيقات ويب حديثة وسريعة باستخدام أحدث التقنيات مثل React و Next.js', icon: 'Globe', order: 1, config: JSON.stringify({ features: ['تطبيقات SPA و SSR', 'تصميم متجاوب', 'تحسين الأداء', 'أمان متقدم'] }) },
      { sectionId: servicesSection.id, type: 'service', title: 'تطوير تطبيقات الموبايل', description: 'تطوير تطبيقات موبايل متعددة المنصات باستخدام React Native', icon: 'Smartphone', order: 2, config: JSON.stringify({ features: ['تطبيقات iOS و Android', 'واجهة مستخدم سلسة', 'إشعارات فورية', 'تكامل API'] }) },
      { sectionId: servicesSection.id, type: 'service', title: 'تصميم واجهات المستخدم', description: 'تصميم واجهات مستخدم جذابة وسهلة الاستخدام مع تجربة مستخدم ممتازة', icon: 'Palette', order: 3, config: JSON.stringify({ features: ['تصميم UI/UX', 'نماذج أولية', 'تصميم متجاوب', 'اختبار قابلية الاستخدام'] }) },
      { sectionId: servicesSection.id, type: 'service', title: 'الاستشارات التقنية', description: 'تقديم استشارات تقنية متخصصة لمساعدتك في اتخاذ القرارات الصحيحة', icon: 'Lightbulb', order: 4, config: JSON.stringify({ features: ['تحليل المتطلبات', 'اختيار التقنيات', 'هندسة النظام', 'تحسين الأداء'] }) },
      { sectionId: servicesSection.id, type: 'service', title: 'الذكاء الاصطناعي', description: 'تطوير حلول ذكاء اصطناعي مخصصة لأتمتة العمليات وتحسين القرارات', icon: 'Brain', order: 5, config: JSON.stringify({ features: ['نماذج ML', 'معالجة اللغة', 'رؤية حاسوبية', 'تحليلات تنبؤية'] }) },
      { sectionId: servicesSection.id, type: 'service', title: 'DevOps والبنية التحتية', description: 'إعداد وإدارة البنية التحتية السحابية وخطوط النشر المستمر', icon: 'Settings', order: 6, config: JSON.stringify({ features: ['CI/CD', 'حاويات Docker', 'Kubernetes', 'مراقبة الأداء'] }) },
    ]

    for (const item of serviceItems) {
      await prisma.sectionItem.create({ data: item })
    }
  }

  // Create experience items
  const experienceSection = await prisma.section.findFirst({ where: { type: 'experience' } })
  if (experienceSection) {
    const experienceItems = [
      { sectionId: experienceSection.id, type: 'experience', title: 'مطوّر أول', subtitle: 'شركة التقنية المتقدمة', description: 'قيادة فريق تطوير الواجهات الأمامية وبناء منتجات SaaS متقدمة', icon: 'Briefcase', order: 1, startDate: '2022', endDate: null, tags: JSON.stringify(['React', 'Next.js', 'TypeScript', 'AWS']), config: JSON.stringify({ type: 'work', company: 'شركة التقنية المتقدمة', location: 'الرياض' }) },
      { sectionId: experienceSection.id, type: 'experience', title: 'مطوّر Full-Stack', subtitle: 'شركة الابتكار الرقمي', description: 'تطوير وبناء تطبيقات ويب متكاملة للعملاء في مختلف القطاعات', icon: 'Briefcase', order: 2, startDate: '2019', endDate: '2022', tags: JSON.stringify(['Node.js', 'React', 'PostgreSQL', 'Docker']), config: JSON.stringify({ type: 'work', company: 'شركة الابتكار الرقمي', location: 'جدة' }) },
      { sectionId: experienceSection.id, type: 'experience', title: 'مطوّر واجهات أمامية', subtitle: 'شركة الحلول الذكية', description: 'بناء واجهات مستخدم تفاعلية وتحسين أداء التطبيقات', icon: 'Briefcase', order: 3, startDate: '2016', endDate: '2019', tags: JSON.stringify(['React', 'Vue.js', 'Sass', 'Webpack']), config: JSON.stringify({ type: 'work', company: 'شركة الحلول الذكية', location: 'الرياض' }) },
    ]

    for (const item of experienceItems) {
      await prisma.sectionItem.create({ data: item })
    }
  }

  // Create testimonial items
  const testimonialsSection = await prisma.section.findFirst({ where: { type: 'testimonials' } })
  if (testimonialsSection) {
    const testimonialItems = [
      { sectionId: testimonialsSection.id, type: 'testimonial', title: 'محمد الخالدي', subtitle: 'مدير مشاريع - شركة التقنية المتقدمة', description: 'أحمد مطوّر استثنائي! ساعدنا في بناء منصتنا من الصفر وكان دائمًا يقدم حلولًا مبتكرة. أنصح بالتعامل معه بشدة.', icon: 'Quote', order: 1, rating: 5, config: JSON.stringify({ company: 'شركة التقنية المتقدمة' }) },
      { sectionId: testimonialsSection.id, type: 'testimonial', title: 'سارة العمري', subtitle: 'مديرة التسويق الرقمي', description: 'العمل مع أحمد كان تجربة رائعة. يفهم المتطلبات بسرعة ويقدم نتائج تفوق التوقعات. موقعنا الجديد حقق نتائج مذهلة.', icon: 'Quote', order: 2, rating: 5, config: JSON.stringify({ company: 'شركة الابتكار الرقمي' }) },
      { sectionId: testimonialsSection.id, type: 'testimonial', title: 'خالد الراشدي', subtitle: 'مؤسس - تطبيق صحتي', description: 'أحمد بنى تطبيقنا الموبايل بكفاءة واحترافية عالية. التطبيق سلس وسهل الاستخدام وحصل على تقييمات ممتازة.', icon: 'Quote', order: 3, rating: 5, config: JSON.stringify({ company: 'تطبيق صحتي' }) },
    ]

    for (const item of testimonialItems) {
      await prisma.sectionItem.create({ data: item })
    }
  }

  // Create FAQ items
  const faqSection = await prisma.section.findFirst({ where: { type: 'faq' } })
  if (faqSection) {
    const faqItems = [
      { sectionId: faqSection.id, type: 'faq', title: 'ما هي مدة تنفيذ المشروع؟', description: 'تختلف المدة حسب حجم المشروع ومتطلباته. المشاريع الصغيرة تستغرق 2-4 أسابيع، والمتوسطة 1-3 أشهر، والكبيرة 3-6 أشهر.', icon: 'Clock', order: 1 },
      { sectionId: faqSection.id, type: 'faq', title: 'ما هي تكلفة تطوير الموقع؟', description: 'تعتمد التكلفة على حجم المشروع وتعقيده. أقدم عروض أسعار مخصصة بعد فهم متطلباتك. تواصل معي للحصول على عرض سعر مجاني.', icon: 'DollarSign', order: 2 },
      { sectionId: faqSection.id, type: 'faq', title: 'هل تقدم دعمًا بعد التسليم؟', description: 'نعم، أقدم دعمًا فنيًا مجانيًا لمدة 3 أشهر بعد تسليم المشروع، مع إمكانية تمديد عقد الدعم.', icon: 'Headphones', order: 3 },
      { sectionId: faqSection.id, type: 'faq', title: 'هل يمكنك العمل مع فرق عن بُعد؟', description: 'بالتأكيد! لدي خبرة واسعة في العمل عن بُعد مع فرق من مختلف أنحاء العالم باستخدام أدوات التعاون الحديثة.', icon: 'Wifi', order: 4 },
      { sectionId: faqSection.id, type: 'faq', title: 'ما هي التقنيات التي تفضلها؟', description: 'أفضل العمل مع React و Next.js للواجهات الأمامية، و Node.js للخوادم. لكنني مرن وأستخدم التقنيات الأنسب لكل مشروع.', icon: 'Code2', order: 5 },
    ]

    for (const item of faqItems) {
      await prisma.sectionItem.create({ data: item })
    }
  }

  // Create blog items
  const blogSection = await prisma.section.findFirst({ where: { type: 'blog' } })
  if (blogSection) {
    const blogItems = [
      { sectionId: blogSection.id, type: 'card', title: 'أفضل ممارسات تطوير React في 2024', subtitle: '5 دقائق قراءة', description: 'تعرف على أحدث الممارسات والأنماط في تطوير تطبيقات React الحديثة', icon: 'FileText', link: '#', linkText: 'اقرأ المزيد', order: 1, tags: JSON.stringify(['React', 'تطوير الويب']), imageUrl: '' },
      { sectionId: blogSection.id, type: 'card', title: 'دليلك الشامل لـ Next.js 14', subtitle: '8 دقائق قراءة', description: 'شرح مفصل للميزات الجديدة في Next.js 14 وكيفية الاستفادة منها', icon: 'FileText', link: '#', linkText: 'اقرأ المزيد', order: 2, tags: JSON.stringify(['Next.js', 'إطار العمل']), imageUrl: '' },
      { sectionId: blogSection.id, type: 'card', title: 'تحسين أداء تطبيقات الويب', subtitle: '6 دقائق قراءة', description: 'نصائح عملية لتحسين سرعة وأداء تطبيقات الويب الخاصة بك', icon: 'FileText', link: '#', linkText: 'اقرأ المزيد', order: 3, tags: JSON.stringify(['أداء', 'تحسين']), imageUrl: '' },
    ]

    for (const item of blogItems) {
      await prisma.sectionItem.create({ data: item })
    }
  }

  // Create active theme
  await prisma.theme.create({
    data: {
      name: 'السمة الافتراضية',
      isDefault: true,
      isActive: true,
      mode: 'system',
      colors: JSON.stringify({
        primary: '#10B981',
        secondary: '#14B8A6',
        accent: '#059669',
        background: '#FFFFFF',
        foreground: '#111827',
      }),
      fonts: JSON.stringify({
        arabic: 'Cairo',
        english: 'Inter',
        mono: 'Fira Code',
      }),
      borderRadius: '0.625rem',
    },
  })

  // Create SEO settings
  await prisma.sEOSetting.create({
    data: {
      page: 'home',
      title: 'أحمد المطيري | مطوّر برمجيات',
      description: 'مطوّر برمجيات متخصص في بناء تطبيقات ويب حديثة باستخدام React و Next.js',
      keywords: JSON.stringify(['مطور برمجيات', 'React', 'Next.js', 'تطوير ويب', 'السعودية']),
      ogTitle: 'أحمد المطيري | مطوّر برمجيات',
      ogDesc: 'مطوّر برمجيات متخصص في بناء تطبيقات ويب حديثة',
      robots: 'index, follow',
    },
  })

  // Create fonts
  const fonts = [
    { name: 'Inter', family: 'Inter', source: 'google', weights: JSON.stringify([400, 500, 600, 700]), subsets: JSON.stringify(['latin']), category: 'sans', isActive: true, usage: 'body' },
    { name: 'Cairo', family: 'Cairo', source: 'google', weights: JSON.stringify([600, 700, 800]), subsets: JSON.stringify(['arabic', 'latin']), category: 'arabic', isActive: true, usage: 'heading' },
  ]

  for (const font of fonts) {
    await prisma.font.create({ data: font })
  }

  console.log('✅ Database re-seeded successfully with Arabic content!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
