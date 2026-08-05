/**
 * Edge-compatible authentication & token verification module.
 * Uses W3C Web Crypto API (crypto.subtle) available in Edge Runtime & browsers.
 * NO Node.js modules ('crypto', 'fs', 'path') or 'bcryptjs' or Prisma 'db' are imported.
 */

export async function verifyAdminSessionTokenEdge(token: string): Promise<{ valid: boolean; userId?: string; role?: string }> {
  if (!token) return { valid: false };
  try {
    const cleanToken = token.trim().replace(/^["']|["']$/g, '');
    const parts = cleanToken.split(':');
    if (parts.length !== 4) return { valid: false };
    const [userId, role, timestampStr, receivedHmac] = parts;

    // Max 30-day session age check
    const timestamp = parseInt(timestampStr, 10);
    const maxAgeMs = 30 * 24 * 60 * 60 * 1000;
    if (isNaN(timestamp) || Date.now() - timestamp > maxAgeMs) {
      return { valid: false };
    }

    if (!['OWNER', 'ADMIN', 'MANAGER', 'STAFF'].includes(role)) {
      return { valid: false };
    }

    const secret = process.env.ADMIN_SECRET_KEY || process.env.NEXTAUTH_SECRET || 'angel-secure-crypto-fallback-key-2026';
    const payload = `${userId}:${role}:${timestampStr}`;

    // Web Crypto API HMAC-SHA256 signature verification
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

    // Constant-time string comparison
    if (expectedHmac.length !== receivedHmac.length) return { valid: false };
    let diff = 0;
    for (let i = 0; i < expectedHmac.length; i++) {
      diff |= expectedHmac.charCodeAt(i) ^ receivedHmac.charCodeAt(i);
    }

    if (diff !== 0) return { valid: false };

    return { valid: true, userId, role };
  } catch {
    return { valid: false };
  }
}

export async function generateAdminSessionTokenEdge(userId: string, role: string): Promise<string> {
  const secret = process.env.ADMIN_SECRET_KEY || process.env.NEXTAUTH_SECRET || 'angel-secure-crypto-fallback-key-2026';
  const timestamp = Date.now().toString();
  const payload = `${userId}:${role}:${timestamp}`;

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
  const hmacHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return `${payload}:${hmacHex}`;
}
