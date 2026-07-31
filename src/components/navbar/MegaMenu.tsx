'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Star, ChevronRight } from 'lucide-react';

interface MegaMenuProps {
  categoryKey: string;
  onClose: () => void;
}

interface MenuLink {
  name: string;
  href: string;
}

interface MenuSubSection {
  subtitle: string;
  links: MenuLink[];
}

interface MegaColumn {
  title: string;
  links?: MenuLink[];
  subsections?: MenuSubSection[];
  isBannerColumn?: boolean;
  bannerImage?: string;
  bannerTitle?: string;
  bannerLink?: string;
}

// Data-driven configuration for Men's Luxury Mega Menu (6 Columns)
const MENS_MEGA_MENU_CONFIG: MegaColumn[] = [
  {
    title: 'TOPWEAR',
    links: [
      { name: 'T-Shirts', href: '/shop?category=men&type=t-shirts' },
      { name: 'Polo T-Shirts', href: '/shop?category=men&type=polo-tshirts' },
      { name: 'Casual Shirts', href: '/shop?category=men&type=casual-shirts' },
      { name: 'Formal Shirts', href: '/shop?category=men&type=formal-shirts' },
      { name: 'Linen Shirts', href: '/shop?category=men&type=linen-shirts' },
      { name: 'Sweatshirts', href: '/shop?category=men&type=sweatshirts' },
      { name: 'Hoodies', href: '/shop?category=men&type=hoodies' },
      { name: 'Jackets', href: '/shop?category=men&type=jackets' },
      { name: 'Blazers', href: '/shop?category=men&type=blazers' },
      { name: 'Suits & Tuxedos', href: '/shop?category=men&type=suits' },
    ],
  },
  {
    title: 'BOTTOMWEAR',
    links: [
      { name: 'Jeans', href: '/shop?category=men&type=jeans' },
      { name: 'Chinos', href: '/shop?category=men&type=chinos' },
      { name: 'Formal Trousers', href: '/shop?category=men&type=formal-trousers' },
      { name: 'Cargo Pants', href: '/shop?category=men&type=cargos' },
      { name: 'Joggers', href: '/shop?category=men&type=joggers' },
      { name: 'Shorts', href: '/shop?category=men&type=shorts' },
      { name: 'Track Pants', href: '/shop?category=men&type=track-pants' },
    ],
  },
  {
    title: 'ETHNIC & FOOTWEAR',
    subsections: [
      {
        subtitle: 'ETHNIC WEAR',
        links: [
          { name: 'Kurtas', href: '/shop?category=men&type=kurtas' },
          { name: 'Kurta Sets', href: '/shop?category=men&type=kurta-sets' },
          { name: 'Sherwanis', href: '/shop?category=men&type=sherwanis' },
          { name: 'Nehru Jackets', href: '/shop?category=men&type=nehru-jackets' },
          { name: 'Dhotis', href: '/shop?category=men&type=dhotis' },
        ],
      },
      {
        subtitle: 'FOOTWEAR',
        links: [
          { name: 'Sneakers', href: '/shop?category=men&type=sneakers' },
          { name: 'Loafers', href: '/shop?category=men&type=loafers' },
          { name: 'Boots', href: '/shop?category=men&type=boots' },
          { name: 'Formal Shoes', href: '/shop?category=men&type=formal-shoes' },
          { name: 'Sandals & Slippers', href: '/shop?category=men&type=sandals' },
        ],
      },
    ],
  },
  {
    title: 'SPORTS & ACCESSORIES',
    subsections: [
      {
        subtitle: 'SPORTS & ACTIVEWEAR',
        links: [
          { name: 'Gym Wear', href: '/shop?category=men&type=gym-wear' },
          { name: 'Running Shoes', href: '/shop?category=men&type=running-shoes' },
          { name: 'Track Suits', href: '/shop?category=men&type=tracksuits' },
          { name: 'Sports T-Shirts', href: '/shop?category=men&type=sports-tshirts' },
        ],
      },
      {
        subtitle: 'ACCESSORIES',
        links: [
          { name: 'Wallets', href: '/shop?category=men&type=wallets' },
          { name: 'Belts', href: '/shop?category=men&type=belts' },
          { name: 'Sunglasses', href: '/shop?category=men&type=sunglasses' },
          { name: 'Luxury Watches', href: '/shop?category=men&type=watches' },
          { name: 'Perfumes', href: '/shop?category=men&type=perfumes' },
        ],
      },
    ],
  },
  {
    title: 'BAGS & GADGETS',
    subsections: [
      {
        subtitle: 'BAGS',
        links: [
          { name: 'Backpacks', href: '/shop?category=men&type=backpacks' },
          { name: 'Laptop Bags', href: '/shop?category=men&type=laptop-bags' },
          { name: 'Duffel Bags', href: '/shop?category=men&type=duffel-bags' },
          { name: 'Travel Bags', href: '/shop?category=men&type=travel-bags' },
        ],
      },
      {
        subtitle: 'GADGETS',
        links: [
          { name: 'Smart Watches', href: '/shop?category=men&type=smartwatches' },
          { name: 'Headphones', href: '/shop?category=men&type=headphones' },
          { name: 'Earbuds', href: '/shop?category=men&type=earbuds' },
        ],
      },
    ],
  },
  {
    title: 'FEATURED COLLECTION',
    isBannerColumn: true,
    bannerImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
    bannerTitle: 'Luxury Winter Edit',
    bannerLink: '/shop?category=men&type=jackets',
    links: [
      { name: 'New Arrivals', href: '/shop?category=men&collection=new-arrivals' },
      { name: 'Best Sellers', href: '/shop?category=men&collection=best-sellers' },
      { name: 'Luxury Brands', href: '/shop?category=men&collection=luxury-brands' },
      { name: 'Limited Edition', href: '/shop?category=men&collection=limited-edition' },
    ],
  },
];

