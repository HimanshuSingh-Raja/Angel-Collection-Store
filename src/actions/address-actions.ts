'use server';

import { db as prisma } from '@/lib/db';

export interface AddressInput {
  userId: string;
  name: string;
  phone: string;
  houseNo?: string;
  street: string;
  apartment?: string; // Address Line 2 / Landmark
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  type?: 'HOME' | 'WORK' | 'OTHER' | string;
  isDefault?: boolean;
}

export async function getUserAddressesAction(userId: string) {
  if (!userId || userId === 'guest') return [];

  try {
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    return addresses;
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    return [];
  }
}

export async function createUserAddressAction(data: AddressInput) {
  if (!data.userId || !data.name || !data.phone || !data.street || !data.city || !data.state || !data.postalCode) {
    return { success: false, error: 'Please complete all required address fields.' };
  }

  try {
    // If set as default, reset other addresses' isDefault flag
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: data.userId },
        data: { isDefault: false },
      });
    }

    const streetCombined = data.houseNo ? `${data.houseNo}, ${data.street}` : data.street;
    const apartmentCombined = data.landmark ? `${data.apartment || ''} (Landmark: ${data.landmark})`.trim() : data.apartment;

    const address = await prisma.address.create({
      data: {
        userId: data.userId,
        name: data.name.trim(),
        phone: data.phone.trim(),
        street: streetCombined.trim(),
        apartment: apartmentCombined ? apartmentCombined.trim() : null,
        city: data.city.trim(),
        state: data.state.trim(),
        postalCode: data.postalCode.trim(),
        country: data.country || 'India',
        type: data.type || 'HOME',
        isDefault: !!data.isDefault,
      },
    });

    return { success: true, address, message: 'Address saved successfully!' };
  } catch (error: any) {
    console.error('Error creating address:', error);
    return { success: false, error: error.message || 'Failed to save address.' };
  }
}

export async function updateUserAddressAction(addressId: string, userId: string, data: Partial<AddressInput>) {
  if (!addressId || !userId) return { success: false, error: 'Unauthorized address update.' };

  try {
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id: addressId },
      data: {
        name: data.name ? data.name.trim() : undefined,
        phone: data.phone ? data.phone.trim() : undefined,
        street: data.street ? data.street.trim() : undefined,
        apartment: data.apartment ? data.apartment.trim() : undefined,
        city: data.city ? data.city.trim() : undefined,
        state: data.state ? data.state.trim() : undefined,
        postalCode: data.postalCode ? data.postalCode.trim() : undefined,
        country: data.country || undefined,
        type: data.type || undefined,
        isDefault: data.isDefault !== undefined ? data.isDefault : undefined,
      },
    });

    return { success: true, address: updated, message: 'Address updated successfully!' };
  } catch (error: any) {
    console.error('Error updating address:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteUserAddressAction(addressId: string, userId: string) {
  if (!addressId || !userId) return { success: false, error: 'Unauthorized deletion.' };

  try {
    await prisma.address.delete({
      where: { id: addressId },
    });

    return { success: true, message: 'Address deleted successfully.' };
  } catch (error: any) {
    console.error('Error deleting address:', error);
    return { success: false, error: error.message };
  }
}

export async function setDefaultAddressAction(addressId: string, userId: string) {
  if (!addressId || !userId) return { success: false, error: 'Unauthorized.' };

  try {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    const updated = await prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });

    return { success: true, address: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
