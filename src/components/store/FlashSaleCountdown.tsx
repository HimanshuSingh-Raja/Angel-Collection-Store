'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, ArrowRight, Timer } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { Product } from '@/types';
import { getStorefrontProductsAction } from '@/actions/product-store';

interface FlashSaleCountdownProps {
  products?: Product[];
}

export const FlashSaleCountdown: React.FC<FlashSaleCountdownProps> = ({ products: initialProducts }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });
  const [productsList, setProductsList] = useState<Product[]>(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts || initialProducts.length === 0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setProductsList(initialProducts);
      setLoading(false);
      return;
    }

    async function loadLiveProducts() {
      setLoading(true);
      try {
        const live = await getStorefrontProductsAction();
        if (live && live.length > 0) {
          setProductsList(live as Product[]);
        }
      } catch (e) {
        console.error('Error fetching live flash sale products:', e);
      } finally {
        setLoading(false);
      }
    }

    loadLiveProducts();
  }, [initialProducts]);

  const flashSaleProducts = productsList.filter(
    (p) => p.compareAtPrice && p.compareAtPrice > p.price
  );

  const displayProducts = flashSaleProducts.length > 0 ? flashSaleProducts : productsList;

  return (
    <section className="py-16 bg-neutral-950 text-white border-y border-neutral-800 relative overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Live Countdown */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 border-b border-neutral-800 pb-8">
          <div>
            <div className="flex items-center gap-2 text-rose-500 font-semibold text-xs tracking-widest uppercase mb-2">
              <Flame className="w-4 h-4 animate-bounce" />
              <span>LIMITED TIME PRIVILEGE EVENT</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Today&apos;s Flash Deals
            </h2>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-3 bg-neutral-900 px-6 py-3 rounded-2xl border border-neutral-800 shadow-xl">
            <Timer className="w-5 h-5 text-amber-400" />
            <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Ends in:</span>
            <div className="flex items-center space-x-2 font-mono font-bold text-amber-300 text-lg">
              <span className="bg-neutral-800 px-2.5 py-1 rounded-lg border border-neutral-700">
                {String(timeLeft.hours).padStart(2, '0')}h
              </span>
              <span>:</span>
              <span className="bg-neutral-800 px-2.5 py-1 rounded-lg border border-neutral-700">
                {String(timeLeft.minutes).padStart(2, '0')}m
              </span>
              <span>:</span>
              <span className="bg-rose-900/50 text-rose-400 px-2.5 py-1 rounded-lg border border-rose-700/50">
                {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProducts.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/shop?onSale=true"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-widest rounded-full hover:bg-amber-300 transition shadow-lg cursor-pointer"
          >
            <span>VIEW ALL PRIVILEGE DEALS</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
