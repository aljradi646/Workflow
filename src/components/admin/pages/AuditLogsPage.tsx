'use client';

import { useEffect, useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DataTable, type Column } from '../shared/DataTable';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { RefreshCw } from 'lucide-react';

interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  entity: string | null;
  entityId: string | null;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  severity: string;
  createdAt: string;
  user: { name: string; email: string } | null;
}

const ACTION_LABELS: Record<string, string> = {
  login: 'تسجيل دخول',
  logout: 'تسجيل خروج',
  create: 'إنشاء',
  update: 'تحديث',
  delete: 'حذف',
  upload: 'رفع',
  settings_change: 'تغيير إعدادات',
  security_event: 'حدث أمني',
};

const SEVERITY_COLORS: Record<string, string> = {
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  critical: 'bg-red-900 text-red-100',
};

export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (actionFilter !== 'all') params.set('action', actionFilter);
      if (severityFilter !== 'all') params.set('severity', severityFilter);
      const res = await fetch(`/api/audit-logs?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        // API returns { logs, total, page, limit }
        const data = json.data.logs || json.data;
        setLogs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed:', err);
    } finally {
      setLoading(false);
    }
  }, [actionFilter, severityFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const columns: Column<AuditLog>[] = [
    { key: 'createdAt', label: 'التاريخ', sortable: true, render: (log) => format(new Date(log.createdAt), 'd MMM yyyy, h:mm a', { locale: ar }) },
    { key: 'user', label: 'المستخدم', render: (log) => log.user?.name || 'النظام' },
    { key: 'action', label: 'الإجراء', render: (log) => <Badge variant="outline">{ACTION_LABELS[log.action] || log.action}</Badge> },
    { key: 'entity', label: 'الكيان', render: (log) => log.entity || '-' },
    { key: 'severity', label: 'الخطورة', render: (log) => <Badge className={SEVERITY_COLORS[log.severity] || SEVERITY_COLORS.info}>{log.severity}</Badge> },
    { key: 'ipAddress', label: 'IP', render: (log) => <span className="font-mono text-xs">{log.ipAddress || '-'}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">سجل العمليات</h1>
          <p className="text-muted-foreground">تتبع جميع العمليات في النظام</p>
        </div>
        <Button variant="outline" onClick={fetchLogs} className="gap-2">
          <RefreshCw className="h-4 w-4" /> تحديث
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="الإجراء" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            {Object.entries(ACTION_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="الخطورة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="info">معلومات</SelectItem>
            <SelectItem value="warning">تحذير</SelectItem>
            <SelectItem value="error">خطأ</SelectItem>
            <SelectItem value="critical">حرج</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={logs as unknown as Record<string, unknown>[]}
        columns={columns as Column<Record<string, unknown>>[]}
        searchKeys={['action', 'entity']}
        searchPlaceholder="ابحث في السجلات..."
        loading={loading}
        pageSize={15}
      />
    </div>
  );
}
