import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.delete('angel_admin_session');
  return response;
}

export async function GET(request: Request) {
  const loginUrl = new URL('/admin/login', request.url);
  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete('angel_admin_session');
  return response;
}
