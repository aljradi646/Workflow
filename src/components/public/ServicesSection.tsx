'use client';

import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { motion, useInView, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { type Section, type SectionItem } from '@/store/site-store';
import { useLanguageStore } from '@/store/language-store';
import { getTranslations } from '@/lib/i18n';
import { localizeSection, localizeSectionItem } from '@/lib/localize';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TiltCard } from '@/components/public/TiltCard';
import { MagneticButton } from '@/components/public/MagneticButton';
import {
  Globe,
  Smartphone,
  Palette,
  Lightbulb,
  Brain,
  Settings,
  Check,
  ArrowLeft,
  Code2,
  Wrench,
  LayoutGrid,
  List,
  Zap,
  FileSearch,
  PenTool,
  Rocket,
  ChevronLeft,
  X,
  Sparkles,
  GitCompareArrows,
  MessageSquareQuote,
  Clock,
  DollarSign,
  User,
  Mail,
  Phone,
  Briefcase,
  Star,
  CircleDot,
  ChevronRight,
  CalendarDays,
  Trophy,
  ArrowRight,
  Send,
  CheckCircle2,
  Image as ImageIcon,
  HelpCircle,
  Timer,
} from 'lucide-react';

interface ServicesSectionProps {
  section: Section;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Globe,
  Smartphone,
  Palette,
  Lightbulb,
  Brain,
  Settings,
  Code2,
};

/* Price ranges for services */
const servicePrices: Record<string, { min: number; max: number; currency: string }> = {
  '0': { min: 500, max: 2000, currency: '$' },
  '1': { min: 1000, max: 5000, currency: '$' },
  '2': { min: 300, max: 1500, currency: '$' },
  '3': { min: 2000, max: 8000, currency: '$' },
  '4': { min: 1500, max: 6000, currency: '$' },
  '5': { min: 800, max: 3000, currency: '$' },
};

/* Technologies used per service */
const serviceTechnologies: Record<string, string[]> = {
  '0': ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
  '1': ['React Native', 'Flutter', 'Swift', 'Kotlin'],
  '2': ['Figma', 'Adobe XD', 'Sketch', 'Framer'],
  '3': ['Node.js', 'Python', 'PostgreSQL', 'Redis'],
  '4': ['TensorFlow', 'PyTorch', 'OpenAI', 'LangChain'],
  '5': ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
};

/* Service categories with colors */
const serviceCategories: Record<string, { color: string }> = {
  '0': { color: 'bg-emerald-500' },
  '1': { color: 'bg-teal-500' },
  '2': { color: 'bg-cyan-500' },
  '3': { color: 'bg-amber-500' },
  '4': { color: 'bg-violet-500' },
  '5': { color: 'bg-rose-500' },
};

/* Map category index to i18n key */
const categoryLabelKeys: Record<string, string> = {
  '0': 'categoryWebDev',
  '1': 'categoryApps',
  '2': 'categoryDesign',
  '3': 'categoryBackend',
  '4': 'categoryAI',
  '5': 'categoryDevOps',
};

/* Comparison features per service */
const serviceComparisonFeatures: Record<string, string[]> = {
  '0': ['Responsive Design', 'SEO Optimization', 'CMS Integration', 'Analytics', 'E-commerce', 'PWA Support'],
  '1': ['Cross-Platform', 'Push Notifications', 'Offline Mode', 'App Store Deploy', 'UI Animations', 'Analytics'],
  '2': ['Wireframing', 'Prototyping', 'Design System', 'User Testing', 'Brand Identity', 'Accessibility'],
  '3': ['API Development', 'Database Design', 'Authentication', 'Caching', 'Real-time', 'Microservices'],
  '4': ['Model Training', 'NLP', 'Computer Vision', 'Chatbots', 'Data Pipeline', 'MLOps'],
  '5': ['CI/CD Pipeline', 'Containerization', 'Monitoring', 'Auto-scaling', 'Security', 'Cost Optimization'],
};

/* Portfolio items per service */
const servicePortfolio: Record<string, Array<{ name: string; nameAr: string; desc: string; descAr: string }>> = {
  '0': [
    { name: 'E-commerce Platform', nameAr: 'منصة تجارة إلكترونية', desc: 'Full-stack web store with payment integration', descAr: 'متجر إلكتروني متكامل مع بوابات الدفع' },
    { name: 'SaaS Dashboard', nameAr: 'لوحة تحكم SaaS', desc: 'Analytics dashboard for business intelligence', descAr: 'لوحة تحليلات للذكاء التجاري' },
  ],
  '1': [
    { name: 'Fitness Tracker App', nameAr: 'تطبيق لياقة بدنية', desc: 'Cross-platform health tracking app', descAr: 'تطبيق تتبع صحي متعدد المنصات' },
    { name: 'Delivery Service App', nameAr: 'تطبيق توصيل', desc: 'Real-time order tracking system', descAr: 'نظام تتبع الطلبات في الوقت الفعلي' },
  ],
  '2': [
    { name: 'Brand Identity System', nameAr: 'نظام هوية بصرية', desc: 'Complete visual identity for startups', descAr: 'هوية بصرية متكاملة للشركات الناشئة' },
    { name: 'UI/UX Redesign', nameAr: 'إعادة تصميم واجهة', desc: 'UX overhaul for fintech platform', descAr: 'تحسين تجربة المستخدم لمنصة مالية' },
  ],
  '3': [
    { name: 'REST API Platform', nameAr: 'منصة REST API', desc: 'High-performance API with microservices', descAr: 'واجهة برمجة عالية الأداء مع خدمات مصغرة' },
    { name: 'Real-time Chat Server', nameAr: 'خادم محادثة فورية', desc: 'WebSocket-based messaging system', descAr: 'نظام مراسنة قائم على WebSocket' },
  ],
  '4': [
    { name: 'AI Content Generator', nameAr: 'مولد محتوى ذكي', desc: 'LLM-powered content creation tool', descAr: 'أداة إنشاء محتوى مدعومة بالذكاء الاصطناعي' },
    { name: 'Image Recognition API', nameAr: 'واجهة التعرف على الصور', desc: 'Computer vision classification service', descAr: 'خدمة تصنيف الرؤية الحاسوبية' },
  ],
  '5': [
    { name: 'Cloud Migration', nameAr: 'ترحيل سحابي', desc: 'Full infrastructure migration to AWS', descAr: 'ترحيل البنية التحتية بالكامل إلى AWS' },
    { name: 'Kubernetes Cluster', nameAr: 'مجموعة Kubernetes', desc: 'Container orchestration setup', descAr: 'إعداد تنسيق الحاويات' },
  ],
};

