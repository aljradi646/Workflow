'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { toast } from 'sonner';
import {
  Mail, MailOpen, Trash2, Search, Download, RefreshCw,
  CheckSquare, Square, Pencil, ToggleLeft, ToggleRight,
  Users, UserCheck, UserX, UserPlus, FileDown,
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
  source: string;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function NewsletterSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, inactive: 0, newThisMonth: 0 });
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sourceFilter, setSourceFilter] = useState('all');

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Edit dialog
  const [editSub, setEditSub] = useState<Subscriber | null>(null);
  const [editName, setEditName] = useState('');

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Subscriber | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        list: 'true',
        page: String(pagination.page),
        limit: String(pagination.limit),
        status: statusFilter,
        source: sourceFilter,
      });
      if (search) params.set('search', search);

      const res = await fetch(`/api/newsletter?${params}`);
      const json = await res.json();
      if (json.success) {
        setSubscribers(json.data.subscribers || []);
        setStats(json.data.stats || { total: 0, active: 0, inactive: 0, newThisMonth: 0 });
        setPagination(json.data.pagination || pagination);
        setSources(json.data.sources || []);
      }
    } catch (err) {
      console.error('Failed:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter, sourceFilter, search]);

  useEffect(() => { fetchSubscribers(); }, [fetchSubscribers]);

  // Reset page when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [search, statusFilter, sourceFilter]);

  const handleToggleActive = async (sub: Subscriber) => {
    try {
      await fetch(`/api/newsletter/${sub.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !sub.isActive }),
      });
      toast.success(sub.isActive ? 'تم تعطيل المشترك' : 'تم تفعيل المشترك');
      fetchSubscribers();
    } catch {
      toast.error('فشل التحديث');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/newsletter/${deleteTarget.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success('تم حذف المشترك');
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(deleteTarget.id);
        return next;
      });
      fetchSubscribers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل الحذف');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const ids = Array.from(selectedIds);
      await Promise.all(ids.map(id => fetch(`/api/newsletter/${id}`, { method: 'DELETE' })));
      toast.success(`تم حذف ${ids.length} مشترك`);
      setSelectedIds(new Set());
      fetchSubscribers();
    } catch {
      toast.error('فشل حذف بعض المشتركين');
    } finally {
      setBulkDeleteConfirm(false);
    }
  };

  const handleBulkToggle = async (isActive: boolean) => {
    try {
      const ids = Array.from(selectedIds);
      await Promise.all(ids.map(id =>
        fetch(`/api/newsletter/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive }),
        })
      ));
      toast.success(`تم ${isActive ? 'تفعيل' : 'تعطيل'} ${ids.length} مشترك`);
      setSelectedIds(new Set());
      fetchSubscribers();
    } catch {
      toast.error('فشل التحديث');
    }
  };

  const handleEditSave = async () => {
    if (!editSub) return;
    try {
      await fetch(`/api/newsletter/${editSub.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName }),
      });
      toast.success('تم تحديث المشترك');
      setEditSub(null);
      fetchSubscribers();
    } catch {
      toast.error('فشل التحديث');
    }
  };

  const handleExportCSV = () => {
    const headers = ['البريد الإلكتروني', 'الاسم', 'المصدر', 'الحالة', 'تاريخ الاشتراك'];
    const rows = subscribers.map(s => [
      s.email,
      s.name || '',
      s.source,
      s.isActive ? 'نشط' : 'غير نشط',
      new Date(s.createdAt).toLocaleDateString('ar'),
    ]);
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success('تم تصدير البيانات');
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === subscribers.length && subscribers.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(subscribers.map(s => s.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading && subscribers.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">مشتركي النشرة البريدية</h1>
          <p className="text-muted-foreground">إدارة والمشتركين في النشرة البريدية</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchSubscribers} className="gap-2">
            <RefreshCw className="h-4 w-4" /> تحديث
          </Button>
          <Button variant="outline" onClick={handleExportCSV} className="gap-2">
            <FileDown className="h-4 w-4" /> تصدير CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-emerald flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">إجمالي المشتركين</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">نشط</p>
              <p className="text-xl font-bold text-emerald-600">{stats.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
              <UserX className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">غير نشط</p>
              <p className="text-xl font-bold text-red-600">{stats.inactive}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0">
              <UserPlus className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">جدد هذا الشهر</p>
              <p className="text-xl font-bold text-teal-600">{stats.newThisMonth}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث بالبريد الإلكتروني أو الاسم..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
        <div className="flex gap-2">
          <Badge
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            className="cursor-pointer px-4 py-2"
            onClick={() => setStatusFilter('all')}
          >
            الكل ({stats.total})
          </Badge>
          <Badge
            variant={statusFilter === 'active' ? 'default' : 'outline'}
            className="cursor-pointer px-4 py-2"
            onClick={() => setStatusFilter('active')}
          >
            نشط ({stats.active})
          </Badge>
          <Badge
            variant={statusFilter === 'inactive' ? 'default' : 'outline'}
            className="cursor-pointer px-4 py-2"
            onClick={() => setStatusFilter('inactive')}
          >
            غير نشط ({stats.inactive})
          </Badge>
        </div>
        {sources.length > 1 && (
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">جميع المصادر</option>
            {sources.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
          <span className="text-sm font-medium">{selectedIds.size} محدد</span>
          <Button size="sm" variant="outline" onClick={() => handleBulkToggle(true)} className="gap-1">
            <ToggleRight className="h-3.5 w-3.5" /> تفعيل
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleBulkToggle(false)} className="gap-1">
            <ToggleLeft className="h-3.5 w-3.5" /> تعطيل
          </Button>
          <Button size="sm" variant="outline" onClick={handleExportCSV} className="gap-1">
            <Download className="h-3.5 w-3.5" /> تصدير
          </Button>
          <Button size="sm" variant="destructive" onClick={() => setBulkDeleteConfirm(true)} className="gap-1">
            <Trash2 className="h-3.5 w-3.5" /> حذف
          </Button>
        </div>
      )}

      {/* Data Table */}
      <div className="rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-right w-10">
                  <button onClick={toggleSelectAll} className="text-muted-foreground hover:text-foreground">
                    {selectedIds.size === subscribers.length && subscribers.length > 0
                      ? <CheckSquare className="h-4 w-4 text-emerald-500" />
                      : <Square className="h-4 w-4" />}
                  </button>
                </th>
                <th className="p-3 text-right text-sm font-medium text-muted-foreground">البريد الإلكتروني</th>
                <th className="p-3 text-right text-sm font-medium text-muted-foreground">الاسم</th>
                <th className="p-3 text-right text-sm font-medium text-muted-foreground">المصدر</th>
                <th className="p-3 text-right text-sm font-medium text-muted-foreground">الحالة</th>
                <th className="p-3 text-right text-sm font-medium text-muted-foreground">تاريخ الاشتراك</th>
                <th className="p-3 text-right text-sm font-medium text-muted-foreground">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => (
                <tr
                  key={sub.id}
                  className={`border-b transition-colors hover:bg-muted/30 ${
                    selectedIds.has(sub.id) ? 'bg-emerald-500/5' : ''
                  }`}
                >
                  <td className="p-3">
                    <button onClick={() => toggleSelect(sub.id)} className="text-muted-foreground hover:text-foreground">
                      {selectedIds.has(sub.id)
                        ? <CheckSquare className="h-4 w-4 text-emerald-500" />
                        : <Square className="h-4 w-4" />}
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {sub.isActive ? (
                        <MailOpen className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span className="text-sm font-medium truncate max-w-[200px]">{sub.email}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {sub.name || '—'}
                  </td>
                  <td className="p-3">
                    <Badge variant="secondary" className="text-xs">{sub.source}</Badge>
                  </td>
                  <td className="p-3">
                    <Badge
                      variant={sub.isActive ? 'default' : 'outline'}
                      className={sub.isActive ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20' : ''}
                    >
                      {sub.isActive ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {format(new Date(sub.createdAt), 'd MMM yyyy', { locale: ar })}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => { setEditSub(sub); setEditName(sub.name || ''); }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleToggleActive(sub)}
                      >
                        {sub.isActive
                          ? <ToggleRight className="h-4 w-4 text-emerald-500" />
                          : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600"
                        onClick={() => setDeleteTarget(sub)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {subscribers.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    <Mail className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p>لا يوجد مشتركون</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            عرض {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} من {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              السابق
            </Button>
            <span className="text-sm font-medium">
              {pagination.page} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              التالي
            </Button>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editSub} onOpenChange={(v) => !v && setEditSub(null)}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل المشترك</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">البريد الإلكتروني</label>
              <Input value={editSub?.email || ''} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">الاسم</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="اسم المشترك"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSub(null)}>إلغاء</Button>
            <Button onClick={handleEditSave} className="gradient-emerald text-white">حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="حذف المشترك"
        description={`هل أنت متأكد من حذف ${deleteTarget?.email}؟ لا يمكن التراجع عن هذا الإجراء.`}
        variant="destructive"
        confirmLabel="حذف"
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        open={bulkDeleteConfirm}
        onClose={() => setBulkDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        title="حذف المشتركين المحددين"
        description={`هل أنت متأكد من حذف ${selectedIds.size} مشترك؟ لا يمكن التراجع عن هذا الإجراء.`}
        variant="destructive"
        confirmLabel="حذف الكل"
      />
    </div>
  );
}
