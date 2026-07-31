import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const ownerEmail = process.env.OWNER_EMAIL || 'angelcollection2021@gmail.com';
    const ownerPass = process.env.OWNER_PASSWORD || 'sukhii@2021';

    // 1. Authenticate Master Admin using environment variables
    if (email.toLowerCase() === ownerEmail.toLowerCase() && password === ownerPass) {
      const response = NextResponse.json({
        success: true,
        message: 'Owner Master Admin Authenticated',
        role: 'OWNER',
      });

      response.cookies.set({
        name: 'angel_admin_session',
        value: 'owner_master_session_authenticated_2026',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days session
      });

      return response;
    }

    // 2. Check Prisma User DB for Admin / Manager / Staff roles
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (user && user.isActive && ['OWNER', 'ADMIN', 'MANAGER', 'STAFF'].includes(user.role)) {
      const response = NextResponse.json({
        success: true,
        message: 'Admin Authenticated',
        role: user.role,
      });

      response.cookies.set({
        name: 'angel_admin_session',
        value: `${user.id}_session_authenticated`,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: 'Invalid Master Admin credentials.' },
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
