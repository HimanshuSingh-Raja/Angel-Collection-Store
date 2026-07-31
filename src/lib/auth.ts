import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '@/lib/db';

export function generateAdminSessionToken(userId: string, role: string): string {
  const secret = process.env.ADMIN_SECRET_KEY || process.env.NEXTAUTH_SECRET || 'angel-secure-crypto-fallback-key-2026';
  const timestamp = Date.now().toString();
  const payload = `${userId}:${role}:${timestamp}`;
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}:${hmac}`;
}

export function verifyAdminSessionToken(token: string): { valid: boolean; userId?: string; role?: string } {
  if (!token) return { valid: false };
  try {
    const parts = token.split(':');
    if (parts.length !== 4) return { valid: false };
    const [userId, role, timestampStr, receivedHmac] = parts;
    const secret = process.env.ADMIN_SECRET_KEY || process.env.NEXTAUTH_SECRET || 'angel-secure-crypto-fallback-key-2026';

    const payload = `${userId}:${role}:${timestampStr}`;
    const expectedHmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(receivedHmac, 'utf-8'),
      Buffer.from(expectedHmac, 'utf-8')
    );

    if (!isValid) return { valid: false };

    // Max 30-day session age check
    const timestamp = parseInt(timestampStr, 10);
    const maxAgeMs = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > maxAgeMs) return { valid: false };

    return { valid: true, userId, role };
  } catch {
    return { valid: false };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatar,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || 'CUSTOMER';
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          const existingUser = await db.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser) {
            await db.user.create({
              data: {
                name: user.name || 'Google User',
                email: user.email!,
                avatar: user.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                role: 'CUSTOMER',
                isActive: true,
              },
            });
          }
        } catch (e) {
          console.error('Google OAuth DB Sync Error:', e);
        }
      }
      return true;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'angel-collection-production-secret-key-2026',
};
