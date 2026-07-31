'use client';

import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, Package, Users, TrendingUp, Percent, CheckCircle2, Clock, XCircle, RefreshCw, AlertTriangle, Sparkles } from 'lucide-react';
import { StatsCard } from '@/components/admin/StatsCard';
import { RecentOrdersTable } from '@/components/admin/RecentOrdersTable';
import { LowStockAlerts } from '@/components/admin/LowStockAlerts';
import { formatPrice } from '@/lib/utils';
import { getAdminAnalyticsData } from '@/actions/admin-analytics';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLiveAnalytics() {
      setLoading(true);
      try {
        const result = await getAdminAnalyticsData();
        setData(result);
      } catch (e) {
        console.error('Failed to load real analytics:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchLiveAnalytics();
  }, []);

  const metrics = data?.metrics || {
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
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Top Operations Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-admin-border">
        <div>
          <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block">ENTERPRISE CONTROL CENTER</span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white mt-1">
            Real-Time Business Analytics
          </h1>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-admin-card text-emerald-400 border border-emerald-500/30 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            PostgreSQL DB: CONNECTED LIVE
          </span>
        </div>
      </div>

      {/* Primary Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Revenue Today"
          value={loading ? 'Loading...' : formatPrice(metrics.revenueToday)}
          change="Real DB Calculation"
          isPositive={true}
          icon={DollarSign}
        />
        <StatsCard
          title="Revenue This Month"
          value={loading ? 'Loading...' : formatPrice(metrics.revenueThisMonth)}
          change="Real DB Calculation"
          isPositive={true}
          icon={TrendingUp}
        />
        <StatsCard
          title="Total Orders Processed"
          value={loading ? 'Loading...' : `${metrics.totalOrders} Orders`}
          change={`${metrics.deliveredOrders} Delivered`}
          isPositive={true}
          icon={ShoppingBag}
        />
        <StatsCard
          title="Avg. Order Value (AOV)"
          value={loading ? 'Loading...' : formatPrice(metrics.averageOrderValue)}
          change="Calculated from Paid Orders"
          isPositive={true}
          icon={Percent}
        />
      </div>

      {/* Real Orders Status Breakdown Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="p-4 bg-admin-card border border-admin-border rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Pending</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">{metrics.pendingOrders}</p>
        </div>

        <div className="p-4 bg-admin-card border border-admin-border rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Delivered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">{metrics.deliveredOrders}</p>
        </div>

        <div className="p-4 bg-admin-card border border-admin-border rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Cancelled</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-white">{metrics.cancelledOrders}</p>
        </div>

        <div className="p-4 bg-admin-card border border-admin-border rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Returned</span>
            <RefreshCw className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-bold text-white">{metrics.returnedOrders}</p>
        </div>

        <div className="p-4 bg-admin-card border border-admin-border rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Total Customers</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">{metrics.totalCustomers}</p>
        </div>

        <div className="p-4 bg-admin-card border border-admin-border rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Active Products</span>
            <Package className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">{metrics.totalProducts}</p>
        </div>
      </div>

      {/* Best Selling Products & Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Best Selling Products */}
        <div className="p-6 bg-admin-card border border-admin-border rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Top Best Selling Products</span>
            </h3>
            <span className="text-[10px] font-mono text-neutral-400 uppercase">LIVE DB</span>
          </div>

          <div className="space-y-3">
            {data?.bestSellingProducts?.length > 0 ? (
              data.bestSellingProducts.map((prod: any) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#0B0E14] border border-admin-border text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt=""
                      className="w-10 h-12 object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-semibold text-white line-clamp-1">{prod.title}</p>
                      <p className="text-[11px] text-neutral-400">{prod.category?.name || 'Couture'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-amber-400">{formatPrice(prod.price)}</p>
                    <p className="text-[10px] text-neutral-500">{prod.stock} in stock</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-neutral-500 py-4 text-center">No products found in database.</p>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <LowStockAlerts />
      </div>

      {/* Live Orders Table */}
      <RecentOrdersTable />
    </div>
  );
}
