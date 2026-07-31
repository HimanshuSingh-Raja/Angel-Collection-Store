import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const totalOrdersCount = await db.order.count();
    const totalProductsCount = await db.product.count();
    const totalCustomersCount = await db.user.count();

    const revenueAggregate = await db.order.aggregate({
      _sum: { total: true },
    });

    const grossRevenue = revenueAggregate._sum.total || 0;
    const netProfit = Math.round(grossRevenue * 0.42);

    const recentOrders = await db.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });

    const lowStockProducts = await db.product.findMany({
      where: { stock: { lte: 5 } },
      take: 5,
      include: { images: true },
    });

    return NextResponse.json({
      success: true,
      stats: {
        grossRevenue,
        netProfit,
        totalOrdersCount,
        totalProductsCount,
        totalCustomersCount,
        conversionRate: '4.85%',
      },
      recentOrders,
      lowStockProducts,
    });
  } catch (error) {
    console.error('API Analytics GET Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to compute analytics' }, { status: 500 });
  }
}
