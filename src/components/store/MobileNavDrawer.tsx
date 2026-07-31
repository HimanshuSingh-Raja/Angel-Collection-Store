'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronRight,
  User,
  ShoppingBag,
  Heart,
  LogOut,
  Sparkles,
  Flame,
  Instagram,
  Facebook,
  HelpCircle,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { wishlist } = useWishlist();
  const { totalItemsCount } = useCart();

  // Prevent background body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const menuCategories = [
    { name: 'New Arrivals', icon: Sparkles, href: '/shop?collection=new-arrivals', badge: 'NEW', badgeBg: 'bg-amber-100 text-amber-950 border-amber-300' },
    { name: 'Women', icon: '👗', href: '/shop?category=women' },
    { name: 'Men', icon: '👔', href: '/shop?category=men' },
    { name: 'Bags', icon: '👜', href: '/shop?category=bags' },
    { name: 'Shoes', icon: '👟', href: '/shop?category=shoes' },
    { name: 'Watches', icon: '⌚', href: '/shop?category=watches' },
    { name: 'Jewellery', icon: '💎', href: '/shop?category=jewellery' },
    { name: 'Beauty', icon: '🧴', href: '/shop?category=beauty' },
    { name: 'Accessories', icon: '🕶️', href: '/shop?category=accessories' },
    { name: 'Sale', icon: Flame, href: '/shop?onSale=true', badge: 'UP TO 40% OFF', badgeBg: 'bg-rose-100 text-rose-700 border-rose-200', isSale: true },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex font-sans">
          {/* Backdrop Blur & Dark Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Drawer Container (Width 85vw, max 360px, rounded-r-3xl) */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative w-[85vw] max-w-[360px] h-full bg-white rounded-r-[24px] shadow-2xl flex flex-col justify-between overflow-hidden z-50 pt-safe"
          >
            {/* Top Section: Header */}
            <div className="p-6 pb-4 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <Link href="/" onClick={onClose} className="block">
                  <span className="font-serif text-xl font-bold tracking-widest text-neutral-950 block">
                    ANGEL <span className="text-amber-700 font-light">COLLECTION</span>
                  </span>
                  <span className="text-[9px] uppercase font-mono tracking-[0.25em] text-neutral-400 block mt-0.5">
                    HAUTE COUTURE • LUXURY FASHION
                  </span>
                </Link>
              </div>

              {/* Close Button (44px x 44px Touch Target) */}
              <button
                onClick={onClose}
                className="w-11 h-11 rounded-full bg-neutral-100 hover:bg-neutral-900 hover:text-white transition flex items-center justify-center text-neutral-700 shadow-sm cursor-pointer shrink-0"
                aria-label="Close navigation drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Middle Section: Scrollable Category Navigation */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 divide-y divide-neutral-100 no-scrollbar">
              {/* Category Menu List */}
              <div className="space-y-1.5">
                {menuCategories.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * idx, duration: 0.2 }}
                    >
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center justify-between px-4 h-[56px] rounded-2xl transition-all duration-200 group ${
                          item.isSale
                            ? 'bg-rose-50/60 hover:bg-rose-100/80 text-rose-700'
                            : 'hover:bg-neutral-100/80 text-neutral-800'
                        }`}
                      >
                        <div className="flex items-center space-x-3.5">
                          <span className="text-xl flex items-center justify-center w-7">
                            {typeof Icon === 'string' ? (
                              Icon
                            ) : (
                              <Icon className={`w-5 h-5 ${item.isSale ? 'text-rose-600' : 'text-amber-700'}`} />
                            )}
                          </span>
                          <span className="font-sans text-sm font-semibold tracking-wide">
                            {item.name}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {item.badge && (
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${item.badgeBg}`}>
                              {item.badge}
                            </span>
                          )}
                          <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* User Account / Auth Action Section */}
              <div className="pt-6">
                {user ? (
                  <div className="space-y-4 bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                    {/* Logged In User Profile Header */}
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-900 text-amber-300 font-bold text-sm flex items-center justify-center border border-amber-500/30 shadow-sm">
                        {user.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs text-neutral-900 truncate">{user.name}</p>
                        <p className="text-[10px] text-neutral-500 truncate">{user.email}</p>
                      </div>
                    </div>

                    {/* Quick Profile Links */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <Link
                        href="/account/orders"
                        onClick={onClose}
                        className="p-2.5 rounded-xl bg-white border border-neutral-200 text-neutral-800 font-semibold hover:border-neutral-400 transition flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-amber-700" />
                        <span>Orders</span>
                      </Link>
                      <Link
                        href="/wishlist"
                        onClick={onClose}
                        className="p-2.5 rounded-xl bg-white border border-neutral-200 text-neutral-800 font-semibold hover:border-neutral-400 transition flex items-center justify-center gap-1.5 shadow-xs relative"
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-600" />
                        <span>Wishlist ({wishlist.length})</span>
                      </Link>
                    </div>

                    <button
                      onClick={() => {
                        logout();
                        onClose();
                      }}
                      className="w-full py-2.5 bg-rose-50 text-rose-600 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-rose-100 transition flex items-center justify-center gap-2 border border-rose-200 cursor-pointer min-h-[44px]"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Logout Account</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 text-center block">
                      PRIVILEGE ACCESS
                    </p>
                    <div className="space-y-2">
                      <Link
                        href="/login"
                        onClick={onClose}
                        className="w-full h-11 bg-neutral-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition flex items-center justify-center gap-2 shadow-md min-h-[44px]"
                      >
                        <LogIn className="w-4 h-4 text-amber-300" />
                        <span>Sign In to Account</span>
                      </Link>
                      <Link
                        href="/register"
                        onClick={onClose}
                        className="w-full h-11 bg-neutral-100 text-neutral-900 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition flex items-center justify-center gap-2 border border-neutral-200 min-h-[44px]"
                      >
                        <UserPlus className="w-4 h-4 text-neutral-600" />
                        <span>Create New Account</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Fixed Footer Section */}
            <div className="p-6 bg-neutral-50/80 border-t border-neutral-100 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <Link
                  href="/contact"
                  onClick={onClose}
                  className="text-neutral-600 hover:text-black font-semibold flex items-center gap-1.5 transition"
                >
                  <HelpCircle className="w-4 h-4 text-amber-700" />
                  <span>Need Help? Contact Us</span>
                </Link>

                <div className="flex items-center space-x-3 text-neutral-500">
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-black transition">
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-black transition">
                    <Facebook className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="text-[10px] text-neutral-400 font-mono text-center pt-2 border-t border-neutral-200/60">
                © 2026 Angel Collection • All rights reserved.
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
