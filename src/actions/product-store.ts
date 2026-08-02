'use server';

import { db as prisma } from '@/lib/db';

export async function getStorefrontProductsAction(query?: {
  category?: string;
  subcategory?: string;
  type?: string;
  brand?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  const startTime = Date.now();
  try {
    const categorySlug = query?.category?.toLowerCase().trim();
    const typeSlug = (query?.type || query?.subcategory)?.toLowerCase().trim();

    const where: any = {
      status: 'PUBLISHED',
    };

    // Category Slug Filter (e.g. "women", "men", "jewellery")
    if (categorySlug && categorySlug !== 'all') {
      where.category = {
        OR: [
          { slug: { equals: categorySlug, mode: 'insensitive' } },
          { name: { contains: categorySlug, mode: 'insensitive' } },
        ],
      };
    }

    // Brand Slug Filter
    if (query?.brand && query.brand.trim() !== '') {
      where.brand = { slug: { equals: query.brand.toLowerCase().trim(), mode: 'insensitive' } };
    }

    // Price Filter
    if (query?.maxPrice) {
      where.price = { lte: query.maxPrice };
    }

    // Subcategory / Type Slug Filter (e.g. "sarees", "gowns", "lehenga", "shirts", "suits")
    if (typeSlug && typeSlug !== 'all') {
      const singularType = typeSlug.replace(/s$/, '');

      where.AND = where.AND || [];
      where.AND.push({
        OR: [
          { subcategory: { slug: { equals: typeSlug, mode: 'insensitive' } } },
          { subcategory: { name: { contains: typeSlug, mode: 'insensitive' } } },
          { title: { contains: typeSlug, mode: 'insensitive' } },
          { title: { contains: singularType, mode: 'insensitive' } },
          { tags: { contains: typeSlug, mode: 'insensitive' } },
          { tags: { contains: singularType, mode: 'insensitive' } },
          { description: { contains: typeSlug, mode: 'insensitive' } },
        ],
      });
    }

    // Search Query Filter
    if (query?.search && query.search.trim() !== '') {
      const searchTerm = query.search.trim();
      where.AND = where.AND || [];
      where.AND.push({
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { tags: { contains: searchTerm, mode: 'insensitive' } },
        ],
      });
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        sku: true,
        description: true,
        shortDescription: true,
        price: true,
        compareAtPrice: true,
        stock: true,
        isFeatured: true,
        isNewArrival: true,
        isTrending: true,
        tags: true,
        createdAt: true,
        category: {
          select: { id: true, name: true, slug: true },
        },
        subcategory: {
          select: { id: true, name: true, slug: true },
        },
        brand: {
          select: { id: true, name: true, slug: true },
        },
        images: {
          orderBy: { position: 'asc' },
          select: { id: true, url: true, isPrimary: true },
        },
      },
    });

    const duration = Date.now() - startTime;
    console.log(`⏱️ [DB STOREFRONT] Products query: ${duration}ms (returned ${products.length} products)`);

    return products.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      sku: p.sku,
      description: p.description,
      shortDescription: p.shortDescription || '',
      price: p.price,
      compareAtPrice: p.compareAtPrice || undefined,
      stock: p.stock,
      category: p.category ? { id: p.category.id, name: p.category.name, slug: p.category.slug } : undefined,
      subcategory: p.subcategory ? { id: p.subcategory.id, name: p.subcategory.name, slug: p.subcategory.slug } : undefined,
      brand: p.brand ? { id: p.brand.id, name: p.brand.name, slug: p.brand.slug } : undefined,
      images: p.images.length > 0 ? p.images.map((img) => ({ id: img.id, url: img.url, isPrimary: img.isPrimary })) : [{ id: '1', url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800', isPrimary: true }],
      colors: p.tags ? p.tags.split(',').filter(Boolean).map((t) => t.trim()) : ['Classic Gold', 'Black'],
      sizes: ['S', 'M', 'L', 'XL'],
      rating: 4.9,
      reviewCount: 12,
      isFeatured: p.isFeatured,
      isNewArrival: p.isNewArrival,
      isTrending: p.isTrending,
      createdAt: p.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching storefront products:', error);
    return [];
  }
}

export async function getProductBySlugAction(slug: string) {
  if (!slug) return null;
  const startTime = Date.now();

  try {
    const p = await prisma.product.findFirst({
      where: {
        slug: slug,
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        title: true,
        slug: true,
        sku: true,
        description: true,
        shortDescription: true,
        price: true,
        compareAtPrice: true,
        stock: true,
        lowStockThreshold: true,
        isFeatured: true,
        isNewArrival: true,
        isTrending: true,
        tags: true,
        createdAt: true,
        category: {
          select: { id: true, name: true, slug: true },
        },
        subcategory: {
          select: { id: true, name: true, slug: true },
        },
        brand: {
          select: { id: true, name: true, slug: true },
        },
        images: {
          orderBy: { position: 'asc' },
          select: { id: true, url: true, isPrimary: true },
        },
      },
    });

    const duration = Date.now() - startTime;
    console.log(`⏱️ [DB STOREFRONT] Single Product query (${slug}): ${duration}ms`);

    if (!p) return null;

    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      sku: p.sku,
      description: p.description,
      shortDescription: p.shortDescription || '',
      price: p.price,
      compareAtPrice: p.compareAtPrice || undefined,
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold || 5,
      category: p.category ? { id: p.category.id, name: p.category.name, slug: p.category.slug } : undefined,
      subcategory: p.subcategory ? { id: p.subcategory.id, name: p.subcategory.name, slug: p.subcategory.slug } : undefined,
      brand: p.brand ? { id: p.brand.id, name: p.brand.name, slug: p.brand.slug } : undefined,
      images: p.images.length > 0 ? p.images.map((img) => ({ id: img.id, url: img.url, isPrimary: img.isPrimary })) : [{ id: '1', url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800', isPrimary: true }],
      colors: p.tags ? p.tags.split(',').filter(Boolean).map((t) => t.trim()) : ['Classic Black', 'Gold'],
      sizes: ['S', 'M', 'L', 'XL'],
      rating: 4.9,
      reviewCount: 18,
      isFeatured: p.isFeatured,
      isNewArrival: p.isNewArrival,
      isTrending: p.isTrending,
      createdAt: p.createdAt.toISOString(),
    };
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    return null;
  }
}
