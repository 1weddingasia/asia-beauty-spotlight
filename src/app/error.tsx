"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { PageShell } from '@/components/site/Layout';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <PageShell>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <AlertCircle className="size-20 text-red-400 mb-6" />
        <h2 className="text-2xl font-bold mb-4 font-display">Đã xảy ra lỗi hệ thống</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Hệ thống đang gặp sự cố khi tải trang này. Chúng tôi đã ghi nhận lỗi và sẽ khắc phục sớm nhất có thể.
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={() => reset()} className="bg-gold hover:bg-gold/90 text-white rounded-full px-8">
            Thử lại
          </Button>
          <Button asChild variant="outline" className="rounded-full px-8 border-gold text-gold hover:bg-gold/10">
            <Link href="/">Về Trang Chủ</Link>
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
