import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

/**
 * Next.js 16 route protection.
 *
 * NOTE: Turbopack hiện vẫn yêu cầu tên export là "middleware".
 * Khi Next.js hoàn toàn bỏ "middleware" thì chạy:
 *   npx @next/codemod@canary middleware-to-proxy .
 * để tự động đổi sang "proxy".
 */

// ── Multi-domain home routing config ─────────────────────────────────────────
// Domain 1beauty.asia sẽ rewrite ngầm về /home-beauty.
// Domain 1booking.asia & localhost giữ nguyên '/' để nạp trang B2C mới (src/app/page.tsx).
// Trang booking B2B cũ đã được chuyển sang '/danh-cho-doanh-nghiep'.
const DOMAIN_HOME_MAP: Record<string, string> = {
  '1beauty.asia': '/home-beauty',
};
// ─────────────────────────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  const hostname = (request.headers.get('host') || '').split(':')[0].toLowerCase();
  const { pathname } = request.nextUrl;

  // ── Multi-domain home routing ─────────────────────────────────────────────
  // Chỉ can thiệp đúng trang chủ "/"
  if (pathname === '/') {
    // Nếu là domain 1beauty.asia -> rewrite sang /home-beauty
    let targetHome: string | null = null;
    for (const [domain, home] of Object.entries(DOMAIN_HOME_MAP)) {
      if (hostname === domain || hostname.endsWith(`.${domain}`)) {
        targetHome = home;
        break;
      }
    }

    if (targetHome) {
      // Refresh Supabase session trước, lấy response có Set-Cookie headers
      const sessionResponse = await updateSession(request);

      // Tạo rewrite response (URL thanh địa chỉ giữ nguyên domain)
      const rewriteResponse = NextResponse.rewrite(new URL(targetHome, request.url));

      // Copy toàn bộ Set-Cookie từ sessionResponse sang rewriteResponse
      // để session không bị expire/re-refresh liên tục
      sessionResponse.cookies.getAll().forEach((cookie) => {
        rewriteResponse.cookies.set(cookie);
      });

      return rewriteResponse;
    }

    // Với 1booking.asia và localhost: giữ nguyên "/" để src/app/page.tsx (trang B2C mới) xử lý
    return await updateSession(request);
  }

  // ── Route trang phụ riêng cho từng domain ────────────────────────────────
  const BOOKING_ROUTE_MAP: Record<string, string> = {
    '/gioi-thieu': '/gioi-thieu-booking',
    '/lien-he': '/lien-he-booking',
  };

  const bookingTarget = BOOKING_ROUTE_MAP[pathname];
  if (bookingTarget) {
    let isBeautyDomain = false;
    for (const [domain] of Object.entries(DOMAIN_HOME_MAP)) {
      if (hostname === domain || hostname.endsWith(`.${domain}`)) {
        isBeautyDomain = true;
        break;
      }
    }
    
    // Nếu không phải domain Beauty (tức là 1Booking hoặc localhost) -> rewrite
    if (!isBeautyDomain) {
      const sessionResponse = await updateSession(request);
      const rewriteResponse = NextResponse.rewrite(new URL(bookingTarget, request.url));
      sessionResponse.cookies.getAll().forEach((cookie) => {
        rewriteResponse.cookies.set(cookie);
      });
      return rewriteResponse;
    }
  }
  // ── End route trang phụ ──────────────────────────────────────────────────

  // Tất cả route còn lại: refresh auth session + bảo vệ /admin và /dashboard
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
