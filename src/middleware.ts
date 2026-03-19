import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Routes that require authentication
const PROTECTED_ROUTES = ['/vendor', '/koc', '/admin'];

// Public routes — skip auth entirely
const PUBLIC_ROUTES = ['/', '/login', '/register', '/academy', '/api/ucp', '/api/products', '/api/tax', '/api/health'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip session refresh for public routes when Supabase isn't configured
  const isPublic = PUBLIC_ROUTES.some((route) =>
    pathname === route || pathname.startsWith(route + '/')
  );

  let user = null;
  let supabaseResponse = NextResponse.next({ request });

  try {
    const result = await updateSession(request);
    supabaseResponse = result.supabaseResponse;
    user = result.user;
  } catch {
    // Supabase not configured or unavailable — continue without auth
    if (!isPublic) {
      const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
      if (isProtected) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
    return NextResponse.next({ request });
  }

  // Check if route requires auth
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
