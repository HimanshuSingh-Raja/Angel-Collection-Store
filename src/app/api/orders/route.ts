import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { generateOrderNumber } from '@/lib/utils';
import { sendOrderConfirmationEmail, sendAdminOrderNotificationEmail } from '@/lib/email';
import { OrderStatus } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const orders = await db.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('API Orders GET Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  console.log('\n======================================================');
  console.log('🔒 [ORDER PIPELINE SECURITY] 1. Validating Session Authentication...');
  console.log('======================================================');

  try {
    // 1. Strict Server-Side Authentication Verification
    const cookieStore = await cookies();
    const sessionUserId = cookieStore.get('angel_user_session')?.value;

    if (!sessionUserId) {
      console.warn('❌ [SECURITY BLOCKED] Unauthenticated order attempt rejected with 401.');
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication Required. Please log in or create an account to complete your order.',
        },
        { status: 401 }
      );
    }

    // Verify user exists in PostgreSQL
    const authenticatedUser = await db.user.findUnique({
      where: { id: sessionUserId },
    });

    if (!authenticatedUser || !authenticatedUser.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid session or user account deactivated. Please log in again.',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      customerName,
      customerPhone,
      shippingAddress,
      paymentMethod,
      items,
      subtotal,
      discount,
      shippingFee,
      tax,
      total,
      couponCode,
    } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: 'Cart items are required to place an order.' }, { status: 400 });
    }

    const orderNumber = generateOrderNumber();
    const emailToUse = authenticatedUser.email;
    const nameToUse = customerName || authenticatedUser.name;
    const initialStatus: OrderStatus = paymentMethod === 'RAZORPAY' ? 'CONFIRMED' : 'PENDING';

    console.log(`[ORDER PIPELINE] 2. Authenticated User: ${nameToUse} (${emailToUse}) | ID: ${authenticatedUser.id}`);
    console.log(`[ORDER PIPELINE] 3. Saving Order #${orderNumber} to PostgreSQL...`);

    // Save order in PostgreSQL database FIRST
    const order = await db.order.create({
      data: {
        orderNumber,
        userId: authenticatedUser.id,
        customerName: nameToUse,
        customerEmail: emailToUse,
        customerPhone: customerPhone || authenticatedUser.phone || '+91 98765 43210',
        paymentMethod: paymentMethod || 'COD',
        paymentStatus: paymentMethod === 'RAZORPAY' ? 'PAID' : 'PENDING',
        status: initialStatus,
        shippingAddress: typeof shippingAddress === 'string' ? shippingAddress : JSON.stringify(shippingAddress),
        subtotal: parseFloat(subtotal),
        discount: parseFloat(discount || '0'),
        shippingFee: parseFloat(shippingFee || '0'),
        tax: parseFloat(tax || '0'),
        total: parseFloat(total),
        couponCode,
        trackingNumber: `AWB-${Math.floor(100000000 + Math.random() * 900000000)}`,
        carrier: 'Angel Express Courier',
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
      },
      include: { items: true },
    });

    console.log(`✅ [ORDER PIPELINE] 4. Authenticated Order #${order.orderNumber} saved to Database successfully!`);

    // 2. Dispatch Customer Confirmation & Admin Notification Email asynchronously (Non-blocking)
    let emailStatus = { customerSent: false, adminSent: false };
    try {
      console.log('✉️ [ORDER PIPELINE] 5. Triggering Resend Email dispatch...');
      const [customerEmailRes, adminEmailRes] = await Promise.allSettled([
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

      emailStatus.customerSent = customerEmailRes.status === 'fulfilled' && (customerEmailRes.value as any)?.success;
      emailStatus.adminSent = adminEmailRes.status === 'fulfilled' && (adminEmailRes.value as any)?.success;

      console.log('[ORDER PIPELINE] 6. Customer Email Result:', customerEmailRes);
      console.log('[ORDER PIPELINE] 7. Admin Email Result:', adminEmailRes);
    } catch (emailErr) {
      console.error('⚠️ [ORDER PIPELINE WARNING] Resend email dispatch encountered an error, but Order remains safely saved in DB:', emailErr);
    }

    console.log('======================================================\n');

    return NextResponse.json({
      success: true,
      order,
      emailStatus,
    });
  } catch (error: any) {
    console.error('❌ [ORDER PIPELINE ERROR]:', error);
    return NextResponse.json({ success: false, message: 'Failed to place order', error: error.message }, { status: 500 });
  }
}
