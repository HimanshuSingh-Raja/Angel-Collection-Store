'use server';

import { db as prisma } from '@/lib/db';
import { INITIAL_PRODUCTS } from '@/lib/mock-data';
import { rankProductSearch } from '@/lib/search/ranker';
import { detectCategoryFromQuery } from '@/lib/search/utils';

export interface SearchFilterParams {
  query?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  fabric?: string;
  occasion?: string;
  discount?: number;
  inStock?: boolean;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
}

export async function searchProductsAction(params: SearchFilterParams) {
  const start = Date.now();
  const rawQ = (params.query || '').trim();
  const q = rawQ.toLowerCase();

  const detected = detectCategoryFromQuery(q);
  const targetCategorySlug = params.category && params.category !== 'all' ? params.category : detected.categorySlug;
  const targetSubcategorySlug = params.subcategory && params.subcategory !== 'all' ? params.subcategory : detected.subcategorySlug;

  try {
    let dbProducts = await prisma.product.findMany({
      where: {
        status: 'PUBLISHED',
      },
      include: {
        images: { orderBy: { position: 'asc' } },
        category: true,
        subcategory: true,
        brand: true,
      },
    });

    let rawProducts = dbProducts.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      description: p.description || '',
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
      images: p.images.length > 0 ? p.images.map((i) => ({ url: i.url })) : [{ url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800' }],
      category: p.category ? { id: p.category.id, name: p.category.name, slug: p.category.slug } : { id: 'women', name: 'Women', slug: 'women' },
      subcategory: p.subcategory ? { id: p.subcategory.id, name: p.subcategory.name, slug: p.subcategory.slug } : null,
      brand: p.brand ? { id: p.brand.id, name: p.brand.name } : { id: 'angel', name: 'Angel Collection' },
      tags: p.tags || '',
      isFeatured: p.isFeatured,
      isTrending: p.isTrending,
      isBestSeller: p.isBestSeller,
      isNewArrival: p.isNewArrival,
      stock: p.stock,
      rating: 4.8,
      reviewCount: 124,
    }));

    if (rawProducts.length === 0) {
      rawProducts = INITIAL_PRODUCTS as any;
    }

    // 1. Strict Category & Subcategory Filter
    let filtered = rawProducts;

    if (targetSubcategorySlug) {
      const subSlugNorm = targetSubcategorySlug.toLowerCase().replace(/s$/, '');
      filtered = filtered.filter((p) => {
        const pTitle = p.title.toLowerCase();
        const pTags = (p.tags || '').toLowerCase();
        const pDesc = p.description.toLowerCase();
        const pSub = (p.subcategory?.slug || '').toLowerCase();
        return pSub.includes(subSlugNorm) || pTitle.includes(subSlugNorm) || pTags.includes(subSlugNorm) || pDesc.includes(subSlugNorm);
      });
    } else if (targetCategorySlug) {
      const catSlugNorm = targetCategorySlug.toLowerCase();
      filtered = filtered.filter((p) => {
        const pCat = (p.category?.slug || '').toLowerCase();
        return pCat === catSlugNorm || pCat.includes(catSlugNorm);
      });
    } else if (q) {
      // General term search - filter out non-matching products
      const searchNorm = q.replace(/s$/, '');
      filtered = filtered.filter((p) => {
        const pTitle = p.title.toLowerCase();
        const pTags = (p.tags || '').toLowerCase();
        const pDesc = p.description.toLowerCase();
        const pCat = (p.category?.name || '').toLowerCase();
        const pSub = (p.subcategory?.name || '').toLowerCase();
        return (
          pTitle.includes(searchNorm) ||
          pTags.includes(searchNorm) ||
          pDesc.includes(searchNorm) ||
          pCat.includes(searchNorm) ||
          pSub.includes(searchNorm)
        );
      });
    }

    // 2. Score & Rank Products
    let ranked = q ? rankProductSearch(q, filtered).map((r) => r.product) : filtered;

    // 3. Price & Filter Controls
    if (params.minPrice !== undefined) {
      ranked = ranked.filter((p) => p.price >= params.minPrice!);
    }
    if (params.maxPrice !== undefined) {
      ranked = ranked.filter((p) => p.price <= params.maxPrice!);
    }
    if (params.inStock) {
      ranked = ranked.filter((p) => p.stock > 0);
    }

    // 4. Sorting
    if (params.sortBy === 'price_asc') {
      ranked.sort((a, b) => a.price - b.price);
    } else if (params.sortBy === 'price_desc') {
      ranked.sort((a, b) => b.price - a.price);
    } else if (params.sortBy === 'rating') {
      ranked.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (params.sortBy === 'newest') {
      ranked.sort((a, b) => (b.isNewArrival ? 1 : -1));
    }

    return {
      success: true,
      products: ranked,
      total: ranked.length,
      detectedCategory: detected.displayName || (targetSubcategorySlug ? targetSubcategorySlug.toUpperCase() : 'All Collections'),
      detectedSubcategory: targetSubcategorySlug,
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    console.error('Search action error:', error);
    return {
      success: true,
      products: INITIAL_PRODUCTS as any,
      total: INITIAL_PRODUCTS.length,
      detectedCategory: 'All Collections',
      latencyMs: Date.now() - start,
    };
  }
}
