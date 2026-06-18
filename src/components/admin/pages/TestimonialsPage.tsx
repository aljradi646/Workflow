'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FormModal } from '../shared/FormModal';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { TextField, TextAreaField, SliderField } from '../shared/FormFields';
import { ImageUpload } from '../shared/ImageUpload';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  position: string | null;
  company: string | null;
  content: string;
  rating: number;
  avatarUrl: string | null;
  link: string | null;
  order: number;
  isVisible: boolean;
}

export function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Testimonial | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [company, setCompany] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [link, setLink] = useState('');

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/testimonials');
      const json = await res.json();
      if (json.success) setTestimonials(json.data);
    } catch (err) {
      console.error('Failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTestimonials(); }, [fetchTestimonials]);

  const openCreate = () => {
    setEditing(null);
    setName(''); setPosition(''); setCompany(''); setContent('');
    setRating(5); setAvatarUrl(''); setLink('');
    setModalOpen(true);
  };

  const openEdit = (t: Testimonial) => {
    setEditing(t);
    setName(t.name); setPosition(t.position || ''); setCompany(t.company || '');
    setContent(t.content); setRating(t.rating);
    setAvatarUrl(t.avatarUrl || ''); setLink(t.link || '');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !content.trim()) { toast.error('الاسم والمحتوى مطلوبان'); return; }
    setSaving(true);
    try {
      const body = { name, position: position || null, company: company || null, content, rating, avatarUrl: avatarUrl || null, link: link || null };
      if (editing) {
        const res = await fetch(`/api/testimonials/${editing.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        toast.success('تم تحديث الشهادة');
      } else {
        const res = await fetch('/api/testimonials', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        toast.success('تم إنشاء الشهادة');
      }
      setModalOpen(false);
      fetchTestimonials();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/testimonials/${deleteConfirm.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success('تم حذف الشهادة');
      fetchTestimonials();
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
          <h1 className="text-2xl font-bold">إدارة الشهادات</h1>
          <p className="text-muted-foreground">{testimonials.length} شهادة</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> شهادة جديدة
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {testimonials.map((t) => (
          <Card key={t.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700">
                    {t.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{t.name}</h3>
                  {t.position && <p className="text-sm text-muted-foreground">{t.position}{t.company ? ` - ${t.company}` : ''}</p>}
                </div>
              </div>
              <p className="text-sm mt-3 line-clamp-3">{t.content}</p>
              <div className="flex items-center gap-0.5 mt-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                <div className="flex-1" />
                <Button variant="ghost" size="icon" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(t)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {testimonials.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">لا توجد شهادات بعد</CardContent></Card>
      )}

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'تعديل الشهادة' : 'شهادة جديدة'} onSubmit={handleSave} loading={saving}>
        <TextField label="الاسم" value={name} onChange={setName} placeholder="اسم الشخص" />
        <div className="grid grid-cols-2 gap-4">
          <TextField label="المنصب" value={position} onChange={setPosition} placeholder="المسمى الوظيفي" />
          <TextField label="الشركة" value={company} onChange={setCompany} placeholder="اسم الشركة" />
        </div>
        <TextAreaField label="المحتوى" value={content} onChange={setContent} placeholder="نص الشهادة" rows={4} />
        <SliderField label="التقييم" value={rating} onChange={setRating} min={1} max={5} step={1} />
        <ImageUpload value={avatarUrl} onChange={setAvatarUrl} onRemove={() => setAvatarUrl('')} folder="avatars" />
        <TextField label="الرابط" value={link} onChange={setLink} placeholder="https://..." />
      </FormModal>

      <ConfirmDialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete} title="حذف الشهادة" description={`هل أنت متأكد من حذف شهادة "${deleteConfirm?.name}"؟`} variant="destructive" confirmLabel="حذف" />
    </div>
  );
}
