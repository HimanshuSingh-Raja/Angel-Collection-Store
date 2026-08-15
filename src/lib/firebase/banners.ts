import {
  subscribeCollectionData,
  setDocumentData,
  deleteDocumentData,
} from './firestore';
import { orderBy, where, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Banner } from '@/types';
import { INITIAL_BANNERS } from '@/lib/mock-data';

export const BANNERS_COLLECTION = 'banners';

/**
 * Subscribe in real-time to ALL banners (for Admin Management) using Firestore onSnapshot
 */
export function subscribeAdminBanners(
  callback: (banners: Banner[]) => void,
  onError?: (err: Error) => void
) {
  return subscribeCollectionData<Banner>(
    BANNERS_COLLECTION,
    (liveBanners) => {
      const sorted = [...(liveBanners || [])].sort((a, b) => (a.position || 0) - (b.position || 0));
      callback(sorted);
    },
    (err) => {
      console.warn('Firestore admin banner subscription notice:', err.message);
      if (onError) onError(err);
    }
  );
}

/**
 * Subscribe in real-time to ACTIVE banners (for Customer Storefront) using Firestore onSnapshot
 */
export function subscribeStorefrontBanners(
  callback: (banners: Banner[]) => void,
  onError?: (err: Error) => void
) {
  return subscribeCollectionData<Banner>(
    BANNERS_COLLECTION,
    (liveBanners) => {
      const activeBanners = [...(liveBanners || [])]
        .filter((b) => b.isActive !== false)
        .sort((a, b) => (a.position || 0) - (b.position || 0));

      callback(activeBanners);
    },
    (err) => {
      console.warn('Firestore storefront banner subscription notice:', err.message);
      if (onError) onError(err);
    }
  );
}

/**
 * Fast Update a Banner in Firestore using setDoc({ merge: true })
 * (Handles both existing documents and initial mock-data document IDs seamlessly)
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

  try {
    await setDoc(ref, cleanData, { merge: true });
  } catch (err) {
    console.warn('Firestore setDoc update fallback:', err);
  }
}

/**
 * Create or overwrite a Banner in Firestore
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

  try {
    await setDocumentData(BANNERS_COLLECTION, docId, bannerData);
  } catch (err) {
    console.warn('Firestore save error:', err);
  }
  return bannerData;
}

/**
 * Delete a Banner from Firestore by document ID
 */
export async function deleteFirestoreBanner(id: string) {
  if (!id) return;
  try {
    await deleteDocumentData(BANNERS_COLLECTION, id);
  } catch (err) {
    console.warn('Firestore delete error:', err);
  }
}
