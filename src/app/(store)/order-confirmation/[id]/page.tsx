'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { CheckCircle2, Package, Printer, Truck, ArrowRight, Sparkles } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderNumber = resolvedParams.id || 'ANG-984210-4491';

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-8">
      {/* Celebration Header */}
      <div className="inline-flex p-4 rounded-full bg-emerald-100 text-emerald-700 mb-2">
        <CheckCircle2 className="w-16 h-16" />
      </div>

      <div className="space-y-2">
        <span className="text-xs uppercase tracking-[0.3em] font-bold text-amber-700">THANK YOU FOR YOUR PURCHASE</span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900">
          Your Luxury Order Is Confirmed!
        </h1>
        <p className="text-sm text-neutral-600 max-w-md mx-auto">
          We have received your order <strong>#{orderNumber}</strong>. A confirmation email and tax invoice have been dispatched to your email address.
        </p>
      </div>

      {/* Details Box */}
      <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm max-w-xl mx-auto space-y-6 text-left text-xs">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div>
            <p className="text-neutral-400 font-bold uppercase">Order Reference</p>
            <p className="font-mono font-bold text-neutral-900 text-sm mt-0.5">#{orderNumber}</p>
          </div>
          <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full font-bold">
            Status: Confirmed
          </span>
        </div>

        <div className="space-y-3">
          <p className="font-bold text-neutral-900 uppercase">Fulfillment Timeline</p>
          <div className="flex items-center space-x-3 text-neutral-600">
            <Package className="w-4 h-4 text-amber-700" />
            <span>Hand-tailored & Inspected by Quality Concierge</span>
          </div>
          <div className="flex items-center space-x-3 text-neutral-600">
            <Truck className="w-4 h-4 text-amber-700" />
            <span>Dispatched via DHL/BlueDart Express in 24-48 Hours</span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <Link
          href={`/track-order?orderId=${orderNumber}`}
          className="px-8 py-4 bg-neutral-950 text-white font-bold text-xs uppercase tracking-widest rounded-full hover:bg-amber-700 transition flex items-center gap-2 shadow-xl"
        >
          <Truck className="w-4 h-4 text-amber-300" />
          <span>TRACK YOUR ORDER</span>
        </Link>

        <Link
          href="/shop"
          className="px-8 py-4 bg-neutral-100 text-neutral-900 font-bold text-xs uppercase tracking-widest rounded-full hover:bg-neutral-200 transition"
        >
          CONTINUE SHOPPING
        </Link>
      </div>
    </div>
  );
}
