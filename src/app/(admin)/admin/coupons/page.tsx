'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { getAdminCouponsAction, createCouponAction, deleteCouponAction } from '@/actions/coupon-admin';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');
  const [type, setType] = useState<'PERCENTAGE' | 'FLAT'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('');

  useEffect(() => {
    async function loadCoupons() {
      setLoading(true);
      try {
        const liveCoupons = await getAdminCouponsAction();
        setCoupons(liveCoupons);
      } catch (e) {
        console.error('Failed to load coupons:', e);
      } finally {
        setLoading(false);
      }
    }
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue) return;
    try {
      const res = await createCouponAction({
        code,
        type,
        discountValue: parseFloat(discountValue),
      });
      if (res.success && res.coupon) {
        setCoupons([res.coupon, ...coupons]);
        setCode('');
        setDiscountValue('');
        setShowModal(false);
      }
    } catch (err) {
      console.error('Failed to create coupon:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      await deleteCouponAction(id);
    }
  };

  return (
    <div className="space-y-8 font-sans text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-admin-border">
        <div>
          <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block font-bold">PROMOTIONS & DISCOUNTS</span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white mt-1">Coupons Management</h1>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-amber-500 text-neutral-950 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-amber-400 transition shadow-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-admin-muted text-xs gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          <span>Fetching database coupons...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((c) => (
            <div key={c.id} className="bg-admin-card p-6 rounded-2xl border border-admin-border space-y-4 relative shadow-lg">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-sm rounded-lg flex items-center gap-2">
                  <Tag className="w-4 h-4" /> {c.code}
                </span>
                <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg bg-admin-bg text-admin-muted hover:text-rose-400 cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-xl font-bold text-white">
                  {c.type === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `${formatPrice(c.discountValue)} OFF`}
                </p>
                <p className="text-admin-muted text-[11px]">Min. Purchase: {formatPrice(c.minPurchase || 0)}</p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-2 border-t border-admin-border font-mono">
                <span>Used {c.timesUsed} times</span>
                <span className="text-emerald-400">ACTIVE</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateCoupon} className="bg-admin-card p-6 rounded-2xl border border-admin-border max-w-md w-full space-y-4">
            <h3 className="font-serif text-lg font-bold text-white">Create Promotional Coupon</h3>
            <div>
              <label className="font-bold text-admin-muted block mb-1">Coupon Code *</label>
              <input
                type="text"
                required
                placeholder="ANGEL20"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-admin-bg text-amber-400 font-mono font-bold rounded-xl border border-admin-border"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-admin-muted block mb-1">Discount Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-admin-bg text-white rounded-xl border border-admin-border"
                >
                  <option value="PERCENTAGE">PERCENTAGE (%)</option>
                  <option value="FLAT">FLAT AMOUNT (₹)</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-admin-muted block mb-1">Value *</label>
                <input
                  type="number"
                  required
                  placeholder="20"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="w-full px-3 py-2 bg-admin-bg text-white rounded-xl border border-admin-border"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-admin-bg text-admin-muted rounded-xl cursor-pointer">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-amber-500 text-neutral-950 font-bold rounded-xl cursor-pointer">
                Create Coupon
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
