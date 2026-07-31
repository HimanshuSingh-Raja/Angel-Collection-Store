'use client';

import React from 'react';
import { X, Printer, Download, CheckCircle2 } from 'lucide-react';
import { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-8 shadow-2xl relative border border-neutral-200 animate-slide-up my-8">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-6 mb-6 print:hidden">
          <div className="flex items-center gap-3">
            <h3 className="font-serif text-xl font-bold text-neutral-900">TAX INVOICE</h3>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> PAID
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-neutral-800 transition"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button onClick={onClose} className="p-2 text-neutral-400 hover:text-black">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Body */}
        <div className="space-y-8 font-sans text-neutral-800">
          {/* Header info */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-neutral-200 pb-6 gap-6">
            <div>
              <h2 className="font-serif text-2xl font-bold tracking-tight text-neutral-950">
                ANGEL <span className="text-amber-700 font-light">COLLECTION</span>
              </h2>
              <p className="text-xs text-neutral-500 mt-1">House of Haute Couture & Fine Jewellery</p>
              <p className="text-xs text-neutral-500">GSTIN: 27AABCA1234D1ZM</p>
              <p className="text-xs text-neutral-500">742 Park Avenue, Mumbai, MH - 400001</p>
            </div>

            <div className="text-left sm:text-right text-xs">
              <p className="font-bold text-neutral-950 text-sm mb-1">INVOICE #{order.orderNumber}</p>
              <p className="text-neutral-500">Date: {formatDate(order.createdAt)}</p>
              <p className="text-neutral-500">Payment: {order.paymentMethod}</p>
              <p className="text-neutral-500">Status: {order.status}</p>
            </div>
          </div>

          {/* Billed To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-neutral-50 p-4 rounded-2xl text-xs border border-neutral-100">
            <div>
              <p className="font-bold uppercase tracking-wider text-neutral-400 mb-1">BILLED & SHIPPED TO</p>
              <p className="font-bold text-neutral-900 text-sm">{order.shippingAddress.name}</p>
              <p className="text-neutral-600">{order.shippingAddress.street}</p>
              <p className="text-neutral-600">
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
              </p>
              <p className="text-neutral-600">Phone: {order.shippingAddress.phone}</p>
              <p className="text-neutral-600">Email: {order.customerEmail}</p>
            </div>
            {order.trackingNumber && (
              <div>
                <p className="font-bold uppercase tracking-wider text-neutral-400 mb-1">LOGISTICS TRACKING</p>
                <p className="font-semibold text-neutral-900">Carrier: {order.carrier || 'Express Courier'}</p>
                <p className="text-neutral-600">AWB No: {order.trackingNumber}</p>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-neutral-900 uppercase font-bold text-neutral-500">
                  <th className="py-3">Item Description</th>
                  <th className="py-3 text-center">Qty</th>
                  <th className="py-3 text-right">Price</th>
                  <th className="py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-4">
                      <p className="font-bold text-neutral-900 text-sm">{item.title}</p>
                      <p className="text-neutral-500">
                        Size: {item.size} | Color: {item.color}
                      </p>
                    </td>
                    <td className="py-4 text-center font-semibold">{item.quantity}</td>
                    <td className="py-4 text-right font-medium">{formatPrice(item.price)}</td>
                    <td className="py-4 text-right font-bold text-neutral-900">
                      {formatPrice(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Math */}
          <div className="flex justify-end pt-4 border-t border-neutral-200 text-xs">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount ({order.couponCode || 'Promo'})</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span>{order.shippingFee === 0 ? 'FREE' : formatPrice(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST Tax (18%)</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-neutral-950 pt-2 border-t-2 border-neutral-900">
                <span>Total Paid</span>
                <span className="text-amber-800">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="text-center text-[11px] text-neutral-400 pt-8 border-t border-neutral-100">
            Thank you for shopping with Angel Collection. For assistance, contact support@angelcollection.com.
          </div>
        </div>
      </div>
    </div>
  );
};