/* Client testimonials per service */
const serviceTestimonials: Record<string, Array<{ name: string; nameAr: string; role: string; roleAr: string; text: string; textAr: string; rating: number }>> = {
  '0': [
    { name: 'Sarah Johnson', nameAr: 'سارة جونسون', role: 'CEO, TechStart', roleAr: 'مديرة تنفيذية، تكستارت', text: 'Exceptional web development work. Our conversion rate increased by 40%.', textAr: 'عمل تطوير ويب استثنائي. زادت نسبة التحويل لدينا بنسبة 40٪.', rating: 5 },
    { name: 'Ahmed Hassan', nameAr: 'أحمد حسن', role: 'CTO, InnovateCo', roleAr: 'المدير التقني، ابتكاركو', text: 'Professional, timely, and the quality exceeded expectations.', textAr: 'احترافي، في الوقت المحدد، والجودة فاقت التوقعات.', rating: 5 },
  ],
  '1': [
    { name: 'Maria Garcia', nameAr: 'ماريا غارسيا', role: 'Product Lead, AppVenture', roleAr: 'قائدة المنتج، أبفنتشر', text: 'The mobile app they built is fast, beautiful, and our users love it.', textAr: 'التطبيق الذي بنوه سريع وجميل ويحبه المستخدمون.', rating: 5 },
  ],
  '2': [
    { name: 'Tom Wilson', nameAr: 'توم ويلسون', role: 'Founder, DesignFirst', roleAr: 'مؤسس، ديزاين فيرست', text: 'Incredible design sense. They understood our brand perfectly.', textAr: 'حس تصميمي لا يصدق. فهموا علامتنا التجارية بشكل مثالي.', rating: 5 },
  ],
  '3': [
    { name: 'Li Wei', nameAr: 'لي وي', role: 'VP Eng, DataFlow', roleAr: 'نائب رئيس الهندسة، داتافلو', text: 'Rock-solid backend architecture. Zero downtime since launch.', textAr: 'بنية خلفية صلبة كالصخر. صفر توقف منذ الإطلاق.', rating: 5 },
  ],
  '4': [
    { name: 'Rachel Kim', nameAr: 'ريتشل كيم', role: 'AI Director, SmartLab', roleAr: 'مديرة الذكاء الاصطناعي، سمارتلاب', text: 'Their AI solution transformed our data processing pipeline.', textAr: 'حل الذكاء الاصطناعي الخاص بهم غيّر خط معالجة البيانات لدينا.', rating: 5 },
  ],
  '5': [
    { name: 'David Brown', nameAr: 'ديفيد براون', role: 'DevOps Lead, CloudScale', roleAr: 'قائد ديفوبس، كلاودسكيل', text: 'Our deployment time went from hours to minutes. Amazing work.', textAr: 'وقت النشر لدينا انخفض من ساعات إلى دقائق. عمل رائع.', rating: 5 },
  ],
};

/* FAQ per service */
const serviceFAQs: Record<string, Array<{ q: string; qAr: string; a: string; aAr: string }>> = {
  '0': [
    { q: 'How long does a web project take?', qAr: 'كم يستغرق مشروع الويب؟', a: 'Typically 4-8 weeks depending on complexity.', aAr: 'عادة من 4 إلى 8 أسابيع حسب التعقيد.' },
    { q: 'Do you provide ongoing support?', qAr: 'هل توفرون دعم مستمر؟', a: 'Yes, we offer maintenance packages after launch.', aAr: 'نعم، نقدم باقات صيانة بعد الإطلاق.' },
    { q: 'Can I update content myself?', qAr: 'هل يمكنني تحديث المحتوى بنفسي؟', a: 'Absolutely, we build with CMS integration.', aAr: 'بالتأكيد، نبني مع تكامل أنظمة إدارة المحتوى.' },
  ],
  '1': [
    { q: 'Do you build for both iOS and Android?', qAr: 'هل تبنون لتطبيقات iOS و Android؟', a: 'Yes, we use cross-platform frameworks for maximum reach.', aAr: 'نعم، نستخدم أطر متعددة المنصات لأقصى وصول.' },
    { q: 'Can you publish to app stores?', qAr: 'هل يمكنكم النشر على متاجر التطبيقات؟', a: 'Yes, we handle the full submission process.', aAr: 'نعم، نتولى عملية الإرسال بالكامل.' },
  ],
  '2': [
    { q: 'How many revision rounds are included?', qAr: 'كم جولة مراجعة مشمولة؟', a: 'We include 3 revision rounds in every project.', aAr: 'نضمّن 3 جولات مراجعة في كل مشروع.' },
    { q: 'Do you provide source files?', qAr: 'هل توفرون الملفات المصدرية؟', a: 'Yes, all design files are handed over upon completion.', aAr: 'نعم، يتم تسليم جميع ملفات التصميم عند الانتهاء.' },
  ],
  '3': [
    { q: 'What tech stack do you use?', qAr: 'ما التقنيات التي تستخدمونها؟', a: 'Node.js, Python, Go, PostgreSQL, MongoDB, and more.', aAr: 'Node.js، Python، Go، PostgreSQL، MongoDB، والمزيد.' },
    { q: 'Do you handle database migrations?', qAr: 'هل تتعاملون مع ترحيل قواعد البيانات؟', a: 'Yes, we plan and execute safe database migrations.', aAr: 'نعم، نخطط وننفذ ترحيل آمن لقواعد البيانات.' },
  ],
  '4': [
    { q: 'Can you work with existing models?', qAr: 'هل يمكنكم العمل مع نماذج موجودة؟', a: 'Yes, we fine-tune and integrate existing AI models.', aAr: 'نعم، نقوم بضبط دقيق ودمج نماذج الذكاء الاصطناعي الموجودة.' },
    { q: 'What about data privacy?', qAr: 'ماذا عن خصوصية البيانات؟', a: 'We follow strict data governance and compliance standards.', aAr: 'نتبع معايير صارمة لحوكمة البيانات والامتثال.' },
  ],
  '5': [
    { q: 'Which cloud providers do you support?', qAr: 'ما مزودو الخدمة السحابية الذين تدعمونهم؟', a: 'AWS, GCP, Azure, and DigitalOcean.', aAr: 'AWS، GCP، Azure، و DigitalOcean.' },
    { q: 'Do you set up monitoring?', qAr: 'هل توفرون إعداد المراقبة؟', a: 'Yes, we implement comprehensive monitoring and alerting.', aAr: 'نعم، ننفذ مراقبة وتنبيهات شاملة.' },
  ],
};

