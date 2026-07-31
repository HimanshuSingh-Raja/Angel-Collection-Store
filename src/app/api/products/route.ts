import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ProductStatus } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const search = searchParams.get('search');
    const maxPrice = searchParams.get('maxPrice');
    const includeAllStatus = searchParams.get('includeAllStatus');

    const where: any = {};

    // Customer storefront queries filter for PUBLISHED products only
    if (includeAllStatus !== 'true') {
      where.status = ProductStatus.PUBLISHED;
    }

    if (category) {
      where.category = { slug: category };
    }
    if (brand) {
      where.brand = { slug: brand };
    }
    if (maxPrice) {
      where.price = { lte: parseFloat(maxPrice) };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { contains: search, mode: 'insensitive' } },
      ];
    }

    const products = await db.product.findMany({
      where,
      include: {
        category: true,
        brand: true,
        images: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('API Products GET Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      slug,
      sku,
      barcode,
      description,
      shortDescription,
      price,
      compareAtPrice,
      costPrice,
      stock,
      lowStockThreshold,
      categoryId,
      brandId,
      images,
      tags,
      status,
    } = body;

    const newProduct = await db.product.create({
      data: {
        title: title.trim(),
        slug: slug || title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        sku: sku || `ANG-P-${Date.now()}`,
        barcode: barcode || null,
        description,
        shortDescription: shortDescription || null,
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        costPrice: costPrice ? parseFloat(costPrice) : null,
        stock: parseInt(stock || '10', 10),
        lowStockThreshold: parseInt(lowStockThreshold || '5', 10),
        categoryId,
        brandId: brandId || null,
        status: (status as ProductStatus) || ProductStatus.PUBLISHED,
        tags: tags || null,
        images: {
          create: (images || []).map((url: string, index: number) => ({
            url,
            isPrimary: index === 0,
            position: index + 1,
          })),
        },
      },
      include: {
        category: true,
        brand: true,
        images: true,
      },
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error('API Products POST Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create product' }, { status: 500 });
  }
}
