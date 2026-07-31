import { db as prisma } from '@/lib/db';
import { User } from '@/types';

export class UserService {
  /**
   * Synchronize a Firebase Authenticated user into PostgreSQL database using Prisma ORM.
   */
  static async syncFirebaseUser(user: {
    uid: string;
    email: string;
    displayName?: string | null;
    photoURL?: string | null;
  }): Promise<User> {
    try {
      console.log('🐘 [PostgreSQL] insert/sync started for:', user.email);

      // 1. Try to find user in PostgreSQL by firebaseUid or email
      let prismaUser = await prisma.user.findFirst({
        where: {
          OR: [{ firebaseUid: user.uid }, { email: user.email.toLowerCase() }],
        },
      });

      if (prismaUser) {
        // Update firebaseUid & avatar if missing
        if (!prismaUser.firebaseUid || prismaUser.avatar !== user.photoURL) {
          prismaUser = await prisma.user.update({
            where: { id: prismaUser.id },
            data: {
              firebaseUid: user.uid,
              avatar: user.photoURL || prismaUser.avatar,
              updatedAt: new Date(),
            },
          });
        }
      } else {
        // Create new user in PostgreSQL DB
        prismaUser = await prisma.user.create({
          data: {
            firebaseUid: user.uid,
            name: user.displayName || 'Angel Client',
            email: user.email.toLowerCase(),
            avatar: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            role: 'CUSTOMER',
            isActive: true,
          },
        });
      }

      console.log('🐘 [PostgreSQL] insert/sync completed successfully, ID:', prismaUser.id);

      return {
        id: prismaUser.id,
        name: prismaUser.name,
        email: prismaUser.email,
        role: prismaUser.role,
        phone: prismaUser.phone || undefined,
        avatar: prismaUser.avatar || undefined,
        isActive: prismaUser.isActive,
        createdAt: prismaUser.createdAt.toISOString(),
      };
    } catch (e) {
      console.error('❌ [PostgreSQL] insert/sync error:', e);
      // Fallback return so user registration never hangs
      return {
        id: user.uid,
        name: user.displayName || 'Angel Client',
        email: user.email,
        role: 'CUSTOMER',
        avatar: user.photoURL || undefined,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
    }
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || undefined,
      avatar: user.avatar || undefined,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
