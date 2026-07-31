'use server';

import { db as prisma } from '@/lib/db';
import { OrderStatus } from '@prisma/client';
import { sendOrderShippedEmail, sendOrderDeliveredEmail } from '@/lib/email';

export async function getAdminOrdersAction() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 25,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      customerEmail: o.customerEmail,
      customerPhone: o.customerPhone,
      status: o.status,
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
      shippingAddress: o.shippingAddress,
      subtotal: o.subtotal,
      discount: o.discount,
      shippingFee: o.shippingFee,
      tax: o.tax,
      total: o.total,
      createdAt: o.createdAt.toISOString(),
      items: o.items.map((i) => ({
        id: i.id,
        productId: i.productId,
        title: i.title,
        price: i.price,
        quantity: i.quantity,
        size: i.size || undefined,
        color: i.color || undefined,
        image: i.image || undefined,
      })),
    }));
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return [];
  }
}

export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
  try {
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status, updatedAt: new Date() },
    });

    // Trigger transactional emails on status changes
    if (status === 'SHIPPED') {
      sendOrderShippedEmail(
        updated.customerEmail,
        updated.orderNumber,
        updated.trackingNumber || 'AC-EXPRESS-TRACKING',
        updated.carrier || 'Angel Air Express'
      ).catch((e) => console.error('Shipped email error:', e));
    } else if (status === 'DELIVERED') {
      sendOrderDeliveredEmail(updated.customerEmail, updated.orderNumber, updated.customerName).catch((e) =>
        console.error('Delivered email error:', e)
      );
    }

    return { success: true, order: updated };
  } catch (error: any) {
    console.error('Error updating order status:', error);
    return { success: false, error: error.message };
  }
}
