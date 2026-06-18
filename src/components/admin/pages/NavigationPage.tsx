'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { FormModal } from '../shared/FormModal';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { TextField, SelectField, SwitchField } from '../shared/FormFields';
import { IconSelect } from '../shared/IconSelect';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface NavItem {
  id: string;
  label: string;
  url: string | null;
  icon: string | null;
  order: number;
  isVisible: boolean;
  parentId: string | null;
  target: string;
  type: string;
}

function SortableNav({ item, onEdit, onDelete }: { item: NavItem; onEdit: (n: NavItem) => void; onDelete: (n: NavItem) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="mb-2 hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground" type="button">
              <GripVertical className="h-5 w-5" />
            </button>
            <div className="flex-1 min-w-0">
              <span className="font-medium">{item.label}</span>
              {item.url && <span className="text-sm text-muted-foreground mr-2">{item.url}</span>}
            </div>
            <Badge variant="outline" className="text-xs">{item.type}</Badge>
            <Switch checked={item.isVisible} onCheckedChange={async () => {
              await fetch(`/api/navigation/${item.id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isVisible: !item.isVisible }),
              }).then(() => window.dispatchEvent(new CustomEvent('refresh-nav')));
            }} />
            <Button variant="ghost" size="icon" onClick={() => onEdit(item)}><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(item)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const TYPE_OPTIONS = [
  { label: 'رئيسي', value: 'main' },
  { label: 'تذييل', value: 'footer' },
  { label: 'شريط جانبي', value: 'sidebar' },
  { label: 'موبايل', value: 'mobile' },
];

const TARGET_OPTIONS = [
  { label: 'نفس النافذة', value: '_self' },
  { label: 'نافذة جديدة', value: '_blank' },
];

export function NavigationPage() {
  const [items, setItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NavItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<NavItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterType, setFilterType] = useState('all');

  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [icon, setIcon] = useState('');
  const [type, setType] = useState('main');
  const [target, setTarget] = useState('_self');
  const [isVisible, setIsVisible] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/navigation');
      const json = await res.json();
      if (json.success) setItems(json.data);
    } catch (err) {
      console.error('Failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
    const handler = () => fetchItems();
    window.addEventListener('refresh-nav', handler);
    return () => window.removeEventListener('refresh-nav', handler);
  }, [fetchItems]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex((i) => i.id === active.id);
    const newIdx = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIdx, newIdx);
    setItems(reordered);
    try {
      await fetch('/api/navigation', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: reordered.map((i) => i.id) }),
      });
    } catch {
      fetchItems();
    }
  };

  const openCreate = () => {
    setEditing(null);
    setLabel(''); setUrl(''); setIcon(''); setType('main');
    setTarget('_self'); setIsVisible(true);
    setModalOpen(true);
  };

  const openEdit = (n: NavItem) => {
    setEditing(n);
    setLabel(n.label); setUrl(n.url || ''); setIcon(n.icon || '');
    setType(n.type); setTarget(n.target); setIsVisible(n.isVisible);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!label.trim()) { toast.error('التسمية مطلوبة'); return; }
    setSaving(true);
    try {
      const body = { label, url: url || null, icon: icon || null, type, target, isVisible };
      if (editing) {
        const res = await fetch(`/api/navigation/${editing.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        toast.success('تم تحديث العنصر');
      } else {
        const res = await fetch('/api/navigation', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        toast.success('تم إنشاء العنصر');
      }
      setModalOpen(false);
      fetchItems();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/navigation/${deleteConfirm.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success('تم حذف العنصر');
      fetchItems();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل الحذف');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const filtered = filterType === 'all' ? items : items.filter((i) => i.type === filterType);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة القوائم</h1>
          <p className="text-muted-foreground">{items.length} عنصر</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> عنصر جديد
        </Button>
      </div>

      <div className="flex gap-2">
        <Badge variant={filterType === 'all' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilterType('all')}>الكل</Badge>
        {TYPE_OPTIONS.map((t) => (
          <Badge key={t.value} variant={filterType === t.value ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilterType(t.value)}>
            {t.label}
          </Badge>
        ))}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={filtered.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {filtered.map((item) => (
            <SortableNav key={item.id} item={item} onEdit={openEdit} onDelete={setDeleteConfirm} />
          ))}
        </SortableContext>
      </DndContext>

      {items.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">لا توجد عناصر قائمة بعد</CardContent></Card>
      )}

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'تعديل العنصر' : 'عنصر جديد'} onSubmit={handleSave} loading={saving}>
        <TextField label="التسمية" value={label} onChange={setLabel} placeholder="عنوان القائمة" />
        <TextField label="الرابط" value={url} onChange={setUrl} placeholder="#section أو /page" />
        <IconSelect label="الأيقونة" value={icon || undefined} onChange={setIcon} />
        <div className="grid grid-cols-2 gap-4">
          <SelectField label="النوع" value={type} onChange={setType} options={TYPE_OPTIONS} />
          <SelectField label="الهدف" value={target} onChange={setTarget} options={TARGET_OPTIONS} />
        </div>
        <SwitchField label="مرئي" checked={isVisible} onChange={setIsVisible} />
      </FormModal>

      <ConfirmDialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete} title="حذف العنصر" description="هل أنت متأكد من حذف هذا العنصر؟" variant="destructive" confirmLabel="حذف" />
    </div>
  );
}