/* Delivery timeline per service */
const serviceTimelines: Record<string, Array<{ phase: string; phaseAr: string; duration: string; durationAr: string }>> = {
  '0': [
    { phase: 'Discovery & Planning', phaseAr: 'الاكتشاف والتخطيط', duration: '1 week', durationAr: 'أسبوع واحد' },
    { phase: 'UI/UX Design', phaseAr: 'تصميم واجهة المستخدم', duration: '1-2 weeks', durationAr: '1-2 أسبوع' },
    { phase: 'Development', phaseAr: 'التطوير', duration: '2-3 weeks', durationAr: '2-3 أسابيع' },
    { phase: 'Testing & QA', phaseAr: 'الاختبار والجودة', duration: '1 week', durationAr: 'أسبوع واحد' },
    { phase: 'Launch & Support', phaseAr: 'الإطلاق والدعم', duration: '1 week', durationAr: 'أسبوع واحد' },
  ],
  '1': [
    { phase: 'Requirements', phaseAr: 'المتطلبات', duration: '1 week', durationAr: 'أسبوع واحد' },
    { phase: 'Design & Prototyping', phaseAr: 'التصميم والنمذجة', duration: '1-2 weeks', durationAr: '1-2 أسبوع' },
    { phase: 'Development', phaseAr: 'التطوير', duration: '3-4 weeks', durationAr: '3-4 أسابيع' },
    { phase: 'Testing', phaseAr: 'الاختبار', duration: '1-2 weeks', durationAr: '1-2 أسبوع' },
    { phase: 'Store Submission', phaseAr: 'إرسال المتجر', duration: '1 week', durationAr: 'أسبوع واحد' },
  ],
  '2': [
    { phase: 'Research', phaseAr: 'البحث', duration: '3-5 days', durationAr: '3-5 أيام' },
    { phase: 'Wireframing', phaseAr: 'التصميم الأولي', duration: '3-5 days', durationAr: '3-5 أيام' },
    { phase: 'Visual Design', phaseAr: 'التصميم البصري', duration: '1-2 weeks', durationAr: '1-2 أسبوع' },
    { phase: 'Prototyping', phaseAr: 'النمذجة', duration: '3-5 days', durationAr: '3-5 أيام' },
    { phase: 'Handoff', phaseAr: 'التسليم', duration: '2-3 days', durationAr: '2-3 أيام' },
  ],
  '3': [
    { phase: 'Architecture', phaseAr: 'البنية المعمارية', duration: '1 week', durationAr: 'أسبوع واحد' },
    { phase: 'Database Design', phaseAr: 'تصميم قاعدة البيانات', duration: '3-5 days', durationAr: '3-5 أيام' },
    { phase: 'API Development', phaseAr: 'تطوير API', duration: '2-3 weeks', durationAr: '2-3 أسابيع' },
    { phase: 'Integration & Testing', phaseAr: 'الدمج والاختبار', duration: '1-2 weeks', durationAr: '1-2 أسبوع' },
    { phase: 'Deployment', phaseAr: 'النشر', duration: '2-3 days', durationAr: '2-3 أيام' },
  ],
  '4': [
    { phase: 'Data Assessment', phaseAr: 'تقييم البيانات', duration: '1 week', durationAr: 'أسبوع واحد' },
    { phase: 'Model Development', phaseAr: 'تطوير النموذج', duration: '2-4 weeks', durationAr: '2-4 أسابيع' },
    { phase: 'Training & Tuning', phaseAr: 'التدريب والضبط', duration: '1-2 weeks', durationAr: '1-2 أسبوع' },
    { phase: 'Integration', phaseAr: 'الدمج', duration: '1 week', durationAr: 'أسبوع واحد' },
    { phase: 'Monitoring Setup', phaseAr: 'إعداد المراقبة', duration: '3-5 days', durationAr: '3-5 أيام' },
  ],
  '5': [
    { phase: 'Assessment', phaseAr: 'التقييم', duration: '3-5 days', durationAr: '3-5 أيام' },
    { phase: 'Architecture Design', phaseAr: 'تصميم البنية', duration: '1 week', durationAr: 'أسبوع واحد' },
    { phase: 'Infrastructure Setup', phaseAr: 'إعداد البنية التحتية', duration: '1-2 weeks', durationAr: '1-2 أسبوع' },
    { phase: 'CI/CD Pipeline', phaseAr: 'خط أنابيب CI/CD', duration: '1 week', durationAr: 'أسبوع واحد' },
    { phase: 'Monitoring & Docs', phaseAr: 'المراقبة والتوثيق', duration: '3-5 days', durationAr: '3-5 أيام' },
  ],
};

/* Feature availability for comparison (per feature index per service) */
const featureAvailability: Record<string, boolean[]> = {
  '0': [true, true, true, true, true, true],
  '1': [true, true, true, true, true, true],
  '2': [true, true, true, true, true, true],
  '3': [true, true, true, true, true, true],
  '4': [true, true, true, true, true, true],
  '5': [true, true, true, true, true, true],
};

/* ===== Sparkle effect around icon on hover ===== */
function SparkleEffect({ visible }: { visible: boolean }) {
  const sparkles = [
    { x: -18, y: -18, delay: 0, size: 4 },
    { x: 18, y: -16, delay: 0.1, size: 3 },
    { x: -20, y: 14, delay: 0.2, size: 3.5 },
    { x: 22, y: 16, delay: 0.15, size: 4 },
    { x: 0, y: -22, delay: 0.05, size: 3 },
    { x: 0, y: 22, delay: 0.25, size: 3 },
  ];
  return (
    <AnimatePresence>
      {visible && sparkles.map((sp, i) => (
        <motion.span
          key={i}
          className="absolute text-emerald-400 pointer-events-none"
          style={{ left: `calc(50% + ${sp.x}px)`, top: `calc(50% + ${sp.y}px)` }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1, 0.5], y: [0, -8] }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.8, delay: sp.delay, repeat: Infinity, repeatDelay: 1.5 }}
        >
          <Sparkles className="text-emerald-400" style={{ width: sp.size, height: sp.size }} />
        </motion.span>
      ))}
    </AnimatePresence>
  );
}

/* ===== Process Timeline Step ===== */
function ProcessStep({
  icon: StepIcon,
  label,
  index,
  totalSteps,
  isInView,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  index: number;
  totalSteps: number;
  isInView: boolean;
}) {
  return (
    <div className="flex items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 0.3 + index * 0.2, duration: 0.5 }}
        className="flex flex-col items-center gap-2"
      >
        <div className="w-12 h-12 rounded-xl gradient-emerald flex items-center justify-center shadow-lg shadow-emerald-500/20 relative">
          <StepIcon className="w-6 h-6 text-white" />
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-background border-2 border-emerald-500 flex items-center justify-center text-[9px] font-bold text-emerald-600">
            {index + 1}
          </div>
        </div>
        <span className="text-xs font-medium text-foreground whitespace-nowrap">{label}</span>
      </motion.div>
      {/* Connecting line */}
      {index < totalSteps - 1 && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ delay: 0.5 + index * 0.2, duration: 0.6, ease: 'easeOut' }}
          className="flex-1 h-0.5 mx-2 bg-gradient-to-l from-emerald-500/30 via-emerald-500/60 to-emerald-500/30 origin-right min-w-[40px]"
        />
      )}
    </div>
  );
}

