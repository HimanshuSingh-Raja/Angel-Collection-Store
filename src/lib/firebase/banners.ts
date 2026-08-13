import {
  subscribeCollectionData,
  setDocumentData,
  deleteDocumentData,
} from './firestore';
import { orderBy, where } from 'firebase/firestore';
import { Banner } from '@/types';
import { INITIAL_BANNERS } from '@/lib/mock-data';

export const BANNERS_COLLECTION = 'banners';

/**
 * Subscribe in real-time to ALL banners (for Admin Management) using Firestore onSnapshot
 */
export function subscribeAdminBanners(callback: (banners: Banner[]) => void) {
  return subscribeCollectionData<Banner>(
    BANNERS_COLLECTION,
    (liveBanners) => {
      if (!liveBanners || liveBanners.length === 0) {
        callback(INITIAL_BANNERS);
      } else {
        const sorted = [...liveBanners].sort((a, b) => (a.position || 0) - (b.position || 0));
        callback(sorted);
      }
    },
    orderBy('position', 'asc')
  );
}

/**
 * Subscribe in real-time to ACTIVE banners (for Customer Storefront) using Firestore onSnapshot
 */
export function subscribeStorefrontBanners(callback: (banners: Banner[]) => void) {
  return subscribeCollectionData<Banner>(
    BANNERS_COLLECTION,
    (liveBanners) => {
      if (!liveBanners || liveBanners.length === 0) {
        callback(INITIAL_BANNERS);
      } else {
        const activeBanners = liveBanners
          .filter((b) => b.isActive !== false)
          .sort((a, b) => (a.position || 0) - (b.position || 0));

        callback(activeBanners.length > 0 ? activeBanners : INITIAL_BANNERS);
      }
    },
    where('isActive', '==', true),
    orderBy('position', 'asc')
  );
}

/**
 * Save or Update a Banner in Firestore using document ID (Single Source of Truth)
 */
export async function saveFirestoreBanner(banner: Partial<Banner> & { id?: string }) {
  const docId = banner.id || `banner_${Date.now()}`;
  const bannerData = {
    id: docId,
    title: banner.title || '',
    subtitle: banner.subtitle || '',
    imageUrl: banner.imageUrl || '',
    mobileImageUrl: banner.mobileImageUrl || '',
    link: banner.link || '/shop?category=women',
    category: banner.category || 'HERO_SLIDER',
    position: banner.position ?? 1,
    isActive: banner.isActive ?? true,
    updatedAt: new Date().toISOString(),
  };

  await setDocumentData(BANNERS_COLLECTION, docId, bannerData);
  return bannerData;
}

/**
 * Delete a Banner from Firestore by document ID
 */
export async function deleteFirestoreBanner(id: string) {
  if (!id) return;
  await deleteDocumentData(BANNERS_COLLECTION, id);
}
