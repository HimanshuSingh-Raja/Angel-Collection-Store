'use server';

import { revalidatePath } from 'next/cache';
import { db as prisma } from '@/lib/db';
import { ProductStatus } from '@prisma/client';

export interface CreateProductInput {
  title: string;
  slug: string;
  sku: string;
  barcode?: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold?: number;
  categoryId: string;
  subcategoryId?: string;
  brandId?: string;
  status?: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  isFeatured?: boolean;
  isTrending?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  tags?: string;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string;
  images: Array<{ url: string; isPrimary?: boolean; position?: number }>;
}

export interface UpdateProductInput {
  id: string;
  title: string;
  slug: string;
  sku: string;
  barcode?: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold?: number;
  categoryId: string;
  subcategoryId?: string;
  brandId?: string;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  isFeatured?: boolean;
  isTrending?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  tags?: string;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string;
  images: Array<{ url: string; isPrimary?: boolean; position?: number }>;
  variants?: Array<{ size?: string; color?: string; price?: number; stock: number; sku?: string }>;
}

export async function createProductAction(data: CreateProductInput) {
  if (!data.title || !data.price || !data.sku) {
    return { success: false, error: 'Product Title, Price, and SKU are required.' };
  }

  try {
    // Ensure category exists or default to first category
    let targetCatId = data.categoryId;
    const existingCat = await prisma.category.findFirst({ where: { id: targetCatId } });
    if (!existingCat) {
      const firstCat = await prisma.category.findFirst();
      if (firstCat) {
        targetCatId = firstCat.id;
      } else {
        const createdCat = await prisma.category.create({
          data: { name: 'Haute Couture', slug: 'haute-couture' },
        });
        targetCatId = createdCat.id;
      }
    }

    const generatedSlug = data.slug || data.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    const product = await prisma.product.create({
      data: {
        title: data.title.trim(),
        slug: generatedSlug,
        sku: data.sku.trim(),
        barcode: data.barcode || null,
        description: data.description,
        shortDescription: data.shortDescription || null,
        price: data.price,
        compareAtPrice: data.compareAtPrice || null,
        costPrice: data.costPrice || null,
        stock: data.stock,
        lowStockThreshold: data.lowStockThreshold || 5,
        categoryId: targetCatId,
        subcategoryId: data.subcategoryId || null,
        brandId: data.brandId || null,
        status: (data.status as ProductStatus) || ProductStatus.PUBLISHED,
        isFeatured: !!data.isFeatured,
        isTrending: !!data.isTrending,
        isBestSeller: !!data.isBestSeller,
        isNewArrival: !!data.isNewArrival,
        tags: data.tags || null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        metaKeywords: data.metaKeywords || null,
        images: {
          create: data.images.map((img, i) => ({
            url: img.url,
            isPrimary: i === 0,
            position: i,
          })),
        },
      },
      include: { images: true, category: true, subcategory: true },
    });

    // Revalidate live storefront routes instantly
    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath(`/product/${generatedSlug}`);
    revalidatePath('/admin/products');

    return { success: true, product, message: 'Product published and synced to storefront!' };
  } catch (error: any) {
    console.error('Error creating product in DB:', error);
    return { success: false, error: error.message || 'Failed to create product.' };
  }
}

export async function getProductForEditAction(productId: string) {
  if (!productId) return null;

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        subcategory: true,
        brand: true,
        images: { orderBy: { position: 'asc' } },
        variants: true,
      },
    });

    if (!product) return null;

    return {
      id: product.id,
      title: product.title,
      slug: product.slug,
      sku: product.sku,
      barcode: product.barcode || '',
      description: product.description,
      shortDescription: product.shortDescription || '',
      price: product.price,
      compareAtPrice: product.compareAtPrice || 0,
      costPrice: product.costPrice || 0,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold || 5,
      categoryId: product.categoryId,
      subcategoryId: product.subcategoryId || '',
      brandId: product.brandId || '',
      status: product.status,
      isFeatured: product.isFeatured,
      isTrending: product.isTrending,
      isBestSeller: product.isBestSeller,
      isNewArrival: product.isNewArrival,
      tags: product.tags || '',
      seoTitle: product.seoTitle || '',
      seoDescription: product.seoDescription || '',
      metaKeywords: product.metaKeywords || '',
      images: product.images.map((img) => ({ url: img.url, isPrimary: img.isPrimary, position: img.position })),
      variants: product.variants.map((v) => ({
        id: v.id,
        size: v.size || 'S',
        color: v.color || 'Black',
        price: v.price || product.price,
        stock: v.stock,
        sku: v.sku || '',
      })),
    };
  } catch (error) {
    console.error('Error fetching product for edit:', error);
    return null;
  }
}

