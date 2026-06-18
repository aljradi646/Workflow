'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';

interface SEOSetting {
  id: string;
  page: string;
  title: string | null;
  description: string | null;
  keywords: string | null;
  ogTitle: string | null;
  ogDesc: string | null;
  ogImage: string | null;
  ogType: string | null;
  canonical: string | null;
  robots: string | null;
  structured: string | null;
}

const PAGE_LABELS: Record<string, string> = {
  global: 'عالمي',
  home: 'الرئيسية',
  about: 'عن',
  projects: 'المشاريع',
  blog: 'المدونة',
  contact: 'التواصل',
};

export function SEOPage() {
  const [settings, setSettings] = useState<SEOSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activePage, setActivePage] = useState<string>('');

  const fetchSEO = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/seo');
      const json = await res.json();
      if (json.success) {
        setSettings(json.data);
        if (json.data.length > 0 && !activePage) {
          setActivePage(json.data[0].page);
        }
      }
    } catch (err) {
      console.error('Failed:', err);
    } finally {
      setLoading(false);
    }
  }, [activePage]);

  useEffect(() => { fetchSEO(); }, [fetchSEO]);

  const current = settings.find((s) => s.page === activePage);

  const updateField = (field: keyof SEOSetting, value: string) => {
    setSettings((prev) =>
      prev.map((s) => s.page === activePage ? { ...s, [field]: value || null } : s)
    );
  };

  const handleSave = async () => {
    if (!current) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/seo/${current.page}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: current.title,
          description: current.description,
          keywords: current.keywords,
          ogTitle: current.ogTitle,
          ogDesc: current.ogDesc,
          ogImage: current.ogImage,
          ogType: current.ogType,
          canonical: current.canonical,
          robots: current.robots,
          structured: current.structured,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success('تم حفظ إعدادات SEO');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إعدادات SEO</h1>
          <p className="text-muted-foreground">تحسين محركات البحث لكل صفحة</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          حفظ التغييرات
        </Button>
      </div>

      {/* Page Tabs */}
      <div className="flex flex-wrap gap-2">
        {settings.map((s) => (
          <Badge
            key={s.page}
            variant={activePage === s.page ? 'default' : 'outline'}
            className="cursor-pointer px-4 py-2"
            onClick={() => setActivePage(s.page)}
          >
            {PAGE_LABELS[s.page] || s.page}
          </Badge>
        ))}
      </div>

      {current && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">SEO - {PAGE_LABELS[current.page] || current.page}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>عنوان الصفحة</Label>
              <Input value={current.title || ''} onChange={(e) => updateField('title', e.target.value)} placeholder="عنوان SEO" />
            </div>
            <div className="space-y-1.5">
              <Label>الوصف</Label>
              <Textarea value={current.description || ''} onChange={(e) => updateField('description', e.target.value)} placeholder="وصف SEO" rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label>الكلمات المفتاحية</Label>
              <Input value={current.keywords || ''} onChange={(e) => updateField('keywords', e.target.value)} placeholder="كلمة1، كلمة2، كلمة3" />
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-sm mb-3">Open Graph</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>عنوان OG</Label>
                  <Input value={current.ogTitle || ''} onChange={(e) => updateField('ogTitle', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>نوع OG</Label>
                  <Input value={current.ogType || ''} onChange={(e) => updateField('ogType', e.target.value)} placeholder="website" />
                </div>
              </div>
              <div className="space-y-1.5 mt-4">
                <Label>وصف OG</Label>
                <Textarea value={current.ogDesc || ''} onChange={(e) => updateField('ogDesc', e.target.value)} rows={2} />
              </div>
              <div className="space-y-1.5 mt-4">
                <Label>صورة OG</Label>
                <Input value={current.ogImage || ''} onChange={(e) => updateField('ogImage', e.target.value)} placeholder="رابط الصورة" dir="ltr" />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-sm mb-3">متقدم</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>الرابط الأساسي (Canonical)</Label>
                  <Input value={current.canonical || ''} onChange={(e) => updateField('canonical', e.target.value)} dir="ltr" />
                </div>
                <div className="space-y-1.5">
                  <Label>Robots</Label>
                  <Input value={current.robots || ''} onChange={(e) => updateField('robots', e.target.value)} placeholder="index, follow" />
                </div>
              </div>
              <div className="space-y-1.5 mt-4">
                <Label>البيانات المنظمة (JSON-LD)</Label>
                <Textarea value={current.structured || ''} onChange={(e) => updateField('structured', e.target.value)} rows={6} dir="ltr" className="font-mono text-xs" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
