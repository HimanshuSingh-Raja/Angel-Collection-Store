import { getCollectionData, getDocumentData, setDocumentData, deleteDocumentData } from '@/lib/firebase/firestore';
import { INITIAL_PRODUCTS } from '@/lib/mock-data';
import { Product } from '@/types';

export class ProductService {
  static async getAllProducts(): Promise<Product[]> {
    try {
      const products = await getCollectionData<Product>('products');
      if (products.length === 0) {
        return INITIAL_PRODUCTS;
      }
      return products;
    } catch (e) {
      console.warn('Firestore fetch failed, returning initial products', e);
      return INITIAL_PRODUCTS;
    }
  }

  static async getProductBySlug(slug: string): Promise<Product | null> {
    const products = await this.getAllProducts();
    return products.find((p) => p.slug === slug || p.id === slug) || null;
  }

  static async createProduct(product: Partial<Product>): Promise<void> {
    const id = product.id || `prod-${Date.now()}`;
    await setDocumentData('products', id, { ...product, id });
  }

  static async updateProduct(id: string, product: Partial<Product>): Promise<void> {
    await setDocumentData('products', id, product);
  }

  static async deleteProduct(id: string): Promise<void> {
    await deleteDocumentData('products', id);
  }
}
