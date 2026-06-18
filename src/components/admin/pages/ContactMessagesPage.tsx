'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { toast } from 'sonner';
import { Mail, MailOpen, Trash2, Reply, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  phone: string | null;
  isRead: boolean;
  isReplied: boolean;
  repliedAt: string | null;
  createdAt: string;
}

export function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState<ContactMessage | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'replied'>('all');

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contact');
      const json = await res.json();
      if (json.success) {
        // API returns { messages, total, page, limit }
        const data = json.data.messages || json.data;
        setMessages(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/contact/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });
      fetchMessages();
    } catch {
      toast.error('فشل التحديث');
    }
  };

  const markAsReplied = async (id: string) => {
    try {
      await fetch(`/api/contact/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isReplied: true }),
      });
      toast.success('تم تعليم الرسالة كمرد عليها');
      fetchMessages();
    } catch {
      toast.error('فشل التحديث');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/contact/${deleteConfirm.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success('تم حذف الرسالة');
      if (selectedMsg?.id === deleteConfirm.id) setSelectedMsg(null);
      fetchMessages();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل الحذف');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const filtered = messages.filter((m) => {
    if (filter === 'unread') return !m.isRead;
    if (filter === 'replied') return m.isReplied;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.isRead).length;

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">رسائل التواصل</h1>
          <p className="text-muted-foreground">{messages.length} رسالة ({unreadCount} غير مقروءة)</p>
        </div>
        <Button variant="outline" onClick={fetchMessages} className="gap-2">
          <RefreshCw className="h-4 w-4" /> تحديث
        </Button>
      </div>

      <div className="flex gap-2">
        <Badge variant={filter === 'all' ? 'default' : 'outline'} className="cursor-pointer px-4 py-2" onClick={() => setFilter('all')}>الكل ({messages.length})</Badge>
        <Badge variant={filter === 'unread' ? 'default' : 'outline'} className="cursor-pointer px-4 py-2" onClick={() => setFilter('unread')}>غير مقروءة ({unreadCount})</Badge>
        <Badge variant={filter === 'replied' ? 'default' : 'outline'} className="cursor-pointer px-4 py-2" onClick={() => setFilter('replied')}>مُرد عليها</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Message List */}
        <div className="lg:col-span-1 space-y-2 max-h-[70vh] overflow-y-auto">
          {filtered.map((msg) => (
            <Card
              key={msg.id}
              className={`cursor-pointer transition-shadow hover:shadow-md ${
                selectedMsg?.id === msg.id ? 'ring-2 ring-emerald-500' : ''
              } ${!msg.isRead ? 'border-emerald-200 dark:border-emerald-900' : ''}`}
              onClick={() => { setSelectedMsg(msg); if (!msg.isRead) markAsRead(msg.id); }}
            >
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  {!msg.isRead ? <Mail className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" /> : <MailOpen className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm truncate ${!msg.isRead ? 'font-semibold' : 'font-medium'}`}>{msg.name}</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{format(new Date(msg.createdAt), 'd MMM', { locale: ar })}</span>
                    </div>
                    {msg.subject && <p className="text-xs text-muted-foreground truncate">{msg.subject}</p>}
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{msg.message}</p>
                    {msg.isReplied && <Badge className="mt-1 text-xs" variant="secondary">تم الرد</Badge>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8">لا توجد رسائل</p>
          )}
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selectedMsg ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedMsg.subject || 'بدون موضوع'}</h3>
                    <p className="text-sm text-muted-foreground">{selectedMsg.name} &lt;{selectedMsg.email}&gt;</p>
                    {selectedMsg.phone && <p className="text-sm text-muted-foreground">هاتف: {selectedMsg.phone}</p>}
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(selectedMsg.createdAt), 'd MMMM yyyy، h:mm a', { locale: ar })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => markAsReplied(selectedMsg.id)} className="gap-1" disabled={selectedMsg.isReplied}>
                      <Reply className="h-3 w-3" /> {selectedMsg.isReplied ? 'تم الرد' : 'تعليم كمردود'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(selectedMsg)} className="text-red-500 gap-1">
                      <Trash2 className="h-3 w-3" /> حذف
                    </Button>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="whitespace-pre-wrap leading-relaxed">{selectedMsg.message}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-20 text-center text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p>اختر رسالة لعرض تفاصيلها</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete} title="حذف الرسالة" description="هل أنت متأكد من حذف هذه الرسالة؟" variant="destructive" confirmLabel="حذف" />
    </div>
  );
}
