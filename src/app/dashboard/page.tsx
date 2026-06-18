'use client';

import { useAdminAuth } from '@/hooks/use-admin-auth';
import { AdminApp } from '@/components/admin/AdminApp';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { Toaster } from 'sonner';

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAdminAuth();

  // Loading while checking session
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  // Not authenticated - show login
  if (!isAuthenticated) {
    return (
      <div dir="rtl">
        <AdminLogin />
        <Toaster position="top-center" richColors />
      </div>
    );
  }

  // Authenticated - show admin panel
  return <AdminApp />;
}
