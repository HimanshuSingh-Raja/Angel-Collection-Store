'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Tag, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    subtotal,
    discount,
    shippingFee,
    tax,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    freeShippingThreshold,
    amountNeededForFreeShipping,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ success: boolean; text: string } | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = applyCoupon(couponCode);
    setCouponMsg({ success: res.success, text: res.message });
    if (res.success) setCouponCode('');
  };

  const shippingPercentage = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-neutral-200 pb-6">
        <span className="text-xs uppercase tracking-[0.25em] text-amber-700 font-bold">SHOPPING BAG</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 mt-1">
          Your Luxury Selection ({cart.reduce((c, i) => c + i.quantity, 0)})
        </h1>
      </div>

      {cart.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-3xl border border-neutral-100 p-8 space-y-4">
          <ShoppingBag className="w-16 h-16 text-neutral-300 mx-auto stroke-1" />
          <h2 className="font-serif text-2xl font-bold text-neutral-900">Your shopping bag is empty</h2>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Discover our haute couture evening gowns, fine jewellery, and bespoke tailoring collections.
          </p>
          <Link
            href="/shop"
            className="inline-block px-8 py-4 bg-neutral-950 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-amber-700 transition shadow-lg"
          >
            EXPLORE CATALOGUE
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Item List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Free Shipping bar */}
            <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-800">
                <span className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-700" />
                  {amountNeededForFreeShipping === 0 ? (
                    <strong className="text-emerald-700">Congratulations! Free Express Shipping Unlocked</strong>
                  ) : (
                    <span>Add {formatPrice(amountNeededForFreeShipping)} more for FREE Shipping</span>
                  )}
                </span>
                <span>{shippingPercentage}%</span>
              </div>
              <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-600 rounded-full transition-all duration-500" style={{ width: `${shippingPercentage}%` }} />
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm divide-y divide-neutral-100 overflow-hidden">
              {cart.map((item) => (
                <div key={item.id} className="p-6 flex flex-col sm:flex-row items-center gap-6">
                  <img
                    src={item.product.images[0]?.url}
                    alt={item.product.title}
                    className="w-24 h-32 object-cover rounded-2xl border border-neutral-100 bg-neutral-50"
                  />

                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">
                      {item.product.brand?.name || 'ANGEL PRIVÉ'}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-neutral-900">{item.product.title}</h3>
                    <p className="text-xs text-neutral-500">
                      Size: <span className="font-bold text-neutral-900">{item.size}</span> | Color: <span className="font-bold text-neutral-900">{item.color}</span>
                    </p>
                    <p className="text-sm font-bold text-neutral-900">{formatPrice(item.product.price)}</p>
                  </div>

                  <div className="flex items-center space-x-6">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-neutral-200 text-neutral-700 transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-4 text-xs font-bold text-neutral-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-neutral-200 text-neutral-700 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-neutral-400 hover:text-rose-600 transition"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Box */}
          <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm space-y-6 sticky top-28">
            <h3 className="font-serif text-xl font-bold text-neutral-900">Order Summary</h3>

            {/* Coupon */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                  <span className="font-medium flex items-center gap-1.5">
                    <Tag className="w-4 h-4" /> Coupon &apos;{appliedCoupon.code}&apos; Applied
                  </span>
                  <button onClick={removeCoupon} className="font-bold text-rose-600 hover:underline">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon (e.g. ANGEL10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 text-xs uppercase bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-amber-600 font-sans"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold uppercase hover:bg-amber-700 transition"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponMsg && (
                <p className={`text-[11px] mt-1 ${couponMsg.success ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {couponMsg.text}
                </p>
              )}
            </div>

            <div className="space-y-3 text-xs text-neutral-600 border-t border-neutral-200 pt-4">
              <div className="flex justify-between">
                <span>Bag Subtotal</span>
                <span className="font-semibold text-neutral-900">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Privilege Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span>{shippingFee === 0 ? <strong className="text-emerald-700">FREE</strong> : formatPrice(shippingFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST Tax (18%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-neutral-950 pt-3 border-t border-neutral-200">
                <span>Total Payable</span>
                <span className="text-amber-800">{formatPrice(total)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full py-4 bg-neutral-950 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.15em] hover:bg-amber-700 transition flex items-center justify-center gap-2 shadow-xl"
            >
              <span>PROCEED TO CHECKOUT</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
