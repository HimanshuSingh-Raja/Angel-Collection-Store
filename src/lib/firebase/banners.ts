import {
  subscribeCollectionData,
  setDocumentData,
  deleteDocumentData,
} from './firestore';
import { orderBy, where, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Banner } from '@/types';
import { INITIAL_BANNERS } from '@/lib/mock-data';

export const BANNERS_COLLECTION = 'banners';

/**
 * Timeout promise wrapper to prevent infinite hanging
 */
function withTimeout<T>(promise: Promise<T>, ms = 6000, errorMsg = 'Operation timed out'): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(errorMsg)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

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
 * Fast Update a Banner in Firestore using single updateDoc() operation
 */
export async function updateFirestoreBanner(id: string, updates: Partial<Banner>) {
  if (!id) throw new Error('Banner ID is required for update');

  const ref = doc(db, BANNERS_COLLECTION, id);
  const cleanData: Record<string, any> = {
    updatedAt: new Date().toISOString(),
  };

  if (updates.title !== undefined) cleanData.title = updates.title.trim();
  if (updates.subtitle !== undefined) cleanData.subtitle = updates.subtitle.trim();
  if (updates.imageUrl !== undefined) cleanData.imageUrl = updates.imageUrl;
  if (updates.mobileImageUrl !== undefined) cleanData.mobileImageUrl = updates.mobileImageUrl;
  if (updates.link !== undefined) cleanData.link = updates.link.trim();
  if (updates.category !== undefined) cleanData.category = updates.category;
  if (updates.position !== undefined) cleanData.position = updates.position;
  if (updates.isActive !== undefined) cleanData.isActive = updates.isActive;

  return withTimeout(updateDoc(ref, cleanData), 6000, 'Firestore update timed out');
}

/**
 * Create a new Banner in Firestore
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

  return withTimeout(setDocumentData(BANNERS_COLLECTION, docId, bannerData), 6000, 'Firestore save timed out');
}

/**
 * Delete a Banner from Firestore by document ID
 */
export async function deleteFirestoreBanner(id: string) {
  if (!id) return;
  return withTimeout(deleteDocumentData(BANNERS_COLLECTION, id), 6000, 'Firestore delete timed out');
}
