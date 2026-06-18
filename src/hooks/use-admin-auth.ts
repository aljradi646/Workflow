'use client';

import { useEffect, useCallback } from 'react';
import { signIn, signOut } from 'next-auth/react';
import { useAdminStore } from '@/store/admin-store';

export function useAdminAuth() {
  const { isAuthenticated, user, setAuth, logout: storeLogout } = useAdminStore();

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session');
      const session = await res.json();
      if (session?.user) {
        setAuth({
          id: (session.user as { id?: string }).id || '',
          email: session.user.email || '',
          name: session.user.name || '',
          role: (session.user as { role?: string }).role || 'admin',
          avatar: (session.user as { avatar?: string | null }).avatar,
        });
      } else {
        setAuth(null);
      }
    } catch {
      setAuth(null);
    }
  }, [setAuth]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    await checkSession();
  }, [checkSession]);

  const handleLogout = useCallback(async () => {
    await signOut({ redirect: false });
    storeLogout();
  }, [storeLogout]);

  return { isAuthenticated, user, login, logout: handleLogout, checkSession };
}
