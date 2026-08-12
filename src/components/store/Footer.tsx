'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Instagram,
  Facebook,
  Mail,
  Phone,
  ShieldCheck,
  RefreshCw,
  Award,
  Lock,
  ArrowRight,
  Check,
  MapPin,
} from 'lucide-react';
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

            <div className="space-y-3.5 text-xs">
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

              {/* Physical Store Address Display */}
              <div className="flex items-start space-x-3 text-neutral-300 p-1.5 -ml-1.5 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block font-mono">
                    Visit Our Store
                  </span>
                  <p className="text-xs text-neutral-300 leading-relaxed font-sans mt-0.5 max-w-sm">
                    Shop No 503, Mahalaxmi Building, Sankeshwar Nagar, Near St. Aloysius High School, Nallasopara East, Maharashtra, India – 401209
                  </p>
                </div>
              </div>
            </div>

            {/* Official Social Media Buttons */}
            <div className="flex items-center space-x-3 pt-2 flex-wrap gap-y-2">
              {/* Instagram */}
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

              {/* Facebook */}
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

              {/* WhatsApp */}
              <a
                href="https://api.whatsapp.com/send?phone=917758913828"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 hover:text-emerald-400 hover:border-emerald-500/60 hover:scale-110 transition duration-200 cursor-pointer shadow-lg"
                aria-label="Chat with Angel Collection on WhatsApp"
                title="WhatsApp Chat +91 7758913828"
              >
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </a>

              {/* Pinterest */}
              <a
                href="https://in.pinterest.com/angelcollectionsb4u/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 hover:text-rose-400 hover:border-rose-500/60 hover:scale-110 transition duration-200 cursor-pointer shadow-lg"
                aria-label="Official Angel Collection Pinterest Page"
                title="Pinterest @angelcollectionsb4u"
              >
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.62 0 12.017 0z" />
                </svg>
              </a>

              {/* Email Button */}
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
