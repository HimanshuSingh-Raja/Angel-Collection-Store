import { PrismaClient } from '@prisma/client';
import {
  INITIAL_CATEGORIES,
  INITIAL_BRANDS,
  INITIAL_BANNERS,
  INITIAL_PRODUCTS,
  INITIAL_COUPONS,
  INITIAL_USERS,
  INITIAL_ORDERS
} from '../src/lib/mock-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Angel Collection Neon PostgreSQL Database...');

  // 1. Seed Categories
  for (const cat of INITIAL_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        image: cat.image,
        description: cat.description,
        isFeatured: cat.isFeatured ?? true,
      },
    });

    if (cat.subcategories) {
      for (const sub of cat.subcategories) {
        await prisma.subcategory.upsert({
          where: { slug: sub.slug },
          update: {},
          create: {
            id: sub.id,
            name: sub.name,
            slug: sub.slug,
            categoryId: cat.id,
          },
        });
      }
    }
  }

  // 2. Seed Brands
  for (const brand of INITIAL_BRANDS) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: {
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        logo: brand.logo,
        isFeatured: brand.isFeatured ?? true,
      },
    });
  }

  // 3. Seed Users
  for (const user of INITIAL_USERS) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        isActive: user.isActive,
      },
    });
  }

  // 4. Seed Products
  for (const prod of INITIAL_PRODUCTS) {
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {},
      create: {
        id: prod.id,
        title: prod.title,
        slug: prod.slug,
        sku: prod.sku,
        barcode: prod.barcode,
        description: prod.description,
        shortDescription: prod.shortDescription,
        price: prod.price,
        compareAtPrice: prod.compareAtPrice,
        costPrice: prod.costPrice,
        stock: prod.stock,
        lowStockThreshold: prod.lowStockThreshold,
        categoryId: prod.categoryId,
        subcategoryId: prod.subcategoryId,
        brandId: prod.brandId,
        status: 'PUBLISHED',
        isFeatured: prod.isFeatured,
        isTrending: prod.isTrending,
        isBestSeller: prod.isBestSeller,
        isNewArrival: prod.isNewArrival,
        tags: prod.tags,
        rating: prod.rating,
        reviewCount: prod.reviewCount,
        seoTitle: prod.seoTitle,
        seoDescription: prod.seoDescription,
        images: {
          create: prod.images.map((img) => ({
            id: img.id,
            url: img.url,
            isPrimary: img.isPrimary,
            position: img.position,
          })),
        },
      },
    });
  }

  // 5. Seed Coupons
  for (const c of INITIAL_COUPONS) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {},
      create: {
        id: c.id,
        code: c.code,
        type: c.type,
        discountValue: c.discountValue,
        minPurchase: c.minPurchase,
        maxDiscount: c.maxDiscount,
        usageLimit: c.usageLimit,
        timesUsed: c.timesUsed,
        isFirstOrderOnly: c.isFirstOrderOnly,
        isActive: c.isActive,
      },
    });
  }

  // 6. Seed Banners
  for (const b of INITIAL_BANNERS) {
    await prisma.banner.upsert({
      where: { id: b.id },
      update: {},
      create: {
        id: b.id,
        title: b.title,
        subtitle: b.subtitle,
        imageUrl: b.imageUrl,
        mobileImageUrl: b.mobileImageUrl,
        link: b.link,
        category: b.category,
        position: b.position,
        isActive: b.isActive,
      },
    });
  }

  console.log('✅ Neon PostgreSQL Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
