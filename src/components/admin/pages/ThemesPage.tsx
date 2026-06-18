'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FormModal } from '../shared/FormModal';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { TextField, SelectField, SwitchField } from '../shared/FormFields';
import { ColorPicker } from '../shared/ColorPicker';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Check } from 'lucide-react';

interface Theme {
  id: string;
  name: string;
  isDefault: boolean;
  isActive: boolean;
  mode: string;
  colors: string;
  fonts: string;
  spacing: string;
  borderRadius: string;
  customCSS: string | null;
}

const MODE_OPTIONS = [
  { label: 'فاتح', value: 'light' },
  { label: 'داكن', value: 'dark' },
  { label: 'تلقائي', value: 'system' },
];

export function ThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Theme | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Theme | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [mode, setMode] = useState('light');
  const [primaryColor, setPrimaryColor] = useState('#10b981');
  const [secondaryColor, setSecondaryColor] = useState('#14b8a6');
  const [accentColor, setAccentColor] = useState('#f59e0b');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#000000');
  const [borderRadius, setBorderRadius] = useState('0.625rem');
  const [customCSS, setCustomCSS] = useState('');

  const fetchThemes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/themes');
      const json = await res.json();
      if (json.success) setThemes(json.data);
    } catch (err) {
      console.error('Failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchThemes(); }, [fetchThemes]);

  const openCreate = () => {
    setEditing(null);
    setName(''); setMode('light'); setPrimaryColor('#10b981');
    setSecondaryColor('#14b8a6'); setAccentColor('#f59e0b');
    setBgColor('#ffffff'); setTextColor('#000000');
    setBorderRadius('0.625rem'); setCustomCSS('');
    setModalOpen(true);
  };

  const openEdit = (t: Theme) => {
    setEditing(t);
    setName(t.name); setMode(t.mode); setBorderRadius(t.borderRadius);
    setCustomCSS(t.customCSS || '');
    try {
      const colors = JSON.parse(t.colors);
      setPrimaryColor(colors.primary || '#10b981');
      setSecondaryColor(colors.secondary || '#14b8a6');
      setAccentColor(colors.accent || '#f59e0b');
      setBgColor(colors.background || '#ffffff');
      setTextColor(colors.foreground || '#000000');
    } catch {
      setPrimaryColor('#10b981'); setSecondaryColor('#14b8a6');
      setAccentColor('#f59e0b'); setBgColor('#ffffff'); setTextColor('#000000');
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error('الاسم مطلوب'); return; }
    setSaving(true);
    try {
      const colors = { primary: primaryColor, secondary: secondaryColor, accent: accentColor, background: bgColor, foreground: textColor };
      const body = {
        name, mode, colors: JSON.stringify(colors),
        fonts: '{}', spacing: '{}', borderRadius, customCSS: customCSS || null,
      };
      if (editing) {
        const res = await fetch(`/api/themes/${editing.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        toast.success('تم تحديث الثيم');
      } else {
        const res = await fetch('/api/themes', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        toast.success('تم إنشاء الثيم');
      }
      setModalOpen(false);
      fetchThemes();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/themes/${deleteConfirm.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success('تم حذف الثيم');
      fetchThemes();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل الحذف');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleActivate = async (theme: Theme) => {
    try {
      await fetch(`/api/themes/${theme.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true }),
      });
      toast.success('تم تفعيل الثيم');
      fetchThemes();
    } catch {
      toast.error('فشل التفعيل');
    }
  };

  const parseColors = (colorsStr: string) => {
    try { return JSON.parse(colorsStr); } catch { return {}; }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة الثيمات</h1>
          <p className="text-muted-foreground">{themes.length} ثيم</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> ثيم جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map((t) => {
          const colors = parseColors(t.colors);
          return (
            <Card key={t.id} className={`hover:shadow-lg transition-shadow ${t.isActive ? 'ring-2 ring-emerald-500' : ''}`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{t.name}</h3>
                  {t.isActive && <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"><Check className="h-3 w-3 ml-1" /> نشط</Badge>}
                </div>
                {/* Color Preview */}
                <div className="flex gap-1 mb-3">
                  {Object.entries(colors).slice(0, 5).map(([key, val]) => (
                    <div key={key} className="w-8 h-8 rounded-md border" style={{ backgroundColor: val as string }} title={key} />
                  ))}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{MODE_OPTIONS.find((m) => m.value === t.mode)?.label || t.mode}</Badge>
                  <span>Border: {t.borderRadius}</span>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                  {!t.isActive && (
                    <Button size="sm" variant="outline" onClick={() => handleActivate(t)} className="gap-1">
                      <Check className="h-3 w-3" /> تفعيل
                    </Button>
                  )}
                  <div className="flex-1" />
                  <Button variant="ghost" size="icon" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(t)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {themes.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">لا توجد ثيمات بعد</CardContent></Card>
      )}

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'تعديل الثيم' : 'ثيم جديد'} onSubmit={handleSave} loading={saving} wide>
        <TextField label="اسم الثيم" value={name} onChange={setName} placeholder="اسم مميز" />
        <SelectField label="الوضع" value={mode} onChange={setMode} options={MODE_OPTIONS} />
        <div className="border-t pt-4 space-y-4">
          <h4 className="font-medium text-sm">الألوان</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ColorPicker label="اللون الأساسي" value={primaryColor} onChange={setPrimaryColor} />
            <ColorPicker label="اللون الثانوي" value={secondaryColor} onChange={setSecondaryColor} />
            <ColorPicker label="لون التمييز" value={accentColor} onChange={setAccentColor} />
            <ColorPicker label="لون الخلفية" value={bgColor} onChange={setBgColor} />
            <ColorPicker label="لون النص" value={textColor} onChange={setTextColor} />
          </div>
        </div>
        <TextField label="حواف مستديرة" value={borderRadius} onChange={setBorderRadius} placeholder="0.625rem" />
        <div className="space-y-1.5">
          <label className="text-sm font-medium">CSS مخصص</label>
          <textarea value={customCSS} onChange={(e) => setCustomCSS(e.target.value)} rows={4} className="w-full px-3 py-2 border rounded-md bg-background font-mono text-sm" placeholder="/* CSS مخصص */" dir="ltr" />
        </div>
      </FormModal>

      <ConfirmDialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete} title="حذف الثيم" description={`هل أنت متأكد من حذف "${deleteConfirm?.name}"؟`} variant="destructive" confirmLabel="حذف" />
    </div>
  );
}
