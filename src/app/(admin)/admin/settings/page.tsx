'use client';

import React, { useState } from 'react';
import { Save, Store, Shield } from 'lucide-react';
import { RolePermissionMatrix } from '@/components/admin/RolePermissionMatrix';

export default function AdminSettingsPage() {
  const [storeInfo, setStoreInfo] = useState({
    name: 'Angel Collection',
    email: 'concierge@angelcollection.com',
    phone: '+91 98765 43210',
    gstin: '27AABCA1234D1ZM',
    currency: 'INR (₹)',
    shippingCharge: '350',
    freeShippingThreshold: '5000',
    address: '742 Park Avenue, Penthouse 4B, South Mumbai, MH 400001',
  });

  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-admin-border">
        <div>
          <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block">SYSTEM CONFIGURATION</span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white mt-1">Store Settings & Access Control</h1>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-admin-card p-6 sm:p-8 rounded-2xl border border-admin-border space-y-6 shadow-lg">
        <div className="flex justify-between items-center pb-4 border-b border-admin-border">
          <div className="flex items-center gap-2 text-amber-400">
            <Store className="w-5 h-5" />
            <h3 className="font-serif text-lg font-bold text-white">General Store Profile</h3>
          </div>

          <button
            type="submit"
            className="px-5 py-2 bg-amber-500 text-neutral-950 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-amber-400 transition"
          >
            <Save className="w-4 h-4" />
            <span>{saved ? 'SETTINGS SAVED' : 'SAVE SETTINGS'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <label className="font-bold text-admin-muted block mb-1">Store Platform Name</label>
            <input
              type="text"
              value={storeInfo.name}
              onChange={(e) => setStoreInfo({ ...storeInfo, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-admin-bg text-white rounded-xl border border-admin-border"
            />
          </div>
          <div>
            <label className="font-bold text-admin-muted block mb-1">Concierge Email</label>
            <input
              type="email"
              value={storeInfo.email}
              onChange={(e) => setStoreInfo({ ...storeInfo, email: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-admin-bg text-white rounded-xl border border-admin-border"
            />
          </div>
          <div>
            <label className="font-bold text-admin-muted block mb-1">Official GSTIN</label>
            <input
              type="text"
              value={storeInfo.gstin}
              onChange={(e) => setStoreInfo({ ...storeInfo, gstin: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-admin-bg text-amber-400 font-mono rounded-xl border border-admin-border"
            />
          </div>
          <div>
            <label className="font-bold text-admin-muted block mb-1">Free Shipping Threshold (₹)</label>
            <input
              type="number"
              value={storeInfo.freeShippingThreshold}
              onChange={(e) => setStoreInfo({ ...storeInfo, freeShippingThreshold: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-admin-bg text-white rounded-xl border border-admin-border"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="font-bold text-admin-muted block mb-1">Flagship Address</label>
            <input
              type="text"
              value={storeInfo.address}
              onChange={(e) => setStoreInfo({ ...storeInfo, address: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-admin-bg text-white rounded-xl border border-admin-border"
            />
          </div>
        </div>
      </form>

      {/* Role Permission Matrix */}
      <RolePermissionMatrix />
    </div>
  );
}
