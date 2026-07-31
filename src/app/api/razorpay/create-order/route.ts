import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerRazorpayOrder } from '@/lib/razorpay';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  console.log('\n======================================================');
  console.log('💳 [RAZORPAY PIPELINE] 1. Creating Razorpay Order on Server...');
  console.log('======================================================');

  try {
    const cookieStore = await cookies();
    const sessionUserId = cookieStore.get('angel_user_session')?.value;

    if (!sessionUserId) {
      console.warn('❌ [RAZORPAY BLOCKED] Unauthenticated checkout attempt.');
      return NextResponse.json(
        { success: false, message: 'Authentication required. Please log in to complete payment.' },
        { status: 401 }
      );
    }

    const authenticatedUser = await db.user.findUnique({
      where: { id: sessionUserId },
    });

    if (!authenticatedUser || !authenticatedUser.isActive) {
      return NextResponse.json(
        { success: false, message: 'Invalid session or user account deactivated.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, currency = 'INR' } = body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Valid payment amount is required.' },
        { status: 400 }
      );
    }

    // Convert amount to paise (1 INR = 100 paise)
    const amountInPaise = Math.round(amount * 100);
    const receiptId = `rcpt_${Math.floor(100000 + Math.random() * 900000)}_${Date.now()}`;

    const razorpayOrder = await createServerRazorpayOrder({
      amount: amountInPaise,
      currency,
      receipt: receiptId,
      notes: {
        userId: authenticatedUser.id,
        userEmail: authenticatedUser.email,
      },
    });

    console.log(`✅ [RAZORPAY PIPELINE] 2. Created Razorpay Order ID: ${razorpayOrder.id} (${amountInPaise} paise)`);

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key_id';

    return NextResponse.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId,
    });
  } catch (error: any) {
    console.error('❌ [RAZORPAY ORDER CREATION ERROR]:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create Razorpay payment order', error: error.message },
      { status: 500 }
    );
  }
}
