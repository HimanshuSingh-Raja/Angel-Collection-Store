'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Package, Printer, Truck, CheckCircle2, ChevronRight, RotateCcw } from 'lucide-react';
import { INITIAL_ORDERS } from '@/lib/mock-data';
import { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { InvoiceModal } from '@/components/store/InvoiceModal';

export default function UserOrdersPage() {
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-neutral-200 pb-6 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-amber-700 font-bold">CLIENT HISTORY</span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-neutral-900 mt-1">
            Order History & Tracking ({INITIAL_ORDERS.length})
          </h1>
        </div>
        <Link href="/account" className="text-xs font-bold text-neutral-600 hover:text-black">
          ← Back to Account
        </Link>
      </div>

      <div className="space-y-6">
        {INITIAL_ORDERS.map((order) => (
          <div key={order.id} className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-100 gap-4 text-xs">
              <div>
                <p className="font-mono font-bold text-neutral-900 text-sm">ORDER #{order.orderNumber}</p>
                <p className="text-neutral-500">Placed on {formatDate(order.createdAt)} | Payment: {order.paymentMethod}</p>
              </div>

              <div className="flex items-center space-x-3">
                <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase text-[10px]">
                  {order.status}
                </span>

                <button
                  onClick={() => setSelectedInvoiceOrder(order)}
                  className="px-4 py-2 bg-neutral-950 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-neutral-800 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Tax Invoice</span>
                </button>
              </div>
            </div>

            {/* Visual Tracking Stepper Line */}
            <div className="py-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-3">Order Status Stepper</p>
              <div className="flex items-center justify-between max-w-xl text-[11px] font-bold text-neutral-700">
                <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                </span>
                <span className="text-neutral-300">—</span>
                <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Packed
                </span>
                <span className="text-neutral-300">—</span>
                <span className={order.status === 'SHIPPED' || order.status === 'DELIVERED' ? 'text-emerald-700 font-extrabold flex items-center gap-1' : 'text-neutral-400'}>
                  <Truck className="w-3.5 h-3.5" /> Shipped
                </span>
                <span className="text-neutral-300">—</span>
                <span className={order.status === 'DELIVERED' ? 'text-emerald-700 font-extrabold flex items-center gap-1' : 'text-neutral-400'}>
                  Delivered
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-4 pt-4 border-t border-neutral-100">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-4">
                    <img src={item.image} alt="" className="w-14 aspect-[1080/1455] object-cover rounded-xl border border-neutral-200" />
                    <div>
                      <h4 className="font-bold text-neutral-900 text-sm">{item.title}</h4>
                      <p className="text-neutral-500">Size: {item.size} | Color: {item.color} | Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-neutral-900 text-sm">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-neutral-100 text-xs">
              <span className="text-neutral-500">Total Paid: <strong className="text-neutral-900 text-sm font-bold">{formatPrice(order.total)}</strong></span>
              <Link
                href={`/track-order?orderId=${order.orderNumber}`}
                className="text-amber-800 font-bold hover:underline flex items-center gap-1"
              >
                <span>Track Live Package</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <InvoiceModal order={selectedInvoiceOrder} onClose={() => setSelectedInvoiceOrder(null)} />
    </div>
  );
}
