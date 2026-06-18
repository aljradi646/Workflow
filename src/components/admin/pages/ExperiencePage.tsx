'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FormModal } from '../shared/FormModal';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { TextField, TextAreaField, SelectField, SwitchField } from '../shared/FormFields';
import { TagsInput } from '../shared/TagsInput';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Briefcase } from 'lucide-react';

interface Experience {
  id: string;
  title: string;
  company: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  description: string | null;
  content: string | null;
  type: string;
  order: number;
  isVisible: boolean;
  technologies: string | null;
}

const TYPE_OPTIONS = [
  { label: 'عمل', value: 'work' },
  { label: 'عمل حر', value: 'freelance' },
  { label: 'تدريب', value: 'internship' },
  { label: 'تطوع', value: 'volunteer' },
];

export function ExperiencePage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Experience | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Experience | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('work');
  const [isVisible, setIsVisible] = useState(true);
  const [technologies, setTechnologies] = useState<string[]>([]);

  const fetchExperiences = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/experiences');
      const json = await res.json();
      if (json.success) setExperiences(json.data);
    } catch (err) {
      console.error('Failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchExperiences(); }, [fetchExperiences]);

  const openCreate = () => {
    setEditing(null);
    setTitle(''); setCompany(''); setLocation(''); setStartDate('');
    setEndDate(''); setDescription(''); setContent(''); setType('work');
    setIsVisible(true); setTechnologies([]);
    setModalOpen(true);
  };

  const openEdit = (e: Experience) => {
    setEditing(e);
    setTitle(e.title); setCompany(e.company); setLocation(e.location || '');
    setStartDate(e.startDate); setEndDate(e.endDate || '');
    setDescription(e.description || ''); setContent(e.content || '');
    setType(e.type); setIsVisible(e.isVisible);
    setTechnologies(e.technologies ? JSON.parse(e.technologies) : []);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !company.trim() || !startDate) { toast.error('العنوان والشركة وتاريخ البدء مطلوبة'); return; }
    setSaving(true);
    try {
      const body = {
        title, company, location: location || null, startDate, endDate: endDate || null,
        description: description || null, content: content || null, type, isVisible,
        technologies: technologies.length > 0 ? JSON.stringify(technologies) : null,
      };
      if (editing) {
        const res = await fetch(`/api/experiences/${editing.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        toast.success('تم تحديث الخبرة');
      } else {
        const res = await fetch('/api/experiences', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        toast.success('تم إنشاء الخبرة');
      }
      setModalOpen(false);
      fetchExperiences();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/experiences/${deleteConfirm.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success('تم حذف الخبرة');
      fetchExperiences();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل الحذف');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const typeLabel = (t: string) => TYPE_OPTIONS.find((o) => o.value === t)?.label || t;

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة الخبرات</h1>
          <p className="text-muted-foreground">{experiences.length} خبرة</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> خبرة جديدة
        </Button>
      </div>

      {/* Timeline Preview */}
      <div className="relative space-y-0">
        {experiences.map((e, idx) => (
          <div key={e.id} className="flex gap-4 relative pb-6">
            {/* Timeline line */}
            {idx < experiences.length - 1 && (
              <div className="absolute right-5 top-10 bottom-0 w-0.5 bg-border" />
            )}
            {/* Timeline dot */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 ${
              e.type === 'work' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-teal-100 dark:bg-teal-900/30'
            }`}>
              <Briefcase className={`h-4 w-4 ${e.type === 'work' ? 'text-emerald-600' : 'text-teal-600'}`} />
            </div>
            {/* Content */}
            <Card className="flex-1 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{e.title}</h3>
                      <Badge variant="outline">{typeLabel(e.type)}</Badge>
                      {!e.endDate && <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">حالي</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{e.company}{e.location ? ` - ${e.location}` : ''}</p>
                    <p className="text-xs text-muted-foreground mt-1">{e.startDate} → {e.endDate || 'الآن'}</p>
                    {e.description && <p className="text-sm mt-2 line-clamp-2">{e.description}</p>}
                    {e.technologies && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {JSON.parse(e.technologies).map((t: string) => (
                          <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(e)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(e)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {experiences.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">لا توجد خبرات بعد</CardContent></Card>
      )}

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'تعديل الخبرة' : 'خبرة جديدة'} onSubmit={handleSave} loading={saving}>
        <TextField label="المسمى الوظيفي" value={title} onChange={setTitle} placeholder="مطور ويب" />
        <div className="grid grid-cols-2 gap-4">
          <TextField label="الشركة" value={company} onChange={setCompany} placeholder="اسم الشركة" />
          <TextField label="الموقع" value={location} onChange={setLocation} placeholder="المدينة" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <TextField label="تاريخ البدء" value={startDate} onChange={setStartDate} placeholder="2023-01" />
          <TextField label="تاريخ الانتهاء" value={endDate} onChange={setEndDate} placeholder="اتركه فارغًا للوظيفة الحالية" />
        </div>
        <SelectField label="النوع" value={type} onChange={setType} options={TYPE_OPTIONS} />
        <TextAreaField label="الوصف" value={description} onChange={setDescription} placeholder="وصف مختصر" />
        <TextAreaField label="المحتوى" value={content} onChange={setContent} placeholder="تفاصيل إضافية" rows={6} />
        <TagsInput label="التقنيات" value={technologies} onChange={setTechnologies} />
        <SwitchField label="مرئي" checked={isVisible} onChange={setIsVisible} />
      </FormModal>

      <ConfirmDialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete} title="حذف الخبرة" description={`هل أنت متأكد من حذف "${deleteConfirm?.title}"؟`} variant="destructive" confirmLabel="حذف" />
    </div>
  );
}
