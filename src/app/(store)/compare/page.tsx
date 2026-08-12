'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, ShoppingBag, Star, Check, X } from 'lucide-react';
import { useCompareStore } from '@/lib/store';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export default function ComparePage() {
  const { compareItems, removeFromCompare, clearCompare } = useCompareStore();
  const { addToCart } = useCart();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-neutral-200 pb-6 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-amber-700 font-bold">HAUTE COUTURE COMPARISON</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 mt-1">
            Compare Luxury Items ({compareItems.length})
          </h1>
        </div>

        {compareItems.length > 0 && (
          <button
            onClick={clearCompare}
            className="text-xs font-semibold text-neutral-500 hover:text-rose-600 flex items-center gap-1.5 transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Comparison</span>
          </button>
        )}
      </div>

      {compareItems.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-3xl border border-neutral-100 p-8 space-y-4">
          <h2 className="font-serif text-2xl font-bold text-neutral-900">No items selected for comparison</h2>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Browse our shop and click &quot;Compare&quot; on any gown, tuxedo, or fine jewellery item to compare specs side-by-side.
          </p>
          <Link
            href="/shop"
            className="inline-block px-8 py-4 bg-neutral-950 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-amber-700 transition shadow-lg"
          >
            BROWSE CATALOGUE
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse bg-white rounded-3xl overflow-hidden border border-neutral-200 text-xs">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="p-4 w-48 font-bold text-neutral-500 uppercase">Product Feature</th>
                {compareItems.map((prod) => (
                  <th key={prod.id} className="p-4 min-w-[220px] text-center border-l border-neutral-200">
                    <div className="relative group">
                      <button
                        onClick={() => removeFromCompare(prod.id)}
                        className="absolute top-0 right-0 p-1 text-neutral-400 hover:text-rose-600"
                        title="Remove from comparison"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <img
                        src={prod.images[0]?.url}
                        alt={prod.title}
                        className="w-28 aspect-[1080/1455] object-cover rounded-xl mx-auto mb-3 border border-neutral-100"
                      />
                      <h4 className="font-serif text-sm font-bold text-neutral-900 line-clamp-1">{prod.title}</h4>
                      <p className="text-amber-800 font-bold text-sm mt-1">{formatPrice(prod.price)}</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-neutral-800">
              <tr>
                <td className="p-4 font-bold text-neutral-500 uppercase">Brand</td>
                {compareItems.map((prod) => (
                  <td key={prod.id} className="p-4 text-center font-semibold border-l border-neutral-200">
                    {prod.brand?.name || 'ANGEL PRIVÉ'}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-neutral-500 uppercase">Category</td>
                {compareItems.map((prod) => (
                  <td key={prod.id} className="p-4 text-center border-l border-neutral-200">
                    {prod.category?.name}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-neutral-500 uppercase">Stock Status</td>
                {compareItems.map((prod) => (
                  <td key={prod.id} className="p-4 text-center border-l border-neutral-200">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                      {prod.stock} Ready To Ship
                    </span>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-neutral-500 uppercase">Rating</td>
                {compareItems.map((prod) => (
                  <td key={prod.id} className="p-4 text-center border-l border-neutral-200">
                    <div className="flex items-center justify-center gap-1 text-amber-600 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{prod.rating}</span>
                    </div>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-neutral-500 uppercase">Materials</td>
                {compareItems.map((prod) => (
                  <td key={prod.id} className="p-4 text-center border-l border-neutral-200 text-neutral-600">
                    {prod.materials?.join(', ') || '100% Italian Silk'}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-neutral-500 uppercase">Available Sizes</td>
                {compareItems.map((prod) => (
                  <td key={prod.id} className="p-4 text-center border-l border-neutral-200">
                    {prod.sizes?.join(', ') || 'XS, S, M, L'}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-neutral-500 uppercase">Action</td>
                {compareItems.map((prod) => (
                  <td key={prod.id} className="p-4 text-center border-l border-neutral-200">
                    <button
                      onClick={() => addToCart(prod)}
                      className="px-4 py-2.5 bg-neutral-950 text-white font-bold text-xs rounded-xl hover:bg-amber-700 transition flex items-center justify-center gap-1.5 mx-auto"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
                      <span>Add To Bag</span>
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
