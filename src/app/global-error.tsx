'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center bg-background text-foreground">
          <div className="text-7xl mb-2">⚠️</div>
          <h2 className="text-3xl font-bold">حدث خطأ غير متوقع</h2>
          <p className="text-muted-foreground max-w-md">
            نعتذر عن هذا الخطأ. يمكنك المحاولة مرة أخرى.
          </p>
          {error?.message && (
            <details className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg max-w-lg overflow-auto">
              <summary className="cursor-pointer font-medium">تفاصيل الخطأ</summary>
              <pre className="mt-2 whitespace-pre-wrap text-left direction-ltr">{error.message}</pre>
            </details>
          )}
          <button
            onClick={() => reset()}
            className="mt-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </body>
    </html>
  );
}
