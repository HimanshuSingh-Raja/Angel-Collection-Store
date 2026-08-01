'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User as UserIcon,
  Package,
  Heart,
  ShoppingBag,
  MapPin,
  CreditCard,
  Phone,
  HelpCircle,
  Truck,
  Settings,
  Lock,
  LogOut,
  ChevronRight,
  Sparkles,
  Gift,
  Ticket,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { MobileProfileDrawer } from './MobileProfileDrawer';

export const ProfileDropdown: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { setIsOpen: setIsCartOpen } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setMobileDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    if (isMobile) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const handleTriggerClick = () => {
    if (isMobile) {
      setMobileDrawerOpen(true);
    } else {
      setIsOpen((prev) => !prev);
    }
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    router.push('/login');
  };

  const menuSections = [
    {
      title: 'ORDERS & SHOPPING',
      items: [
        { label: 'My Orders', href: '/account/orders', icon: Package },
        { label: 'Wishlist', href: '/wishlist', icon: Heart },
        { label: 'Shopping Bag', href: '/cart', icon: ShoppingBag, onClick: () => setIsCartOpen(true) },
        { label: 'Saved Addresses', href: '/account', icon: MapPin },
        { label: 'Payment Methods', href: '/account', icon: CreditCard },
        { label: 'Gift Cards', href: '/account', icon: Gift },
        { label: 'Coupons & Vouchers', href: '/account', icon: Ticket },
      ],
    },
    {
      title: 'CUSTOMER SUPPORT',
      items: [
        { label: 'Contact Us', href: '/contact', icon: Phone },
        { label: 'FAQ', href: '/faq', icon: HelpCircle },
        { label: 'Track Order', href: '/track-order', icon: Truck },
      ],
    },
    {
      title: 'ACCOUNT SETTINGS',
      items: [
        { label: 'Profile Settings', href: '/account', icon: Settings },
        { label: 'Change Password', href: '/account', icon: Lock },
      ],
    },
  ];

  return (
    <>
      <div
        ref={dropdownRef}
        className="relative inline-block text-left"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          onClick={handleTriggerClick}
          aria-expanded={isOpen || mobileDrawerOpen}
          aria-haspopup="true"
          aria-label="User account menu"
          className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-1 sm:px-2 group focus:outline-none cursor-pointer"
        >
          <div
            className={`w-9 h-9 rounded-full transition-all duration-200 flex items-center justify-center ${
              isOpen || mobileDrawerOpen
                ? 'bg-neutral-950 text-white shadow-sm'
                : 'text-neutral-700 group-hover:text-black group-hover:bg-neutral-100'
            }`}
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-5 h-5 rounded-full object-cover border border-amber-600/50"
              />
            ) : (
              <UserIcon className="w-5 h-5" />
            )}
          </div>
          <span className="text-[10px] uppercase font-bold text-neutral-600 tracking-wider hidden md:block mt-1">
            Account
          </span>
        </button>

        {/* DESKTOP POPOVER MENU */}
        <AnimatePresence>
          {isOpen && !isMobile && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="z-50 bg-white font-sans text-neutral-900 border border-neutral-100 shadow-[0_20px_50px_rgba(0,0,0,0.14)] absolute right-0 mt-3 w-[300px] rounded-2xl p-5 hidden lg:block"
            >
              <div className="pb-4 border-b border-neutral-100 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                      {user ? 'ANGEL VIP CLIENT' : 'WELCOME'}
                    </span>
                    <Sparkles className="w-3 h-3 text-amber-600" />
                  </div>
                  <h3 className="font-serif font-bold text-lg leading-snug text-neutral-900 line-clamp-1">
                    Hello, {user?.name ? user.name.split(' ')[0] : 'Guest'}
                  </h3>
                  <p className="text-xs text-neutral-500 font-normal line-clamp-1">
                    {user?.email || 'Sign in to access your luxury account'}
                  </p>

                  <div className="pt-2">
                    {user ? (
                      <Link
                        href="/account"
                        onClick={handleLinkClick}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-900 uppercase tracking-widest hover:underline"
                      >
                        <span>Manage Account</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    ) : (
                      <Link
                        href="/login"
                        onClick={handleLinkClick}
                        className="w-full mt-1 py-2.5 px-4 bg-neutral-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition flex items-center justify-center gap-2 shadow-sm"
                      >
                        <span>Sign In / Register</span>
                        <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              <div className="py-2 divide-y divide-neutral-100">
                {menuSections.map((section) => (
                  <div key={section.title} className="py-3">
                    <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                      {section.title}
                    </p>
                    <div className="space-y-0.5">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => {
                              if (item.onClick) item.onClick();
                              handleLinkClick();
                            }}
                            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50 transition-colors group"
                          >
                            <div className="flex items-center space-x-3">
                              <Icon className="w-4 h-4 text-neutral-400 group-hover:text-amber-800 transition-colors" />
                              <span>{item.label}</span>
                            </div>
                            <ChevronRight className="w-3 h-3 text-neutral-300 group-hover:text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {user && (
                <div className="pt-2 border-t border-neutral-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <LogOut className="w-4 h-4 text-rose-500 group-hover:text-rose-600" />
                      <span>Logout Account</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-rose-400 group-hover:text-rose-600" />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MOBILE RIGHT SLIDING PROFILE DRAWER VIA PORTAL */}
      <MobileProfileDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
      />
    </>
  );
};
