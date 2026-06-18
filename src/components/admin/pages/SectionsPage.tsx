'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { FormModal } from '../shared/FormModal';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { TextField, SelectField, SwitchField } from '../shared/FormFields';
import { IconSelect } from '../shared/IconSelect';
import { LayoutSelector } from '../shared/LayoutSelector';
import { toast } from 'sonner';
import {
  GripVertical, Plus, Pencil, Trash2, Eye, EyeOff,
  Copy, LayoutGrid, Type, Code2, Wrench, GraduationCap,
  Briefcase, MessageSquareQuote, HelpCircle, Mail, BookOpen,
  Layers, ChevronDown, ChevronUp,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';

interface Section {
  id: string;
  type: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  config: string;
  content: string;
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

interface SectionItem {
  id: string;
  sectionId: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  content: string;
  imageUrl: string | null;
  icon: string | null;
  link: string | null;
  linkText: string | null;
  order: number;
  isVisible: boolean;
  config: string;
  tags: string | null;
  startDate: string | null;
  endDate: string | null;
  rating: number | null;
}

const SECTION_TYPES = [
  { label: 'البطل (Hero)', value: 'hero' },
  { label: 'عن (About)', value: 'about' },
  { label: 'المهارات', value: 'skills' },
  { label: 'المشاريع', value: 'projects' },
  { label: 'الخدمات', value: 'services' },
  { label: 'الشهادات', value: 'testimonials' },
  { label: 'الخبرات', value: 'experience' },
  { label: 'التعليم', value: 'education' },
  { label: 'الأسئلة الشائعة', value: 'faq' },
  { label: 'التواصل', value: 'contact' },
  { label: 'المدونة', value: 'blog' },
  { label: 'مخصص', value: 'custom' },
];

const LAYOUTS = [
  { label: 'افتراضي', value: 'default' },
  { label: 'شبكة', value: 'grid' },
  { label: 'بناء', value: 'masonry' },
  { label: 'كاروسيل', value: 'carousel' },
  { label: 'خط زمني', value: 'timeline' },
  { label: 'بطاقات', value: 'cards' },
  { label: 'منقسم', value: 'split' },
  { label: 'عرض كامل', value: 'fullwidth' },
];

const ANIMATIONS = [
  { label: 'تلاشي', value: 'fade' },
  { label: 'انزلاق', value: 'slide' },
  { label: 'تكبير', value: 'zoom' },
  { label: 'تدوير', value: 'flip' },
  { label: 'ارتداد', value: 'bounce' },
];

const BG_TYPES = [
  { label: 'افتراضي', value: 'default' },
  { label: 'تدرج', value: 'gradient' },
  { label: 'صورة', value: 'image' },
  { label: 'نمط', value: 'pattern' },
  { label: 'جسيمات', value: 'particle' },
];

// Section type config with icon and color
const SECTION_TYPE_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  hero: { icon: LayoutGrid, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  about: { icon: Type, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  skills: { icon: Code2, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
  projects: { icon: LayoutGrid, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  services: { icon: Wrench, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  testimonials: { icon: MessageSquareQuote, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-100 dark:bg-pink-900/30' },
  experience: { icon: Briefcase, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  education: { icon: GraduationCap, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-100 dark:bg-teal-900/30' },
  faq: { icon: HelpCircle, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/30' },
  contact: { icon: Mail, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  blog: { icon: BookOpen, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-100 dark:bg-violet-900/30' },
  custom: { icon: Layers, color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-900/30' },
};

function SortableSection({ section, onEdit, onDelete, onToggleVisible, onDuplicate, selected, onToggleSelect }: {
  section: Section;
  onEdit: (s: Section) => void;
  onDelete: (s: Section) => void;
  onToggleVisible: (s: Section) => void;
  onDuplicate: (s: Section) => void;
  selected: boolean;
  onToggleSelect: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const [expanded, setExpanded] = useState(false);
  const typeConfig = SECTION_TYPE_CONFIG[section.type] || SECTION_TYPE_CONFIG.custom;
  const TypeIcon = typeConfig.icon;

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`mb-2 overflow-hidden transition-all duration-200 ${!section.isVisible ? 'opacity-60' : 'hover:shadow-lg'} ${selected ? 'ring-2 ring-emerald-500' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Checkbox checked={selected} onCheckedChange={() => onToggleSelect(section.id)} className="shrink-0" />
            <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1" type="button">
              <GripVertical className="h-5 w-5" />
            </button>
            {/* Type icon */}
            <div className={`w-9 h-9 rounded-lg ${typeConfig.bg} flex items-center justify-center shrink-0`}>
              <TypeIcon className={`h-4 w-4 ${typeConfig.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{section.title}</span>
                <Badge variant="outline" className="text-xs">{SECTION_TYPES.find((t) => t.value === section.type)?.label || section.type}</Badge>
                {!section.isVisible && (
                  <Badge className="text-xs bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">مخفي</Badge>
                )}
              </div>
              {section.subtitle && <p className="text-sm text-muted-foreground truncate mt-0.5">{section.subtitle}</p>}
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant="secondary" className="text-xs">{section.items?.length || 0} عنصر</Badge>
              <button onClick={() => onToggleVisible(section)} className="p-1.5 rounded-md hover:bg-accent" type="button" title={section.isVisible ? 'إخفاء' : 'إظهار'}>
                {section.isVisible ? <Eye className="h-4 w-4 text-emerald-500" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
              </button>
              <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-md hover:bg-accent" type="button" title="تفاصيل">
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDuplicate(section)} title="نسخ">
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(section)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => onDelete(section)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Expanded Details */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-3 border-t space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-muted/50">
                      <span className="text-muted-foreground">التخطيط:</span>
                      <span className="font-medium mr-1">{LAYOUTS.find(l => l.value === section.layout)?.label || section.layout}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <span className="text-muted-foreground">الرسوم:</span>
                      <span className="font-medium mr-1">{ANIMATIONS.find(a => a.value === section.animation)?.label || section.animation}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <span className="text-muted-foreground">الخلفية:</span>
                      <span className="font-medium mr-1">{BG_TYPES.find(b => b.value === section.bgType)?.label || section.bgType}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <span className="text-muted-foreground">الترتيب:</span>
                      <span className="font-medium mr-1">{section.order}</span>
                    </div>
                  </div>
                  {section.description && (
                    <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg">{section.description}</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}

export function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Section | null>(null);
  const [saving, setSaving] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SectionItem | null>(null);
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [addTypeOpen, setAddTypeOpen] = useState(false);

  // Form state
  const [formType, setFormType] = useState('hero');
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLayout, setFormLayout] = useState('default');
  const [formAnimation, setFormAnimation] = useState('fade');
  const [formBgType, setFormBgType] = useState('default');
  const [formBgValue, setFormBgValue] = useState('');
  const [formIsVisible, setFormIsVisible] = useState(true);

  // Item form state
  const [itemTitle, setItemTitle] = useState('');
  const [itemSubtitle, setItemSubtitle] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemIcon, setItemIcon] = useState('');
  const [itemLink, setItemLink] = useState('');
  const [itemLinkText, setItemLinkText] = useState('');
  const [itemIsVisible, setItemIsVisible] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchSections = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sections');
      const json = await res.json();
      if (json.success) setSections(json.data);
    } catch (err) {
      console.error('Failed to fetch sections:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSections(); }, [fetchSections]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(sections, oldIndex, newIndex);
    setSections(reordered);

    try {
      await fetch('/api/sections/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: reordered.map((s) => s.id) }),
      });
      toast.success('تم إعادة ترتيب الأقسام');
    } catch {
      toast.error('فشل إعادة الترتيب');
      fetchSections();
    }
  };

  const openCreate = (type?: string) => {
    setEditingSection(null);
    setFormType(type || 'hero'); setFormTitle(''); setFormSubtitle(''); setFormDescription('');
    setFormLayout('default'); setFormAnimation('fade'); setFormBgType('default'); setFormBgValue('');
    setFormIsVisible(true);
    setAddTypeOpen(false);
    setModalOpen(true);
  };

  const openEdit = (s: Section) => {
    setEditingSection(s);
    setFormType(s.type); setFormTitle(s.title); setFormSubtitle(s.subtitle || '');
    setFormDescription(s.description || ''); setFormLayout(s.layout); setFormAnimation(s.animation);
    setFormBgType(s.bgType); setFormBgValue(s.bgValue || ''); setFormIsVisible(s.isVisible);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim()) { toast.error('العنوان مطلوب'); return; }
    setSaving(true);
    try {
      const body = {
        type: formType, title: formTitle, subtitle: formSubtitle || null,
        description: formDescription || null, layout: formLayout, animation: formAnimation,
        bgType: formBgType, bgValue: formBgValue || null, isVisible: formIsVisible,
      };
      if (editingSection) {
        const res = await fetch(`/api/sections/${editingSection.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        toast.success('تم تحديث القسم');
      } else {
        const res = await fetch('/api/sections', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        toast.success('تم إنشاء القسم');
      }
      setModalOpen(false);
      fetchSections();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/sections/${deleteConfirm.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success('تم حذف القسم');
      fetchSections();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل الحذف');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleToggleVisible = async (s: Section) => {
    try {
      const res = await fetch(`/api/sections/${s.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !s.isVisible }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success(s.isVisible ? 'تم إخفاء القسم' : 'تم إظهار القسم');
      fetchSections();
    } catch {
      toast.error('فشل التحديث');
    }
  };

  const handleDuplicate = async (s: Section) => {
    try {
      const body = {
        type: s.type, title: `${s.title} (نسخة)`, subtitle: s.subtitle,
        description: s.description, layout: s.layout, animation: s.animation,
        bgType: s.bgType, bgValue: s.bgValue, isVisible: false,
      };
      const res = await fetch('/api/sections', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success('تم نسخ القسم');
      fetchSections();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل النسخ');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleBulkToggle = async (visible: boolean) => {
    try {
      await Promise.all(
        Array.from(selectedIds).map(id =>
          fetch(`/api/sections/${id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isVisible: visible }),
          })
        )
      );
      toast.success(visible ? 'تم إظهار الأقسام المحددة' : 'تم إخفاء الأقسام المحددة');
      setSelectedIds(new Set());
      fetchSections();
    } catch {
      toast.error('فشل التحديث');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        Array.from(selectedIds).map(id =>
          fetch(`/api/sections/${id}`, { method: 'DELETE' })
        )
      );
      toast.success('تم حذف الأقسام المحددة');
      setSelectedIds(new Set());
      fetchSections();
    } catch {
      toast.error('فشل الحذف');
    }
  };

  // Item management
  const openItemCreate = (section: Section) => {
    setActiveSection(section);
    setEditingItem(null);
    setItemTitle(''); setItemSubtitle(''); setItemDescription('');
    setItemIcon(''); setItemLink(''); setItemLinkText(''); setItemIsVisible(true);
    setItemModalOpen(true);
  };

  const openItemEdit = (section: Section, item: SectionItem) => {
    setActiveSection(section);
    setEditingItem(item);
    setItemTitle(item.title || ''); setItemSubtitle(item.subtitle || '');
    setItemDescription(item.description || ''); setItemIcon(item.icon || '');
    setItemLink(item.link || ''); setItemLinkText(item.linkText || '');
    setItemIsVisible(item.isVisible);
    setItemModalOpen(true);
  };

  const handleItemSave = async () => {
    if (!activeSection) return;
    setSaving(true);
    try {
      const body = {
        sectionId: activeSection.id,
        title: itemTitle || null, subtitle: itemSubtitle || null,
        description: itemDescription || null, icon: itemIcon || null,
        link: itemLink || null, linkText: itemLinkText || null,
        isVisible: itemIsVisible,
      };
      if (editingItem) {
        const res = await fetch(`/api/section-items/${editingItem.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        toast.success('تم تحديث العنصر');
      } else {
        const res = await fetch('/api/section-items', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        toast.success('تم إنشاء العنصر');
      }
      setItemModalOpen(false);
      fetchSections();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleItemDelete = async (itemId: string) => {
    try {
      const res = await fetch(`/api/section-items/${itemId}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success('تم حذف العنصر');
      fetchSections();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل الحذف');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة الأقسام</h1>
          <p className="text-muted-foreground">رتب وأدر أقسام الموقع</p>
        </div>
        <Button onClick={() => setAddTypeOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> قسم جديد
        </Button>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800"
        >
          <span className="text-sm font-medium">{selectedIds.size} قسم محدد</span>
          <Button variant="outline" size="sm" onClick={() => handleBulkToggle(true)} className="gap-1">
            <Eye className="h-3 w-3" /> إظهار
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleBulkToggle(false)} className="gap-1">
            <EyeOff className="h-3 w-3" /> إخفاء
          </Button>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="gap-1">
            <Trash2 className="h-3 w-3" /> حذف
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
            إلغاء التحديد
          </Button>
        </motion.div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {sections.map((section) => (
            <div key={section.id}>
              <SortableSection
                section={section}
                onEdit={openEdit}
                onDelete={setDeleteConfirm}
                onToggleVisible={handleToggleVisible}
                onDuplicate={handleDuplicate}
                selected={selectedIds.has(section.id)}
                onToggleSelect={toggleSelect}
              />
              {/* Section Items */}
              {section.items && section.items.length > 0 && (
                <div className="mr-12 mb-4 space-y-1.5">
                  {section.items.map((item) => {
                    const typeConfig = SECTION_TYPE_CONFIG[section.type] || SECTION_TYPE_CONFIG.custom;
                    return (
                      <div key={item.id} className={`flex items-center gap-2 p-2.5 rounded-lg border text-sm transition-colors ${!item.isVisible ? 'opacity-50 bg-muted/20' : 'bg-muted/30 hover:bg-muted/50'}`}>
                        <div className={`w-6 h-6 rounded ${typeConfig.bg} flex items-center justify-center shrink-0`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${typeConfig.color.replace('text-', 'bg-')}`} />
                        </div>
                        <span className="flex-1 truncate">{item.title || item.subtitle || 'عنصر'}</span>
                        <Switch checked={item.isVisible} onCheckedChange={() => {
                          fetch(`/api/section-items/${item.id}`, {
                            method: 'PUT', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ isVisible: !item.isVisible }),
                          }).then(() => fetchSections());
                        }} />
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openItemEdit(section, item)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleItemDelete(item.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="mr-12 mb-4">
                <Button variant="outline" size="sm" onClick={() => openItemCreate(section)} className="gap-1 text-xs">
                  <Plus className="h-3 w-3" /> إضافة عنصر
                </Button>
              </div>
            </div>
          ))}
        </SortableContext>
      </DndContext>

      {sections.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            لا توجد أقسام بعد. اضغط على &quot;قسم جديد&quot; للبدء.
          </CardContent>
        </Card>
      )}

      {/* Add Section Type Selector */}
      {addTypeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setAddTypeOpen(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card rounded-2xl p-6 shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4">اختر نوع القسم</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SECTION_TYPES.map((type) => {
                const config = SECTION_TYPE_CONFIG[type.value] || SECTION_TYPE_CONFIG.custom;
                const Icon = config.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => openCreate(type.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-transparent ${config.bg} hover:border-emerald-500 transition-all duration-200 hover:shadow-md`}
                  >
                    <Icon className={`h-6 w-6 ${config.color}`} />
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => setAddTypeOpen(false)}>إلغاء</Button>
          </motion.div>
        </div>
      )}

      {/* Section Modal */}
      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editingSection ? 'تعديل القسم' : 'قسم جديد'} onSubmit={handleSave} loading={saving}>
        <SelectField label="نوع القسم" value={formType} onChange={setFormType} options={SECTION_TYPES} />
        <TextField label="العنوان" value={formTitle} onChange={setFormTitle} placeholder="عنوان القسم" />
        <TextField label="العنوان الفرعي" value={formSubtitle} onChange={setFormSubtitle} placeholder="عنوان فرعي اختياري" />
        <TextField label="الوصف" value={formDescription} onChange={setFormDescription} placeholder="وصف اختياري" />
        <LayoutSelector value={formLayout} onChange={setFormLayout} />
        <SelectField label="الرسوم المتحركة" value={formAnimation} onChange={setFormAnimation} options={ANIMATIONS} />
        <div className="grid grid-cols-2 gap-4">
          <SelectField label="نوع الخلفية" value={formBgType} onChange={setFormBgType} options={BG_TYPES} />
          <TextField label="قيمة الخلفية" value={formBgValue} onChange={setFormBgValue} placeholder="رابط أو لون" />
        </div>
        <SwitchField label="مرئي" checked={formIsVisible} onChange={setFormIsVisible} description="إظهار القسم على الموقع" />
      </FormModal>

      {/* Item Modal */}
      <FormModal open={itemModalOpen} onClose={() => setItemModalOpen(false)} title={editingItem ? 'تعديل العنصر' : 'عنصر جديد'} onSubmit={handleItemSave} loading={saving}>
        <TextField label="العنوان" value={itemTitle} onChange={setItemTitle} placeholder="عنوان العنصر" />
        <TextField label="العنوان الفرعي" value={itemSubtitle} onChange={setItemSubtitle} placeholder="عنوان فرعي" />
        <TextField label="الوصف" value={itemDescription} onChange={setItemDescription} placeholder="وصف العنصر" />
        <IconSelect label="الأيقونة" value={itemIcon || undefined} onChange={setItemIcon} />
        <TextField label="الرابط" value={itemLink} onChange={setItemLink} placeholder="https://..." />
        <TextField label="نص الرابط" value={itemLinkText} onChange={setItemLinkText} placeholder="افتح الرابط" />
        <SwitchField label="مرئي" checked={itemIsVisible} onChange={setItemIsVisible} />
      </FormModal>

      {/* Delete Confirm */}
      <ConfirmDialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete} title="حذف القسم" description={`هل أنت متأكد من حذف "${deleteConfirm?.title}"؟ سيتم حذف جميع العناصر المرتبطة.`} variant="destructive" confirmLabel="حذف" />
    </div>
  );
}
