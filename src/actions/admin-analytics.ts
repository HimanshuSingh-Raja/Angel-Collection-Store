'use server';

import { db as prisma } from '@/lib/db';

export async function getAdminAnalyticsData() {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // 1. Total counts from real PostgreSQL database
    const [
      totalUsers,
      totalCustomers,
      totalProducts,
      totalCategories,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      returnedOrders,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.order.count({ where: { status: 'CANCELLED' } }),
      prisma.order.count({ where: { status: 'RETURNED' } }),
    ]);

    // 2. Real Revenue Calculations from completed/paid orders
    const [
      revenueTodayAgg,
      revenueWeekAgg,
      revenueMonthAgg,
      revenueYearAgg,
      totalRevenueAgg,
    ] = await Promise.all([
      prisma.order.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: startOfToday }, paymentStatus: 'PAID' },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: startOfWeek }, paymentStatus: 'PAID' },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: startOfMonth }, paymentStatus: 'PAID' },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: startOfYear }, paymentStatus: 'PAID' },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: 'PAID' },
      }),
    ]);

    const revenueToday = revenueTodayAgg._sum.total || 0;
    const revenueThisWeek = revenueWeekAgg._sum.total || 0;
    const revenueThisMonth = revenueMonthAgg._sum.total || 0;
    const revenueThisYear = revenueYearAgg._sum.total || 0;
    const totalRevenue = totalRevenueAgg._sum.total || 0;

    const averageOrderValue = deliveredOrders > 0 ? totalRevenue / deliveredOrders : 0;

    // 3. Best selling products & low stock items
    const [bestSellingProducts, lowStockProducts, recentOrders] = await Promise.all([
      prisma.product.findMany({
        take: 5,
        orderBy: { reviewCount: 'desc' },
        include: { images: true, category: true },
      }),
      prisma.product.findMany({
        where: { stock: { lte: 5 } },
        take: 5,
        include: { category: true },
      }),
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
    ]);

    return {
      metrics: {
        totalUsers,
        totalCustomers,
        totalProducts,
        totalCategories,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        returnedOrders,
        revenueToday,
        revenueThisWeek,
        revenueThisMonth,
        revenueThisYear,
        totalRevenue,
        averageOrderValue,
      },
      bestSellingProducts,
      lowStockProducts,
      recentOrders,
    };
  } catch (error) {
    console.error('Error fetching real admin analytics:', error);
    return {
      metrics: {
        totalUsers: 0,
        totalCustomers: 0,
        totalProducts: 0,
        totalCategories: 0,
        totalOrders: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        returnedOrders: 0,
        revenueToday: 0,
        revenueThisWeek: 0,
        revenueThisMonth: 0,
        revenueThisYear: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
      },
      bestSellingProducts: [],
      lowStockProducts: [],
      recentOrders: [],
    };
  }
}
