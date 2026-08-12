'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, ArrowUpRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getLowStockProductsAction } from '@/actions/product-admin';

export const LowStockAlerts: React.FC = () => {
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAlerts() {
      setLoading(true);
      try {
        const items = await getLowStockProductsAction();
        setLowStockItems(items);
      } catch (e) {
        console.error('Failed to load low stock alerts:', e);
      } finally {
        setLoading(false);
      }
    }
    loadAlerts();
  }, []);

  return (
    <div className="bg-admin-card p-6 rounded-2xl border border-admin-border shadow-lg space-y-4 font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-amber-400">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="font-serif text-lg font-bold text-white tracking-tight">Low Stock Alerts</h3>
        </div>
        <span className="text-[10px] font-mono text-neutral-400">PRISMA LIVE</span>
      </div>
      <p className="text-xs text-admin-muted">Products requiring inventory reordering</p>

      {loading ? (
        <div className="flex items-center justify-center py-6 text-admin-muted text-xs gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          <span>Checking database inventory...</span>
        </div>
      ) : lowStockItems.length > 0 ? (
        <div className="space-y-3">
          {lowStockItems.map((prod) => (
            <div
              key={prod.id}
              className="flex items-center justify-between p-3 rounded-xl bg-admin-bg border border-admin-border"
            >
              <div className="flex items-center space-x-3">
                <img src={prod.imageUrl} alt="" className="w-10 aspect-[1080/1455] object-cover rounded-lg" />
                <div>
                  <p className="text-xs font-semibold text-white line-clamp-1">{prod.title}</p>
                  <span className="text-[10px] text-admin-muted">SKU: {prod.sku}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[10px] font-bold border border-rose-500/20">
                  {prod.stock} left
                </span>
                <Link
                  href="/admin/products"
                  className="p-1 rounded text-admin-muted hover:text-white transition"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-emerald-400 py-4 text-center">All inventory levels are healthy!</p>
      )}
    </div>
  );
};
