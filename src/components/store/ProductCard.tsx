'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Eye, ShoppingBag, Star, Sparkles } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatPrice, calculateDiscountPercentage } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const inWishlist = isInWishlist(product.id);
  const discount = calculateDiscountPercentage(product.price, product.compareAtPrice);
  const primaryImg = product.images[0]?.url || 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800';
  const secondaryImg = product.images[1]?.url || primaryImg;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, selectedSize || product.sizes?.[0]);
  };

  return (
    <div
      className="group relative flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-neutral-100/80 shadow-sm hover:shadow-xl transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      aria-label={`Product card for ${product.title}`}
      onMouseLeave={() => {
        setIsHovered(false);
        setSelectedSize(null);
      }}
    >
      {/* Image Wrapper */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100">
        <Link href={`/product/${product.slug}`} className="block h-full w-full relative">
          <Image
            src={isHovered ? secondaryImg : primaryImg}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            unoptimized
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {discount > 0 && (
            <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[9px] sm:text-[10px] font-bold tracking-wider uppercase shadow-sm">
              -{discount}% OFF
            </span>
          )}
          {product.isNewArrival && (
            <span className="px-2 py-0.5 rounded bg-neutral-900 text-amber-300 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase shadow-sm border border-amber-500/30 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" /> NEW
            </span>
          )}
          {product.stock <= product.lowStockThreshold && product.stock > 0 && (
            <span className="px-2 py-0.5 rounded bg-amber-500 text-white text-[9px] sm:text-[10px] font-bold tracking-wider uppercase shadow-sm">
              ONLY {product.stock} LEFT
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          className={`absolute top-2.5 right-2.5 z-10 p-2 sm:p-2.5 rounded-full transition-all duration-300 backdrop-blur-md min-h-[44px] min-w-[44px] flex items-center justify-center ${
            inWishlist
              ? 'bg-rose-600 text-white shadow-lg'
              : 'bg-white/85 text-neutral-700 hover:bg-white hover:text-rose-600'
          }`}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${inWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Action Overlay Bar (Desktop Hover) */}
        <div
          className={`hidden sm:flex absolute bottom-3 inset-x-3 z-10 items-center justify-between gap-2 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          {onQuickView && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onQuickView(product);
              }}
              className="flex-1 py-2.5 bg-white/90 backdrop-blur-md text-neutral-900 rounded-xl text-xs font-semibold hover:bg-white hover:text-black transition shadow-lg flex items-center justify-center gap-1.5 min-h-[44px]"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>QUICK VIEW</span>
            </button>
          )}

          <button
            onClick={handleQuickAdd}
            className="flex-1 py-2.5 bg-neutral-950 text-white rounded-xl text-xs font-semibold hover:bg-amber-600 hover:text-neutral-950 transition shadow-lg flex items-center justify-center gap-1.5 min-h-[44px]"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
            <span>ADD TO CART</span>
          </button>
        </div>
      </div>

      {/* Product Information Footer */}
      <div className="p-3 sm:p-4 flex flex-col justify-between flex-1">
        <div>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-400 font-medium block mb-1">
            {typeof product.brand === 'object' ? product.brand?.name : typeof product.category === 'object' ? product.category?.name : 'Angel Collection'}
          </span>
          <Link href={`/product/${product.slug}`}>
            <h3 className="font-sans text-xs sm:text-sm font-semibold text-neutral-900 hover:text-amber-800 transition line-clamp-2 leading-snug">
              {product.title}
            </h3>
          </Link>
        </div>

        {/* Rating Breakdown */}
        <div className="flex items-center space-x-1.5 my-1.5">
          <div className="flex items-center text-amber-500">
            <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-neutral-800">{(product.rating || 4.8).toFixed(1)}</span>
          <span className="text-[10px] sm:text-[11px] text-neutral-400">({product.reviewCount || 124})</span>
        </div>

        {/* Pricing */}
        <div className="flex items-baseline space-x-2 pt-0.5">
          <span className="text-sm sm:text-base font-bold text-neutral-900">{formatPrice(product.price)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-[11px] sm:text-xs text-neutral-400 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Mobile Touch Quick Add Button */}
        <button
          onClick={handleQuickAdd}
          className="sm:hidden w-full mt-3 py-2.5 bg-neutral-950 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition flex items-center justify-center gap-1 cursor-pointer min-h-[44px]"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
          <span>ADD TO BAG</span>
        </button>
      </div>
    </div>
  );
};
