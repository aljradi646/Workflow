'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { FormModal } from '../shared/FormModal';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { TextField, TextAreaField, SwitchField } from '../shared/FormFields';
import { IconSelect } from '../shared/IconSelect';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Wrench } from 'lucide-react';

interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string | null;
  icon: string | null;
  imageUrl: string | null;
  features: string | null;
  price: string | null;
  order: number;
  isVisible: boolean;
}

export function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [icon, setIcon] = useState('');
  const [price, setPrice] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/services');
      const json = await res.json();
      if (json.success) setServices(json.data);
    } catch (err) {
      console.error('Failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const openCreate = () => {
    setEditing(null);
    setTitle(''); setSlug(''); setDescription(''); setContent('');
    setIcon(''); setPrice(''); setFeatures([]); setIsVisible(true);
    setModalOpen(true);
  };

  const openEdit = (s: Service) => {
    setEditing(s);
    setTitle(s.title); setSlug(s.slug); setDescription(s.description);
    setContent(s.content || ''); setIcon(s.icon || '');
    setPrice(s.price || '');
    setFeatures(s.features ? JSON.parse(s.features) : []);
    setIsVisible(s.isVisible);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) { toast.error('العنوان والوصف مطلوبان'); return; }
    setSaving(true);
    try {
      const autoSlug = slug || title.replace(/\s+/g, '-').toLowerCase();
      const body = {
        title, slug: autoSlug, description, content: content || null,
        icon: icon || null, price: price || null,
        features: features.length > 0 ? JSON.stringify(features) : null,
        isVisible,
      };
      if (editing) {
        const res = await fetch(`/api/services/${editing.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        toast.success('تم تحديث الخدمة');
      } else {
        const res = await fetch('/api/services', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        toast.success('تم إنشاء الخدمة');
      }
      setModalOpen(false);
      fetchServices();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/services/${deleteConfirm.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success('تم حذف الخدمة');
      fetchServices();
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
          <h1 className="text-2xl font-bold">إدارة الخدمات</h1>
          <p className="text-muted-foreground">{services.length} خدمة</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> خدمة جديدة
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => (
          <Card key={s.id} className="group hover:shadow-lg transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                  <Wrench className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{s.description}</p>
                  {s.price && <Badge variant="secondary" className="mt-2">{s.price}</Badge>}
                  {s.features && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {JSON.parse(s.features).slice(0, 3).map((f: string) => (
                        <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                <Switch checked={s.isVisible} onCheckedChange={async () => {
                  await fetch(`/api/services/${s.id}`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isVisible: !s.isVisible }),
                  });
                  fetchServices();
                }} />
                <div className="flex-1" />
                <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(s)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">لا توجد خدمات بعد</CardContent></Card>
      )}

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'تعديل الخدمة' : 'خدمة جديدة'} onSubmit={handleSave} loading={saving}>
        <TextField label="العنوان" value={title} onChange={(v) => { setTitle(v); if (!editing) setSlug(v.replace(/\s+/g, '-').toLowerCase()); }} placeholder="اسم الخدمة" />
        <TextAreaField label="الوصف" value={description} onChange={setDescription} placeholder="وصف الخدمة" />
        <TextAreaField label="المحتوى" value={content} onChange={setContent} placeholder="تفاصيل إضافية" rows={6} />
        <IconSelect label="الأيقونة" value={icon || undefined} onChange={setIcon} />
        <TextField label="السعر" value={price} onChange={setPrice} placeholder="مثال: 500 ر.س" />
        <SwitchField label="مرئي" checked={isVisible} onChange={setIsVisible} />
      </FormModal>

      <ConfirmDialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete} title="حذف الخدمة" description={`هل أنت متأكد من حذف "${deleteConfirm?.title}"؟`} variant="destructive" confirmLabel="حذف" />
    </div>
  );
}
