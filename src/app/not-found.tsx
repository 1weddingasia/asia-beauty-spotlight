import Link from 'next/link';
import { PageShell } from '@/components/site/Layout';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <PageShell>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="text-8xl font-black text-champagne mb-4 font-display">404</h1>
        <h2 className="text-2xl font-bold mb-4 font-display">Không tìm thấy trang</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Đường dẫn bạn đang cố truy cập không tồn tại hoặc đã bị gỡ bỏ khỏi hệ thống danh bạ của 1Beauty.Asia.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild className="bg-gold hover:bg-gold/90 text-white rounded-full px-8">
            <Link href="/">Về Trang Chủ</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full px-8 border-gold text-gold hover:bg-gold/10">
            <Link href="/tim-kiem">Tìm kiếm Dịch vụ</Link>
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
