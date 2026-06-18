import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  console.log('🌱 Seeding English content...');

  // ========================================
  // 1. Update Sections with English fields
  // ========================================
  const sectionTranslations: Record<string, { titleEn: string; subtitleEn: string; descriptionEn?: string }> = {
    hero: { titleEn: 'Home', subtitleEn: 'Welcome to my personal website' },
    about: { titleEn: 'About Me', subtitleEn: 'Get to know me better' },
    skills: { titleEn: 'Skills', subtitleEn: 'My technical expertise' },
    projects: { titleEn: 'Projects', subtitleEn: 'My latest work' },
    services: { titleEn: 'Services', subtitleEn: 'How I can help you' },
    experience: { titleEn: 'Experience', subtitleEn: 'My professional journey' },
    testimonials: { titleEn: 'Testimonials', subtitleEn: 'What clients say' },
    faq: { titleEn: 'FAQ', subtitleEn: 'Answers to your questions' },
    blog: { titleEn: 'Blog', subtitleEn: 'Latest articles' },
    contact: { titleEn: 'Contact Me', subtitleEn: "Let's work together" },
    education: { titleEn: 'Education', subtitleEn: 'My academic background' },
  };

  // contentEn for sections with JSON content
  const sectionContentEn: Record<string, Record<string, unknown>> = {
    hero: {
      title: "Hello, I'm Ahmed",
      subtitle: 'I build exceptional digital experiences',
      ctaPrimary: { text: 'Explore My Work', href: '#projects' },
      ctaSecondary: { text: 'Contact Me', href: '#contact' },
      typingTexts: ['Full-Stack Developer', 'UI/UX Designer', 'React & Next.js Expert', 'Problem Solver'],
    },
    about: {
      bio: "I'm a passionate Full-Stack Developer with over 8 years of experience building modern web applications. I specialize in React, Next.js, and Node.js, creating scalable and performant solutions that deliver exceptional user experiences. I love turning complex problems into simple, beautiful, and intuitive designs. When I'm not coding, you'll find me exploring new technologies, contributing to open source, or mentoring aspiring developers.",
      stats: [
        { label: 'Years Experience', value: 8, icon: 'Calendar' },
        { label: 'Projects Completed', value: 150, icon: 'Briefcase' },
        { label: 'Happy Clients', value: 80, icon: 'Users' },
        { label: 'Awards', value: 12, icon: 'Award' },
      ],
    },
  };

  const sections = await db.section.findMany();
  for (const section of sections) {
    const translation = sectionTranslations[section.type];
    const contentEnData = sectionContentEn[section.type];
    if (translation || contentEnData) {
      await db.section.update({
        where: { id: section.id },
        data: {
          titleEn: translation?.titleEn,
          subtitleEn: translation?.subtitleEn,
          descriptionEn: translation?.descriptionEn || null,
          contentEn: contentEnData ? JSON.stringify(contentEnData) : undefined,
        },
      });
      console.log(`  ✅ Section "${section.type}" updated${contentEnData ? ' (with contentEn)' : ''}`);
    }
  }

  // ========================================
  // 2. Update Section Items with English fields
  // ========================================
  const skillItemTranslations: Record<string, { titleEn: string; subtitleEn: string; descriptionEn: string }> = {
    'React': { titleEn: 'React', subtitleEn: 'User Interfaces', descriptionEn: 'React library for building interactive user interfaces' },
    'Next.js': { titleEn: 'Next.js', subtitleEn: 'Full-Stack Framework', descriptionEn: 'Next.js framework for full-stack applications' },
    'TypeScript': { titleEn: 'TypeScript', subtitleEn: 'Type-Safe Language', descriptionEn: 'TypeScript for safe and reliable coding' },
    'Node.js': { titleEn: 'Node.js', subtitleEn: 'Backend Runtime', descriptionEn: 'Node.js runtime for server-side applications' },
    'Python': { titleEn: 'Python', subtitleEn: 'Versatile Language', descriptionEn: 'Python for versatile and multi-purpose programming' },
    'PostgreSQL': { titleEn: 'PostgreSQL', subtitleEn: 'Databases', descriptionEn: 'PostgreSQL relational database management' },
    'Docker': { titleEn: 'Docker', subtitleEn: 'Containers & Deployment', descriptionEn: 'Docker for containerization and deployment' },
    'AWS': { titleEn: 'AWS', subtitleEn: 'Cloud Computing', descriptionEn: 'AWS cloud computing services' },
    'Tailwind CSS': { titleEn: 'Tailwind CSS', subtitleEn: 'UI Styling', descriptionEn: 'Tailwind CSS framework for UI styling' },
    'GraphQL': { titleEn: 'GraphQL', subtitleEn: 'API Query Language', descriptionEn: 'GraphQL for flexible API queries' },
  };

  const projectItemTranslations: Record<string, { titleEn: string; subtitleEn: string; descriptionEn: string }> = {
    'منصة التجارة الإلكترونية': { titleEn: 'E-Commerce Platform', subtitleEn: 'Complete online store', descriptionEn: 'A comprehensive e-commerce platform supporting thousands of products with secure payment and advanced dashboard' },
    'تطبيق إدارة المهام': { titleEn: 'Task Management App', subtitleEn: 'Smart productivity tool', descriptionEn: 'A task and project management app with drag-and-drop interface and multi-team support' },
    'لوحة تحليلات البيانات': { titleEn: 'Data Analytics Dashboard', subtitleEn: 'Advanced analytics', descriptionEn: 'A dashboard for data analysis with interactive charts and custom reports' },
    'تطبيق موبايل للصحة': { titleEn: 'Health Mobile App', subtitleEn: 'Health & fitness tracking', descriptionEn: 'A mobile app for tracking workouts and diet with AI-powered smart recommendations' },
    'نظام إدارة المحتوى': { titleEn: 'Content Management System', subtitleEn: 'Custom CMS', descriptionEn: 'A custom CMS with rich text editor and advanced permissions system' },
    'منصة التعلم الإلكتروني': { titleEn: 'E-Learning Platform', subtitleEn: 'Interactive learning', descriptionEn: 'An educational platform supporting interactive courses, quizzes, and certificates' },
  };

  const serviceItemTranslations: Record<string, { titleEn: string; descriptionEn: string }> = {
    'تطوير تطبيقات الويب': { titleEn: 'Web App Development', descriptionEn: 'Building modern, fast web applications using the latest technologies like React and Next.js' },
    'تطوير تطبيقات الموبايل': { titleEn: 'Mobile App Development', descriptionEn: 'Developing cross-platform mobile applications using React Native' },
    'تصميم واجهات المستخدم': { titleEn: 'UI/UX Design', descriptionEn: 'Designing attractive and user-friendly interfaces with excellent user experience' },
    'الاستشارات التقنية': { titleEn: 'Technical Consulting', descriptionEn: 'Providing specialized technical consulting to help you make the right decisions' },
    'الذكاء الاصطناعي': { titleEn: 'Artificial Intelligence', descriptionEn: 'Developing custom AI solutions to automate processes and improve decision-making' },
    'DevOps والبنية التحتية': { titleEn: 'DevOps & Infrastructure', descriptionEn: 'Setting up and managing cloud infrastructure and continuous deployment pipelines' },
  };

  const experienceItemTranslations: Record<string, { titleEn: string; subtitleEn: string; descriptionEn: string }> = {
    'مطوّر أول': { titleEn: 'Senior Developer', subtitleEn: 'Advanced Tech Company', descriptionEn: 'Leading the frontend development team and building advanced SaaS products' },
    'مطوّر Full-Stack': { titleEn: 'Full-Stack Developer', subtitleEn: 'Digital Innovation Company', descriptionEn: 'Developing and building integrated web applications for clients across various sectors' },
    'مطوّر واجهات أمامية': { titleEn: 'Frontend Developer', subtitleEn: 'Smart Solutions Company', descriptionEn: 'Building interactive user interfaces and improving application performance' },
  };

  const testimonialItemTranslations: Record<string, { titleEn: string; subtitleEn: string; descriptionEn: string }> = {
    'محمد الخالدي': { titleEn: 'Mohammed Al-Khalidi', subtitleEn: 'Project Manager - Advanced Tech Company', descriptionEn: 'Ahmed is an exceptional developer! He helped us build our platform from scratch and always delivered innovative solutions. Highly recommended.' },
    'سارة العمري': { titleEn: 'Sarah Al-Omari', subtitleEn: 'Digital Marketing Director', descriptionEn: 'Working with Ahmed was a great experience. He understands requirements quickly and delivers results that exceed expectations. Our new website achieved amazing results.' },
    'خالد الراشدي': { titleEn: 'Khalid Al-Rashidi', subtitleEn: 'Founder - MyHealth App', descriptionEn: 'Ahmed built our mobile app with high efficiency and professionalism. The app is smooth, easy to use, and received excellent ratings.' },
  };

  const faqItemTranslations: Record<string, { titleEn: string; descriptionEn: string }> = {
    'ما هي مدة تنفيذ المشروع؟': { titleEn: 'How long does a project take?', descriptionEn: 'Duration varies by project size and requirements. Small projects take 2-4 weeks, medium ones 1-3 months, and large ones 3-6 months.' },
    'ما هي تكلفة تطوير الموقع؟': { titleEn: 'How much does web development cost?', descriptionEn: 'Cost depends on project size and complexity. I provide custom quotes after understanding your requirements. Contact me for a free quote.' },
    'هل تقدم دعمًا بعد التسليم؟': { titleEn: 'Do you provide post-delivery support?', descriptionEn: 'Yes, I provide free technical support for 3 months after project delivery, with the option to extend the support contract.' },
    'هل يمكنك العمل مع فرق عن بُعد؟': { titleEn: 'Can you work with remote teams?', descriptionEn: 'Absolutely! I have extensive experience working remotely with teams from around the world using modern collaboration tools.' },
    'ما هي التقنيات التي تفضلها؟': { titleEn: 'What technologies do you prefer?', descriptionEn: 'I prefer working with React and Next.js for frontend, and Node.js for backend. But I am flexible and use the most suitable technologies for each project.' },
  };

  const blogItemTranslations: Record<string, { titleEn: string; subtitleEn: string; descriptionEn: string }> = {
    'أفضل ممارسات تطوير React في 2024': { titleEn: 'Best React Development Practices in 2024', subtitleEn: '5 min read', descriptionEn: 'Learn about the latest practices and patterns in modern React application development' },
    'دليلك الشامل لـ Next.js 14': { titleEn: 'Your Complete Guide to Next.js 14', subtitleEn: '8 min read', descriptionEn: 'A detailed explanation of the new features in Next.js 14 and how to leverage them' },
    'تحسين أداء تطبيقات الويب': { titleEn: 'Optimizing Web Application Performance', subtitleEn: '6 min read', descriptionEn: 'Practical tips to improve the speed and performance of your web applications' },
  };

  const items = await db.sectionItem.findMany();
  for (const item of items) {
    let translation: { titleEn?: string; subtitleEn?: string; descriptionEn?: string } | undefined;

    if (item.type === 'skill' && item.title) {
      translation = skillItemTranslations[item.title];
    } else if (item.type === 'project' && item.title) {
      translation = projectItemTranslations[item.title];
    } else if (item.type === 'service' && item.title) {
      translation = serviceItemTranslations[item.title];
    } else if (item.type === 'experience' && item.title) {
      translation = experienceItemTranslations[item.title];
    } else if (item.type === 'testimonial' && item.title) {
      translation = testimonialItemTranslations[item.title];
    } else if (item.type === 'faq' && item.title) {
      translation = faqItemTranslations[item.title];
    } else if (item.type === 'card' && item.title) {
      translation = blogItemTranslations[item.title];
    }

    if (translation) {
      // Build configEn for service items with features
      let configEnData: string | undefined;
      if (item.type === 'service' && item.title) {
        const serviceFeaturesEn: Record<string, string[]> = {
          'تطوير تطبيقات الويب': ['Responsive Design', 'SEO Optimization', 'CMS Integration', 'Analytics', 'E-commerce', 'PWA Support'],
          'تطوير تطبيقات الموبايل': ['Cross-Platform', 'Push Notifications', 'Offline Mode', 'App Store Deploy', 'UI Animations', 'Analytics'],
          'تصميم واجهات المستخدم': ['User Research', 'Wireframing', 'Prototyping', 'Design System', 'Usability Testing', 'Accessibility'],
          'الاستشارات التقنية': ['Architecture Review', 'Tech Stack Selection', 'Code Audit', 'Performance Optimization', 'Security Assessment', 'Team Training'],
          'الذكاء الاصطناعي': ['Custom AI Models', 'NLP Solutions', 'Computer Vision', 'ML Pipelines', 'Chatbots', 'Data Analysis'],
          'DevOps والبنية التحتية': ['CI/CD Pipelines', 'Cloud Setup', 'Container Orchestration', 'Monitoring', 'Auto-scaling', 'Security Hardening'],
        };
        const features = serviceFeaturesEn[item.title];
        if (features) {
          configEnData = JSON.stringify({ features });
        }
      }

      await db.sectionItem.update({
        where: { id: item.id },
        data: {
          titleEn: translation.titleEn || null,
          subtitleEn: translation.subtitleEn || null,
          descriptionEn: translation.descriptionEn || null,
          ...(configEnData ? { configEn: configEnData } : {}),
        },
      });
      console.log(`  ✅ SectionItem "${item.title}" (${item.type}) updated${configEnData ? ' (with configEn)' : ''}`);
    }
  }

  // ========================================
  // 3. Update Projects with English fields
  // ========================================
  const projectTranslations: Record<string, { titleEn: string; descriptionEn: string; contentEn?: string }> = {
    'E-Commerce Platform': { titleEn: 'E-Commerce Platform', descriptionEn: 'A full-featured e-commerce platform with real-time inventory management, payment processing, and analytics dashboard.' },
    'Task Management App': { titleEn: 'Task Management App', descriptionEn: 'A collaborative task management application with real-time updates, team features, and intelligent task prioritization.' },
    'Portfolio Website Builder': { titleEn: 'Portfolio Website Builder', descriptionEn: 'A drag-and-drop portfolio builder that allows creatives to showcase their work with customizable templates and themes.' },
    'AI Content Generator': { titleEn: 'AI Content Generator', descriptionEn: 'An AI-powered content generation tool that helps marketers create engaging copy, blog posts, and social media content.' },
    'Fitness Tracking App': { titleEn: 'Fitness Tracking App', descriptionEn: 'A mobile-first fitness tracking application with workout plans, progress analytics, and social features.' },
    'Real Estate Platform': { titleEn: 'Real Estate Platform', descriptionEn: 'A comprehensive real estate platform with property listings, virtual tours, and mortgage calculator integration.' },
  };

  const projects = await db.project.findMany();
  for (const project of projects) {
    const translation = projectTranslations[project.title];
    if (translation) {
      await db.project.update({
        where: { id: project.id },
        data: {
          titleEn: translation.titleEn,
          descriptionEn: translation.descriptionEn,
          contentEn: translation.contentEn || null,
        },
      });
      console.log(`  ✅ Project "${project.title}" updated`);
    } else {
      // If no explicit translation, the project titles are already in English, so set titleEn = title
      await db.project.update({
        where: { id: project.id },
        data: {
          titleEn: project.title,
          descriptionEn: project.description,
        },
      });
      console.log(`  ✅ Project "${project.title}" updated (auto English)`);
    }
  }

  // ========================================
  // 4. Update Navigation with English labels
  // ========================================
  const navTranslations: Record<string, string> = {
    'الرئيسية': 'Home',
    'عني': 'About',
    'المهارات': 'Skills',
    'المشاريع': 'Projects',
    'الخدمات': 'Services',
    'الخبرات': 'Experience',
    'الآراء': 'Testimonials',
    'تواصل': 'Contact',
  };

  const navs = await db.navigation.findMany();
  for (const nav of navs) {
    const labelEn = navTranslations[nav.label];
    if (labelEn) {
      await db.navigation.update({
        where: { id: nav.id },
        data: { labelEn },
      });
      console.log(`  ✅ Navigation "${nav.label}" → "${labelEn}" updated`);
    }
  }

  console.log('\n🎉 English content seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding English content:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
