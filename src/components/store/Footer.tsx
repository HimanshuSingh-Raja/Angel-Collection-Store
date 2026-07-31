'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Instagram, Facebook, Mail, Phone, ShieldCheck, RefreshCw, Award, Lock, ArrowRight, Check } from 'lucide-react';
import { AngelLogo } from '@/components/common/AngelLogo';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-neutral-950 text-white font-sans border-t border-neutral-800">
      {/* Brand Values Header Banner */}
      <div className="border-b border-neutral-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start space-y-2">
            <ShieldCheck className="w-8 h-8 text-amber-400 mb-1" />
            <h4 className="text-sm font-semibold tracking-wider uppercase text-neutral-100">100% Certified Luxury</h4>
            <p className="text-xs text-neutral-400">Authentic haute couture & conflict-free diamonds guaranteed.</p>
          </div>
          <div className="flex flex-col items-center md:items-start space-y-2">
            <RefreshCw className="w-8 h-8 text-amber-400 mb-1" />
            <h4 className="text-sm font-semibold tracking-wider uppercase text-neutral-100">30-Day Easy Returns</h4>
            <p className="text-xs text-neutral-400">Complimentary home pickup for worry-free exchanges.</p>
          </div>
          <div className="flex flex-col items-center md:items-start space-y-2">
            <Award className="w-8 h-8 text-amber-400 mb-1" />
            <h4 className="text-sm font-semibold tracking-wider uppercase text-neutral-100">Bespoke Craftsmanship</h4>
            <p className="text-xs text-neutral-400">Tailored by master artisans in Milan, Paris, and Jaipur.</p>
          </div>
          <div className="flex flex-col items-center md:items-start space-y-2">
            <Lock className="w-8 h-8 text-amber-400 mb-1" />
            <h4 className="text-sm font-semibold tracking-wider uppercase text-neutral-100">Secure Payments</h4>
            <p className="text-xs text-neutral-400">Razorpay 256-bit encrypted checkout & COD support.</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
        {/* Brand Info & Connect With Us */}
        <div className="lg:col-span-2 space-y-6">
          <AngelLogo variant="dark" />
          <p className="text-xs leading-relaxed text-neutral-400 max-w-sm">
            Angel Collection is an international luxury fashion house bringing together contemporary elegance, fine jewellery, Italian silk couture, and handcrafted leather goods.
          </p>

          {/* CONNECT WITH US SECTION */}
          <div className="space-y-4 pt-4 border-t border-neutral-900">
            <div>
              <h4 className="text-sm font-semibold tracking-wider text-white font-serif flex items-center gap-2">
                <span className="text-amber-400">✦</span> Connect With Us
              </h4>
              <p className="text-[11px] text-neutral-400 font-light mt-1 leading-relaxed">
                We&apos;re here to help. Reach out to us for orders, support, collaborations, or any questions.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              {/* Phone Direct Call Link */}
              <a
                href="tel:+917620994257"
                className="flex items-center space-x-3 text-neutral-300 hover:text-amber-400 transition group p-1.5 -ml-1.5 rounded-xl hover:bg-neutral-900/80 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400 group-hover:border-amber-500/60 group-hover:scale-105 transition shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="font-mono font-bold tracking-wider text-white group-hover:text-amber-400">
                  +91 7620994257
                </span>
              </a>

              {/* Email Direct Mailto Link */}
              <a
                href="mailto:angelcollections.b4u@gmail.com"
                className="flex items-center space-x-3 text-neutral-300 hover:text-amber-400 transition group p-1.5 -ml-1.5 rounded-xl hover:bg-neutral-900/80 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400 group-hover:border-amber-500/60 group-hover:scale-105 transition shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="font-mono font-medium text-neutral-300 group-hover:text-amber-400 break-all">
                  angelcollections.b4u@gmail.com
                </span>
              </a>
            </div>

            {/* Official Social Media Buttons */}
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://www.instagram.com/angelcollections.b4u/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 hover:text-amber-400 hover:border-amber-500/60 hover:scale-110 transition duration-200 cursor-pointer shadow-lg"
                aria-label="Official Angel Collection Instagram Page"
                title="Instagram @angelcollections.b4u"
              >
                <Instagram className="w-4.5 h-4.5" />
              </a>

              <a
                href="https://www.facebook.com/angelcollection.b4u"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 hover:text-amber-400 hover:border-amber-500/60 hover:scale-110 transition duration-200 cursor-pointer shadow-lg"
                aria-label="Official Angel Collection Facebook Page"
                title="Facebook @angelcollection.b4u"
              >
                <Facebook className="w-4.5 h-4.5" />
              </a>

              <a
                href="mailto:angelcollections.b4u@gmail.com"
                className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 hover:text-amber-400 hover:border-amber-500/60 hover:scale-110 transition duration-200 cursor-pointer shadow-lg"
                aria-label="Send Email to Angel Collection"
                title="Send Email"
              >
                <Mail className="w-4.5 h-4.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-neutral-200 mb-6">Collections</h4>
          <ul className="space-y-3 text-xs text-neutral-400">
            <li><Link href="/shop?category=women" className="hover:text-amber-400 transition">Haute Couture Women</Link></li>
            <li><Link href="/shop?category=men" className="hover:text-amber-400 transition">Tailored Men Suits</Link></li>
            <li><Link href="/shop?category=jewellery" className="hover:text-amber-400 transition">Fine Gold Jewellery</Link></li>
            <li><Link href="/shop?category=bags" className="hover:text-amber-400 transition">Tuscan Leather Bags</Link></li>
            <li><Link href="/shop?category=shoes" className="hover:text-amber-400 transition">Handcrafted Oxfords</Link></li>
          </ul>
        </div>

        {/* Client Care */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-neutral-200 mb-6">Client Service</h4>
          <ul className="space-y-3 text-xs text-neutral-400">
            <li><Link href="/track-order" className="hover:text-amber-400 transition">Track Your Order</Link></li>
            <li><Link href="/faq" className="hover:text-amber-400 transition">Shipping & Delivery</Link></li>
            <li><Link href="/refund-policy" className="hover:text-amber-400 transition">Returns & Exchanges</Link></li>
            <li><Link href="/contact" className="hover:text-amber-400 transition">Contact VIP Support</Link></li>
            <li><Link href="/terms" className="hover:text-amber-400 transition">Terms & Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Privilege Newsletter */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-neutral-200 mb-6">Privilege Club</h4>
          <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
            Subscribe for private runway access and 10% off your first luxury order.
          </p>
          {subscribed ? (
            <div className="flex items-center space-x-2 text-xs text-amber-400 font-semibold bg-amber-950/40 border border-amber-800/60 p-3 rounded-xl">
              <Check className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Privilege Activated! Code ANGEL10</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletter} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition"
                />
                <button
                  type="submit"
                  aria-label="Subscribe to Privilege Club"
                  className="absolute right-2 top-2 p-1.5 rounded-lg bg-amber-500 text-neutral-950 hover:bg-amber-400 transition cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Bottom Legal Copyright Bar */}
      <div className="border-t border-neutral-900 py-6 px-4 sm:px-6 lg:px-8 text-center text-xs text-neutral-500 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto space-y-4 sm:space-y-0">
        <p>© {new Date().getFullYear()} Angel Collection House of Luxury. All rights reserved.</p>
        <div className="flex items-center space-x-6 text-neutral-400">
          <Link href="/privacy-policy" className="hover:text-amber-400 transition">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-amber-400 transition">Terms of Service</Link>
          <Link href="/refund-policy" className="hover:text-amber-400 transition">Refund Policy</Link>
        </div>
      </div>
    </footer>
  );
};
