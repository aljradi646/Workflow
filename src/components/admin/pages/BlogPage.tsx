'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { FormModal } from '../shared/FormModal';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { TextField, TextAreaField, SelectField, SwitchField } from '../shared/FormFields';
import { TagsInput } from '../shared/TagsInput';
import { RichTextEditor } from '../shared/RichTextEditor';
import { ImageUpload } from '../shared/ImageUpload';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, BookOpen, Star } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  category: string | null;
  tags: string | null;
  status: string;
  featured: boolean;
  readTime: number | null;
  seoTitle: string | null;
  seoDesc: string | null;
  ogImage: string | null;
  publishedAt: string | null;
}

const STATUS_OPTIONS = [
  { label: 'مسودة', value: 'draft' },
  { label: 'منشور', value: 'published' },
  { label: 'مؤرشف', value: 'archived' },
];

export function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState('draft');
  const [featured, setFeatured] = useState(false);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/blog');
      const json = await res.json();
      if (json.success) setPosts(json.data);
    } catch (err) {
      console.error('Failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const openCreate = () => {
    setEditing(null);
    setTitle(''); setSlug(''); setExcerpt(''); setContent('');
    setCoverImage(''); setCategory(''); setTags([]);
    setStatus('draft'); setFeatured(false); setSeoTitle(''); setSeoDesc('');
    setModalOpen(true);
  };

  const openEdit = (p: BlogPost) => {
    setEditing(p);
    setTitle(p.title); setSlug(p.slug); setExcerpt(p.excerpt || '');
    setContent(p.content); setCoverImage(p.coverImage || '');
    setCategory(p.category || '');
    setTags(p.tags ? JSON.parse(p.tags) : []);
    setStatus(p.status); setFeatured(p.featured);
    setSeoTitle(p.seoTitle || ''); setSeoDesc(p.seoDesc || '');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) { toast.error('العنوان والمحتوى مطلوبان'); return; }
    setSaving(true);
    try {
      const autoSlug = slug || title.replace(/\s+/g, '-').toLowerCase();
      const body = {
        title, slug: autoSlug, excerpt: excerpt || null, content,
        coverImage: coverImage || null, category: category || null,
        tags: tags.length > 0 ? JSON.stringify(tags) : null,
        status, featured,
        readTime: Math.ceil(content.split(/\s+/).length / 200),
        seoTitle: seoTitle || null, seoDesc: seoDesc || null,
      };
      if (editing) {
        const res = await fetch(`/api/blog/${editing.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        toast.success('تم تحديث المقال');
      } else {
        const res = await fetch('/api/blog', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        toast.success('تم إنشاء المقال');
      }
      setModalOpen(false);
      fetchPosts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/blog/${deleteConfirm.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success('تم حذف المقال');
      fetchPosts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل الحذف');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, { label: string; class: string }> = {
      published: { label: 'منشور', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
      draft: { label: 'مسودة', class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
      archived: { label: 'مؤرشف', class: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' },
    };
    const info = map[s] || map.draft;
    return <Badge className={info.class}>{info.label}</Badge>;
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة المدونة</h1>
          <p className="text-muted-foreground">{posts.length} مقال</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> مقال جديد
        </Button>
      </div>

      <div className="space-y-3">
        {posts.map((p) => (
          <Card key={p.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {p.coverImage ? (
                    <img src={p.coverImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen className="h-6 w-6 text-emerald-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{p.title}</h3>
                    {statusBadge(p.status)}
                    {p.featured && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
                  </div>
                  {p.excerpt && <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{p.excerpt}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    {p.category && <Badge variant="outline" className="text-xs">{p.category}</Badge>}
                    {p.tags && JSON.parse(p.tags).slice(0, 3).map((t: string) => (
                      <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                    ))}
                    {p.readTime && <span className="text-xs text-muted-foreground">{p.readTime} دقيقة قراءة</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={p.status === 'published'} onCheckedChange={async () => {
                    await fetch(`/api/blog/${p.id}`, {
                      method: 'PUT', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ status: p.status === 'published' ? 'draft' : 'published' }),
                    });
                    fetchPosts();
                  }} />
                  <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(p)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {posts.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">لا توجد مقالات بعد</CardContent></Card>
      )}

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'تعديل المقال' : 'مقال جديد'} onSubmit={handleSave} loading={saving} wide>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="العنوان" value={title} onChange={(v) => { setTitle(v); if (!editing) setSlug(v.replace(/\s+/g, '-').toLowerCase()); }} placeholder="عنوان المقال" />
          <TextField label="الرابط (Slug)" value={slug} onChange={setSlug} placeholder="article-slug" />
        </div>
        <TextAreaField label="المقتطف" value={excerpt} onChange={setExcerpt} placeholder="ملخص قصير" rows={2} />
        <RichTextEditor label="المحتوى" value={content} onChange={setContent} rows={15} />
        <ImageUpload value={coverImage} onChange={setCoverImage} onRemove={() => setCoverImage('')} folder="blog" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="الفئة" value={category} onChange={setCategory} placeholder="تقنية، تصميم..." />
          <SelectField label="الحالة" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
        </div>
        <TagsInput label="الوسوم" value={tags} onChange={setTags} />
        <SwitchField label="مقال مميز" checked={featured} onChange={setFeatured} />
        <div className="border-t pt-4 space-y-4">
          <h4 className="font-medium text-sm">إعدادات SEO</h4>
          <TextField label="عنوان SEO" value={seoTitle} onChange={setSeoTitle} placeholder="عنوان محركات البحث" />
          <TextAreaField label="وصف SEO" value={seoDesc} onChange={setSeoDesc} placeholder="وصف محركات البحث" rows={2} />
        </div>
      </FormModal>

      <ConfirmDialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete} title="حذف المقال" description={`هل أنت متأكد من حذف "${deleteConfirm?.title}"؟`} variant="destructive" confirmLabel="حذف" />
    </div>
  );
}
