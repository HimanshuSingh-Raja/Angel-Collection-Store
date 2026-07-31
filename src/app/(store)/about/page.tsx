'use client';

import React from 'react';
import Link from 'next/link';
import { Award, ShieldCheck, Heart, Sparkles, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] bg-neutral-950 text-white flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
        <img
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1920"
          alt="Haute Couture Workshop"
          className="w-full h-full object-cover"
        />
        <div className="relative z-20 text-center max-w-3xl px-4 space-y-4">
          <span className="text-xs uppercase tracking-[0.35em] text-amber-400 font-bold">OUR HERITAGE</span>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight">Elegance Redefined</h1>
          <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
            Founded with a vision to merge Italian silk craftsmanship with contemporary minimalist luxury.
          </p>
        </div>
      </section>

      {/* Main Philosophy */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-widest text-amber-700 font-bold">BESPOKE CRAFTSMANSHIP</span>
            <h2 className="font-serif text-3xl font-bold text-neutral-900">Tailored by Artisans in Milan & Paris</h2>
            <p className="text-xs text-neutral-600 leading-relaxed font-light">
              At Angel Collection, every gown, tuxedo, and piece of fine jewellery undergoes over 40 hours of painstaking handcraftsmanship. We source 100% pure Mulberry silk, Mongolian cashmere, and GIA-certified solitaire diamonds.
            </p>
          </div>
          <img
            src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800"
            alt="Jewellery Craftsmanship"
            className="rounded-3xl shadow-xl border border-neutral-200"
          />
        </div>
      </section>

      {/* Pillars */}
      <section className="bg-neutral-950 py-16 text-white border-y border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3">
            <Award className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <h3 className="font-serif text-xl font-bold">Haute Couture Standards</h3>
            <p className="text-xs text-neutral-400 font-light leading-relaxed">
              Every garment follows classical French & Italian couture patterns with reinforced silk linings.
            </p>
          </div>
          <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3">
            <ShieldCheck className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <h3 className="font-serif text-xl font-bold">100% Conflict-Free Solitaires</h3>
            <p className="text-xs text-neutral-400 font-light leading-relaxed">
              Ethically sourced 18K solid gold and Kimberly-certified diamonds for zero-environmental impact.
            </p>
          </div>
          <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3">
            <Heart className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <h3 className="font-serif text-xl font-bold">VIP Concierge Service</h3>
            <p className="text-xs text-neutral-400 font-light leading-relaxed">
              Dedicated personal stylists, home try-ons, and lifetime warranty on fine jewellery.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
