'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FormModal } from '../shared/FormModal';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { TextField, SwitchField } from '../shared/FormFields';
import { IconSelect } from '../shared/IconSelect';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string | null;
  order: number;
  isVisible: boolean;
}

const PLATFORM_PRESETS = [
  { platform: 'github', icon: 'Github' },
  { platform: 'linkedin', icon: 'Linkedin' },
  { platform: 'twitter', icon: 'Twitter' },
  { platform: 'youtube', icon: 'Youtube' },
  { platform: 'instagram', icon: 'Instagram' },
  { platform: 'facebook', icon: 'Facebook' },
];

export function SocialLinksPage() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SocialLink | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<SocialLink | null>(null);
  const [saving, setSaving] = useState(false);

  const [platform, setPlatform] = useState('');
  const [url, setUrl] = useState('');
  const [icon, setIcon] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/social-links');
      const json = await res.json();
      if (json.success) setLinks(json.data);
    } catch (err) {
      console.error('Failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLinks(); }, [fetchLinks]);

  const openCreate = () => {
    setEditing(null);
    setPlatform(''); setUrl(''); setIcon(''); setIsVisible(true);
    setModalOpen(true);
  };

  const openEdit = (l: SocialLink) => {
    setEditing(l);
    setPlatform(l.platform); setUrl(l.url); setIcon(l.icon || ''); setIsVisible(l.isVisible);
    setModalOpen(true);
  };

  const handlePlatformSelect = (p: string) => {
    setPlatform(p);
    const preset = PLATFORM_PRESETS.find((pr) => pr.platform === p);
    if (preset && !icon) setIcon(preset.icon);
  };

  const handleSave = async () => {
    if (!platform.trim() || !url.trim()) { toast.error('المنصة والرابط مطلوبان'); return; }
    setSaving(true);
    try {
      const body = { platform, url, icon: icon || null, isVisible };
      if (editing) {
        const res = await fetch(`/api/social-links/${editing.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        toast.success('تم تحديث الرابط');
      } else {
        const res = await fetch('/api/social-links', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        toast.success('تم إنشاء الرابط');
      }
      setModalOpen(false);
      fetchLinks();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/social-links/${deleteConfirm.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success('تم حذف الرابط');
      fetchLinks();
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
          <h1 className="text-2xl font-bold">وسائل التواصل</h1>
          <p className="text-muted-foreground">{links.length} رابط</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> رابط جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((l) => (
          <Card key={l.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center capitalize text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  {l.platform.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold capitalize">{l.platform}</h3>
                  <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-emerald-600 truncate flex items-center gap-1">
                    {l.url} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                <div className="flex-1" />
                <Button variant="ghost" size="icon" onClick={() => openEdit(l)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(l)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {links.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">لا توجد روابط بعد</CardContent></Card>
      )}

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'تعديل الرابط' : 'رابط جديد'} onSubmit={handleSave} loading={saving}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">المنصة</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {PLATFORM_PRESETS.map((p) => (
              <Button key={p.platform} variant={platform === p.platform ? 'default' : 'outline'} size="sm" onClick={() => handlePlatformSelect(p.platform)} className="capitalize text-xs">
                {p.platform}
              </Button>
            ))}
          </div>
          <input value={platform} onChange={(e) => setPlatform(e.target.value)} placeholder="أو أدخل اسم المنصة" className="w-full px-3 py-2 border rounded-md bg-background text-sm" />
        </div>
        <TextField label="الرابط" value={url} onChange={setUrl} placeholder="https://..." />
        <IconSelect label="الأيقونة" value={icon || undefined} onChange={setIcon} />
        <SwitchField label="مرئي" checked={isVisible} onChange={setIsVisible} />
      </FormModal>

      <ConfirmDialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete} title="حذف الرابط" description="هل أنت متأكد من حذف هذا الرابط؟" variant="destructive" confirmLabel="حذف" />
    </div>
  );
}
