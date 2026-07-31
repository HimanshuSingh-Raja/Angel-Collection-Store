'use server';

import { db as prisma } from '@/lib/db';
import { ReviewStatus } from '@prisma/client';

export async function getAdminReviewsAction() {
  try {
    return await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { title: true } },
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}

export async function updateReviewStatusAction(reviewId: string, status: ReviewStatus) {
  try {
    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: { status },
    });
    return { success: true, review: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteReviewAction(reviewId: string) {
  try {
    await prisma.review.delete({ where: { id: reviewId } });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
