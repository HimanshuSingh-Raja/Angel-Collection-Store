import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { db } from '@/lib/db';
import { generateOrderNumber } from '@/lib/utils';
import { sendOrderConfirmationEmail, sendAdminOrderNotificationEmail } from '@/lib/email';

export async function POST(request: Request) {
  console.log('\n======================================================');
  console.log('🔒 [RAZORPAY VERIFICATION] 1. Verifying HMAC SHA256 Signature...');
  console.log('======================================================');

  try {
    const cookieStore = await cookies();
    const sessionUserId = cookieStore.get('angel_user_session')?.value;

    if (!sessionUserId) {
      console.warn('❌ [RAZORPAY BLOCKED] Unauthenticated payment verification attempt.');
      return NextResponse.json(
        { success: false, message: 'Authentication required. Please log in to complete order.' },
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
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      customerName,
      customerPhone,
      shippingAddress,
      items,
      subtotal,
      discount,
      shippingFee,
      tax,
      total,
      couponCode,
    } = body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { success: false, message: 'Missing required Razorpay payment credentials.' },
        { status: 400 }
      );
    }

    // 2. Compute & Verify HMAC SHA256 Signature
    const isValidSignature = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!isValidSignature) {
      console.error(`❌ [RAZORPAY SECURITY REJECTED] Cryptographic Signature Mismatch!`);
      return NextResponse.json(
        { success: false, message: 'Payment verification failed: Invalid cryptographic signature.' },
        { status: 400 }
      );
    }

    console.log('✅ [RAZORPAY VERIFICATION] Signature verified successfully! Saving order to PostgreSQL...');

    // Check for duplicate payment transaction ID
    const existingPayment = await db.payment.findUnique({
      where: { transactionId: razorpayPaymentId },
    });

    if (existingPayment) {
      console.warn(`⚠️ [DUPLICATE PAYMENT BLOCKED] Transaction ID ${razorpayPaymentId} already processed.`);
      const existingOrder = await db.order.findFirst({
        where: { id: existingPayment.orderId },
        include: { items: true },
      });
      return NextResponse.json({ success: true, order: existingOrder });
    }

    const orderNumber = generateOrderNumber();
    const emailToUse = authenticatedUser.email;
    const nameToUse = customerName || authenticatedUser.name;

    // 3. Create Order & Payment record in PostgreSQL Database
    const order = await db.order.create({
      data: {
        orderNumber,
        userId: authenticatedUser.id,
        customerName: nameToUse,
        customerEmail: emailToUse,
        customerPhone: customerPhone || authenticatedUser.phone || '+91 98765 43210',
        paymentMethod: 'RAZORPAY',
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        shippingAddress: typeof shippingAddress === 'string' ? shippingAddress : JSON.stringify(shippingAddress),
        subtotal: parseFloat(subtotal),
        discount: parseFloat(discount || '0'),
        shippingFee: parseFloat(shippingFee || '0'),
        tax: parseFloat(tax || '0'),
        total: parseFloat(total),
        couponCode,
        trackingNumber: `AWB-${Math.floor(100000000 + Math.random() * 900000000)}`,
        carrier: 'Angel Express Air',
        items: {
          create: (items || []).map((item: any) => ({
            productId: item.productId || item.product?.id,
            title: item.product?.title || item.title || 'Luxury Couture Item',
            price: parseFloat(item.product?.price || item.price),
            quantity: item.quantity,
            size: item.size || 'Standard',
            color: item.color || 'Standard',
            image: item.product?.images?.[0]?.url || item.image,
          })),
        },
        payments: {
          create: {
            gateway: 'RAZORPAY',
            transactionId: razorpayPaymentId,
            status: 'SUCCESS',
            amount: parseFloat(total),
            responsePayload: JSON.stringify({ razorpayOrderId, razorpayPaymentId, razorpaySignature }),
          },
        },
      },
      include: { items: true, payments: true },
    });

    console.log(`✅ [RAZORPAY VERIFICATION] Order #${order.orderNumber} created with PAID status!`);

    // 4. Send Resend Confirmation Emails (Non-blocking)
    try {
      console.log('✉️ [RAZORPAY DISPATCH] Triggering Resend order confirmation email...');
      await Promise.allSettled([
        sendOrderConfirmationEmail(emailToUse, {
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          total: order.total,
          items: order.items.map((i) => ({ title: i.title, quantity: i.quantity, price: i.price })),
          shippingAddress: order.shippingAddress,
          subtotal: order.subtotal,
          shippingFee: order.shippingFee,
          tax: order.tax,
        }),
        sendAdminOrderNotificationEmail({
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          total: order.total,
        }),
      ]);
    } catch (emailErr) {
      console.error('⚠️ [RAZORPAY EMAIL WARNING] Email dispatch error, but Order is safely saved:', emailErr);
    }

    console.log('======================================================\n');

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error: any) {
    console.error('❌ [RAZORPAY VERIFICATION ERROR]:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to verify Razorpay payment', error: error.message },
      { status: 500 }
    );
  }
}
