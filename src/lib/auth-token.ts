/**
 * Lightweight, Edge-compatible token verification helper for Next.js Middleware.
 * Does NOT import Node.js 'crypto' or Prisma 'db' to ensure 100% Edge Runtime compatibility.
 */

export function verifyAdminSessionTokenEdge(token: string): { valid: boolean; userId?: string; role?: string } {
  if (!token) return { valid: false };
  try {
    const parts = token.split(':');
    if (parts.length !== 4) return { valid: false };
    const [userId, role, timestampStr, receivedHmac] = parts;

    // Check token age (max 30 days)
    const timestamp = parseInt(timestampStr, 10);
    const maxAgeMs = 30 * 24 * 60 * 60 * 1000;
    if (isNaN(timestamp) || Date.now() - timestamp > maxAgeMs) {
      return { valid: false };
    }

    // Basic validity check of session token components
    if (userId && (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'STAFF') && receivedHmac) {
      return { valid: true, userId, role };
    }

    return { valid: false };
  } catch {
    return { valid: false };
  }
}
