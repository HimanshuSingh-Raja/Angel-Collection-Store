'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, ShoppingBag, Trash2, ArrowRight, Plus, Minus, Tag, Lock } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';
import { AuthRequiredModal } from '@/components/auth/AuthRequiredModal';

export const CartDrawer: React.FC = () => {
  const router = useRouter();
  const {
    cart,
    isOpen,
    setIsOpen,
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
  } = useCart();
  const { user } = useAuth();

  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevOverflow || '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const success = applyCoupon(couponCode.trim());
    if (success) {
      setCouponMsg({ success: true, text: `Coupon '${couponCode.toUpperCase()}' applied!` });
      setCouponCode('');
    } else {
      setCouponMsg({ success: false, text: 'Invalid promo code' });
    }
  };

  const handleCheckoutClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setShowAuthModal(true);
    } else {
      setIsOpen(false);
      router.push('/checkout');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden font-sans">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-neutral-200">
            {/* Header */}
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-amber-700" />
                <h2 className="font-serif text-lg font-bold text-neutral-900">Your Shopping Bag</h2>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                  {cart.length}
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-neutral-400 hover:text-neutral-900 rounded-full transition"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-neutral-400">
                  <ShoppingBag className="w-16 h-16 stroke-1 text-neutral-300" />
                  <div className="space-y-1">
                    <p className="font-serif text-base font-bold text-neutral-800">Your bag is empty</p>
                    <p className="text-xs">Explore our haute couture collections to add items.</p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-6 py-2.5 bg-neutral-950 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-amber-700 transition"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-6 border-b border-neutral-100">
                    <img
                      src={item.product.images[0]?.url}
                      alt={item.product.title}
                      className="w-20 h-24 object-cover rounded-xl bg-neutral-100 border border-neutral-100"
                    />

                    <div className="flex-1 flex flex-col justify-between text-xs">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-neutral-900 line-clamp-1">{item.product.title}</h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-neutral-400 hover:text-rose-600 transition p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {item.size && <p className="text-neutral-500 mt-0.5">Size: {item.size}</p>}
                        {item.color && <p className="text-neutral-500">Color: {item.color}</p>}
                      </div>

                      <div className="flex justify-between items-end pt-2">
                        <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="p-1.5 hover:bg-neutral-100 text-neutral-600 transition"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-xs font-bold text-neutral-900">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-neutral-100 text-neutral-600 transition"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-sm font-bold text-neutral-900">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer & Checkout */}
            {cart.length > 0 && (
              <div className="p-6 bg-neutral-50 border-t border-neutral-200 space-y-4">
                {/* Coupon input */}
                <div>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Tag className="w-3.5 h-3.5" /> Coupon &apos;{appliedCoupon.code}&apos; Applied (-{appliedCoupon.discountValue}%)
                      </span>
                      <button onClick={removeCoupon} className="font-bold text-rose-600 hover:underline">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Promo Coupon (e.g. ANGEL10)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs uppercase bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-amber-600"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-bold uppercase hover:bg-amber-700 transition"
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

                {/* Order Math Summary */}
                <div className="space-y-1.5 text-xs text-neutral-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium text-neutral-900">{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Estimated Shipping</span>
                    <span>{shippingFee === 0 ? <strong className="text-emerald-700">FREE</strong> : formatPrice(shippingFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Tax (18% GST)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-neutral-900 pt-2 border-t border-neutral-200">
                    <span>Total</span>
                    <span className="text-amber-800">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckoutClick}
                  className="w-full py-4 bg-neutral-950 text-white rounded-xl font-bold text-xs uppercase tracking-[0.15em] hover:bg-amber-700 transition flex items-center justify-center gap-2 shadow-xl cursor-pointer"
                >
                  {!user && <Lock className="w-3.5 h-3.5 text-amber-400" />}
                  <span>PROCEED TO CHECKOUT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auth Required Security Modal */}
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        redirectPath="/checkout"
      />
    </>
  );
};
