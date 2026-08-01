'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Package,
  Heart,
  MapPin,
  Ticket,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Sparkles,
  LogIn,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';

interface MobileProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileProfileDrawer: React.FC<MobileProfileDrawerProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { wishlist } = useWishlist();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when profile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  const handleLogout = async () => {
    onClose();
    await logout();
    router.push('/login');
  };

  const profileSections = [
    { label: 'Profile', href: '/account', icon: User, desc: 'Personal info & settings' },
    { label: 'My Orders', href: '/account/orders', icon: Package, desc: 'Track, return & buy again' },
    { label: 'Wishlist', href: '/wishlist', icon: Heart, count: wishlist.length, desc: 'Saved luxury items' },
    { label: 'Addresses', href: '/account', icon: MapPin, desc: 'Saved shipping locations' },
    { label: 'Coupons', href: '/account', icon: Ticket, desc: 'Promos & privilege vouchers' },
    { label: 'Notifications', href: '/account', icon: Bell, desc: 'Order & offer updates' },
    { label: 'Help', href: '/contact', icon: HelpCircle, desc: 'Customer support & FAQs' },
  ];

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end font-sans touch-none">
          {/* Dark Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm cursor-pointer"
          />

          {/* Right Sliding Drawer with Rounded Top-Left & Bottom-Left Corners */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative w-[85vw] max-w-[360px] h-[100vh] bg-white rounded-l-[28px] shadow-2xl flex flex-col justify-between overflow-hidden z-[101] pt-safe"
          >
            {/* Top User Header Banner (Myntra Luxe Style) */}
            <div className="p-6 bg-gradient-to-br from-neutral-900 via-neutral-850 to-neutral-950 text-white border-b border-amber-500/20 relative shrink-0">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white transition flex items-center justify-center min-h-[44px] min-w-[44px] cursor-pointer"
                aria-label="Close profile drawer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-4 pt-2">
                {/* Profile Image / Avatar */}
                <div className="relative">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-amber-400 shadow-md"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-amber-500/20 border-2 border-amber-400 text-amber-300 font-serif font-bold text-xl flex items-center justify-center shadow-inner">
                      {user?.name ? user.name[0].toUpperCase() : 'A'}
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-neutral-900" />
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-amber-400">
                      {user ? 'PRIVILEGE CLIENT' : 'WELCOME'}
                    </span>
                    <Sparkles className="w-3 h-3 text-amber-400" />
                  </div>
                  <h3 className="font-serif font-bold text-base text-white truncate leading-tight mt-0.5">
                    {user?.name || 'Guest User'}
                  </h3>
                  <p className="text-xs text-neutral-300 font-light truncate mt-0.5">
                    {user?.email || 'Sign in to access orders & wishlist'}
                  </p>
                </div>
              </div>

              {!user && (
                <div className="mt-4 pt-3 border-t border-white/10">
                  <Link
                    href="/login"
                    onClick={onClose}
                    className="w-full py-2.5 bg-amber-400 text-neutral-950 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-white transition flex items-center justify-center gap-1.5 shadow-md min-h-[44px]"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>LOG IN / REGISTER</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Menu Items Section (Myntra Spacing & Layout) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1.5 no-scrollbar overscroll-contain">
              {profileSections.map((sec) => {
                const Icon = sec.icon;
                return (
                  <Link
                    key={sec.label}
                    href={sec.href}
                    onClick={onClose}
                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-neutral-50 transition border border-transparent hover:border-neutral-100 group min-h-[48px]"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 group-hover:bg-amber-50 text-neutral-700 group-hover:text-amber-800 transition flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-xs text-neutral-900 group-hover:text-amber-900 transition leading-tight">
                          {sec.label}
                        </h4>
                        <p className="text-[10px] text-neutral-400 font-light truncate mt-0.5">
                          {sec.desc}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {typeof sec.count === 'number' && sec.count > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold">
                          {sec.count}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-900 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Logout Footer (If Logged In) */}
            {user && (
              <div className="p-4 bg-neutral-50 border-t border-neutral-100 shrink-0 pb-safe">
                <button
                  onClick={handleLogout}
                  className="w-full h-12 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-rose-100 transition flex items-center justify-center gap-2 border border-rose-200 cursor-pointer min-h-[44px]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>LOG OUT ACCOUNT</span>
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
