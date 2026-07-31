'use server';

import { revalidatePath } from 'next/cache';
import { db as prisma } from '@/lib/db';
import { BannerCategory } from '@prisma/client';

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
        title: data.title?.trim(),
        subtitle: data.subtitle?.trim(),
        imageUrl: data.imageUrl,
        mobileImageUrl: data.mobileImageUrl,
        link: data.link,
        category: data.category as BannerCategory,
        position: data.position,
        isActive: data.isActive,
      },
    });

    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/admin/banners');

    return { success: true, banner: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
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
    return { success: false, error: error.message };
  }
}
