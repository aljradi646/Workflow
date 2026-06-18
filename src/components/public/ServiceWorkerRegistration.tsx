'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated') {
                // New service worker activated - could notify user to refresh
              }
            });
          }
        });
      } catch (error) {
        // Service worker registration failed - fail silently in production
        if (process.env.NODE_ENV === 'development') {
          console.warn('SW registration failed:', error);
        }
      }
    };

    registerSW();
  }, []);

  return null;
}
