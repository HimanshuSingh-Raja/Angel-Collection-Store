'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, ShoppingBag, Truck, Tag } from 'lucide-react';
import { INITIAL_BANNERS } from '@/lib/mock-data';

export const HeroSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % INITIAL_BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % INITIAL_BANNERS.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + INITIAL_BANNERS.length) % INITIAL_BANNERS.length);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 40;

    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const activeBanner = INITIAL_BANNERS[currentSlide];

  // Category quick-nav pills
  const categoriesPills = [
    { name: 'Women', icon: '👗', href: '/shop?category=women' },
    { name: 'Men', icon: '👔', href: '/shop?category=men' },
    { name: 'Bags', icon: '👜', href: '/shop?category=bags' },
    { name: 'Shoes', icon: '👟', href: '/shop?category=shoes' },
    { name: 'Watches', icon: '⌚', href: '/shop?category=watches' },
    { name: 'Jewellery', icon: '💍', href: '/shop?category=jewellery' },
    { name: 'Beauty', icon: '🧴', href: '/shop?category=beauty' },
  ];

  // Promotional feature cards
  const promoCards = [
    {
      title: 'New Season 2026',
      subtitle: 'Haute Couture Edit',
      tag: 'NEW ARRIVALS',
      link: '/shop?collection=new-arrivals',
      bg: 'bg-gradient-to-br from-neutral-900 via-neutral-800 to-amber-950 text-white',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: Sparkles,
    },
    {
      title: 'Privilege Sale',
      subtitle: 'Up to 40% Off Select Couture',
      tag: 'LIMITED TIME',
      link: '/shop?onSale=true',
      bg: 'bg-gradient-to-br from-rose-950 via-neutral-900 to-neutral-950 text-white',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      icon: Tag,
    },
    {
      title: 'Italian Bags',
      subtitle: 'Tuscan Artisanal Craft',
      tag: 'HANDMADE',
      link: '/shop?category=bags',
      bg: 'bg-gradient-to-br from-amber-950 via-neutral-900 to-neutral-900 text-white',
      badgeColor: 'bg-amber-400/20 text-amber-200 border-amber-400/30',
      icon: ShoppingBag,
    },
    {
      title: 'Express Courier',
      subtitle: 'Complimentary Insured Shipping',
      tag: 'VIP SERVICE',
      link: '/about',
      bg: 'bg-gradient-to-br from-neutral-900 via-neutral-900 to-emerald-950 text-white',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: Truck,
    },
  ];

  return (
    <div className="w-full space-y-4 sm:space-y-6 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-4">
      {/* 1. LUXURY MOBILE HERO BANNER (Zara / Louis Vuitton Aesthetic: Edge-to-Edge Image, Lower Left Text, 440px Mobile Height) */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full h-[440px] sm:h-[480px] lg:h-[540px] bg-[#0F1218] rounded-2xl sm:rounded-3xl overflow-hidden border border-neutral-800 shadow-xl"
      >
        {/* Full-bleed Edge-to-Edge Background Image */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={activeBanner.imageUrl}
              alt={activeBanner.title}
              className="w-full h-full object-cover object-center sm:object-[center_top]"
            />
            {/* Soft Bottom Gradient Overlay for High Contrast Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent z-10" />
          </motion.div>
        </AnimatePresence>

        {/* Lower Left Floating Content Overlay */}
        <div className="absolute bottom-10 left-4 right-4 sm:bottom-14 sm:left-10 z-20 max-w-xl space-y-2.5 sm:space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/40 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] text-amber-300 shadow-sm">
              ✦ HAUTE COUTURE 2026
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="space-y-1.5"
            >
              <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight drop-shadow-md">
                {activeBanner.title}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-200 font-light leading-relaxed line-clamp-2 max-w-md drop-shadow-sm">
                {activeBanner.subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Action Buttons (Height 44px, Rounded, Compact) */}
          <div className="flex items-center gap-2.5 pt-1">
            <Link
              href={activeBanner.link || '/shop'}
              className="h-11 px-6 bg-amber-400 text-neutral-950 text-xs font-bold tracking-widest uppercase rounded-full hover:bg-white transition duration-200 flex items-center justify-center gap-1.5 shadow-lg shadow-amber-400/10 cursor-pointer"
            >
              <span>SHOP NOW</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/shop?collection=new-arrivals"
              className="h-11 px-6 bg-white/15 border border-white/30 text-white text-xs font-bold tracking-widest uppercase rounded-full hover:bg-white/30 transition duration-200 backdrop-blur-md flex items-center justify-center cursor-pointer"
            >
              EXPLORE
            </Link>
          </div>
        </div>

        {/* Floating Luxury Badge (Desktop) */}
        <div className="absolute top-6 right-6 z-20 hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-xl bg-black/50 backdrop-blur-md border border-white/20 shadow-xl text-white">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <div className="text-left">
            <p className="text-[9px] uppercase font-bold tracking-widest text-amber-300">CURATED EDIT</p>
            <p className="text-xs font-serif font-bold text-white">Angel Sovereign Collection</p>
          </div>
        </div>

        {/* Previous / Next Desktop Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/40 text-white hover:bg-amber-400 hover:text-neutral-950 transition backdrop-blur-md border border-white/20 cursor-pointer"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/40 text-white hover:bg-amber-400 hover:text-neutral-950 transition backdrop-blur-md border border-white/20 cursor-pointer"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Slider Indicator Dots (Bottom Center) */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-2">
          {INITIAL_BANNERS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentSlide ? 'w-6 bg-amber-400' : 'w-2 bg-white/50 hover:bg-white'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 2. HORIZONTAL CATEGORY QUICK-NAV PILLS BELOW HERO */}
      <div className="w-full">
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1">
          {categoriesPills.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="px-3 py-2 rounded-xl bg-white border border-neutral-200/80 shadow-xs hover:border-amber-600 transition flex items-center gap-1.5 shrink-0 group"
            >
              <span className="text-sm">{cat.icon}</span>
              <span className="text-[11px] font-bold text-neutral-800 group-hover:text-amber-800 uppercase tracking-wider">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* 3. 4 PROMOTIONAL CARDS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {promoCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.link}
              className={`p-3.5 sm:p-5 rounded-2xl ${card.bg} border border-neutral-800 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-2 group`}
            >
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-bold uppercase tracking-widest border ${card.badgeColor}`}>
                  {card.tag}
                </span>
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400 group-hover:text-amber-400 transition-colors" />
              </div>

              <div>
                <h3 className="font-serif font-bold text-xs sm:text-base leading-snug group-hover:text-amber-300 transition-colors line-clamp-1">
                  {card.title}
                </h3>
                <p className="text-[10px] sm:text-xs text-neutral-400 font-light mt-0.5 line-clamp-1">{card.subtitle}</p>
              </div>

              <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                <span>Explore</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
