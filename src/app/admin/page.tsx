'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { LoadingSpinner } from '@/components/public/LoadingSpinner';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string | null;
}

// Lazy-load the admin dashboard after login (avoids server crash from compiling too many components)
const AdminApp = dynamic(
  () => import('@/components/admin/AdminApp').then(mod => ({ default: mod.AdminApp })),
  { ssr: false, loading: () => <LoadingSpinner /> }
);

export default function AdminPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/verify-token');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUser(data.user);
          }
        }
      } catch {
        // Not authenticated
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLoginSuccess = useCallback((loggedInUser: AuthUser) => {
    setUser(loggedInUser);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/custom-logout', { method: 'POST' });
    } catch {
      // Ignore
    }
    setUser(null);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <AdminApp user={user} onLogout={handleLogout} />;
  }

  return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
}
