'use client';

import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { Printer, ChevronDown, Loader2 } from 'lucide-react';
import { InvoiceModal } from '../store/InvoiceModal';
import { getAdminOrdersAction, updateOrderStatusAction } from '@/actions/order-admin';

export const RecentOrdersTable: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      try {
        const liveOrders = await getAdminOrdersAction();
        setOrders(liveOrders as any);
      } catch (e) {
        console.error('Failed to load live orders:', e);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    await updateOrderStatusAction(orderId, newStatus as any);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'SHIPPED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'PACKED':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'CONFIRMED':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'PENDING':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'CANCELLED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-neutral-500/10 text-neutral-400 border-neutral-500/30';
    }
  };

  return (
    <div className="bg-admin-card p-6 rounded-2xl border border-admin-border shadow-lg space-y-4 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg font-bold text-white tracking-tight">Recent Orders</h3>
          <p className="text-xs text-admin-muted">Manage status, generate invoices & shipping labels</p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">
          LIVE POSTGRESQL DB
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-admin-muted text-xs gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          <span>Fetching live database orders...</span>
        </div>
      ) : orders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-admin-border uppercase font-bold text-admin-muted">
                <th className="py-3 px-2">Order #</th>
                <th className="py-3 px-2">Customer</th>
                <th className="py-3 px-2">Date</th>
                <th className="py-3 px-2">Payment</th>
                <th className="py-3 px-2">Total</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border text-admin-text">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-admin-hover transition">
                  <td className="py-3.5 px-2 font-mono font-bold text-amber-400">{order.orderNumber}</td>
                  <td className="py-3.5 px-2">
                    <p className="font-semibold text-white">{order.customerName}</p>
                    <p className="text-[10px] text-admin-muted">{order.customerEmail}</p>
                  </td>
                  <td className="py-3.5 px-2 text-admin-muted">{formatDate(order.createdAt)}</td>
                  <td className="py-3.5 px-2">
                    <span className="px-2 py-0.5 rounded bg-admin-bg border border-admin-border text-[10px] font-semibold text-neutral-300">
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3.5 px-2 font-bold text-white">{formatPrice(order.total)}</td>
                  <td className="py-3.5 px-2">
                    <div className="relative inline-block">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border focus:outline-none appearance-none pr-5 cursor-pointer ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        <option value="PENDING" className="bg-admin-card text-white">PENDING</option>
                        <option value="CONFIRMED" className="bg-admin-card text-white">CONFIRMED</option>
                        <option value="PACKED" className="bg-admin-card text-white">PACKED</option>
                        <option value="SHIPPED" className="bg-admin-card text-white">SHIPPED</option>
                        <option value="DELIVERED" className="bg-admin-card text-white">DELIVERED</option>
                        <option value="CANCELLED" className="bg-admin-card text-white">CANCELLED</option>
                        <option value="RETURNED" className="bg-admin-card text-white">RETURNED</option>
                      </select>
                      <ChevronDown className="w-3 h-3 absolute right-1.5 top-2 pointer-events-none text-admin-muted" />
                    </div>
                  </td>
                  <td className="py-3.5 px-2 text-right space-x-2">
                    <button
                      onClick={() => setSelectedInvoiceOrder(order)}
                      className="p-1.5 rounded-lg bg-admin-bg hover:bg-amber-500/20 text-amber-400 transition border border-admin-border cursor-pointer"
                      title="View Tax Invoice"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center py-8 text-admin-muted text-xs">No orders found in PostgreSQL database.</p>
      )}

      <InvoiceModal order={selectedInvoiceOrder} onClose={() => setSelectedInvoiceOrder(null)} />
    </div>
  );
};
