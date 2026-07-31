'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { ProductCard } from '@/components/store/ProductCard';

export default function WishlistPage() {
  const { wishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-neutral-200 pb-6 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-amber-700 font-bold">SAVED COUTURE</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 mt-1">
            My Wishlist ({wishlist.length})
          </h1>
        </div>

        {wishlist.length > 0 && (
          <button
            onClick={clearWishlist}
            className="text-xs font-semibold text-neutral-500 hover:text-rose-600 flex items-center gap-1.5 transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Wishlist</span>
          </button>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-3xl border border-neutral-100 p-8 space-y-4">
          <Heart className="w-16 h-16 text-neutral-300 mx-auto stroke-1" />
          <h2 className="font-serif text-2xl font-bold text-neutral-900">Your wishlist is empty</h2>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Explore our latest collections and save your favorite evening gowns, jewellery, and accessories.
          </p>
          <Link
            href="/shop"
            className="inline-block px-8 py-4 bg-neutral-950 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-amber-700 transition shadow-lg"
          >
            DISCOVER CATALOGUE
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