// Data-driven configuration for Women's Mega Menu
const WOMEN_MEGA_MENU_CONFIG: MegaColumn[] = [
  {
    title: 'CLOTHING',
    links: [
      { name: 'Dresses', href: '/shop?category=women&type=dresses' },
      { name: 'Evening Gowns', href: '/shop?category=women&type=evening-gowns' },
      { name: 'Ethnic Wear', href: '/shop?category=women&type=ethnic-wear' },
      { name: 'Sarees', href: '/shop?category=women&type=sarees' },
      { name: 'Kurtas & Kurta Sets', href: '/shop?category=women&type=kurtas' },
      { name: 'Co-ord Sets', href: '/shop?category=women&type=co-ords' },
      { name: 'Tops & Shirts', href: '/shop?category=women&type=tops-shirts' },
      { name: 'T-Shirts', href: '/shop?category=women&type=tshirts' },
      { name: 'Jeans', href: '/shop?category=women&type=jeans' },
      { name: 'Trousers', href: '/shop?category=women&type=trousers' },
      { name: 'Skirts', href: '/shop?category=women&type=skirts' },
      { name: 'Jackets', href: '/shop?category=women&type=jackets' },
      { name: 'Blazers', href: '/shop?category=women&type=blazers' },
    ],
  },
  {
    title: 'FOOTWEAR',
    links: [
      { name: 'Heels', href: '/shop?category=women&type=heels' },
      { name: 'Flats', href: '/shop?category=women&type=flats' },
      { name: 'Sneakers', href: '/shop?category=women&type=sneakers' },
      { name: 'Boots', href: '/shop?category=women&type=boots' },
      { name: 'Sandals', href: '/shop?category=women&type=sandals' },
      { name: 'Loafers', href: '/shop?category=women&type=loafers' },
    ],
  },
  {
    title: 'BAGS & ACCESSORIES',
    links: [
      { name: 'Handbags', href: '/shop?category=women&type=handbags' },
      { name: 'Tote Bags', href: '/shop?category=women&type=totes' },
      { name: 'Crossbody Bags', href: '/shop?category=women&type=crossbody' },
      { name: 'Clutches', href: '/shop?category=women&type=clutches' },
      { name: 'Wallets', href: '/shop?category=women&type=wallets' },
      { name: 'Belts', href: '/shop?category=women&type=belts' },
      { name: 'Sunglasses', href: '/shop?category=women&type=sunglasses' },
    ],
  },
  {
    title: 'JEWELLERY & WATCHES',
    links: [
      { name: 'Necklaces', href: '/shop?category=jewellery&type=necklaces' },
      { name: 'Earrings', href: '/shop?category=jewellery&type=earrings' },
      { name: 'Rings', href: '/shop?category=jewellery&type=rings' },
      { name: 'Bracelets', href: '/shop?category=jewellery&type=bracelets' },
      { name: 'Luxury Watches', href: '/shop?category=jewellery&type=luxury-watches' },
    ],
  },
  {
    title: 'BEAUTY',
    links: [
      { name: 'Makeup', href: '/shop?category=beauty&type=makeup' },
      { name: 'Skincare', href: '/shop?category=beauty&type=skincare' },
      { name: 'Fragrances', href: '/shop?category=beauty&type=fragrances' },
      { name: 'Hair Care', href: '/shop?category=beauty&type=haircare' },
    ],
  },
  {
    title: 'FEATURED COLLECTIONS',
    isBannerColumn: true,
    bannerImage: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80',
    bannerTitle: 'Haute Couture Edit',
    bannerLink: '/shop?category=women&type=gowns',
    links: [
      { name: 'New Arrivals', href: '/shop?collection=new-arrivals' },
      { name: 'Best Sellers', href: '/shop?collection=best-sellers' },
      { name: 'Luxury Collection', href: '/shop?collection=luxury' },
      { name: 'Limited Edition', href: '/shop?collection=limited-edition' },
    ],
  },
];

