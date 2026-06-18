'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { FormModal } from '../shared/FormModal';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { TextField, SelectField, SwitchField } from '../shared/FormFields';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, User, Shield } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface UserItem {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

const ROLE_OPTIONS = [
  { label: 'مدير', value: 'admin' },
  { label: 'محرر', value: 'editor' },
  { label: 'مشاهد', value: 'viewer' },
];

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  editor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  viewer: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

export function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<UserItem | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('editor');
  const [isActive, setIsActive] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      const json = await res.json();
      if (json.success) setUsers(json.data);
    } catch (err) {
      console.error('Failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openCreate = () => {
    setEditing(null);
    setName(''); setEmail(''); setPassword(''); setRole('editor'); setIsActive(true);
    setModalOpen(true);
  };

  const openEdit = (u: UserItem) => {
    setEditing(u);
    setName(u.name); setEmail(u.email); setPassword('');
    setRole(u.role); setIsActive(u.isActive);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) { toast.error('الاسم والبريد مطلوبان'); return; }
    if (!editing && !password.trim()) { toast.error('كلمة المرور مطلوبة للمستخدم الجديد'); return; }
    setSaving(true);
    try {
      const body: Record<string, unknown> = { name, email, role, isActive };
      if (password) body.password = password;
      if (editing) {
        const res = await fetch(`/api/users/${editing.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        toast.success('تم تحديث المستخدم');
      } else {
        const res = await fetch('/api/users', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        toast.success('تم إنشاء المستخدم');
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/users/${deleteConfirm.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success('تم حذف المستخدم');
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل الحذف');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const toggleActive = async (u: UserItem) => {
    try {
      await fetch(`/api/users/${u.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !u.isActive }),
      });
      toast.success(u.isActive ? 'تم تعطيل المستخدم' : 'تم تفعيل المستخدم');
      fetchUsers();
    } catch {
      toast.error('فشل التحديث');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
          <p className="text-muted-foreground">{users.length} مستخدم</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> مستخدم جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => (
          <Card key={u.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                    {u.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{u.name}</h3>
                    <Badge className={ROLE_COLORS[u.role] || ROLE_COLORS.viewer}>
                      <Shield className="h-3 w-3 ml-1" />
                      {ROLE_OPTIONS.find((r) => r.value === u.role)?.label || u.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {!u.isActive && <Badge variant="destructive" className="text-xs">معطل</Badge>}
                    {u.lastLoginAt && (
                      <span className="text-xs text-muted-foreground">
                        آخر دخول: {new Date(u.lastLoginAt).toLocaleDateString('ar')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{u.isActive ? 'مفعّل' : 'معطّل'}</span>
                  <Switch checked={u.isActive} onCheckedChange={() => toggleActive(u)} />
                </div>
                <div className="flex-1" />
                <Button variant="ghost" size="icon" onClick={() => openEdit(u)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(u)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">لا يوجد مستخدمون بعد</CardContent></Card>
      )}

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'تعديل المستخدم' : 'مستخدم جديد'} onSubmit={handleSave} loading={saving}>
        <TextField label="الاسم" value={name} onChange={setName} placeholder="اسم المستخدم" />
        <TextField label="البريد الإلكتروني" value={email} onChange={setEmail} placeholder="user@example.com" type="email" />
        <TextField label={editing ? 'كلمة المرور الجديدة (اتركها فارغة للإبقاء)' : 'كلمة المرور'} value={password} onChange={setPassword} placeholder="••••••••" type="password" />
        <SelectField label="الدور" value={role} onChange={setRole} options={ROLE_OPTIONS} />
        <SwitchField label="مفعّل" checked={isActive} onChange={setIsActive} description="تفعيل أو تعطيل حساب المستخدم" />
      </FormModal>

      <ConfirmDialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete} title="حذف المستخدم" description={`هل أنت متأكد من حذف "${deleteConfirm?.name}"؟`} variant="destructive" confirmLabel="حذف" />
    </div>
  );
}
