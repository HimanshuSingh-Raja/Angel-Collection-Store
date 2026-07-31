'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Star, Instagram, ShieldCheck, Award, Heart, CheckCircle2, Flame, Clock, Mail, Check } from 'lucide-react';
import { HeroSlider } from '@/components/store/HeroSlider';
import { FlashSaleCountdown } from '@/components/store/FlashSaleCountdown';
import { ProductCard } from '@/components/store/ProductCard';
import { QuickViewModal } from '@/components/store/QuickViewModal';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_BRANDS, INITIAL_REVIEWS } from '@/lib/mock-data';
import { Product } from '@/types';

export default function HomePage() {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const newArrivals = INITIAL_PRODUCTS.filter((p) => p.isNewArrival);
  const bestSellers = INITIAL_PRODUCTS.filter((p) => p.isBestSeller);
  const trending = INITIAL_PRODUCTS.filter((p) => p.isTrending);
  const flashSaleProducts = INITIAL_PRODUCTS.filter((p) => p.compareAtPrice && p.compareAtPrice > p.price);
  const jewellery = INITIAL_PRODUCTS.filter((p) => p.categoryId === 'cat-jewellery');
  const bags = INITIAL_PRODUCTS.filter((p) => p.categoryId === 'cat-bags');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
    }
  };

  const circleCategories = [
    { name: 'Women', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=300&q=80', href: '/shop?category=women' },
    { name: 'Men', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=300&q=80', href: '/shop?category=men' },
    { name: 'Jewellery', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&q=80', href: '/shop?category=jewellery' },
    { name: 'Bags', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&q=80', href: '/shop?category=bags' },
    { name: 'Shoes', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&q=80', href: '/shop?category=shoes' },
    { name: 'Watches', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&q=80', href: '/shop?category=watches' },
    { name: 'Beauty', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&q=80', href: '/shop?category=beauty' },
    { name: 'Accessories', image: 'https://images.unsplash.com/photo-1611591475179-42cd345f092e?w=300&q=80', href: '/shop?category=accessories' },
  ];

  return (
    <div className="space-y-8 sm:space-y-14 pb-16 font-sans">
      {/* SECTION 1: HERO SLIDER */}
      <HeroSlider />

      {/* SECTION 2: SHOP BY CATEGORY (CIRCLE ICONS) */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="text-center mb-4 sm:mb-6">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-bold text-amber-700">CURATED HOUSES</span>
          <h2 className="font-serif text-xl sm:text-3xl font-bold tracking-tight text-neutral-900 mt-0.5">
            Shop By Category
          </h2>
        </div>

        <div className="flex items-center justify-between sm:justify-center gap-4 sm:gap-10 overflow-x-auto no-scrollbar py-2 px-1">
          {circleCategories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="flex flex-col items-center group shrink-0"
            >
              <div className="w-14 h-14 sm:w-22 sm:h-22 rounded-full p-0.5 sm:p-1 border-2 border-neutral-200 group-hover:border-amber-600 transition-all duration-300 shadow-xs group-hover:shadow-md bg-white">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-neutral-800 group-hover:text-amber-800 mt-1.5 tracking-wider uppercase text-center">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 3: FLASH DEALS */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="bg-neutral-950 rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-white border border-neutral-800 shadow-xl space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3 sm:pb-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
              </span>
              <div>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-rose-400 font-bold">LIMITED QUANTITIES</span>
                <h3 className="font-serif text-lg sm:text-2xl font-bold text-white">Privilege Flash Deals</h3>
              </div>
            </div>

            <Link
              href="/shop?onSale=true"
              className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-400 hover:text-white flex items-center gap-1"
            >
              <span>View All Deals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Horizontal Product Scroll */}
          <div className="flex gap-3 sm:gap-6 overflow-x-auto no-scrollbar pb-1">
            {flashSaleProducts.map((prod) => (
              <div key={prod.id} className="w-[180px] sm:w-[260px] shrink-0">
                <ProductCard
                  product={prod}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: NEW ARRIVALS (2 COLUMNS MOBILE) */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 sm:mb-8 pb-3 sm:pb-4 border-b border-neutral-200">
          <div>
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-amber-700 font-bold">SPRING / SUMMER 2026</span>
            <h2 className="font-serif text-xl sm:text-3xl font-bold tracking-tight text-neutral-900 mt-0.5">New Arrivals</h2>
          </div>
          <Link
            href="/shop?collection=new-arrivals"
            className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-900 hover:text-amber-700 flex items-center gap-1 mt-1 sm:mt-0"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {newArrivals.slice(0, 4).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* SECTION 5: LUXURY COLLECTIONS */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Card 1: Aurora Fine Jewellery */}
          <div className="group relative aspect-[16/11] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-neutral-800 bg-neutral-950">
            <img
              src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1000&q=80"
              alt="Aurora Fine Jewellery"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-95"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 sm:p-8 flex flex-col justify-end">
              <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[9px] sm:text-[10px] font-bold tracking-widest uppercase w-max mb-1.5">
                FINE JEWELLERY HOUSE
              </span>
              <h3 className="font-serif text-xl sm:text-3xl font-bold text-white group-hover:text-amber-300 transition leading-snug">
                18K Solid Gold & Solitaires
              </h3>
              <p className="text-[11px] sm:text-xs text-neutral-300 font-light mt-1 max-w-md line-clamp-2">
                Handcrafted GIA solitaires and Florentine gold pendants for timeless privilege.
              </p>
              <div className="mt-3 sm:mt-4">
                <Link
                  href="/shop?category=jewellery"
                  className="inline-flex items-center gap-1.5 px-4 sm:px-6 py-2.5 sm:py-3 bg-amber-400 text-neutral-950 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-full hover:bg-white transition"
                >
                  <span>SHOP JEWELLERY</span>
                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: Tuscan Leather Collection */}
          <div className="group relative aspect-[16/11] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-neutral-800 bg-neutral-950">
            <img
              src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1000&q=80"
              alt="Tuscan Leather Bags"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-95"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 sm:p-8 flex flex-col justify-end">
              <span className="px-2.5 py-0.5 bg-amber-400/20 text-amber-200 border border-amber-400/30 rounded-full text-[9px] sm:text-[10px] font-bold tracking-widest uppercase w-max mb-1.5">
                ITALIAN CRAFTSMANSHIP
              </span>
              <h3 className="font-serif text-xl sm:text-3xl font-bold text-white group-hover:text-amber-300 transition leading-snug">
                Tuscan Leather Handbags
              </h3>
              <p className="text-[11px] sm:text-xs text-neutral-300 font-light mt-1 max-w-md line-clamp-2">
                Full-grain calfskin totes & top-handle bags hand-stitched by Italian masters.
              </p>
              <div className="mt-3 sm:mt-4">
                <Link
                  href="/shop?category=bags"
                  className="inline-flex items-center gap-1.5 px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-neutral-950 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-full hover:bg-amber-400 transition"
                >
                  <span>SHOP LEATHER BAGS</span>
                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: TRENDING PRODUCTS (2 COLUMNS MOBILE) */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 sm:mb-8 pb-3 sm:pb-4 border-b border-neutral-200">
          <div>
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-amber-700 font-bold">MOST COVETED</span>
            <h2 className="font-serif text-xl sm:text-3xl font-bold tracking-tight text-neutral-900 mt-0.5">Trending Products</h2>
          </div>
          <Link
            href="/shop"
            className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-900 hover:text-amber-700 flex items-center gap-1 mt-1 sm:mt-0"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {trending.slice(0, 4).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* SECTION 7: SHOP BY BRAND */}
      <section className="bg-neutral-100 py-8 sm:py-12 border-y border-neutral-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <p className="text-center text-[10px] sm:text-xs uppercase tracking-[0.3em] font-bold text-neutral-400 mb-6">
            SHOP BY DESIGNER HOUSES
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 text-center">
            {INITIAL_BRANDS.map((b) => (
              <Link
                key={b.id}
                href={`/shop?brand=${b.slug}`}
                className="p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl border border-neutral-200/80 shadow-xs font-serif text-sm sm:text-lg font-bold text-neutral-900 tracking-wider hover:border-amber-700 transition"
              >
                {b.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: NEWSLETTER SIGNUP */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="bg-[#0F1218] rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-white border border-neutral-800 shadow-xl text-center space-y-4 sm:space-y-6">
          <div className="max-w-xl mx-auto space-y-2">
            <span className="px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em]">
              ANGEL PRIVILEGE CLUB
            </span>
            <h2 className="font-serif text-xl sm:text-4xl font-bold tracking-tight text-white">
              Subscribe For Exclusive VIP Access
            </h2>
            <p className="text-xs text-neutral-300 font-light leading-relaxed">
              Receive private invitations to haute couture collection launches, secret seasonal sales, and 10% off your first order.
            </p>
          </div>

          {newsletterSubscribed ? (
            <div className="inline-flex items-center gap-2 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Welcome to Angel Privilege Club! Code ANGEL10 activated.</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2.5">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="flex-1 px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-500 font-sans"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-white transition shrink-0 cursor-pointer"
              >
                JOIN VIP CLUB
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
