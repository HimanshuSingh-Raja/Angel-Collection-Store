'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronRight,
  User,
  Heart,
  LogOut,
  Sparkles,
  MapPin,
  Truck,
  HelpCircle,
  MessageCircle,
  LogIn,
  Package,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { AngelLogo } from '@/components/common/AngelLogo';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { wishlist } = useWishlist();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Safely lock body scroll when drawer is active
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevOverflow || '';
    };
  }, [isOpen]);

  // Categories in exact order specified
  const primaryCategories = [
    { name: 'New Arrivals', href: '/shop?collection=new-arrivals', badge: 'NEW', isHighlighted: true },
    { name: 'Women', href: '/shop?category=women' },
    { name: 'Men', href: '/shop?category=men' },
    { name: 'Kids', href: '/shop?category=kids' },
    { name: 'Bags', href: '/shop?category=bags' },
    { name: 'Jewellery', href: '/shop?category=jewellery' },
    { name: 'Beauty', href: '/shop?category=beauty' },
  ];

  // Account / Quick links in exact order specified
  const secondaryLinks = [
    { name: 'Account', href: '/account', icon: User },
    { name: 'Wishlist', href: '/wishlist', icon: Heart, count: wishlist.length },
    { name: 'Orders', href: '/account/orders', icon: Package },
    { name: 'Addresses', href: '/account', icon: MapPin },
    { name: 'Track Order', href: '/track-order', icon: Truck },
    { name: 'Contact', href: '/contact', icon: MessageCircle },
    { name: 'FAQ', href: '/faq', icon: HelpCircle },
  ];

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex font-sans lg:hidden">
          {/* Dark Overlay with Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
          />

          {/* Full Height Drawer (100vh, Width 82%, Max 350px) */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-[82vw] max-w-[350px] h-[100vh] bg-white shadow-2xl flex flex-col justify-between overflow-hidden z-[101] pt-safe"
          >
            {/* Sticky Header with Logo & Sticky Close Button */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-5 py-4 border-b border-neutral-100 flex items-center justify-between shrink-0">
              <AngelLogo variant="mobile" onClick={onClose} />

              <button
                onClick={onClose}
                className="w-11 h-11 rounded-full bg-neutral-100 hover:bg-neutral-900 hover:text-white transition-colors flex items-center justify-center text-neutral-800 shrink-0 cursor-pointer min-h-[44px] min-w-[44px]"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 no-scrollbar overscroll-contain">
              {/* PRIMARY CATEGORIES SECTION */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400 px-2 mb-2">
                  Categories
                </p>
                {primaryCategories.map((cat, idx) => (
                  <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03, duration: 0.2 }}
                  >
                    <Link
                      href={cat.href}
                      onClick={onClose}
                      className="flex items-center justify-between px-3 h-12 rounded-xl text-sm font-semibold tracking-wide text-neutral-900 hover:bg-neutral-50 hover:text-amber-800 transition group min-h-[44px]"
                    >
                      <div className="flex items-center gap-2.5">
                        {cat.isHighlighted && <Sparkles className="w-4 h-4 text-amber-600" />}
                        <span className={cat.isHighlighted ? 'font-bold text-amber-900' : ''}>
                          {cat.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {cat.badge && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-950 border border-amber-300">
                            {cat.badge}
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-900 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* SEPARATOR */}
              <hr className="border-neutral-100 my-2" />

              {/* SECONDARY / ACCOUNT LINKS */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400 px-2 mb-2">
                  Account & Services
                </p>
                {secondaryLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={onClose}
                      className="flex items-center justify-between px-3 h-11 rounded-xl text-xs font-medium text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50 transition group min-h-[44px]"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-neutral-400 group-hover:text-amber-800 transition-colors" />
                        <span>{link.name}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {typeof link.count === 'number' && link.count > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold">
                            {link.count}
                          </span>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-neutral-600" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* BOTTOM LOGIN / PROFILE CARD */}
            <div className="p-4 bg-neutral-50/90 border-t border-neutral-100 shrink-0 pb-safe">
              {user ? (
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-neutral-200/80 shadow-xs">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-neutral-950 text-amber-300 font-bold text-xs flex items-center justify-center border border-amber-500/30 shrink-0">
                      {user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs text-neutral-900 truncate">{user.name}</p>
                      <p className="text-[10px] text-neutral-500 truncate">{user.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      onClose();
                    }}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={onClose}
                  className="w-full h-12 bg-neutral-950 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition flex items-center justify-center gap-2 shadow-md cursor-pointer min-h-[44px]"
                >
                  <LogIn className="w-4 h-4 text-amber-300" />
                  <span>Login / Register Account</span>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
