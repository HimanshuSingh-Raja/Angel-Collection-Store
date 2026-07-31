'use client';

import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { Printer, Eye, Search, Loader2, RefreshCw } from 'lucide-react';
import { InvoiceModal } from '@/components/store/InvoiceModal';
import { OrderDetailsModal } from '@/components/admin/OrderDetailsModal';
import { getAdminOrdersAction, updateOrderStatusAction } from '@/actions/order-admin';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [selectedDetailsOrder, setSelectedDetailsOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const liveOrders = await getAdminOrdersAction();
      if (liveOrders && Array.isArray(liveOrders)) {
        setOrders(liveOrders as any[]);
      }
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Real-Time Polling Listener every 10 seconds
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const filtered = orders.filter((o) => {
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    if (
      search &&
      !o.orderNumber.toLowerCase().includes(search.toLowerCase()) &&
      !o.customerName.toLowerCase().includes(search.toLowerCase()) &&
      !o.customerEmail.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    await updateOrderStatusAction(orderId, newStatus);
  };

  const statusBadges: Record<string, string> = {
    PENDING: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    CONFIRMED: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    PROCESSING: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    PACKED: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    SHIPPED: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    DELIVERED: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    CANCELLED: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-admin-border">
        <div>
          <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block">ORDER FULFILLMENT</span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white mt-1">Order Management Dashboard</h1>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
          {['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition shrink-0 cursor-pointer ${
                statusFilter === st
                  ? 'bg-amber-500 text-neutral-950 shadow-md'
                  : 'bg-admin-card text-admin-muted hover:text-white border border-admin-border'
              }`}
            >
              {st}
            </button>
          ))}

          <button
            onClick={fetchOrders}
            className="p-2 rounded-xl bg-admin-card text-amber-400 border border-admin-border hover:bg-admin-hover transition cursor-pointer"
            title="Refresh Live Orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search & Matching Stats */}
      <div className="flex items-center justify-between gap-4 bg-admin-card p-4 rounded-2xl border border-admin-border">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-admin-muted" />
          <input
            type="text"
            placeholder="Search by Order #, Customer Name, or Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-admin-bg text-xs text-white rounded-xl border border-admin-border focus:outline-none focus:border-amber-500"
          />
        </div>
        <span className="text-xs font-bold text-amber-400">Total Live Orders: {filtered.length}</span>
      </div>

      {/* Orders Table */}
      <div className="bg-admin-card rounded-2xl border border-admin-border shadow-lg overflow-hidden">
        {loading && orders.length === 0 ? (
          <div className="py-20 text-center text-xs text-admin-muted flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
            <span>Loading PostgreSQL orders...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-admin-border uppercase font-bold text-admin-muted bg-admin-bg">
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border text-admin-text">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-admin-hover transition">
                    <td className="py-4 px-4 font-mono font-bold text-amber-400">{order.orderNumber}</td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-white">{order.customerName}</p>
                      <p className="text-[10px] text-admin-muted">{order.customerEmail}</p>
                    </td>
                    <td className="py-4 px-4 text-admin-muted">{formatDate(order.createdAt)}</td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded bg-admin-bg border border-admin-border text-[10px] font-semibold">
                        {order.paymentMethod} ({order.paymentStatus})
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-white">{formatPrice(order.total)}</td>
                    <td className="py-4 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                        className={`px-3 py-1 rounded-xl text-[10px] font-bold bg-admin-bg border focus:outline-none cursor-pointer ${
                          statusBadges[order.status] || statusBadges.PENDING
                        }`}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="PACKED">PACKED</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedDetailsOrder(order)}
                        className="p-2 rounded-lg bg-admin-bg hover:bg-neutral-800 text-white transition border border-admin-border cursor-pointer"
                        title="View Full Order Details"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                      </button>

                      <button
                        onClick={() => setSelectedInvoiceOrder(order)}
                        className="p-2 rounded-lg bg-admin-bg hover:bg-amber-500/20 text-amber-400 transition border border-admin-border cursor-pointer"
                        title="Tax Invoice & Shipping Label"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Full Order Details Modal */}
      <OrderDetailsModal
        order={selectedDetailsOrder}
        onClose={() => setSelectedDetailsOrder(null)}
        onStatusUpdated={(orderId, newStatus) => {
          setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
        }}
      />

      {/* Printable Invoice Modal */}
      <InvoiceModal order={selectedInvoiceOrder} onClose={() => setSelectedInvoiceOrder(null)} />
    </div>
  );
}
