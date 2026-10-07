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
export async function proxy(request: NextRequest) {
  const hostname = (request.headers.get('host') || '').split(':')[0].toLowerCase();
  const { pathname } = request.nextUrl;

  // ── Multi-domain home routing ────────────────────────────────────────────
  // Chỉ can thiệp đúng trang chủ "/"
  // Dùng exact match + subdomain check để tránh lỗi bảo mật hostname spoofing
  if (pathname === '/') {
    if (hostname === '1beauty.asia' || hostname.endsWith('.1beauty.asia')) {
      // Domain 1beauty.asia → Rewrite ngầm về /home-beauty (URL thanh địa chỉ giữ nguyên)
      const rewriteResponse = NextResponse.rewrite(new URL('/home-beauty', request.url));
      // Vẫn cần refresh Supabase session dù là trang công khai
      await updateSession(request);
      return rewriteResponse;
    }
    // Domain 1booking.asia / localhost / bất kỳ domain khác → /home-booking
    const rewriteResponse = NextResponse.rewrite(new URL('/home-booking', request.url));
    await updateSession(request);
    return rewriteResponse;
  }
  // ── End multi-domain routing ─────────────────────────────────────────────

  // Tất cả route còn lại: refresh auth session + bảo vệ /admin và /dashboard
  return await updateSession(request)
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
