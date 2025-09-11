import { NextResponse, type NextRequest } from 'next/server'

import { supabaseServerClient } from '@/utils/supabase/server'

export async function middleware(request: NextRequest) {
  try {
    const supabase = await supabaseServerClient()
    const response = NextResponse.next()

    // Refresh session if expired - required for Server Components
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const isLoginPage = request.nextUrl.pathname === '/login'
    const isAuthCallback = request.nextUrl.pathname === '/auth/callback'

    // Allow access to auth callback without session
    if (isAuthCallback) {
      return response
    }

    if (!session && !isLoginPage) {
      // No session and not on login page - redirect to login
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    if (session && isLoginPage) {
      // Has session but on login page - redirect to home
      const homeUrl = new URL('/', request.url)
      return NextResponse.redirect(homeUrl)
    }

    // if (session && !isLoginPage) {
    //   // Check admin status for authenticated users on protected routes
    //   const { data: profile } = await supabase
    //     .from("profiles")
    //     .select("role")
    //     .eq("id", session.user.id)
    //     .maybeSingle();

    //   if (!profile || profile.role !== "admin") {
    //     // Not admin - redirect to login with message
    //     const loginUrl = new URL("/login", request.url);
    //     loginUrl.searchParams.set("error", "admin_required");
    //     return NextResponse.redirect(loginUrl);
    //   }
    // }

    return response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }
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
