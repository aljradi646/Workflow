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
import { ImageUpload } from '../shared/ImageUpload';
import { toast } from 'sonner';
import {
  Plus, Pencil, Trash2, LayoutGrid, List, ExternalLink, Star,
  FolderKanban, GripVertical, X, Image as ImageIcon, Upload,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string | null;
  category: string | null;
  status: string;
  featured: boolean;
  startDate: string | null;
  endDate: string | null;
  clientName: string | null;
  demoUrl: string | null;
  repoUrl: string | null;
  technologies: string | null;
  order: number;
  isVisible: boolean;
  images: ProjectImage[];
}

interface ProjectImage {
  id: string;
  url: string;
  alt: string | null;
  caption: string | null;
  order: number;
  isFeatured: boolean;
}

const STATUS_OPTIONS = [
  { label: 'منشور', value: 'published' },
  { label: 'مسودة', value: 'draft' },
  { label: 'مؤرشف', value: 'archived' },
];

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  published: { label: 'منشور', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  draft: { label: 'مسودة', class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  archived: { label: 'مؤرشف', class: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' },
};

function SortableImage({ image, onDelete }: { image: ProjectImage; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: image.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div className="w-full aspect-video rounded-lg overflow-hidden border bg-muted">
        <img src={image.url} alt={image.alt || ''} className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
        <button {...attributes} {...listeners} className="p-1.5 rounded-md bg-white/20 text-white cursor-grab active:cursor-grabbing" type="button">
          <GripVertical className="h-4 w-4" />
        </button>
        <button onClick={onDelete} className="p-1.5 rounded-md bg-red-500/80 text-white" type="button">
          <X className="h-4 w-4" />
        </button>
      </div>
      {image.isFeatured && (
        <Badge className="absolute top-1 right-1 bg-amber-500 text-white text-xs py-0">
          <Star className="h-3 w-3 ml-0.5" /> غلاف
        </Badge>
      )}
    </div>
  );
}

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageGalleryOpen, setImageGalleryOpen] = useState<Project | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('published');
  const [featured, setFeatured] = useState(false);
  const [demoUrl, setDemoUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [coverImageUrl, setCoverImageUrl] = useState('');

  const imageSensors = useSensors(useSensor(PointerSensor));

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects');
      const json = await res.json();
      if (json.success) setProjects(json.data);
    } catch (err) {
      console.error('Failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const openCreate = () => {
    setEditing(null);
    setTitle(''); setSlug(''); setDescription(''); setContent('');
    setCategory(''); setStatus('published'); setFeatured(false);
    setDemoUrl(''); setRepoUrl(''); setTechnologies([]); setIsVisible(true);
    setCoverImageUrl('');
    setModalOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditing(p);
    setTitle(p.title); setSlug(p.slug); setDescription(p.description);
    setContent(p.content || ''); setCategory(p.category || '');
    setStatus(p.status); setFeatured(p.featured);
    setDemoUrl(p.demoUrl || ''); setRepoUrl(p.repoUrl || '');
    setTechnologies(p.technologies ? JSON.parse(p.technologies) : []);
    setIsVisible(p.isVisible);
    setCoverImageUrl(p.images?.find(i => i.isFeatured)?.url || '');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !slug.trim()) { toast.error('العنوان والرابط مطلوبان'); return; }
    setSaving(true);
    try {
      const body = {
        title, slug, description, content: content || null,
        category: category || null, status, featured,
        demoUrl: demoUrl || null, repoUrl: repoUrl || null,
        technologies: JSON.stringify(technologies), isVisible,
      };
      if (editing) {
        const res = await fetch(`/api/projects/${editing.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);

        // Handle cover image
        if (coverImageUrl) {
          const existingFeatured = editing.images?.find(i => i.isFeatured);
          if (existingFeatured && existingFeatured.url !== coverImageUrl) {
            // Remove old featured and add new
            await fetch('/api/project-images', {
              method: 'DELETE', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: existingFeatured.id }),
            });
          }
          if (!existingFeatured || existingFeatured.url !== coverImageUrl) {
            await fetch('/api/project-images', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ projectId: editing.id, url: coverImageUrl, isFeatured: true, alt: title }),
            });
          }
        }
        toast.success('تم تحديث المشروع');
      } else {
        const res = await fetch('/api/projects', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);

        // Add cover image for new project
        if (coverImageUrl && json.data?.id) {
          await fetch('/api/project-images', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId: json.data.id, url: coverImageUrl, isFeatured: true, alt: title }),
          });
        }
        toast.success('تم إنشاء المشروع');
      }
      setModalOpen(false);
      fetchProjects();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/projects/${deleteConfirm.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success('تم حذف المشروع');
      fetchProjects();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل الحذف');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleImageUpload = async (projectId: string, files: FileList) => {
    setUploadingImage(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await fetch('/api/media', { method: 'POST', body: formData });
        const uploadJson = await uploadRes.json();
        if (!uploadJson.success) throw new Error(uploadJson.error);

        await fetch('/api/project-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            url: uploadJson.data.url,
            alt: '',
            isFeatured: false,
          }),
        });
      }
      toast.success('تم رفع الصور');
      fetchProjects();
      // Update gallery if open
      if (imageGalleryOpen) {
        const res = await fetch('/api/projects');
        const json = await res.json();
        if (json.success) {
          const updated = json.data.find((p: Project) => p.id === projectId);
          if (updated) setImageGalleryOpen(updated);
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل رفع الصور');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageDelete = async (imageId: string) => {
    try {
      await fetch('/api/project-images', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: imageId }),
      });
      toast.success('تم حذف الصورة');
      fetchProjects();
      if (imageGalleryOpen) {
        setImageGalleryOpen({
          ...imageGalleryOpen,
          images: imageGalleryOpen.images.filter(i => i.id !== imageId),
        });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل حذف الصورة');
    }
  };

  const handleImageReorder = async (event: DragEndEvent) => {
    if (!imageGalleryOpen) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const images = imageGalleryOpen.images;
    const oldIndex = images.findIndex((i) => i.id === active.id);
    const newIndex = images.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(images, oldIndex, newIndex);

    setImageGalleryOpen({ ...imageGalleryOpen, images: reordered });

    try {
      await fetch('/api/project-images/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: reordered.map((img, idx) => ({ id: img.id, order: idx + 1 })) }),
      });
    } catch {
      toast.error('فشل إعادة الترتيب');
    }
  };

  const statusBadge = (s: string) => {
    const info = STATUS_MAP[s] || STATUS_MAP.draft;
    return <Badge className={info.class}>{info.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة المشاريع</h1>
          <p className="text-muted-foreground">{projects.length} مشروع</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')}>
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')}>
            <List className="h-4 w-4" />
          </Button>
          <Button onClick={openCreate} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4" /> مشروع جديد
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <motion.div key={p.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-44 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center relative">
                  {p.images?.[0]?.url ? (
                    <img src={p.images[0].url} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <FolderKanbanIcon className="h-12 w-12 text-emerald-500/50" />
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {p.images && p.images.length > 0 && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="gap-1 text-xs"
                        onClick={() => setImageGalleryOpen(p)}
                      >
                        <ImageIcon className="h-3 w-3" /> {p.images.length} صورة
                      </Button>
                    )}
                    <div className="flex-1" />
                    {p.demoUrl && (
                      <a href={p.demoUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="secondary" size="sm" className="gap-1 text-xs">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </a>
                    )}
                  </div>
                  {p.featured && (
                    <Badge className="absolute top-2 right-2 bg-amber-500 text-white">
                      <Star className="h-3 w-3 ml-1" /> مميز
                    </Badge>
                  )}
                  {statusBadge(p.status)}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{p.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{p.description}</p>
                    </div>
                  </div>
                  {p.technologies && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {JSON.parse(p.technologies).slice(0, 4).map((t: string) => (
                        <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                      ))}
                      {JSON.parse(p.technologies).length > 4 && (
                        <Badge variant="secondary" className="text-xs">+{JSON.parse(p.technologies).length - 4}</Badge>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                    <Switch checked={p.isVisible} onCheckedChange={async () => {
                      await fetch(`/api/projects/${p.id}`, {
                        method: 'PUT', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ isVisible: !p.isVisible }),
                      });
                      fetchProjects();
                    }} />
                    <span className="text-xs text-muted-foreground">{p.isVisible ? 'مرئي' : 'مخفي'}</span>
                    <div className="flex-1" />
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(p)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-16 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-emerald-500/20 to-teal-500/20 shrink-0">
                  {p.images?.[0]?.url ? (
                    <img src={p.images[0].url} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FolderKanbanIcon className="h-6 w-6 text-emerald-500/40" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium truncate">{p.title}</h3>
                    {statusBadge(p.status)}
                    {p.featured && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{p.description}</p>
                </div>
                {p.images && p.images.length > 0 && (
                  <Button variant="outline" size="sm" onClick={() => setImageGalleryOpen(p)} className="gap-1 text-xs shrink-0">
                    <ImageIcon className="h-3 w-3" /> {p.images.length}
                  </Button>
                )}
                <Switch checked={p.isVisible} onCheckedChange={async () => {
                  await fetch(`/api/projects/${p.id}`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isVisible: !p.isVisible }),
                  });
                  fetchProjects();
                }} />
                <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(p)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {projects.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">لا توجد مشاريع بعد</CardContent></Card>
      )}

      {/* Image Gallery Modal */}
      {imageGalleryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setImageGalleryOpen(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl p-6 shadow-xl max-w-3xl w-full mx-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">صور المشروع: {imageGalleryOpen.title}</h2>
              <Button variant="ghost" size="icon" onClick={() => setImageGalleryOpen(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Upload Zone */}
            <div
              className="border-2 border-dashed rounded-xl p-6 text-center mb-4 cursor-pointer hover:border-emerald-400 transition-colors"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = true;
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const files = (e.target as HTMLInputElement).files;
                  if (files) handleImageUpload(imageGalleryOpen.id, files);
                };
                input.click();
              }}
            >
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {uploadingImage ? 'جاري الرفع...' : 'اسحب الصور أو انقر للاختيار'}
              </p>
            </div>

            {/* Image Grid */}
            <DndContext sensors={imageSensors} collisionDetection={closestCenter} onDragEnd={handleImageReorder}>
              <SortableContext items={imageGalleryOpen.images.map(i => i.id)} strategy={verticalListSortingStrategy}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {imageGalleryOpen.images.map((img) => (
                    <SortableImage
                      key={img.id}
                      image={img}
                      onDelete={() => handleImageDelete(img.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {imageGalleryOpen.images.length === 0 && (
              <p className="text-center text-muted-foreground py-8">لا توجد صور بعد</p>
            )}
          </motion.div>
        </div>
      )}

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'تعديل المشروع' : 'مشروع جديد'} onSubmit={handleSave} loading={saving} wide>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="العنوان" value={title} onChange={(v) => { setTitle(v); if (!editing) setSlug(v.replace(/\s+/g, '-').toLowerCase()); }} placeholder="اسم المشروع" />
          <TextField label="الرابط (Slug)" value={slug} onChange={setSlug} placeholder="project-slug" />
        </div>
        <TextAreaField label="الوصف" value={description} onChange={setDescription} placeholder="وصف مختصر" />
        <TextAreaField label="المحتوى" value={content} onChange={setContent} placeholder="محتوى تفصيلي (Markdown)" rows={8} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="الفئة" value={category} onChange={setCategory} placeholder="web, mobile..." />
          <SelectField label="الحالة" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="رابط العرض" value={demoUrl} onChange={setDemoUrl} placeholder="https://..." />
          <TextField label="رابط المستودع" value={repoUrl} onChange={setRepoUrl} placeholder="https://github.com/..." />
        </div>
        <TagsInput label="التقنيات" value={technologies} onChange={setTechnologies} placeholder="أضف تقنية" />
        {/* Cover Image */}
        <ImageUpload
          label="صورة الغلاف"
          value={coverImageUrl}
          onChange={setCoverImageUrl}
          folder="projects"
        />
        <div className="grid grid-cols-2 gap-4">
          <SwitchField label="مميز" checked={featured} onChange={setFeatured} />
          <SwitchField label="مرئي" checked={isVisible} onChange={setIsVisible} />
        </div>
      </FormModal>

      <ConfirmDialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete} title="حذف المشروع" description={`هل أنت متأكد من حذف "${deleteConfirm?.title}"؟`} variant="destructive" confirmLabel="حذف" />
    </div>
  );
}

function FolderKanbanIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
      <path d="M8 10v4"/><path d="M12 10v2"/><path d="M16 10v6"/>
    </svg>
  );
}
