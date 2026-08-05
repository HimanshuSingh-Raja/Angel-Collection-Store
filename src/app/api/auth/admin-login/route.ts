import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { generateAdminSessionToken, verifyAdminSessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('angel_admin_session')?.value;

    if (!adminToken) {
      return NextResponse.json({ authenticated: false }, { status: 401, headers: { 'Cache-Control': 'no-store, max-age=0' } });
    }

    const { valid, role } = verifyAdminSessionToken(adminToken);

    if (valid) {
      return NextResponse.json({ authenticated: true, role }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
    }

    return NextResponse.json({ authenticated: false }, { status: 401, headers: { 'Cache-Control': 'no-store, max-age=0' } });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 500, headers: { 'Cache-Control': 'no-store, max-age=0' } });
  }
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const ownerEmail = process.env.OWNER_EMAIL;
    const ownerPass = process.env.OWNER_PASSWORD;

    if (!ownerEmail || !ownerPass) {
      console.error('❌ [SECURITY ERROR] Missing OWNER_EMAIL or OWNER_PASSWORD environment variables.');
      return NextResponse.json(
        { success: false, message: 'Server configuration error. Contact system administrator.' },
        { status: 500 }
      );
    }

    // 1. Authenticate Master Admin strictly using environment variables
    if (email.toLowerCase() === ownerEmail.toLowerCase() && password === ownerPass) {
      const sessionToken = generateAdminSessionToken('owner_master', 'OWNER');

      const response = NextResponse.json({
        success: true,
        message: 'Master Admin Authenticated',
        role: 'OWNER',
      });

      response.cookies.set({
        name: 'angel_admin_session',
        value: sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // Cryptographically Secure 30-Day Session
      });

      return response;
    }

    // 2. Check Prisma User DB for Admin / Manager / Staff roles
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (user && user.isActive && ['OWNER', 'ADMIN', 'MANAGER', 'STAFF'].includes(user.role)) {
      const sessionToken = generateAdminSessionToken(user.id, user.role);

      const response = NextResponse.json({
        success: true,
        message: 'Admin Authenticated',
        role: user.role,
      });

      response.cookies.set({
        name: 'angel_admin_session',
        value: sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: 'Invalid Admin credentials.' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Admin Auth Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
