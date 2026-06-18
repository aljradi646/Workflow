'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { FormModal } from '../shared/FormModal';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { TextField, SelectField } from '../shared/FormFields';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Type } from 'lucide-react';

interface Font {
  id: string;
  name: string;
  family: string;
  source: string;
  url: string | null;
  weights: string | null;
  subsets: string | null;
  category: string;
  isActive: boolean;
  usage: string;
}

const SOURCE_OPTIONS = [
  { label: 'Google Fonts', value: 'google' },
  { label: 'مخصص', value: 'custom' },
  { label: 'نظام', value: 'system' },
];

const CATEGORY_OPTIONS = [
  { label: 'Sans Serif', value: 'sans' },
  { label: 'Serif', value: 'serif' },
  { label: 'Monospace', value: 'mono' },
  { label: 'عرض', value: 'display' },
  { label: 'عربي', value: 'arabic' },
];

const USAGE_OPTIONS = [
  { label: 'النص الأساسي', value: 'body' },
  { label: 'العناوين', value: 'heading' },
  { label: 'الأكواد', value: 'code' },
  { label: 'مخصص', value: 'custom' },
];

export function FontsPage() {
  const [fonts, setFonts] = useState<Font[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Font | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Font | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [family, setFamily] = useState('');
  const [source, setSource] = useState('google');
  const [url, setUrl] = useState('');
  const [weights, setWeights] = useState('400,700');
  const [category, setCategory] = useState('sans');
  const [usage, setUsage] = useState('body');
  const [isActive, setIsActive] = useState(true);

  const fetchFonts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/fonts');
      const json = await res.json();
      if (json.success) setFonts(json.data);
    } catch (err) {
      console.error('Failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFonts(); }, [fetchFonts]);

  const openCreate = () => {
    setEditing(null);
    setName(''); setFamily(''); setSource('google'); setUrl('');
    setWeights('400,700'); setCategory('sans'); setUsage('body'); setIsActive(true);
    setModalOpen(true);
  };

  const openEdit = (f: Font) => {
    setEditing(f);
    setName(f.name); setFamily(f.family); setSource(f.source);
    setUrl(f.url || ''); setWeights(f.weights || '400,700');
    setCategory(f.category); setUsage(f.usage); setIsActive(f.isActive);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !family.trim()) { toast.error('الاسم والعائلة مطلوبان'); return; }
    setSaving(true);
    try {
      const body = {
        name, family, source, url: url || null,
        weights: weights || null, subsets: null,
        category, isActive, usage,
      };
      if (editing) {
        const res = await fetch(`/api/fonts/${editing.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        toast.success('تم تحديث الخط');
      } else {
        const res = await fetch('/api/fonts', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        toast.success('تم إنشاء الخط');
      }
      setModalOpen(false);
      fetchFonts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/fonts/${deleteConfirm.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success('تم حذف الخط');
      fetchFonts();
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
          <h1 className="text-2xl font-bold">إدارة الخطوط</h1>
          <p className="text-muted-foreground">{fonts.length} خط</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> خط جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {fonts.map((f) => (
          <Card key={f.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                  <Type className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{f.name}</h3>
                  <p className="text-sm text-muted-foreground font-mono">{f.family}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Badge variant="outline" className="text-xs">{CATEGORY_OPTIONS.find((c) => c.value === f.category)?.label}</Badge>
                    <Badge variant="secondary" className="text-xs">{USAGE_OPTIONS.find((u) => u.value === f.usage)?.label}</Badge>
                  </div>
                </div>
                <Switch checked={f.isActive} onCheckedChange={async () => {
                  await fetch(`/api/fonts/${f.id}`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isActive: !f.isActive }),
                  });
                  fetchFonts();
                }} />
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground flex-1">الأوزان: {f.weights || '400'}</p>
                <Button variant="ghost" size="icon" onClick={() => openEdit(f)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(f)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {fonts.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">لا توجد خطوط بعد</CardContent></Card>
      )}

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'تعديل الخط' : 'خط جديد'} onSubmit={handleSave} loading={saving}>
        <TextField label="اسم الخط" value={name} onChange={setName} placeholder="Cairo" />
        <TextField label="عائلة الخط" value={family} onChange={setFamily} placeholder="'Cairo', sans-serif" />
        <div className="grid grid-cols-2 gap-4">
          <SelectField label="المصدر" value={source} onChange={setSource} options={SOURCE_OPTIONS} />
          <SelectField label="الفئة" value={category} onChange={setCategory} options={CATEGORY_OPTIONS} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <SelectField label="الاستخدام" value={usage} onChange={setUsage} options={USAGE_OPTIONS} />
          <TextField label="الأوزان" value={weights} onChange={setWeights} placeholder="400,700,900" />
        </div>
        <TextField label="رابط الخط" value={url} onChange={setUrl} placeholder="https://fonts.googleapis.com/..." />
      </FormModal>

      <ConfirmDialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete} title="حذف الخط" description={`هل أنت متأكد من حذف "${deleteConfirm?.name}"؟`} variant="destructive" confirmLabel="حذف" />
    </div>
  );
}
