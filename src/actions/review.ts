'use server';

import { db as prisma } from '@/lib/db';

export async function submitProductReviewAction(data: {
  productId: string;
  userName: string;
  userEmail?: string;
  rating: number;
  title?: string;
  comment: string;
}) {
  if (!data.productId || !data.userName || !data.comment || !data.rating) {
    return { success: false, error: 'Please complete all required fields.' };
  }

  if (data.rating < 1 || data.rating > 5) {
    return { success: false, error: 'Rating must be between 1 and 5 stars.' };
  }

  try {
    const review = await prisma.review.create({
      data: {
        productId: data.productId,
        userName: data.userName.trim(),
        rating: Math.round(data.rating),
        title: data.title ? data.title.trim() : 'Customer Review',
        comment: data.comment.trim(),
        status: 'APPROVED',
        isVerified: true,
      },
    });

    // Update product rating and review count
    const allReviews = await prisma.review.findMany({
      where: { productId: data.productId, status: 'APPROVED' },
    });

    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / (allReviews.length || 1);

    await prisma.product.update({
      where: { id: data.productId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: allReviews.length,
      },
    });

    return {
      success: true,
      review,
      message: 'Thank you! Your review has been submitted successfully.',
    };
  } catch (error: any) {
    console.error('Review Submission Error:', error);
    return { success: false, error: error.message || 'Failed to submit review.' };
  }
}