/* ===== Animated Service Icon with floating/breathing ===== */
function AnimatedServiceIcon({
  IconComponent,
  isHovered,
}: {
  IconComponent: React.ComponentType<{ className?: string }>;
  isHovered: boolean;
}) {
  const rotate = useMotionValue(0);
  const springRotate = useSpring(rotate, { stiffness: 200, damping: 15 });

  useEffect(() => {
    rotate.set(isHovered ? 12 : 0);
  }, [isHovered, rotate]);

  return (
    <div className="relative">
      {/* Continuous floating/breathing animation */}
      <motion.div
        className="w-14 h-14 rounded-xl gradient-emerald flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-shadow duration-300"
        animate={{
          y: [0, -3, 0],
          scale: [1, 1.03, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ rotate: springRotate }}
      >
        {IconComponent && <IconComponent className="w-7 h-7 text-white" />}
      </motion.div>
      {/* Pulse ring behind icon */}
      <motion.div
        className="absolute inset-0 w-14 h-14 rounded-xl gradient-emerald"
        animate={isHovered
          ? { opacity: [0, 0.3, 0], scale: [1, 1.4, 1] }
          : { opacity: 0, scale: 1 }
        }
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Sparkle particles on hover */}
      <SparkleEffect visible={isHovered} />
    </div>
  );
}

