'use server';

import { revalidatePath } from 'next/cache';
import { db as prisma } from '@/lib/db';
import { BannerCategory } from '@prisma/client';
import { INITIAL_BANNERS } from '@/lib/mock-data';

export interface CreateBannerInput {
  title: string;
  subtitle?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  link?: string;
  category: 'HERO_SLIDER' | 'OFFER_BANNER' | 'FESTIVAL_BANNER' | 'COLLECTION_BANNER' | 'POPUP_BANNER';
  position?: number;
  isActive?: boolean;
}

export async function getAdminBannersAction() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { position: 'asc' },
    });

    if (banners && banners.length > 0) {
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
    }
    return INITIAL_BANNERS;
  } catch (error) {
    console.error('Error fetching admin banners:', error);
    return INITIAL_BANNERS;
  }
}

export async function getStorefrontBannersAction() {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
    });

    if (banners && banners.length > 0) {
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
    }
    return INITIAL_BANNERS;
  } catch (error) {
    console.error('Error fetching storefront banners:', error);
    return INITIAL_BANNERS;
  }
}

export async function createBannerAction(data: CreateBannerInput) {
  if (!data.title || !data.imageUrl) {
    return { success: false, error: 'Banner Title and Image URL are required.' };
  }

  try {
    const banner = await prisma.banner.create({
      data: {
        title: data.title.trim(),
        subtitle: data.subtitle ? data.subtitle.trim() : null,
        imageUrl: data.imageUrl,
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

    return { success: true, banner, message: 'Banner published and synced to storefront!' };
  } catch (error: any) {
    console.error('Error creating banner:', error);
    return { success: false, error: error.message || 'Failed to create banner.' };
  }
}

export async function updateBannerAction(id: string, data: Partial<CreateBannerInput>) {
  try {
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

export async function deleteBannerAction(id: string) {
  try {
    await prisma.banner.delete({
      where: { id },
    });

    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/admin/banners');

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting banner:', error);
    return { success: false, error: error.message || 'Failed to delete banner.' };
  }
}
