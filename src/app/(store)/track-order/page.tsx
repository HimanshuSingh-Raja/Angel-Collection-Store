'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Truck, CheckCircle2, Package, Clock, MapPin } from 'lucide-react';
import { INITIAL_ORDERS } from '@/lib/mock-data';
import { formatPrice } from '@/lib/utils';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const queryId = searchParams?.get('orderId') || '';

  const [orderIdInput, setOrderIdInput] = useState(queryId || 'ANG-984210-4491');
  const [searchedOrder, setSearchedOrder] = useState(
    INITIAL_ORDERS.find((o) => o.orderNumber === orderIdInput) || INITIAL_ORDERS[0]
  );

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const found = INITIAL_ORDERS.find(
      (o) => o.orderNumber.toUpperCase() === orderIdInput.trim().toUpperCase()
    );
    if (found) {
      setSearchedOrder(found);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs uppercase tracking-[0.3em] font-bold text-amber-700">LOGISTICS CONCIERGE</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
          Track Your Order
        </h1>
        <p className="text-xs text-neutral-500">
          Enter your Order Reference Number (e.g. ANG-984210-4491) to view real-time courier updates.
        </p>
      </div>

      {/* Input */}
      <form onSubmit={handleTrack} className="flex gap-3 max-w-xl mx-auto">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-4 top-3.5 text-neutral-400" />
          <input
            type="text"
            required
            placeholder="Order Number (e.g. ANG-984210-4491)"
            value={orderIdInput}
            onChange={(e) => setOrderIdInput(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-neutral-300 font-mono text-xs uppercase focus:outline-none focus:border-amber-600 shadow-sm"
          />
        </div>
        <button
          type="submit"
          className="px-8 py-3 bg-neutral-950 text-white text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-amber-700 transition shadow-lg"
        >
          Track
        </button>
      </form>

      {/* Results Box */}
      {searchedOrder && (
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-neutral-100 shadow-xl space-y-8 animate-slide-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-100 gap-4 text-xs">
            <div>
              <span className="text-neutral-400 font-bold uppercase">Order Reference</span>
              <p className="font-mono text-lg font-bold text-neutral-900">{searchedOrder.orderNumber}</p>
            </div>
            <div>
              <span className="text-neutral-400 font-bold uppercase">Courier Carrier</span>
              <p className="font-semibold text-neutral-900">{searchedOrder.carrier || 'DHL Express Worldwide'}</p>
              <p className="text-neutral-500 font-mono">AWB: {searchedOrder.trackingNumber || 'AWB-993847291'}</p>
            </div>
          </div>

          {/* Stepper Line */}
          <div className="space-y-6">
            <h3 className="font-serif text-lg font-bold text-neutral-900">Live Status Stepper</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center text-xs">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-1">
                <CheckCircle2 className="w-5 h-5 mx-auto text-emerald-600" />
                <p className="font-bold">Order Placed</p>
                <p className="text-[10px] text-emerald-600">Payment Verified</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-1">
                <Package className="w-5 h-5 mx-auto text-emerald-600" />
                <p className="font-bold">Quality Inspected</p>
                <p className="text-[10px] text-emerald-600">Haute Couture Vault</p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                <Truck className="w-5 h-5 mx-auto text-amber-600" />
                <p className="font-bold">In Transit</p>
                <p className="text-[10px] text-amber-700">Dispatched via Air</p>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-neutral-400 space-y-1">
                <MapPin className="w-5 h-5 mx-auto text-neutral-400" />
                <p className="font-bold">Delivered</p>
                <p className="text-[10px]">Estimated Tomorrow</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="pt-6 border-t border-neutral-100 space-y-3 text-xs">
            <p className="font-bold text-neutral-900 uppercase">Package Contents</p>
            {searchedOrder.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-neutral-700">
                <span>{item.title} (x{item.quantity})</span>
                <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-neutral-400">Loading tracking...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
