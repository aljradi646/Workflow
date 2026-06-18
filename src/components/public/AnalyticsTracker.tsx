'use client';

import { useEffect, useRef } from 'react';

export function AnalyticsTracker() {
  const sessionIdRef = useRef<string>('');
  const startTimeRef = useRef<number>(0);
  const trackedRef = useRef<boolean>(false);

  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;

    // Generate session ID
    sessionIdRef.current = `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    startTimeRef.current = Date.now();

    // Track page view
    const trackPageView = async () => {
      try {
        await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: 'page_view',
            page: window.location.pathname,
            referrer: document.referrer || null,
            sessionId: sessionIdRef.current,
          }),
        });
      } catch {
        // Silently fail
      }
    };

    trackPageView();

    // Track session duration on unload
    const trackSessionEnd = async () => {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      try {
        const payload = JSON.stringify({
          eventType: 'session_end',
          page: window.location.pathname,
          sessionId: sessionIdRef.current,
          duration,
        });
        navigator.sendBeacon('/api/analytics', payload);
      } catch {
        // Silently fail
      }
    };

    window.addEventListener('beforeunload', trackSessionEnd);

    // Track scroll depth
    let maxScrollDepth = 0;
    const trackScrollDepth = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);
        if (scrollPercent > maxScrollDepth) {
          maxScrollDepth = scrollPercent;
        }
      }
    };

    window.addEventListener('scroll', trackScrollDepth, { passive: true });

    return () => {
      window.removeEventListener('beforeunload', trackSessionEnd);
      window.removeEventListener('scroll', trackScrollDepth);
    };
  }, []);

  return null;
}
