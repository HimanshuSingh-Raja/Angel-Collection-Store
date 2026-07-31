'use server';

import { db as prisma } from '@/lib/db';

export async function validateCouponAction(code: string, cartSubtotal: number) {
  if (!code || !code.trim()) {
    return { success: false, error: 'Please enter a valid coupon code.' };
  }

  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      return { success: false, error: 'Invalid or expired coupon code.' };
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return { success: false, error: 'This coupon code has expired.' };
    }

    if (coupon.minPurchase && cartSubtotal < coupon.minPurchase) {
      return {
        success: false,
        error: `Minimum order amount of ₹${coupon.minPurchase.toLocaleString()} required for this coupon.`,
      };
    }

    let discountAmount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discountAmount = (cartSubtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    return {
      success: true,
      code: coupon.code,
      discountAmount,
      type: coupon.type,
      discountValue: coupon.discountValue,
      message: `Coupon "${coupon.code}" applied successfully! You saved ₹${discountAmount.toLocaleString()}`,
    };
  } catch (error: any) {
    console.error('Coupon Validation Error:', error);
    return { success: false, error: 'An error occurred while validating the coupon.' };
  }
}
