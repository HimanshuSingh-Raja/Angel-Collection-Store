'use server';

import { db as prisma } from '@/lib/db';

export async function getAdminCategoriesAction() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      image: c.image || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800',
      description: c.description || 'Custom luxury collection category',
      isFeatured: c.isFeatured,
      productCount: c._count.products,
    }));
  } catch (error) {
    console.error('Error fetching admin categories:', error);
    return [];
  }
}

export async function createCategoryAction(data: { name: string; slug: string; description?: string; image?: string }) {
  try {
    const created = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
        description: data.description || 'Custom luxury collection category',
        image: data.image || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800',
        isFeatured: true,
      },
    });
    return { success: true, category: created };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCategoryAction(categoryId: string) {
  try {
    await prisma.category.delete({
      where: { id: categoryId },
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
