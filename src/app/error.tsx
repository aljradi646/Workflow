'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center bg-background text-foreground">
      <div className="text-7xl mb-2">😵</div>
      <h2 className="text-3xl font-bold">حدث خطأ في التطبيق</h2>
      <p className="text-muted-foreground max-w-md">
        حدث خطأ أثناء تحميل الصفحة. يمكنك المحاولة مرة أخرى.
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
  );
}