/* ===== Service Card (Grid View) ===== */
function ServiceCardGrid({
  item,
  index,
  isInView,
  onLearnMore,
  onRequestQuote,
  onCompareToggle,
  isCompareSelected,
  t,
  language,
  isMostPopular,
}: {
  item: SectionItem;
  index: number;
  isInView: boolean;
  onLearnMore: (item: SectionItem, index: number) => void;
  onRequestQuote: (item: SectionItem, index: number) => void;
  onCompareToggle: (index: number) => void;
  isCompareSelected: boolean;
  t: ReturnType<typeof getTranslations>;
  language: 'ar' | 'en';
  isMostPopular: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [featuresExpanded, setFeaturesExpanded] = useState(false);
  const config = (() => {
    try { return JSON.parse(item.config || '{}'); } catch { return {}; }
  })();
  const configEn = (() => {
    if (language === 'en' && item.configEn) {
      try { return JSON.parse(item.configEn); } catch { return null; }
    }
    return null;
  })();
  const activeConfig = configEn || config;
  const features: string[] = activeConfig.features || [];
  const IconComponent = item.icon ? iconMap[item.icon] : Code2;
  const numberedIndex = String(index + 1).padStart(2, '0');
  const price = servicePrices[String(index)] || { min: 500, max: 2000, currency: '$' };
  const category = serviceCategories[String(index)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.6, delay: 0.1 + index * 0.12, scale: { duration: 0.25 } }}
      className="stagger-children"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <TiltCard maxTilt={8} glareEnabled glareOpacity={0.08} scale={1.02} spotlightEnabled borderGlowEnabled className="rounded-xl h-full">
        <Card className="glass-card card-hover card-accent-top h-full group relative overflow-hidden border-glow rounded-xl">
          {/* Animated gradient border at bottom that sweeps on hover */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden">
            <motion.div
              className="h-full w-full bg-gradient-to-l from-emerald-500 via-teal-500 to-emerald-400"
              initial={{ scaleX: 0 }}
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{ transformOrigin: 'left' }}
            />
          </div>

          {/* Hover glow effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl" />
          </div>

          {/* Large number indicator in background */}
          <div className="absolute top-2 left-4 text-[6rem] font-black text-emerald-500/[0.04] leading-none select-none pointer-events-none">
            {numberedIndex}
          </div>

          {/* Most Popular badge */}
          {isMostPopular && (
            <motion.div
              className="absolute top-4 left-1/2 -translate-x-1/2 z-20"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Badge className="bg-gradient-to-l from-amber-500 to-orange-500 text-white border-0 text-[10px] px-3 py-1 shadow-lg shadow-amber-500/30">
                <Trophy className="w-3 h-3 mr-1" />
                {t.services.mostPopular}
              </Badge>
            </motion.div>
          )}

          {/* Compare checkbox indicator */}
          {isCompareSelected && (
            <motion.div
              className="absolute top-4 left-4 z-20"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <div className="w-6 h-6 rounded-full gradient-emerald flex items-center justify-center shadow-md">
                <Check className="w-3.5 h-3.5 text-white" />
              </div>
            </motion.div>
          )}

          {/* Animated service number with gradient background */}
          <div className="absolute top-4 left-4 z-10">
            <span
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold font-mono"
              style={{
                background: 'linear-gradient(135deg, #10b981, #14b8a6)',
                color: '#fff',
              }}
            >
              {numberedIndex}
            </span>
          </div>

          {/* Pricing hint badge */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            {category && (
              <Badge
                variant="secondary"
                className="text-[9px] font-medium text-white border-0"
                style={{ background: category.color.replace('bg-', '') }}
              >
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${category.color} mr-1`} />
                {t.services[categoryLabelKeys[String(index)] as keyof typeof t.services]}
              </Badge>
            )}
            <Badge
              variant="secondary"
              className="text-[10px] font-medium glass-card-sm border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
            >
              {t.services.startingFrom} {price.currency}{price.min}
            </Badge>
          </div>

          <CardContent className="p-6 space-y-4 relative z-10">
            {/* Animated Icon */}
            <AnimatedServiceIcon IconComponent={IconComponent} isHovered={isHovered} />

            {/* Title & Description */}
            <div>
              <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {item.description}
              </p>
            </div>

            {/* Features with hover-to-expand */}
            {features.length > 0 && (
              <div>
                <ul
                  className="space-y-1.5 cursor-pointer"
                  onClick={() => setFeaturesExpanded(!featuresExpanded)}
                >
                  <AnimatePresence>
                    {features.slice(0, featuresExpanded ? undefined : 3).map((feature, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{feature}</span>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                  {!featuresExpanded && features.length > 3 && (
                    <li className="text-xs text-muted-foreground/60 flex items-center gap-1">
                      +{features.length - 3}{' '}
                      <ChevronLeft className="w-3 h-3" />
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-2">
              <MagneticButton strength={0.25}>
                <button
                  onClick={() => onLearnMore(item, index)}
                  className="inline-flex items-center gap-1.5 text-sm text-primary font-medium group/link cursor-pointer"
                  data-cursor-hover
                >
                  <span className="animated-underline">{t.services.learnMore}</span>
                  <motion.span
                    className="inline-flex"
                    whileHover={{ x: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </motion.span>
                </button>
              </MagneticButton>

              <button
                onClick={() => onRequestQuote(item, index)}
                className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg gradient-emerald text-white hover:shadow-md hover:shadow-emerald-500/20 transition-shadow cursor-pointer"
              >
                <MessageSquareQuote className="w-3.5 h-3.5" />
                {t.services.requestQuote}
              </button>
            </div>
          </CardContent>
        </Card>
      </TiltCard>
    </motion.div>
  );
}

/* ===== Service Card (List View) ===== */
function ServiceCardList({
  item,
  index,
  isInView,
  onLearnMore,
  onRequestQuote,
  t,
  language,
  isMostPopular,
}: {
  item: SectionItem;
  index: number;
  isInView: boolean;
  onLearnMore: (item: SectionItem, index: number) => void;
  onRequestQuote: (item: SectionItem, index: number) => void;
  t: ReturnType<typeof getTranslations>;
  language: 'ar' | 'en';
  isMostPopular: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const config = (() => {
    try { return JSON.parse(item.config || '{}'); } catch { return {}; }
  })();
  const configEn = (() => {
    if (language === 'en' && item.configEn) {
      try { return JSON.parse(item.configEn); } catch { return null; }
    }
    return null;
  })();
  const activeConfig = configEn || config;
  const features: string[] = activeConfig.features || [];
  const IconComponent = item.icon ? iconMap[item.icon] : Code2;
  const numberedIndex = String(index + 1).padStart(2, '0');
  const price = servicePrices[String(index)] || { min: 500, max: 2000, currency: '$' };
  const category = serviceCategories[String(index)];

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.08 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="glass-card card-hover group relative overflow-hidden rounded-xl">
        <CardContent className="p-5 flex items-center gap-5 relative z-10">
          {/* Number */}
          <span
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-bold font-mono shrink-0"
            style={{
              background: 'linear-gradient(135deg, #10b981, #14b8a6)',
              color: '#fff',
            }}
          >
            {numberedIndex}
          </span>

          {/* Icon with floating animation */}
          <motion.div
            className="w-12 h-12 rounded-xl gradient-emerald flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow shrink-0 relative"
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            {IconComponent && <IconComponent className="w-6 h-6 text-white" />}
            <SparkleEffect visible={isHovered} />
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-bold text-base group-hover:text-primary transition-colors truncate">
                {item.title}
              </h3>
              {isMostPopular && (
                <Badge className="bg-gradient-to-l from-amber-500 to-orange-500 text-white border-0 text-[9px] px-2 py-0.5">
                  <Trophy className="w-2.5 h-2.5 mr-0.5" />
                  {t.services.mostPopular}
                </Badge>
              )}
              {category && (
                <Badge variant="secondary" className="text-[9px] font-medium text-white border-0" style={{ background: '#10b981' }}>
                  {t.services[categoryLabelKeys[String(index)] as keyof typeof t.services]}
                </Badge>
              )}
              <Badge
                variant="secondary"
                className="text-[10px] font-medium shrink-0 glass-card-sm border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              >
                {t.services.startingFrom} {price.currency}{price.min}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {item.description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onRequestQuote(item, index)}
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg gradient-emerald text-white hover:shadow-md hover:shadow-emerald-500/20 transition-shadow cursor-pointer"
            >
              <MessageSquareQuote className="w-3.5 h-3.5" />
              {t.services.requestQuote}
            </button>
            <button
              onClick={() => onLearnMore(item, index)}
              className="inline-flex items-center gap-1.5 text-sm text-primary font-medium group/link cursor-pointer"
            >
              <span className="animated-underline hidden sm:inline">{t.services.learnMore}</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ===== Comparison Dialog ===== */
function CompareDialog({
  open,
  onClose,
  selectedIndices,
  items,
  t,
  language,
}: {
  open: boolean;
  onClose: () => void;
  selectedIndices: number[];
  items: SectionItem[];
  t: ReturnType<typeof getTranslations>;
  language: 'ar' | 'en';
}) {
  const selectedServices = selectedIndices.map(i => ({
    item: items[i],
    index: i,
    price: servicePrices[String(i)] || { min: 500, max: 2000, currency: '$' },
    technologies: serviceTechnologies[String(i)] || [],
    features: serviceComparisonFeatures[String(i)] || [],
    availability: featureAvailability[String(i)] || [],
  }));

  // Get the max feature count
  const maxFeatures = Math.max(...selectedServices.map(s => s.features.length), 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompareArrows className="w-5 h-5 text-emerald-500" />
            {t.services.compareServices}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t.services.selectServicesToCompare}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[400px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground w-1/4">
                  {t.services.feature}
                </th>
                {selectedServices.map(({ item, index }) => (
                  <th key={index} className="text-center py-3 px-2 text-sm font-semibold min-w-[140px]">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-lg gradient-emerald flex items-center justify-center">
                        {(() => {
                          const IconComp = item.icon ? iconMap[item.icon] : Code2;
                          return IconComp && <IconComp className="w-5 h-5 text-white" />;
                        })()}
                      </div>
                      <span className="text-xs">{item.title}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Price row */}
              <tr className="border-b border-border/50">
                <td className="py-3 px-2 text-sm font-medium">{t.services.startingPrice}</td>
                {selectedServices.map(({ index, price }) => (
                  <td key={index} className="text-center py-3 px-2">
                    <span className="text-sm font-bold text-gradient-emerald">
                      {price.currency}{price.min} - {price.currency}{price.max}
                    </span>
                  </td>
                ))}
              </tr>
              {/* Technologies row */}
              <tr className="border-b border-border/50">
                <td className="py-3 px-2 text-sm font-medium">{t.services.technologies}</td>
                {selectedServices.map(({ index, technologies }) => (
                  <td key={index} className="text-center py-3 px-2">
                    <div className="flex flex-wrap justify-center gap-1">
                      {technologies.slice(0, 3).map(tech => (
                        <Badge key={tech} variant="secondary" className="text-[9px] px-1.5 py-0.5">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
              {/* Feature rows */}
              {Array.from({ length: maxFeatures }).map((_, featureIdx) => (
                <tr key={featureIdx} className="border-b border-border/30">
                  <td className="py-2.5 px-2 text-xs text-muted-foreground">
                    {selectedServices[0]?.features[featureIdx] || `Feature ${featureIdx + 1}`}
                  </td>
                  {selectedServices.map(({ index, availability }) => (
                    <td key={index} className="text-center py-2.5 px-2">
                      {availability[featureIdx] ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-red-400 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ===== Request Quote Wizard ===== */
function RequestQuoteWizard({
  open,
  onClose,
  initialServiceIndex,
  items,
  t,
  language,
}: {
  open: boolean;
  onClose: () => void;
  initialServiceIndex: number;
  items: SectionItem[];
  t: ReturnType<typeof getTranslations>;
  language: 'ar' | 'en';
}) {
  // Track previous open state for reset
  const prevOpenRef = useRef(false);
  // Reset when dialog transitions from closed to open
  const justOpened = open && !prevOpenRef.current;
  prevOpenRef.current = open;

  // Initial state values (used for reset)
  const initialFormState = {
    serviceIndex: initialServiceIndex,
    scope: 'medium' as 'small' | 'medium' | 'enterprise',
    timeline: '1-3',
    budget: '$1k-$5k',
    description: '',
    name: '',
    email: '',
    phone: '',
  };

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState(initialFormState);

  // Reset on open via key change pattern
  const wizardKey = justOpened ? Date.now() : 'stable';

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const scopeOptions: Array<{ value: 'small' | 'medium' | 'enterprise'; icon: React.ComponentType<{ className?: string }>; label: string }> = [
    { value: 'small', icon: Briefcase, label: t.services.small },
    { value: 'medium', icon: Building2Icon, label: t.services.medium },
    { value: 'enterprise', icon: Rocket, label: t.services.enterprise },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" key={wizardKey}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquareQuote className="w-5 h-5 text-emerald-500" />
            {t.services.requestQuote}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t.services.requestQuote} - {t.services.step} {step}/{totalSteps}
          </DialogDescription>
        </DialogHeader>

        {!submitted ? (
          <div className="space-y-6 mt-2">
            {/* Progress indicator */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t.services.step} {step}/{totalSteps}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-emerald-500/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full gradient-emerald rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
              <div className="flex justify-between">
                {[1, 2, 3].map(s => (
                  <button
                    key={s}
                    onClick={() => s < step && setStep(s)}
                    className={`flex items-center gap-1 text-[10px] ${s <= step ? 'text-emerald-500 font-semibold' : 'text-muted-foreground/40'}`}
                    disabled={s > step}
                  >
                    <CircleDot className="w-3 h-3" />
                    {s === 1 ? t.services.scope : s === 2 ? t.services.projectDetails : t.services.contactInfo}
                  </button>
                ))}
              </div>
            </div>

            {/* Step content with smooth transitions */}
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: language === 'ar' ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: language === 'ar' ? 20 : -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Service selection */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">{t.services.selectService}</Label>
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                      {items.map((item, i) => (
                        <button
                          key={item.id}
                          onClick={() => setForm(prev => ({ ...prev, serviceIndex: i }))}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-right cursor-pointer ${
                            form.serviceIndex === i
                              ? 'border-emerald-500 bg-emerald-500/5 shadow-sm'
                              : 'border-border hover:border-emerald-500/30'
                          }`}
                        >
                          {(() => {
                            const IconComp = item.icon ? iconMap[item.icon] : Code2;
                            return IconComp && <IconComp className={`w-5 h-5 ${form.serviceIndex === i ? 'text-emerald-500' : 'text-muted-foreground'}`} />;
                          })()}
                          <span className={`text-sm font-medium ${form.serviceIndex === i ? 'text-emerald-500' : ''}`}>
                            {item.title}
                          </span>
                          {form.serviceIndex === i && <Check className="w-4 h-4 text-emerald-500 mr-auto" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Scope selection */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">{t.services.scope}</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {scopeOptions.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setForm(prev => ({ ...prev, scope: opt.value }))}
                          className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer ${
                            form.scope === opt.value
                              ? 'border-emerald-500 bg-emerald-500/5 shadow-sm'
                              : 'border-border hover:border-emerald-500/30'
                          }`}
                        >
                          <opt.icon className={`w-5 h-5 ${form.scope === opt.value ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                          <span className={`text-xs font-medium ${form.scope === opt.value ? 'text-emerald-500' : ''}`}>
                            {opt.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: language === 'ar' ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: language === 'ar' ? 20 : -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div>
                    <Label className="text-sm font-medium mb-2 block">{t.services.timelineRange}</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {['1-2', '2-4', '4+'].map(tl => (
                        <button
                          key={tl}
                          onClick={() => setForm(prev => ({ ...prev, timeline: tl }))}
                          className={`p-3 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                            form.timeline === tl
                              ? 'border-emerald-500 bg-emerald-500/5 text-emerald-500'
                              : 'border-border hover:border-emerald-500/30'
                          }`}
                        >
                          {tl} {language === 'ar' ? (tl === '1' ? t.services.month : t.services.months) : (tl === '1' ? t.services.month : t.services.months)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">{t.services.budgetRange}</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {['<$1k', '$1k-$5k', '$5k+'].map(b => (
                        <button
                          key={b}
                          onClick={() => setForm(prev => ({ ...prev, budget: b }))}
                          className={`p-3 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                            form.budget === b
                              ? 'border-emerald-500 bg-emerald-500/5 text-emerald-500'
                              : 'border-border hover:border-emerald-500/30'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">{t.services.description}</Label>
                    <Textarea
                      value={form.description}
                      onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder={t.services.descriptionPlaceholder}
                      className="min-h-[80px] resize-none"
                    />
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: language === 'ar' ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: language === 'ar' ? 20 : -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div>
                    <Label className="text-sm font-medium mb-2 block">{t.contact.name}</Label>
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={form.name}
                        onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder={t.services.namePlaceholder}
                        className="pr-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">{t.contact.email}</Label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={form.email}
                        onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder={t.services.emailPlaceholder}
                        className="pr-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">{t.services.phone}</Label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="tel"
                        value={form.phone}
                        onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder={t.services.phonePlaceholder}
                        className="pr-10"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-2">
              <div>
                {step > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => setStep(s => s - 1)}>
                    {language === 'ar' ? <ArrowRight className="w-4 h-4 ml-1" /> : <ArrowLeft className="w-4 h-4 mr-1" />}
                    {t.services.previous}
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={onClose}>
                  {t.services.cancel}
                </Button>
                {step < totalSteps ? (
                  <Button
                    size="sm"
                    className="gradient-emerald text-white"
                    onClick={() => setStep(s => s + 1)}
                  >
                    {t.services.next}
                    {language === 'ar' ? <ArrowLeft className="w-4 h-4 mr-1" /> : <ChevronRight className="w-4 h-4 ml-1" />}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="gradient-emerald text-white"
                    onClick={handleSubmit}
                  >
                    <Send className="w-4 h-4 mr-1" />
                    {t.services.submit}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Success state */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8 text-center space-y-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
              className="w-16 h-16 rounded-full gradient-emerald flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30"
            >
              <Check className="w-8 h-8 text-white" />
            </motion.div>
            <h3 className="text-lg font-bold text-gradient-emerald">{t.services.quoteSuccess}</h3>
            <p className="text-sm text-muted-foreground">{t.services.quoteSuccessMsg}</p>
            <Button size="sm" className="gradient-emerald text-white mt-4" onClick={onClose}>
              {t.services.cancel}
            </Button>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* Building icon for medium scope */
function Building2Icon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
}

/* ===== Enhanced Service Detail Modal ===== */
function ServiceDetailModal({
  item,
  index,
  open,
  onClose,
  t,
  language,
}: {
  item: SectionItem | null;
  index: number;
  open: boolean;
  onClose: () => void;
  t: ReturnType<typeof getTranslations>;
  language: 'ar' | 'en';
}) {
  const [activeTab, setActiveTab] = useState<'details' | 'portfolio' | 'testimonials' | 'faq' | 'timeline'>('details');

  if (!item) return null;

  const config = (() => {
    try { return JSON.parse(item.config || '{}'); } catch { return {}; }
  })();
  const configEn = (() => {
    if (language === 'en' && item.configEn) {
      try { return JSON.parse(item.configEn); } catch { return null; }
    }
    return null;
  })();
  const activeConfig = configEn || config;
  const features: string[] = activeConfig.features || [];
  const IconComponent = item.icon ? iconMap[item.icon] : Code2;
  const numberedIndex = String(index + 1).padStart(2, '0');
  const price = servicePrices[String(index)] || { min: 500, max: 2000, currency: '$' };
  const technologies = serviceTechnologies[String(index)] || ['Next.js', 'TypeScript', 'Tailwind CSS'];
  const portfolio = servicePortfolio[String(index)] || [];
  const testimonials = serviceTestimonials[String(index)] || [];
  const faqs = serviceFAQs[String(index)] || [];
  const timeline = serviceTimelines[String(index)] || [];

  const tabs = [
    { id: 'details' as const, label: t.services.keyFeatures, icon: Zap },
    { id: 'portfolio' as const, label: t.services.portfolio, icon: ImageIcon },
    { id: 'testimonials' as const, label: t.services.clientTestimonials, icon: Star },
    { id: 'faq' as const, label: t.services.faq, icon: HelpCircle },
    { id: 'timeline' as const, label: t.services.deliveryTimeline, icon: Timer },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-emerald flex items-center justify-center shadow-md shadow-emerald-500/20">
              {IconComponent && <IconComponent className="w-5 h-5 text-white" />}
            </div>
            <span>{item.title}</span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t.services.serviceDetails} - {item.title}
          </DialogDescription>
        </DialogHeader>

        {/* Description */}
        <div className="mt-2">
          <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
        </div>

        {/* Starting Price */}
        <div className="flex items-center justify-between p-4 rounded-xl glass-card">
          <div>
            <p className="text-xs text-muted-foreground">{t.services.startingPrice}</p>
            <p className="text-2xl font-bold text-gradient-emerald">
              {price.currency}{price.min}
              <span className="text-sm text-muted-foreground font-normal"> - {price.currency}{price.max}</span>
            </p>
          </div>
          <div className="text-xs text-muted-foreground/60">#{numberedIndex}</div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-border">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border-b-2 border-emerald-500'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {features.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-500" />
                    {t.services.keyFeatures}
                  </h4>
                  <ul className="space-y-2">
                    {features.map((feature, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-500" />
                  {t.services.technologies}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {technologies.map((tech, i) => (
                    <motion.span
                      key={tech}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium glass-card-sm text-foreground"
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'portfolio' && (
            <motion.div
              key="portfolio"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {portfolio.length > 0 ? portfolio.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-xl glass-card border border-border/50 hover:border-emerald-500/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg gradient-emerald flex items-center justify-center shrink-0">
                      <ImageIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-sm">{language === 'ar' ? p.nameAr : p.name}</h5>
                      <p className="text-xs text-muted-foreground mt-1">{language === 'ar' ? p.descAr : p.desc}</p>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t.services.noPortfolio}
                </p>
              )}
            </motion.div>
          )}

          {activeTab === 'testimonials' && (
            <motion.div
              key="testimonials"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {testimonials.length > 0 ? testimonials.map((tm, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-xl glass-card border border-border/50"
                >
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: tm.rating }).map((_, si) => (
                      <Star key={si} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground italic mb-3">&ldquo;{language === 'ar' ? tm.textAr : tm.text}&rdquo;</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full gradient-emerald flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{(language === 'ar' ? tm.nameAr : tm.name).charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{language === 'ar' ? tm.nameAr : tm.name}</p>
                      <p className="text-[10px] text-muted-foreground">{language === 'ar' ? tm.roleAr : tm.role}</p>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t.services.noTestimonials}
                </p>
              )}
            </motion.div>
          )}

          {activeTab === 'faq' && (
            <motion.div
              key="faq"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {faqs.length > 0 ? faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="p-4 rounded-xl glass-card border border-border/50"
                >
                  <h5 className="font-semibold text-sm flex items-center gap-2 mb-2">
                    <HelpCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    {language === 'ar' ? faq.qAr : faq.q}
                  </h5>
                  <p className="text-sm text-muted-foreground">{language === 'ar' ? faq.aAr : faq.a}</p>
                </motion.div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t.services.noFAQ}
                </p>
              )}
            </motion.div>
          )}

          {activeTab === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-0"
            >
              {timeline.length > 0 ? timeline.map((tl, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4"
                >
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full gradient-emerald flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                      <span className="text-xs font-bold text-white">{i + 1}</span>
                    </div>
                    {i < timeline.length - 1 && (
                      <div className="w-0.5 flex-1 bg-emerald-500/20 my-1" />
                    )}
                  </div>
                  {/* Content */}
                  <div className="pb-6">
                    <h5 className="font-semibold text-sm">{language === 'ar' ? tl.phaseAr : tl.phase}</h5>
                    <div className="flex items-center gap-1.5 mt-1">
                      <CalendarDays className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-xs text-muted-foreground">{language === 'ar' ? tl.durationAr : tl.duration}</span>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t.services.noTimeline}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA Button */}
        <Button
          className="w-full gradient-emerald text-white hover:shadow-lg hover:shadow-emerald-500/20 transition-shadow mt-4"
          size="lg"
          onClick={() => {
            const contactSection = document.querySelector('#contact');
            if (contactSection) {
              contactSection.scrollIntoView({ behavior: 'smooth' });
              onClose();
            }
          }}
        >
          {t.services.contactUs}
          <ArrowLeft className="w-4 h-4 mr-2" />
        </Button>
      </DialogContent>
    </Dialog>
  );
}

/* ===== Animated Mesh Gradient Background ===== */
function MeshGradientBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full opacity-[0.04]"
        style={{
          background: 'radial-gradient(circle, #10b981 0%, transparent 70%)',
          left: '10%',
          top: '-20%',
        }}
        animate={{
          x: [0, 50, -30, 0],
          y: [0, 30, -20, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full opacity-[0.04]"
        style={{
          background: 'radial-gradient(circle, #14b8a6 0%, transparent 70%)',
          right: '5%',
          bottom: '-15%',
        }}
        animate={{
          x: [0, -40, 30, 0],
          y: [0, -20, 40, 0],
          scale: [1, 0.95, 1.1, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full opacity-[0.03]"
        style={{
          background: 'radial-gradient(circle, #059669 0%, transparent 70%)',
          left: '40%',
          top: '30%',
        }}
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -30, 20, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

/* ===== Main Services Section ===== */
export function ServicesSection({ section }: ServicesSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const { language } = useLanguageStore();
  const t = getTranslations(language);

  const localizedSection = localizeSection(section, language);

  // Create localized items by merging localized text fields into each item
  const localizedItems = useMemo(() =>
    section.items.map((item) => {
      const localized = localizeSectionItem(item, language);
      return { ...item, title: localized.title, subtitle: localized.subtitle, description: localized.description };
    }),
  [section.items, language]);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedService, setSelectedService] = useState<SectionItem | null>(null);
  const [selectedServiceIndex, setSelectedServiceIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  // Compare state
  const [compareMode, setCompareMode] = useState(false);
  const [compareSelected, setCompareSelected] = useState<number[]>([]);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);

  // Quote wizard state
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteServiceIndex, setQuoteServiceIndex] = useState(0);

  const handleLearnMore = (item: SectionItem, index: number) => {
    setSelectedService(item);
    setSelectedServiceIndex(index);
    setModalOpen(true);
  };

  const handleRequestQuote = (item: SectionItem, index: number) => {
    setQuoteServiceIndex(index);
    setQuoteOpen(true);
  };

  const handleCompareToggle = useCallback((index: number) => {
    setCompareSelected(prev => {
      if (prev.includes(index)) return prev.filter(i => i !== index);
      if (prev.length >= 3) return prev;
      return [...prev, index];
    });
  }, []);

  const handleCompareOpen = () => {
    if (compareSelected.length >= 2) {
      setCompareDialogOpen(true);
    }
  };

  const processSteps = [
    { icon: FileSearch, label: t.services.discovery },
    { icon: PenTool, label: t.services.design },
    { icon: Code2, label: t.services.development },
    { icon: Rocket, label: t.services.delivery },
  ];

  // Determine the "most popular" service (index 0 by default)
  const mostPopularIndex = 0;

  return (
    <section
      id="services"
      ref={sectionRef}
      aria-labelledby="services-heading"
      className="section-padding relative overflow-hidden bg-grid-pattern"
    >
      {/* Animated mesh gradient background */}
      <MeshGradientBackground />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card-sm text-xs font-medium text-primary mb-4"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>{t.services.myServices}</span>
          </motion.div>
          <h2 id="services-heading" className="text-3xl sm:text-4xl font-bold mb-4 text-shimmer-heading">{localizedSection.title}</h2>
          {localizedSection.subtitle && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {localizedSection.subtitle}
            </p>
          )}
        </motion.div>

        {/* Process Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <h3 className="text-center text-sm font-semibold text-muted-foreground mb-6">
            {t.services.process}
          </h3>
          <div className="flex items-center justify-center max-w-2xl mx-auto">
            {processSteps.map((step, i) => (
              <ProcessStep
                key={i}
                icon={step.icon}
                label={step.label}
                index={i}
                totalSteps={processSteps.length}
                isInView={isInView}
              />
            ))}
          </div>
        </motion.div>

        {/* Toolbar: View toggle + Compare */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between gap-4 mb-6 flex-wrap"
        >
          <div className="flex items-center gap-2">
            <Button
              variant={compareMode ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setCompareMode(!compareMode);
                if (compareMode) setCompareSelected([]);
              }}
              className={`h-8 px-3 ${compareMode ? 'gradient-emerald text-white' : ''}`}
            >
              <GitCompareArrows className="w-4 h-4 ml-1" />
              {t.services.compare}
            </Button>
            {compareMode && compareSelected.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Button
                  size="sm"
                  onClick={handleCompareOpen}
                  className="h-8 px-3 gradient-emerald text-white"
                >
                  {t.services.compareServices} ({compareSelected.length})
                </Button>
              </motion.div>
            )}
            {compareMode && (
              <span className="text-xs text-muted-foreground">
                {t.services.selectServicesToCompare}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`h-8 px-3 ${viewMode === 'grid' ? 'gradient-emerald text-white' : ''}`}
              aria-label={t.services.gridView}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={`h-8 px-3 ${viewMode === 'list' ? 'gradient-emerald text-white' : ''}`}
              aria-label={t.services.listView}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Services Display */}
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-fade"
            >
              {localizedItems.map((item, index) => (
                <div key={item.id} className="relative">
                  {/* Compare selection overlay */}
                  {compareMode && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`absolute top-4 left-4 z-30 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                        compareSelected.includes(index)
                          ? 'gradient-emerald border-emerald-500'
                          : 'border-muted-foreground/30 bg-background/80 backdrop-blur-sm hover:border-emerald-500/50'
                      }`}
                      onClick={() => handleCompareToggle(index)}
                    >
                      {compareSelected.includes(index) && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </motion.button>
                  )}
                  <ServiceCardGrid
                    item={item}
                    index={index}
                    isInView={isInView}
                    onLearnMore={handleLearnMore}
                    onRequestQuote={handleRequestQuote}
                    onCompareToggle={handleCompareToggle}
                    isCompareSelected={compareSelected.includes(index)}
                    t={t}
                    language={language}
                    isMostPopular={index === mostPopularIndex}
                  />
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {localizedItems.map((item, index) => (
                <div key={item.id} className="relative">
                  {compareMode && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`absolute top-5 left-5 z-30 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                        compareSelected.includes(index)
                          ? 'gradient-emerald border-emerald-500'
                          : 'border-muted-foreground/30 bg-background/80 backdrop-blur-sm hover:border-emerald-500/50'
                      }`}
                      onClick={() => handleCompareToggle(index)}
                    >
                      {compareSelected.includes(index) && (
                        <Check className="w-3.5 h-3.5 text-white" />
                      )}
                    </motion.button>
                  )}
                  <ServiceCardList
                    item={item}
                    index={index}
                    isInView={isInView}
                    onLearnMore={handleLearnMore}
                    onRequestQuote={handleRequestQuote}
                    t={t}
                    language={language}
                    isMostPopular={index === mostPopularIndex}
                  />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Service Detail Modal */}
      <ServiceDetailModal
        item={selectedService}
        index={selectedServiceIndex}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        t={t}
        language={language}
      />

      {/* Compare Dialog */}
      <CompareDialog
        open={compareDialogOpen}
        onClose={() => setCompareDialogOpen(false)}
        selectedIndices={compareSelected}
        items={localizedItems}
        t={t}
        language={language}
      />

      {/* Request Quote Wizard */}
      <RequestQuoteWizard
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        initialServiceIndex={quoteServiceIndex}
        items={localizedItems}
        t={t}
        language={language}
      />
    </section>
  );
}
