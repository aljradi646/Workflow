'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FormModal } from '../shared/FormModal';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { TextField, SelectField, SliderField, SwitchField } from '../shared/FormFields';
import { ColorPicker } from '../shared/ColorPicker';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Cpu } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  slug: string;
  category: string;
  level: number;
  icon: string | null;
  iconUrl: string | null;
  color: string | null;
  order: number;
  isVisible: boolean;
  featured: boolean;
}

const CATEGORIES = [
  { label: 'واجهة أمامية', value: 'frontend' },
  { label: 'واجهة خلفية', value: 'backend' },
  { label: 'قواعد بيانات', value: 'database' },
  { label: 'DevOps', value: 'devops' },
  { label: 'تصميم', value: 'design' },
  { label: 'هواتف', value: 'mobile' },
  { label: 'أدوات', value: 'tools' },
  { label: 'لغات', value: 'language' },
  { label: 'عام', value: 'general' },
];

export function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Skill | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState('all');

  const [name, setName] = useState('');
  const [category, setCategory] = useState('frontend');
  const [level, setLevel] = useState(50);
  const [color, setColor] = useState('#10b981');
  const [isVisible, setIsVisible] = useState(true);
  const [featured, setFeatured] = useState(false);

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/skills');
      const json = await res.json();
      if (json.success) setSkills(json.data);
    } catch (err) {
      console.error('Failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSkills(); }, [fetchSkills]);

  const openCreate = () => {
    setEditing(null);
    setName(''); setCategory('frontend'); setLevel(50); setColor('#10b981');
    setIsVisible(true); setFeatured(false);
    setModalOpen(true);
  };

  const openEdit = (s: Skill) => {
    setEditing(s);
    setName(s.name); setCategory(s.category); setLevel(s.level);
    setColor(s.color || '#10b981'); setIsVisible(s.isVisible); setFeatured(s.featured);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error('الاسم مطلوب'); return; }
    setSaving(true);
    try {
      const slug = name.replace(/\s+/g, '-').toLowerCase();
      const body = { name, slug, category, level, color, isVisible, featured };
      if (editing) {
        const res = await fetch(`/api/skills/${editing.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        toast.success('تم تحديث المهارة');
      } else {
        const res = await fetch('/api/skills', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        toast.success('تم إنشاء المهارة');
      }
      setModalOpen(false);
      fetchSkills();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/skills/${deleteConfirm.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success('تم حذف المهارة');
      fetchSkills();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل الحذف');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const filtered = filterCat === 'all' ? skills : skills.filter((s) => s.category === filterCat);
  const grouped = filtered.reduce<Record<string, Skill[]>>((acc, s) => {
    const cat = s.category || 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة المهارات</h1>
          <p className="text-muted-foreground">{skills.length} مهارة</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> مهارة جديدة
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Badge variant={filterCat === 'all' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilterCat('all')}>الكل</Badge>
        {CATEGORIES.map((c) => (
          <Badge key={c.value} variant={filterCat === c.value ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilterCat(c.value)}>
            {c.label}
          </Badge>
        ))}
      </div>

      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat}>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            {CATEGORIES.find((c) => c.value === cat)?.label || cat}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((s) => (
              <Card key={s.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color ? `${s.color}20` : '#10b98120' }}>
                        <Cpu className="h-4 w-4" style={{ color: s.color || '#10b981' }} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{s.name}</p>
                        <p className="text-xs text-muted-foreground">المستوى: {s.level}%</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(s)}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setDeleteConfirm(s)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${s.level}%`, backgroundColor: s.color || '#10b981' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {skills.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">لا توجد مهارات بعد</CardContent></Card>
      )}

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'تعديل المهارة' : 'مهارة جديدة'} onSubmit={handleSave} loading={saving}>
        <TextField label="الاسم" value={name} onChange={setName} placeholder="اسم المهارة" />
        <SelectField label="الفئة" value={category} onChange={setCategory} options={CATEGORIES} />
        <SliderField label="المستوى" value={level} onChange={setLevel} min={0} max={100} step={5} />
        <ColorPicker label="اللون" value={color} onChange={setColor} />
        <SwitchField label="مرئي" checked={isVisible} onChange={setIsVisible} />
        <SwitchField label="مميزة" checked={featured} onChange={setFeatured} />
      </FormModal>

      <ConfirmDialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete} title="حذف المهارة" description={`هل أنت متأكد من حذف "${deleteConfirm?.name}"؟`} variant="destructive" confirmLabel="حذف" />
    </div>
  );
}
