'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FormModal } from '../shared/FormModal';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { TextField, TextAreaField, SwitchField } from '../shared/FormFields';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, GraduationCap } from 'lucide-react';

interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  description: string | null;
  grade: string | null;
  certificate: string | null;
  order: number;
  isVisible: boolean;
}

export function EducationPage() {
  const [items, setItems] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Education | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Education | null>(null);
  const [saving, setSaving] = useState(false);

  const [degree, setDegree] = useState('');
  const [institution, setInstitution] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [grade, setGrade] = useState('');
  const [certificate, setCertificate] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/education');
      const json = await res.json();
      if (json.success) setItems(json.data);
    } catch (err) {
      console.error('Failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openCreate = () => {
    setEditing(null);
    setDegree(''); setInstitution(''); setLocation(''); setStartDate('');
    setEndDate(''); setDescription(''); setGrade(''); setCertificate('');
    setIsVisible(true);
    setModalOpen(true);
  };

  const openEdit = (e: Education) => {
    setEditing(e);
    setDegree(e.degree); setInstitution(e.institution); setLocation(e.location || '');
    setStartDate(e.startDate); setEndDate(e.endDate || '');
    setDescription(e.description || ''); setGrade(e.grade || '');
    setCertificate(e.certificate || ''); setIsVisible(e.isVisible);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!degree.trim() || !institution.trim()) { toast.error('الدرجة والمؤسسة مطلوبان'); return; }
    setSaving(true);
    try {
      const body = {
        degree, institution, location: location || null, startDate,
        endDate: endDate || null, description: description || null,
        grade: grade || null, certificate: certificate || null, isVisible,
      };
      if (editing) {
        const res = await fetch(`/api/education/${editing.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        toast.success('تم تحديث التعليم');
      } else {
        const res = await fetch('/api/education', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        toast.success('تم إنشاء التعليم');
      }
      setModalOpen(false);
      fetchItems();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/education/${deleteConfirm.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success('تم حذف التعليم');
      fetchItems();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل الحذف');
    } finally {
      setDeleteConfirm(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة التعليم</h1>
          <p className="text-muted-foreground">{items.length} عنصر</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> إضافة تعليم
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((e) => (
          <Card key={e.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center shrink-0">
                  <GraduationCap className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{e.degree}</h3>
                  <p className="text-sm text-muted-foreground">{e.institution}{e.location ? ` - ${e.location}` : ''}</p>
                  <p className="text-xs text-muted-foreground mt-1">{e.startDate} → {e.endDate || 'الآن'}</p>
                  {e.description && <p className="text-sm mt-2 line-clamp-2">{e.description}</p>}
                  {e.grade && <Badge variant="secondary" className="mt-2">التقدير: {e.grade}</Badge>}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                <div className="flex-1" />
                <Button variant="ghost" size="icon" onClick={() => openEdit(e)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(e)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">لا توجد عناصر تعليم بعد</CardContent></Card>
      )}

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'تعديل التعليم' : 'إضافة تعليم'} onSubmit={handleSave} loading={saving}>
        <TextField label="الدرجة" value={degree} onChange={setDegree} placeholder="بكالوريوس علوم حاسب" />
        <TextField label="المؤسسة" value={institution} onChange={setInstitution} placeholder="اسم الجامعة" />
        <div className="grid grid-cols-2 gap-4">
          <TextField label="الموقع" value={location} onChange={setLocation} placeholder="المدينة" />
          <TextField label="التقدير" value={grade} onChange={setGrade} placeholder="ممتاز" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <TextField label="تاريخ البدء" value={startDate} onChange={setStartDate} placeholder="2018-09" />
          <TextField label="تاريخ الانتهاء" value={endDate} onChange={setEndDate} placeholder="2022-06" />
        </div>
        <TextAreaField label="الوصف" value={description} onChange={setDescription} placeholder="وصف مختصر" />
        <TextField label="رابط الشهادة" value={certificate} onChange={setCertificate} placeholder="https://..." />
        <SwitchField label="مرئي" checked={isVisible} onChange={setIsVisible} />
      </FormModal>

      <ConfirmDialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete} title="حذف التعليم" description={`هل أنت متأكد من حذف "${deleteConfirm?.degree}"؟`} variant="destructive" confirmLabel="حذف" />
    </div>
  );
}
