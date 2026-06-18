'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { FormModal } from '../shared/FormModal';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { TextField, TextAreaField, SwitchField } from '../shared/FormFields';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, GripVertical, HelpCircle } from 'lucide-react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  order: number;
  isVisible: boolean;
}

function SortableFAQ({ faq, onEdit, onDelete }: { faq: FAQ; onEdit: (f: FAQ) => void; onDelete: (f: FAQ) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: faq.id });
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
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="font-medium truncate">{faq.question}</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{faq.answer}</p>
            </div>
            <Switch checked={faq.isVisible} onCheckedChange={async () => {
              await fetch(`/api/faqs/${faq.id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isVisible: !faq.isVisible }),
              }).then(() => window.dispatchEvent(new CustomEvent('refresh-faqs')));
            }} />
            <Button variant="ghost" size="icon" onClick={() => onEdit(faq)}><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(faq)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<FAQ | null>(null);
  const [saving, setSaving] = useState(false);

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/faqs');
      const json = await res.json();
      if (json.success) setFaqs(json.data);
    } catch (err) {
      console.error('Failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaqs();
    const handler = () => fetchFaqs();
    window.addEventListener('refresh-faqs', handler);
    return () => window.removeEventListener('refresh-faqs', handler);
  }, [fetchFaqs]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = faqs.findIndex((f) => f.id === active.id);
    const newIndex = faqs.findIndex((f) => f.id === over.id);
    const reordered = arrayMove(faqs, oldIndex, newIndex);
    setFaqs(reordered);
    try {
      await fetch('/api/faqs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: reordered.map((f) => f.id) }),
      });
    } catch {
      fetchFaqs();
    }
  };

  const openCreate = () => {
    setEditing(null);
    setQuestion(''); setAnswer(''); setCategory(''); setIsVisible(true);
    setModalOpen(true);
  };

  const openEdit = (f: FAQ) => {
    setEditing(f);
    setQuestion(f.question); setAnswer(f.answer);
    setCategory(f.category || ''); setIsVisible(f.isVisible);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!question.trim() || !answer.trim()) { toast.error('السؤال والجواب مطلوبان'); return; }
    setSaving(true);
    try {
      const body = { question, answer, category: category || null, isVisible };
      if (editing) {
        const res = await fetch(`/api/faqs/${editing.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        toast.success('تم تحديث السؤال');
      } else {
        const res = await fetch('/api/faqs', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        toast.success('تم إنشاء السؤال');
      }
      setModalOpen(false);
      fetchFaqs();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/faqs/${deleteConfirm.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success('تم حذف السؤال');
      fetchFaqs();
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
          <h1 className="text-2xl font-bold">إدارة الأسئلة الشائعة</h1>
          <p className="text-muted-foreground">{faqs.length} سؤال</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> سؤال جديد
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={faqs.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          {faqs.map((faq) => (
            <SortableFAQ key={faq.id} faq={faq} onEdit={openEdit} onDelete={setDeleteConfirm} />
          ))}
        </SortableContext>
      </DndContext>

      {faqs.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">لا توجد أسئلة شائعة بعد</CardContent></Card>
      )}

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'تعديل السؤال' : 'سؤال جديد'} onSubmit={handleSave} loading={saving}>
        <TextField label="السؤال" value={question} onChange={setQuestion} placeholder="السؤال الشائع" />
        <TextAreaField label="الجواب" value={answer} onChange={setAnswer} placeholder="الإجابة" rows={4} />
        <TextField label="الفئة" value={category} onChange={setCategory} placeholder="فئة اختيارية" />
        <SwitchField label="مرئي" checked={isVisible} onChange={setIsVisible} />
      </FormModal>

      <ConfirmDialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete} title="حذف السؤال" description="هل أنت متأكد من حذف هذا السؤال؟" variant="destructive" confirmLabel="حذف" />
    </div>
  );
}
