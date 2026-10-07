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
// Thêm domain mới vào đây mà không cần sửa logic bên dưới
const DOMAIN_HOME_MAP: Record<string, string> = {
  '1beauty.asia': '/home-beauty',
};
const DEFAULT_HOME = '/home-booking'; // fallback: 1booking.asia, localhost, ...
// ─────────────────────────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  const hostname = (request.headers.get('host') || '').split(':')[0].toLowerCase();
  const { pathname } = request.nextUrl;

  // ── Multi-domain home routing ─────────────────────────────────────────────
  // Chỉ can thiệp đúng trang chủ "/"
  if (pathname === '/') {
    // Tìm target page dựa theo hostname (exact match hoặc subdomain)
    let targetHome = DEFAULT_HOME;
    for (const [domain, home] of Object.entries(DOMAIN_HOME_MAP)) {
      if (hostname === domain || hostname.endsWith(`.${domain}`)) {
        targetHome = home;
        break;
      }
    }

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

  // ── Route trang phụ riêng cho từng domain ────────────────────────────────
  if (pathname === '/gioi-thieu' || pathname === '/lien-he') {
    let isBookingDomain = true;
    for (const [domain] of Object.entries(DOMAIN_HOME_MAP)) {
      if (hostname === domain || hostname.endsWith(`.${domain}`)) {
        isBookingDomain = false;
        break;
      }
    }
    
    // Nếu là domain của 1Booking (hoặc localhost fallback) -> trỏ vào trang -booking
    if (isBookingDomain) {
      const targetPath = pathname === '/gioi-thieu' ? '/gioi-thieu-booking' : '/lien-he-booking';
      const sessionResponse = await updateSession(request);
      const rewriteResponse = NextResponse.rewrite(new URL(targetPath, request.url));
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
