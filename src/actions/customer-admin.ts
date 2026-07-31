'use server';

import { db as prisma } from '@/lib/db';

export async function getAdminCustomersAction() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        orders: {
          select: { id: true, total: true, status: true },
        },
      },
    });

    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone || '+91 98765 43210',
      avatar: u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      isActive: u.isActive,
      orderCount: u.orders.length,
      createdAt: u.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching admin customers:', error);
    return [];
  }
}

export async function toggleCustomerActiveAction(userId: string, currentStatus: boolean) {
  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive: !currentStatus, updatedAt: new Date() },
    });
    return { success: true, user: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCustomerAction(userId: string) {
  try {
    await prisma.user.delete({
      where: { id: userId },
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
