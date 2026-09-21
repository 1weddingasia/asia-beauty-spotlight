import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

/**
 * Next.js 16 route protection.
 *
 * NOTE: Turbopack hiện vẫn yêu cầu tên export là "middleware".
 * Khi Next.js hoàn toàn bỏ "middleware" thì chạy:
 *   npx @next/codemod@canary middleware-to-proxy .
 * để tự động đổi sang "proxy".
 */
export async function middleware(request: NextRequest) {
  // Refresh auth session + bảo vệ /admin và /dashboard
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
