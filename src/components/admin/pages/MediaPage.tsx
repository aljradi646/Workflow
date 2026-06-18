'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { toast } from 'sonner';
import {
  Upload, Trash2, Copy, Image as ImageIcon, FileText, Search,
  LayoutGrid, List, File, Film, Music, FileArchive, Info, X,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl: string | null;
  alt: string | null;
  caption: string | null;
  folder: string;
  width: number | null;
  height: number | null;
  createdAt: string;
}

const FILE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'image': ImageIcon,
  'video': Film,
  'audio': Music,
  'application/pdf': FileText,
  'application/zip': FileArchive,
  'application': File,
};

function getFileIcon(mime: string) {
  const category = mime.split('/')[0];
  const specific = FILE_ICONS[mime] || FILE_ICONS[category] || FileText;
  return specific;
}

function isImage(mime: string) {
  return mime.startsWith('image/');
}

export function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<MediaItem | null>(null);
  const [search, setSearch] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailItem, setDetailItem] = useState<MediaItem | null>(null);
  const [hoverItem, setHoverItem] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/media');
      const json = await res.json();
      if (json.success) setMedia(json.data);
    } catch (err) {
      console.error('Failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMedia(); }, [fetchMedia]);

  const handleUpload = async (files: FileList | File[]) => {
    setUploading(true);
    setUploadProgress(0);
    try {
      const fileArray = Array.from(files);
      let completed = 0;
      for (const file of fileArray) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/media', { method: 'POST', body: formData });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        completed++;
        setUploadProgress(Math.round((completed / fileArray.length) * 100));
      }
      toast.success('تم رفع الملفات بنجاح');
      fetchMedia();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل الرفع');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/media/${deleteConfirm.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success('تم حذف الملف');
      if (detailItem?.id === deleteConfirm.id) setDetailItem(null);
      fetchMedia();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل الحذف');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        Array.from(selectedIds).map(id =>
          fetch(`/api/media/${id}`, { method: 'DELETE' })
        )
      );
      toast.success(`تم حذف ${selectedIds.size} ملف`);
      if (detailItem && selectedIds.has(detailItem.id)) setDetailItem(null);
      setSelectedIds(new Set());
      fetchMedia();
    } catch (err) {
      toast.error('فشل حذف بعض الملفات');
    }
  };

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('تم نسخ الرابط');
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filtered = search
    ? media.filter((m) => m.originalName.toLowerCase().includes(search.toLowerCase()) || m.folder.toLowerCase().includes(search.toLowerCase()))
    : media;

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
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
          <h1 className="text-2xl font-bold">مكتبة الوسائط</h1>
          <p className="text-muted-foreground">{media.length} ملف</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')}>
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
          dragOver ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 scale-[1.01]' : 'border-border hover:border-emerald-400'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length > 0) handleUpload(e.dataTransfer.files); }}
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.multiple = true;
          input.accept = 'image/*,video/*,.pdf,.doc,.docx';
          input.onchange = (e) => { const files = (e.target as HTMLInputElement).files; if (files) handleUpload(files); };
          input.click();
        }}
      >
        <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <p className="text-lg font-medium">{uploading ? `جاري الرفع... ${uploadProgress}%` : 'اسحب الملفات هنا أو انقر للاختيار'}</p>
        <p className="text-sm text-muted-foreground mt-1">يدعم الصور، الفيديو، PDF، والمستندات</p>
        {uploading && (
          <div className="mt-3 max-w-xs mx-auto">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800"
        >
          <span className="text-sm font-medium">{selectedIds.size} ملف محدد</span>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="gap-1">
            <Trash2 className="h-3 w-3" /> حذف المحدد
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
            إلغاء التحديد
          </Button>
        </motion.div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن ملف..." className="pr-9" />
      </div>

      <div className="flex gap-6">
        {/* Media Grid/List */}
        <div className="flex-1 min-w-0">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filtered.map((item) => {
                const FileIcon = getFileIcon(item.mimeType);
                return (
                  <Card
                    key={item.id}
                    className={`group overflow-hidden hover:shadow-lg transition-all cursor-pointer ${selectedIds.has(item.id) ? 'ring-2 ring-emerald-500' : ''}`}
                    onClick={() => setDetailItem(item)}
                  >
                    <div className="aspect-square bg-muted flex items-center justify-center relative">
                      {isImage(item.mimeType) ? (
                        <>
                          <img src={item.url} alt={item.alt || item.originalName} className="w-full h-full object-cover" />
                          {/* Hover preview */}
                          <AnimatePresence>
                            {hoverItem === item.id && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/70 flex items-center justify-center z-10"
                                onMouseEnter={() => setHoverItem(item.id)}
                                onMouseLeave={() => setHoverItem(null)}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <img src={item.url} alt="" className="max-w-[90%] max-h-[90%] object-contain rounded shadow-xl" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                        <FileIcon className="h-10 w-10 text-muted-foreground" />
                      )}
                      {/* Selection checkbox */}
                      <div className="absolute top-1 right-1 z-20" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(item.id)}
                          onCheckedChange={() => toggleSelect(item.id)}
                          className="bg-white/80 dark:bg-black/50"
                        />
                      </div>
                      {/* Copy button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); copyUrl(item.url, item.id); }}
                        className="absolute top-1 left-1 z-20 p-1 rounded-md bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black/70"
                      >
                        {copiedId === item.id ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                      {/* Type indicator */}
                      {isImage(item.mimeType) && (
                        <div className="absolute bottom-1 right-1">
                          <ImageIcon className="h-3 w-3 text-white drop-shadow" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-2">
                      <p className="text-xs truncate" title={item.originalName}>{item.originalName}</p>
                      <p className="text-xs text-muted-foreground">{formatSize(item.size)}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="space-y-1.5">
              {filtered.map((item) => {
                const FileIcon = getFileIcon(item.mimeType);
                return (
                  <Card
                    key={item.id}
                    className={`hover:shadow-md transition-shadow cursor-pointer ${selectedIds.has(item.id) ? 'ring-2 ring-emerald-500' : ''}`}
                    onClick={() => setDetailItem(item)}
                  >
                    <CardContent className="p-3 flex items-center gap-3">
                      <Checkbox
                        checked={selectedIds.has(item.id)}
                        onCheckedChange={() => toggleSelect(item.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                        {isImage(item.mimeType) ? (
                          <img src={item.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <FileIcon className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.originalName}</p>
                        <p className="text-xs text-muted-foreground">{formatSize(item.size)} • {item.folder}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">{item.mimeType.split('/')[1]?.toUpperCase()}</Badge>
                      <button
                        onClick={(e) => { e.stopPropagation(); copyUrl(item.url, item.id); }}
                        className="p-1.5 rounded-md hover:bg-accent"
                        title="نسخ الرابط"
                      >
                        {copiedId === item.id ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm(item); }}
                        className="p-1.5 rounded-md hover:bg-accent text-red-500"
                        title="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {filtered.length === 0 && (
            <Card><CardContent className="py-12 text-center text-muted-foreground">لا توجد ملفات {search && 'مطابقة للبحث'}</CardContent></Card>
          )}
        </div>

        {/* File Details Panel */}
        {detailItem && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="hidden lg:block w-72 shrink-0"
          >
            <Card className="border-0 shadow-md sticky top-20">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">تفاصيل الملف</span>
                  <button onClick={() => setDetailItem(null)} className="p-1 rounded-md hover:bg-accent">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Preview */}
                <div className="aspect-video rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                  {isImage(detailItem.mimeType) ? (
                    <img src={detailItem.url} alt={detailItem.alt || ''} className="w-full h-full object-cover" />
                  ) : (
                    (() => {
                      const FileIcon = getFileIcon(detailItem.mimeType);
                      return <FileIcon className="h-12 w-12 text-muted-foreground" />;
                    })()
                  )}
                </div>

                {/* Info */}
                <div className="space-y-2">
                  {[
                    { label: 'الاسم', value: detailItem.originalName },
                    { label: 'النوع', value: detailItem.mimeType },
                    { label: 'الحجم', value: formatSize(detailItem.size) },
                    { label: 'المجلد', value: detailItem.folder },
                    ...(detailItem.width && detailItem.height ? [{ label: 'الأبعاد', value: `${detailItem.width}×${detailItem.height}` }] : []),
                    { label: 'تاريخ الرفع', value: new Date(detailItem.createdAt).toLocaleDateString('ar-SA') },
                  ].map((info) => (
                    <div key={info.label} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{info.label}</span>
                      <span className="font-medium truncate mr-2">{info.value}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => copyUrl(detailItem.url, detailItem.id)}>
                    <Copy className="h-3 w-3" /> نسخ
                  </Button>
                  <Button variant="destructive" size="sm" className="gap-1" onClick={() => setDeleteConfirm(detailItem)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      <ConfirmDialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete} title="حذف الملف" description={`هل أنت متأكد من حذف "${deleteConfirm?.originalName}"؟`} variant="destructive" confirmLabel="حذف" />
    </motion.div>
  );
}
