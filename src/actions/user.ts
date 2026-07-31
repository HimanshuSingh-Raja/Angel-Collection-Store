'use server';

import { cookies } from 'next/headers';
import { db as prisma } from '@/lib/db';

export async function syncFirebaseUserAction(userData: {
  uid?: string;
  name?: string;
  displayName?: string | null;
  email: string;
  photoURL?: string | null;
  role?: any;
}) {
  try {
    const name = userData.name || userData.displayName || userData.email.split('@')[0];
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        firebaseUid: userData.uid || undefined,
        name: name,
        avatar: userData.photoURL || undefined,
      },
      create: {
        firebaseUid: userData.uid || undefined,
        email: userData.email,
        name: name,
        avatar: userData.photoURL || undefined,
        role: userData.role || 'CUSTOMER',
      },
    });

    const cookieStore = await cookies();
    cookieStore.set('angel_user_session', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return {
      id: user.id,
      firebaseUid: user.firebaseUid || undefined,
      name: user.name,
      email: user.email,
      role: user.role as any,
      phone: user.phone || undefined,
      avatar: user.avatar || undefined,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('Error syncing user:', error);
    return {
      id: `user-${Date.now()}`,
      name: userData.name || userData.email.split('@')[0],
      email: userData.email,
      role: 'CUSTOMER' as any,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

export async function addCustomerAddressAction(data: {
  userId: string;
  name: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
}) {
  if (!data.userId || !data.name || !data.phone || !data.street || !data.city || !data.postalCode) {
    return { success: false, error: 'Please fill in all required address fields.' };
  }

  try {
    const address = await prisma.address.create({
      data: {
        userId: data.userId,
        name: data.name.trim(),
        phone: data.phone.trim(),
        street: data.street.trim(),
        apartment: data.apartment ? data.apartment.trim() : null,
        city: data.city.trim(),
        state: data.state.trim(),
        postalCode: data.postalCode.trim(),
        country: data.country || 'India',
        isDefault: false,
      },
    });

    return { success: true, address, message: 'Address saved successfully!' };
  } catch (error: any) {
    console.error('Address Save Error:', error);
    return { success: false, error: error.message };
  }
}

export async function updateCustomerProfileAction(userId: string, data: { name?: string; phone?: string; avatar?: string }) {
  if (!userId) return { success: false, error: 'User ID is required.' };

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name ? data.name.trim() : undefined,
        phone: data.phone ? data.phone.trim() : undefined,
        avatar: data.avatar ? data.avatar : undefined,
        updatedAt: new Date(),
      },
    });

    return { success: true, user: updatedUser, message: 'Profile updated successfully!' };
  } catch (error: any) {
    console.error('Profile Update Error:', error);
    return { success: false, error: error.message };
  }
}
