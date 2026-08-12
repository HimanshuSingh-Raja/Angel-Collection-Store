'use client';

import React, { useState } from 'react';
import { X, User, Phone, Mail, MapPin, Package, Clock, ShieldCheck, Printer, CheckCircle2, Truck, AlertCircle } from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { updateOrderStatusAction } from '@/actions/order-admin';

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
  onStatusUpdated?: (orderId: string, newStatus: OrderStatus) => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose, onStatusUpdated }) => {
  const [updating, setUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order?.status || 'PENDING');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!order) return null;

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setUpdating(true);
    setCurrentStatus(newStatus);
    try {
      const res = await updateOrderStatusAction(order.id, newStatus);
      if (res.success) {
        setToastMessage(`Order status updated to ${newStatus}`);
        if (onStatusUpdated) onStatusUpdated(order.id, newStatus);
      } else {
        alert('Failed to update order status in database.');
      }
    } catch (e) {
      console.error('Status update failed:', e);
    } finally {
      setUpdating(false);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    CONFIRMED: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    PROCESSING: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    PACKED: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    SHIPPED: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    DELIVERED: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    CANCELLED: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-admin-card rounded-3xl border border-admin-border shadow-2xl overflow-hidden flex flex-col text-admin-text font-sans">
        {/* Header */}
        <div className="p-6 border-b border-admin-border flex items-center justify-between bg-admin-bg">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                ORDER DETAILS
              </span>
              <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[currentStatus] || statusColors.PENDING}`}>
                {currentStatus}
              </span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-white mt-1">
              Order #{order.orderNumber}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-admin-card hover:bg-neutral-800 text-xs font-bold text-white rounded-xl border border-admin-border transition flex items-center gap-2"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-admin-muted hover:text-white rounded-full hover:bg-admin-hover transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {toastMessage && (
          <div className="bg-emerald-500/20 text-emerald-300 px-6 py-2.5 text-xs font-bold border-b border-emerald-500/30 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Status Change Control Box */}
          <div className="p-4 bg-admin-bg rounded-2xl border border-admin-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-white uppercase text-[11px] tracking-wider">Update Order Fulfillment Status</p>
              <p className="text-[11px] text-admin-muted mt-0.5">Changing status automatically updates PostgreSQL and sends transactional notifications.</p>
            </div>
            <select
              value={currentStatus}
              disabled={updating}
              onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-admin-card text-amber-400 border border-admin-border focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="PACKED">PACKED</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Info */}
            <div className="p-5 bg-admin-bg rounded-2xl border border-admin-border space-y-3">
              <h3 className="font-serif text-sm font-bold text-amber-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Customer Profile</span>
              </h3>
              <div className="space-y-1.5 text-admin-muted">
                <p className="text-white font-bold text-sm">{order.customerName}</p>
                <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-amber-400/80" /> {order.customerEmail}</p>
                <p className="flex items-center gap-2 font-mono"><Phone className="w-3.5 h-3.5 text-amber-400/80" /> {order.customerPhone}</p>
                <p className="flex items-center gap-2 pt-1 border-t border-admin-border/60 text-[11px]"><Clock className="w-3.5 h-3.5 text-neutral-400" /> Placed on: {formatDate(order.createdAt)}</p>
              </div>
            </div>

            {/* Shipping Address & Courier */}
            <div className="p-5 bg-admin-bg rounded-2xl border border-admin-border space-y-3">
              <h3 className="font-serif text-sm font-bold text-amber-400 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Shipping Destination & Courier</span>
              </h3>
              <div className="space-y-1.5 text-admin-muted leading-relaxed">
                <p className="text-white font-semibold">
                  {typeof order.shippingAddress === 'string' ? order.shippingAddress : JSON.stringify(order.shippingAddress)}
                </p>
                <div className="pt-2 border-t border-admin-border/60 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-amber-300">Carrier: {order.carrier || 'Angel Express'}</span>
                  <span className="font-mono text-neutral-400">{order.trackingNumber || 'AWB-PENDING'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ordered Products Table */}
          <div className="space-y-3">
            <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-400" />
              <span>Items Summary ({order.items?.length || 0})</span>
            </h3>

            <div className="bg-admin-bg rounded-2xl border border-admin-border overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-admin-border text-admin-muted uppercase text-[10px] tracking-wider font-bold">
                    <th className="p-3">Product</th>
                    <th className="p-3 text-center">Variant</th>
                    <th className="p-3 text-center">Quantity</th>
                    <th className="p-3 text-right">Price</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border">
                  {(order.items || []).map((item) => (
                    <tr key={item.id} className="hover:bg-admin-hover transition">
                      <td className="p-3 flex items-center gap-3">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=200'}
                          alt={item.title}
                          className="w-10 aspect-[1080/1455] object-cover rounded-lg border border-admin-border shrink-0"
                        />
                        <span className="font-semibold text-white line-clamp-1">{item.title}</span>
                      </td>
                      <td className="p-3 text-center text-admin-muted font-mono">
                        {item.size || 'STD'} {item.color ? `/ ${item.color}` : ''}
                      </td>
                      <td className="p-3 text-center font-bold text-white">×{item.quantity}</td>
                      <td className="p-3 text-right text-admin-muted">{formatPrice(item.price)}</td>
                      <td className="p-3 text-right font-bold text-amber-400">{formatPrice(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Breakdown & Payment Method */}
          <div className="p-5 bg-admin-bg rounded-2xl border border-admin-border flex flex-col sm:flex-row justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-admin-muted tracking-wider block">Payment Details</span>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-admin-card rounded-lg border border-admin-border text-white font-bold text-xs">
                  {order.paymentMethod} ({order.paymentStatus})
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-admin-muted text-right min-w-[200px]">
              <div className="flex justify-between"><span>Subtotal:</span> <span className="text-white font-semibold">{formatPrice(order.subtotal || order.total)}</span></div>
              <div className="flex justify-between"><span>Discount:</span> <span className="text-emerald-400">-{formatPrice(order.discount || 0)}</span></div>
              <div className="flex justify-between"><span>Shipping:</span> <span className="text-white font-semibold">{order.shippingFee === 0 ? 'FREE' : formatPrice(order.shippingFee || 0)}</span></div>
              <div className="flex justify-between"><span>GST Tax (18%):</span> <span className="text-white font-semibold">{formatPrice(order.tax || 0)}</span></div>
              <div className="flex justify-between pt-2 border-t border-admin-border text-sm font-bold text-white">
                <span>Grand Total:</span>
                <span className="text-amber-400">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
