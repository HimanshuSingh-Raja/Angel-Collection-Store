'use server';

import { revalidatePath } from 'next/cache';
import { db as prisma } from '@/lib/db';
import { BannerCategory } from '@prisma/client';

export interface CreateBannerInput {
  id?: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  link?: string;
  category: 'HERO_SLIDER' | 'OFFER_BANNER' | 'FESTIVAL_BANNER' | 'COLLECTION_BANNER' | 'POPUP_BANNER';
  position?: number;
  isActive?: boolean;
}

/**
 * Fetch ALL banners for Admin management directly from PostgreSQL DB.
 */
export async function getAdminBannersAction() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { position: 'asc' },
    });

    return banners.map((b) => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle || '',
      imageUrl: b.imageUrl,
      mobileImageUrl: b.mobileImageUrl || '',
      link: b.link || '',
      category: b.category,
      position: b.position,
      isActive: b.isActive,
    }));
  } catch (error) {
    console.error('Error fetching admin banners:', error);
    return [];
  }
}

/**
 * Fetch ACTIVE banners for Customer Storefront directly from PostgreSQL DB.
 */
export async function getStorefrontBannersAction() {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
    });

    return banners.map((b) => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle || '',
      imageUrl: b.imageUrl,
      mobileImageUrl: b.mobileImageUrl || '',
      link: b.link || '',
      category: b.category,
      position: b.position,
      isActive: b.isActive,
    }));
  } catch (error) {
    console.error('Error fetching storefront banners:', error);
    return [];
  }
}

/**
 * Create a new Banner in PostgreSQL DB.
 */
export async function createBannerAction(data: CreateBannerInput) {
  if (!data.title || !data.imageUrl) {
    return { success: false, error: 'Banner Title and Image URL are required.' };
  }

  try {
    const bannerData: any = {
      title: data.title.trim(),
      subtitle: data.subtitle ? data.subtitle.trim() : null,
      imageUrl: data.imageUrl,
      mobileImageUrl: data.mobileImageUrl || null,
      link: data.link || null,
      category: (data.category as BannerCategory) || BannerCategory.HERO_SLIDER,
      position: data.position ?? 1,
      isActive: data.isActive ?? true,
    };

    if (data.id) {
      bannerData.id = data.id;
    }

    const banner = await prisma.banner.create({
      data: bannerData,
    });

    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/admin/banners');

    return { success: true, banner, message: 'Banner published and synced to storefront!' };
  } catch (error: any) {
    console.error('Error creating banner:', error);
    return { success: false, error: error.message || 'Failed to create banner.' };
  }
}

/**
 * Update an existing Banner in PostgreSQL DB by ID (prevents creating duplicate records).
 */
export async function updateBannerAction(id: string, data: Partial<CreateBannerInput>) {
  if (!id) {
    return { success: false, error: 'Banner ID is required for update.' };
  }

  try {
    const existing = await prisma.banner.findUnique({ where: { id } });

    if (!existing) {
      // If banner record doesn't exist yet in PostgreSQL, create it with this ID
      const created = await prisma.banner.create({
        data: {
          id,
          title: data.title ? data.title.trim() : 'Haute Couture Banner',
          subtitle: data.subtitle ? data.subtitle.trim() : null,
          imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1920',
          mobileImageUrl: data.mobileImageUrl || null,
          link: data.link || null,
          category: (data.category as BannerCategory) || BannerCategory.HERO_SLIDER,
          position: data.position ?? 1,
          isActive: data.isActive ?? true,
        },
      });

      revalidatePath('/');
      revalidatePath('/shop');
      revalidatePath('/admin/banners');

      return { success: true, banner: created };
    }

    const updated = await prisma.banner.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title.trim() : undefined,
        subtitle: data.subtitle !== undefined ? data.subtitle.trim() : undefined,
        imageUrl: data.imageUrl !== undefined ? data.imageUrl : undefined,
        mobileImageUrl: data.mobileImageUrl !== undefined ? data.mobileImageUrl : undefined,
        link: data.link !== undefined ? data.link.trim() : undefined,
        category: data.category ? (data.category as BannerCategory) : undefined,
        position: data.position !== undefined ? data.position : undefined,
        isActive: data.isActive !== undefined ? data.isActive : undefined,
      },
    });

    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/admin/banners');

    return { success: true, banner: updated };
  } catch (error: any) {
    console.error('Error updating banner:', error);
    return { success: false, error: error.message || 'Failed to update banner.' };
  }
}

/**
 * Permanently delete a Banner from PostgreSQL DB.
 */
export async function deleteBannerAction(id: string) {
  if (!id) return { success: false, error: 'Banner ID is required.' };

  try {
    await prisma.banner.delete({
      where: { id },
    }).catch(() => {});

    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/admin/banners');

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting banner:', error);
    return { success: false, error: error.message || 'Failed to delete banner.' };
  }
}
