import {
  subscribeCollectionData,
  setDocumentData,
  deleteDocumentData,
} from './firestore';
import { Product } from '@/types';

export const PRODUCTS_COLLECTION = 'products';

/**
 * Subscribe in real-time to ALL products (for Admin management)
 */
export function subscribeAdminProducts(
  callback: (products: any[]) => void,
  onError?: (err: Error) => void
) {
  return subscribeCollectionData<any>(
    PRODUCTS_COLLECTION,
    (liveProducts) => {
      const sorted = [...(liveProducts || [])].sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      callback(sorted);
    },
    (err) => {
      console.warn('Firestore admin products subscription notice:', err.message);
      if (onError) onError(err);
    }
  );
}

/**
 * Subscribe in real-time to STOREFRONT products (for Customer Storefront)
 */
export function subscribeStorefrontProducts(
  callback: (products: Product[]) => void,
  onError?: (err: Error) => void
) {
  return subscribeCollectionData<any>(
    PRODUCTS_COLLECTION,
    (liveProducts) => {
      const published = [...(liveProducts || [])]
        .filter((p) => p.status === 'PUBLISHED' || !p.status)
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      callback(published as Product[]);
    },
    (err) => {
      console.warn('Firestore storefront products subscription notice:', err.message);
      if (onError) onError(err);
    }
  );
}

/**
 * Save / Update a Product in Firestore collection 'products'
 */
export async function saveFirestoreProduct(productData: any) {
  if (!productData?.id) return;
  try {
    await setDocumentData(PRODUCTS_COLLECTION, productData.id, productData);
  } catch (err) {
    console.warn('Firestore save product error:', err);
  }
}

/**
 * Delete a Product document from Firestore collection 'products'
 */
export async function deleteFirestoreProduct(id: string) {
  if (!id) return;
  try {
    await deleteDocumentData(PRODUCTS_COLLECTION, id);
  } catch (err) {
    console.warn('Firestore delete product error:', err);
  }
}
