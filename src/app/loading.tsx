import { PageShell } from '@/components/site/Layout';
import { Sparkles } from 'lucide-react';

export default function Loading() {
  return (
    <PageShell>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-champagne rounded-full border-t-gold animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-gold animate-pulse" />
          </div>
        </div>
        <h2 className="text-xl font-medium font-display text-ink animate-pulse">Đang tải dữ liệu...</h2>
        <p className="text-muted-foreground mt-2 max-w-sm text-sm">
          Vui lòng đợi một chút trong khi chúng tôi chuẩn bị nội dung cho bạn.
        </p>
      </div>
    </PageShell>
  );
}
