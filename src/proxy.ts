import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminSessionTokenEdge } from '@/lib/auth-token';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cleanPath = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;

  // 1. Check if user is accessing /admin/login while ALREADY authenticated
  if (cleanPath === '/admin/login') {
    const adminToken = request.cookies.get('angel_admin_session')?.value;
    const { valid } = await verifyAdminSessionTokenEdge(adminToken || '');
    if (valid) {
      console.log('🔒 [AUTH PROXY] Authenticated session detected on /admin/login -> Redirecting to /admin');
      const adminDashboardUrl = new URL('/admin', request.url);
      return NextResponse.redirect(adminDashboardUrl);
    }
  }

  // 2. Intercept all protected /admin routes (except /admin/login)
  if (cleanPath.startsWith('/admin') && cleanPath !== '/admin/login') {
    const adminToken = request.cookies.get('angel_admin_session')?.value;
    const { valid } = await verifyAdminSessionTokenEdge(adminToken || '');
    console.log(`🔒 [AUTH PROXY] Route: ${cleanPath} | Admin session valid: ${valid}`);

    if (!valid) {
      console.log(`🔒 [AUTH PROXY] Unauthenticated access attempt to ${cleanPath} -> Redirecting to /admin/login`);
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Intercept protected customer routes: /checkout, /payment, /orders, /account
  const protectedRoutes = ['/checkout', '/payment', '/orders', '/account'];
  const isProtectedRoute = protectedRoutes.some((route) => cleanPath.startsWith(route));

  if (isProtectedRoute) {
    const userSession =
      request.cookies.get('angel_user_session')?.value ||
      request.cookies.get('next-auth.session-token')?.value ||
      request.cookies.get('__Secure-next-auth.session-token')?.value;

    if (!userSession) {
      const loginUrl = new URL(`/login?redirect=${encodeURIComponent(cleanPath)}`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export async function middleware(request: NextRequest) {
  return proxy(request);
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/checkout',
    '/checkout/:path*',
    '/payment',
    '/payment/:path*',
    '/orders',
    '/orders/:path*',
    '/account',
    '/account/:path*',
  ],
};
