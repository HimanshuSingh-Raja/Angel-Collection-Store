'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Heart, Menu, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { ProfileDropdown } from '@/components/navbar/ProfileDropdown';
import { SearchBar } from '@/components/navbar/SearchBar';
import { MegaMenu } from '@/components/navbar/MegaMenu';
import { AngelLogo } from '@/components/common/AngelLogo';
import { MobileNavDrawer } from './MobileNavDrawer';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { setIsOpen: setIsCartOpen, totalItemsCount } = useCart();
  const { wishlist } = useWishlist();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMegaCategory, setActiveMegaCategory] = useState<string | null>(null);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = [
    { name: 'NEW ARRIVALS', href: '/shop?collection=new-arrivals' },
    { name: 'WOMEN', href: '/shop?category=women', hasMega: true },
    { name: 'MEN', href: '/shop?category=men', hasMega: true },
    { name: 'KIDS', href: '/shop?category=kids' },
    { name: 'BAGS', href: '/shop?category=bags', hasMega: true },
    { name: 'WATCHES', href: '/shop?category=watches' },
    { name: 'JEWELLERY', href: '/shop?category=jewellery', hasMega: true },
    { name: 'SHOES', href: '/shop?category=shoes' },
    { name: 'BEAUTY', href: '/shop?category=beauty' },
    { name: 'ACCESSORIES', href: '/shop?category=accessories' },
    { name: 'SALE', href: '/shop?onSale=true', isSale: true },
    { name: 'LUXURY BRANDS', href: '/shop?collection=luxury-brands', isFeatured: true },
  ];

  const handleCategoryMouseEnter = (catName: string, hasMega?: boolean) => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    if (hasMega) {
      setActiveMegaCategory(catName);
    } else {
      setActiveMegaCategory(null);
    }
  };

  const handleCategoryMouseLeave = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setActiveMegaCategory(null);
    }, 200);
  };

  return (
    <header
      className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#ECECEC] transition-all duration-300 font-sans ${
        isScrolled ? 'shadow-[0_4px_25px_rgba(0,0,0,0.05)]' : 'shadow-none'
      }`}
    >
      {/* MAIN TOP BAR (85px Height Desktop, Compact Mobile) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[85px] flex items-center justify-between gap-4 sm:gap-6">
        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 min-h-[44px] min-w-[44px] text-neutral-800 hover:text-black focus:outline-none flex items-center justify-center cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* BRAND LOGO */}
        <AngelLogo variant="full" />

        {/* CENTER: LARGE PREMIUM SEARCH BAR (Desktop) */}
        <div className="hidden lg:flex flex-1 justify-center px-4 max-w-xl">
          <SearchBar />
        </div>

        {/* RIGHT SIDE ACTIONS: WISHLIST + ACCOUNT + CART */}
        <div className="flex items-center space-x-3 sm:space-x-5 shrink-0">
          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="flex flex-col items-center justify-center text-neutral-700 hover:text-black transition group relative focus:outline-none min-h-[44px]"
            aria-label="View Wishlist"
          >
            <div className="p-1.5 sm:p-2 rounded-full group-hover:bg-neutral-100/80 transition relative flex items-center justify-center">
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-amber-700 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                  {wishlist.length}
                </span>
              )}
            </div>
            <span className="text-[10px] uppercase font-semibold text-neutral-600 group-hover:text-black tracking-wider hidden sm:block">
              Wishlist
            </span>
          </Link>

          {/* Account Profile Dropdown */}
          <ProfileDropdown />

          {/* Cart Icon Drawer Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex flex-col items-center justify-center group focus:outline-none min-h-[44px] cursor-pointer"
            aria-label="Open Shopping Bag"
          >
            <div className="p-2 sm:p-2.5 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition relative flex items-center justify-center shadow-md">
              <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-300" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-600 text-neutral-950 text-[10px] font-bold flex items-center justify-center shadow-sm">
                  {totalItemsCount}
                </span>
              )}
            </div>
            <span className="text-[10px] uppercase font-semibold text-neutral-600 group-hover:text-black tracking-wider hidden sm:block">
              Bag
            </span>
          </button>
        </div>
      </div>

      {/* MOBILE SEARCH BAR ROW */}
      <div className="lg:hidden px-3 sm:px-4 py-2 bg-neutral-50/90 border-t border-b border-[#ECECEC]">
        <SearchBar />
      </div>

      {/* MOBILE HORIZONTALLY SCROLLABLE CATEGORY CHIPS */}
      <div className="lg:hidden bg-white border-b border-[#ECECEC] overflow-x-auto no-scrollbar py-2 px-3 flex items-center space-x-2">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            href={cat.href}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 transition min-h-[36px] flex items-center ${
              pathname === cat.href
                ? 'bg-neutral-900 text-white'
                : cat.isSale
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : cat.isFeatured
                ? 'bg-amber-50 text-amber-900 border border-amber-200'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* CATEGORY NAVIGATION ROW (Desktop) */}
      <div
        className="hidden lg:block relative bg-white border-t border-[#ECECEC]/60"
        onMouseLeave={handleCategoryMouseLeave}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between space-x-6 overflow-x-auto no-scrollbar py-2.5">
            {categories.map((cat) => {
              const isActive = pathname === cat.href;
              const isHovered = activeMegaCategory === cat.name;

              return (
                <div
                  key={cat.name}
                  onMouseEnter={() => handleCategoryMouseEnter(cat.name, cat.hasMega)}
                  className="relative group py-1"
                >
                  <Link
                    href={cat.href}
                    className={`text-[11px] font-bold uppercase tracking-[0.18em] transition-colors relative block ${
                      cat.isSale
                        ? 'text-rose-600 font-extrabold'
                        : cat.isFeatured
                        ? 'text-amber-800 font-extrabold flex items-center gap-1'
                        : isActive || isHovered
                        ? 'text-black'
                        : 'text-neutral-700 hover:text-black'
                    }`}
                  >
                    {cat.isFeatured && <Sparkles className="w-3 h-3 text-amber-600 inline" />}
                    <span>{cat.name}</span>

                    {/* Hover Underline */}
                    <span
                      className={`absolute -bottom-1.5 left-0 w-full h-[2px] bg-amber-700 transition-transform duration-200 transform origin-left ${
                        isActive || isHovered ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    />
                  </Link>
                </div>
              );
            })}
          </nav>
        </div>

        {/* MEGA MENU */}
        {activeMegaCategory && (
          <div
            onMouseEnter={() => {
              if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
            }}
            onMouseLeave={handleCategoryMouseLeave}
            className="absolute left-0 right-0 top-full z-50"
          >
            <MegaMenu
              categoryKey={activeMegaCategory}
              onClose={() => setActiveMegaCategory(null)}
            />
          </div>
        )}
      </div>

      {/* LUXURY REDESIGNED MOBILE NAVIGATION DRAWER */}
      <MobileNavDrawer isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  );
};
