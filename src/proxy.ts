import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminSessionTokenEdge } from '@/lib/auth-token';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercept all /admin routes except /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminToken = request.cookies.get('angel_admin_session')?.value;
    const { valid } = verifyAdminSessionTokenEdge(adminToken || '');
    if (!valid) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Intercept protected customer routes: /checkout, /payment, /orders, /account
  const protectedRoutes = ['/checkout', '/payment', '/orders', '/account'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    const userSession =
      request.cookies.get('angel_user_session')?.value ||
      request.cookies.get('next-auth.session-token')?.value ||
      request.cookies.get('__Secure-next-auth.session-token')?.value;

    if (!userSession) {
      const loginUrl = new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Keep export middleware for backward compatibility if needed by older Next.js loaders
export const middleware = proxy;

export const config = {
  matcher: ['/admin/:path*', '/checkout/:path*', '/payment/:path*', '/orders/:path*', '/account/:path*'],
};
