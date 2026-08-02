import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.set('angel_admin_session', '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
    httpOnly: true,
  });
  return response;
}

export async function GET(request: Request) {
  const loginUrl = new URL('/admin/login', request.url);
  const response = NextResponse.redirect(loginUrl);
  response.cookies.set('angel_admin_session', '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
    httpOnly: true,
  });
  return response;
}
