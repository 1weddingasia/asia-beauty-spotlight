import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const { pathname } = request.nextUrl;

  // Chỉ can thiệp đúng trang chủ "/"
  if (pathname === '/') {
    // Nếu vào từ domain 1beauty.asia → Rewrite ngầm về /home-beauty
    if (hostname.includes('1beauty.asia')) {
      return NextResponse.rewrite(new URL('/home-beauty', request.url));
    }

    // Các domain còn lại (1booking.asia, localhost...) → Rewrite ngầm về /home-booking
    return NextResponse.rewrite(new URL('/home-booking', request.url));
  }

  // Toàn bộ route khác (/[slug], /api, static files...) giữ nguyên luồng
  return NextResponse.next();
}

export const config = {
  // Chỉ lắng nghe đúng trang chủ để tối ưu hiệu năng
  matcher: ['/'],
};
