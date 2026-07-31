'use server';

import { db as prisma } from '@/lib/db';
import { CouponType } from '@prisma/client';

export async function getAdminCouponsAction() {
  try {
    return await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return [];
  }
}

export async function createCouponAction(data: {
  code: string;
  type: CouponType;
  discountValue: number;
  minPurchase?: number;
  usageLimit?: number;
}) {
  try {
    const coupon = await prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        type: data.type,
        discountValue: data.discountValue,
        minPurchase: data.minPurchase || 0,
        usageLimit: data.usageLimit || 100,
        isActive: true,
      },
    });
    return { success: true, coupon };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCouponAction(couponId: string) {
  try {
    await prisma.coupon.delete({ where: { id: couponId } });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