export const MegaMenu: React.FC<MegaMenuProps> = ({ categoryKey, onClose }) => {
  const activeMenuConfig =
    categoryKey === 'MEN' ? MENS_MEGA_MENU_CONFIG : WOMEN_MEGA_MENU_CONFIG;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
      className="w-full bg-white/95 backdrop-blur-md border-b border-neutral-200/90 shadow-[0_25px_60px_rgba(0,0,0,0.12)] py-8 px-6 sm:px-10 font-sans z-50"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8">
          {activeMenuConfig.map((col) => (
            <div key={col.title} className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C8A45D] border-b border-neutral-100 pb-2">
                {col.title}
              </h4>

              {/* Simple Links */}
              {col.links && !col.isBannerColumn && (
                <ul className="space-y-1.5 text-xs">
                  {col.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className="text-neutral-600 hover:text-neutral-950 transition-all font-normal hover:translate-x-1 inline-flex items-center gap-1.5 transform duration-150"
                      >
                        <ChevronRight className="w-2.5 h-2.5 text-neutral-300 group-hover:text-amber-600" />
                        <span>{link.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {/* Subsections if any (e.g. Ethnic + Footwear) */}
              {col.subsections && (
                <div className="space-y-4 text-xs">
                  {col.subsections.map((sub: MenuSubSection) => (
                    <div key={sub.subtitle} className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase text-neutral-400 block tracking-wider">
                        {sub.subtitle}
                      </span>
                      <ul className="space-y-1">
                        {sub.links.map((link: MenuLink) => (
                          <li key={link.name}>
                            <Link
                              href={link.href}
                              onClick={onClose}
                              className="text-neutral-600 hover:text-neutral-950 transition-all font-normal hover:translate-x-1 inline-block transform duration-150"
                            >
                              {link.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Banner & Featured Column */}
              {col.isBannerColumn && (
                <div className="space-y-3">
                  {col.bannerImage && (
                    <Link
                      href={col.bannerLink || '/shop'}
                      onClick={onClose}
                      className="group block relative rounded-2xl overflow-hidden border border-neutral-200 shadow-md bg-neutral-900"
                    >
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={col.bannerImage}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-amber-300">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          FEATURED DROP
                        </span>
                        <h5 className="font-serif font-bold text-white text-sm group-hover:text-amber-300 transition-colors">
                          {col.bannerTitle}
                        </h5>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-neutral-300 uppercase tracking-widest mt-1">
                          <span>Shop Now</span>
                          <ArrowRight className="w-3 h-3 text-amber-400" />
                        </div>
                      </div>
                    </Link>
                  )}

                  {col.links && (
                    <ul className="space-y-1.5 text-xs pt-1">
                      {col.links.map((link) => (
                        <li key={link.name}>
                          <Link
                            href={link.href}
                            onClick={onClose}
                            className="text-neutral-900 font-semibold hover:text-[#C8A45D] transition-colors inline-flex items-center gap-1.5"
                          >
                            <Star className="w-3 h-3 text-[#C8A45D] shrink-0 fill-[#C8A45D]" />
                            <span>{link.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
