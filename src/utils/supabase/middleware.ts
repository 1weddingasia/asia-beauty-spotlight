import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // This will refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone();
  
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    
    // Kiểm tra quyền hạn Chủ Doanh Nghiệp (Owner)
    const role = user.user_metadata?.role;
    if (role === 'owner') {
      if (request.nextUrl.pathname === '/admin' || 
          request.nextUrl.pathname.startsWith('/admin/users') || 
          request.nextUrl.pathname.startsWith('/admin/settings')) {
        url.pathname = '/dashboard'; 
        return NextResponse.redirect(url);
      }
    }
  }

  // Bảo vệ route /dashboard cho doanh nghiệp
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  // Redirect away from login if already logged in
  if (request.nextUrl.pathname === '/login' && user) {
    const role = user.user_metadata?.role;
    if (role === 'owner') {
       url.pathname = '/dashboard'; 
    } else {
       url.pathname = '/admin';
    }
    return NextResponse.redirect(url);
  }

  return supabaseResponse
}
