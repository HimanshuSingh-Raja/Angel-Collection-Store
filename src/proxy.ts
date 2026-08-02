import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

async function verifyAdminToken(token: string): Promise<boolean> {
  if (!token) return false;
  try {
    const parts = token.split(':');
    if (parts.length !== 4) return false;
    const [userId, role, timestampStr, receivedHmac] = parts;

    const timestamp = parseInt(timestampStr, 10);
    const maxAgeMs = 30 * 24 * 60 * 60 * 1000;
    if (isNaN(timestamp) || Date.now() - timestamp > maxAgeMs) {
      return false;
    }

    if (!['OWNER', 'ADMIN', 'MANAGER', 'STAFF'].includes(role)) {
      return false;
    }

    const secret = process.env.ADMIN_SECRET_KEY || process.env.NEXTAUTH_SECRET || 'angel-secure-crypto-fallback-key-2026';
    const payload = `${userId}:${role}:${timestampStr}`;

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(payload);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const expectedHmac = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    if (expectedHmac.length !== receivedHmac.length) return false;
    let diff = 0;
    for (let i = 0; i < expectedHmac.length; i++) {
      diff |= expectedHmac.charCodeAt(i) ^ receivedHmac.charCodeAt(i);
    }

    return diff === 0;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercept all /admin routes except /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminToken = request.cookies.get('angel_admin_session')?.value;
    const isValid = await verifyAdminToken(adminToken || '');
    if (!isValid) {
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

export async function middleware(request: NextRequest) {
  return proxy(request);
}

export const config = {
  matcher: ['/admin/:path*', '/checkout/:path*', '/payment/:path*', '/orders/:path*', '/account/:path*'],
};