export async function updateProductAction(data: UpdateProductInput) {
  if (!data.id || !data.title || !data.price || !data.sku) {
    return { success: false, error: 'Product ID, Title, Price, and SKU are required.' };
  }

  try {
    const generatedSlug = data.slug || data.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    // Delete old images and variants to perform atomic update
    await prisma.productImage.deleteMany({ where: { productId: data.id } });
    await prisma.productVariant.deleteMany({ where: { productId: data.id } });

    const updated = await prisma.product.update({
      where: { id: data.id },
      data: {
        title: data.title.trim(),
        slug: generatedSlug,
        sku: data.sku.trim(),
        barcode: data.barcode || null,
        description: data.description,
        shortDescription: data.shortDescription || null,
        price: data.price,
        compareAtPrice: data.compareAtPrice || null,
        costPrice: data.costPrice || null,
        stock: data.stock,
        lowStockThreshold: data.lowStockThreshold || 5,
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId || null,
        brandId: data.brandId || null,
        status: data.status as ProductStatus,
        isFeatured: !!data.isFeatured,
        isTrending: !!data.isTrending,
        isBestSeller: !!data.isBestSeller,
        isNewArrival: !!data.isNewArrival,
        tags: data.tags || null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        metaKeywords: data.metaKeywords || null,
        images: {
          create: data.images.map((img, i) => ({
            url: img.url,
            isPrimary: i === 0,
            position: i,
          })),
        },
        variants: data.variants && data.variants.length > 0 ? {
          create: data.variants.map((v) => ({
            size: v.size || null,
            color: v.color || null,
            price: v.price || null,
            stock: v.stock,
            sku: v.sku || null,
          })),
        } : undefined,
      },
      include: { images: true, category: true },
    });

    // Revalidate storefront cache
    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath(`/product/${generatedSlug}`);
    revalidatePath('/admin/products');
    revalidatePath(`/admin/products/${data.id}/edit`);

    return { success: true, product: updated, message: 'Product updated successfully in PostgreSQL!' };
  } catch (error: any) {
    console.error('Error updating product in DB:', error);
    return { success: false, error: error.message || 'Failed to update product.' };
  }
}

export async function updateProductStatusAction(productId: string, newStatus: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED') {
  try {
    const updated = await prisma.product.update({
      where: { id: productId },
      data: { status: newStatus as ProductStatus, updatedAt: new Date() },
    });

    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/admin/products');

    return { success: true, product: updated };
  } catch (error: any) {
    console.error('Error updating product status:', error);
    return { success: false, error: error.message };
  }
}

export async function getAdminProductsAction() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        subcategory: true,
        images: true,
      },
    });

    return products.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      sku: p.sku,
      barcode: p.barcode || undefined,
      description: p.description,
      price: p.price,
      compareAtPrice: p.compareAtPrice || undefined,
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold,
      status: p.status,
      categoryName: p.category.name,
      subcategoryName: p.subcategory?.name || 'Unassigned',
      images: p.images.map((img) => ({ url: img.url, isPrimary: img.isPrimary })),
      createdAt: p.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching admin products:', error);
    return [];
  }
}

export async function getLowStockProductsAction() {
  try {
    const products = await prisma.product.findMany({
      where: { stock: { lte: 10 } },
      orderBy: { stock: 'asc' },
      take: 6,
      include: {
        images: true,
      },
    });

    return products.map((p) => ({
      id: p.id,
      title: p.title,
      sku: p.sku,
      stock: p.stock,
      imageUrl: p.images[0]?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    }));
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    return [];
  }
}

export async function updateProductStockAction(productId: string, newStock: number) {
  try {
    const updated = await prisma.product.update({
      where: { id: productId },
      data: { stock: newStock, updatedAt: new Date() },
    });

    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/admin/products');

    return { success: true, product: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteProductAction(productId: string) {
  try {
    await prisma.product.delete({
      where: { id: productId },
    });

    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/admin/products');

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
