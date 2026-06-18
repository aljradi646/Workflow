'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Save, Loader2, Settings, Phone, Sparkles, Globe, Cpu, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

interface SettingItem {
  id: string;
  key: string;
  value: string;
  type: string;
  group: string;
  label: string | null;
  description: string | null;
}

interface SettingGroup {
  [key: string]: SettingItem[];
}

const GROUP_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; tab: string }> = {
  general: { label: 'عام', icon: Settings, tab: 'general' },
  contact: { label: 'التواصل', icon: Phone, tab: 'contact' },
  hero: { label: 'قسم البطل', icon: Sparkles, tab: 'hero' },
  footer: { label: 'التذييل', icon: Globe, tab: 'footer' },
  seo: { label: 'SEO', icon: Cpu, tab: 'seo' },
  appearance: { label: 'المظهر', icon: Eye, tab: 'appearance' },
  social: { label: 'وسائل التواصل', icon: Globe, tab: 'social' },
};

const TAB_ORDER = ['general', 'contact', 'hero', 'footer', 'seo', 'appearance', 'social'];

export function SettingsPage() {
  const [groups, setGroups] = useState<SettingGroup>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('general');
  const [previewOpen, setPreviewOpen] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      const json = await res.json();
      if (json.success) {
        const grouped: SettingGroup = {};
        const valMap: Record<string, string> = {};
        for (const s of json.data) {
          if (!grouped[s.group]) grouped[s.group] = [];
          grouped[s.group].push(s);
          valMap[s.key] = s.value;
        }
        setGroups(grouped);
        setValues(valMap);
        // Set initial tab to first available group
        const firstGroup = TAB_ORDER.find(g => grouped[g]);
        if (firstGroup) setActiveTab(firstGroup);
      }
    } catch (err) {
      console.error('Failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    setSaveProgress(0);
    try {
      const entries = Object.entries(values);
      const total = entries.length;
      let completed = 0;

      for (const [key, value] of entries) {
        await fetch(`/api/settings/${key}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value }),
        });
        completed++;
        setSaveProgress(Math.round((completed / total) * 100));
      }

      toast.success('تم حفظ الإعدادات');
    } catch (err) {
      toast.error('فشل حفظ الإعدادات');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveProgress(0), 2000);
    }
  };

  const renderInput = (s: SettingItem) => {
    const val = values[s.key] || '';

    // Boolean type
    if (s.type === 'boolean' || val === 'true' || val === 'false') {
      return (
        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <Label htmlFor={s.key}>{s.label || s.key}</Label>
            {s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}
          </div>
          <Switch
            id={s.key}
            checked={val === 'true'}
            onCheckedChange={(checked) => setValues((prev) => ({ ...prev, [s.key]: String(checked) }))}
          />
        </div>
      );
    }

    // Color type
    if (s.type === 'color') {
      return (
        <div className="space-y-1.5">
          <Label htmlFor={s.key}>{s.label || s.key}</Label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={val || '#000000'}
              onChange={(e) => setValues((prev) => ({ ...prev, [s.key]: e.target.value }))}
              className="w-10 h-10 rounded-lg border cursor-pointer p-1"
            />
            <Input
              value={val}
              onChange={(e) => setValues((prev) => ({ ...prev, [s.key]: e.target.value }))}
              className="flex-1 font-mono text-sm"
              dir="ltr"
              placeholder="#000000"
            />
            <div className="w-10 h-10 rounded-lg border" style={{ backgroundColor: val }} />
          </div>
          {s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}
        </div>
      );
    }

    // Number type
    if (s.type === 'number') {
      return (
        <div className="space-y-1.5">
          <Label htmlFor={s.key}>{s.label || s.key}</Label>
          <Input
            id={s.key}
            type="number"
            value={val}
            onChange={(e) => setValues((prev) => ({ ...prev, [s.key]: e.target.value }))}
            dir="ltr"
          />
          {s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}
        </div>
      );
    }

    // JSON or long text
    if (s.type === 'json' || (val && val.length > 200)) {
      return (
        <div className="space-y-1.5">
          <Label htmlFor={s.key}>{s.label || s.key}</Label>
          <Textarea
            id={s.key}
            value={val}
            onChange={(e) => setValues((prev) => ({ ...prev, [s.key]: e.target.value }))}
            rows={4}
            dir={s.type === 'json' ? 'ltr' : 'rtl'}
            className={s.type === 'json' ? 'font-mono text-sm' : ''}
          />
          {s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}
        </div>
      );
    }

    // URL type
    if (s.key.toLowerCase().includes('url') || s.key.toLowerCase().includes('link')) {
      return (
        <div className="space-y-1.5">
          <Label htmlFor={s.key}>{s.label || s.key}</Label>
          <Input
            id={s.key}
            type="url"
            value={val}
            onChange={(e) => setValues((prev) => ({ ...prev, [s.key]: e.target.value }))}
            dir="ltr"
            placeholder="https://..."
          />
          {s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}
        </div>
      );
    }

    // Default text
    return (
      <div className="space-y-1.5">
        <Label htmlFor={s.key}>{s.label || s.key}</Label>
        <Input
          id={s.key}
          value={val}
          onChange={(e) => setValues((prev) => ({ ...prev, [s.key]: e.target.value }))}
          dir="rtl"
        />
        {s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}
      </div>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" /></div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إعدادات الموقع</h1>
          <p className="text-muted-foreground">إدارة الإعدادات العامة للموقع</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setPreviewOpen(!previewOpen)} className="gap-2">
            <Eye className="h-4 w-4" />
            معاينة
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2 bg-emerald-600 hover:bg-emerald-700 min-w-[140px]">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                حفظ... {saveProgress}%
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                حفظ التغييرات
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Save Progress */}
      {saving && (
        <Progress value={saveProgress} className="h-1.5" />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Tabs */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted/50 p-1">
              {TAB_ORDER.filter(g => groups[g]).map((groupKey) => {
                const config = GROUP_CONFIG[groupKey];
                if (!config) return null;
                const Icon = config.icon;
                return (
                  <TabsTrigger key={groupKey} value={groupKey} className="gap-1.5 text-xs data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                    <Icon className="h-3.5 w-3.5" />
                    {config.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {TAB_ORDER.filter(g => groups[g]).map((groupKey) => (
              <TabsContent key={groupKey} value={groupKey}>
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {(() => {
                        const config = GROUP_CONFIG[groupKey];
                        if (!config) return null;
                        const Icon = config.icon;
                        return <Icon className="h-5 w-5 text-emerald-500" />;
                      })()}
                      {GROUP_CONFIG[groupKey]?.label || groupKey}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {groups[groupKey]?.map((s) => (
                      <div key={s.key}>
                        {renderInput(s)}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}

            {/* Handle groups not in TAB_ORDER */}
            {Object.keys(groups).filter(g => !TAB_ORDER.includes(g)).map((groupKey) => (
              <TabsContent key={groupKey} value={groupKey}>
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle>{groupKey}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {groups[groupKey]?.map((s) => (
                      <div key={s.key}>{renderInput(s)}</div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-md sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">معاينة سريعة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(GROUP_CONFIG).map(([groupKey, config]) => {
                  const Icon = config.icon;
                  const groupSettings = groups[groupKey];
                  if (!groupSettings) return null;
                  return (
                    <div key={groupKey} className="p-3 rounded-xl bg-muted/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm font-medium">{config.label}</span>
                        <Badge variant="secondary" className="text-xs mr-auto">{groupSettings.length}</Badge>
                      </div>
                      <div className="space-y-1">
                        {groupSettings.slice(0, 3).map((s) => (
                          <div key={s.key} className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground truncate">{s.label || s.key}:</span>
                            <span className="font-medium truncate">
                              {s.type === 'boolean'
                                ? (values[s.key] === 'true' ? '✓' : '✗')
                                : s.type === 'color'
                                ? <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: values[s.key] }} />
                                : (values[s.key]?.substring(0, 20) || '—')}
                            </span>
                          </div>
                        ))}
                        {groupSettings.length > 3 && (
                          <p className="text-xs text-muted-foreground">+{groupSettings.length - 3} أخرى</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {Object.keys(groups).length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">لا توجد إعدادات بعد</CardContent></Card>
      )}
    </motion.div>
  );
}
