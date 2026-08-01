'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Star, ShoppingBag, Heart, Check, ShieldCheck, Truck } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatPrice, calculateDiscountPercentage } from '@/lib/utils';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [added, setAdded] = useState(false);

  React.useEffect(() => {
    if (!product) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevOverflow || '';
    };
  }, [product]);

  if (!product) return null;

  const inWishlist = isInWishlist(product.id);
  const discount = calculateDiscountPercentage(product.price, product.compareAtPrice);
  const sizes = product.sizes || ['XS', 'S', 'M', 'L', 'XL'];
  const colors = product.colors || ['Black', 'Cream', 'Gold'];

  const handleAddToCart = () => {
    addToCart(product, selectedSize || sizes[0], selectedColor || colors[0]);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative border border-neutral-200 animate-slide-up overflow-hidden my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-neutral-400 hover:text-black transition rounded-full bg-neutral-100"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Gallery Preview */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200">
              <img
                src={product.images[activeImgIndex]?.url || product.images[0]?.url}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-rose-600 text-white text-[10px] font-bold px-3 py-1 rounded-md uppercase">
                  -{discount}% OFF
                </span>
              )}
            </div>

            {/* Thumbnail Row */}
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setActiveImgIndex(idx)}
                  className={`w-16 h-20 rounded-xl overflow-hidden border-2 transition ${
                    idx === activeImgIndex ? 'border-amber-600 scale-105' : 'border-neutral-200 opacity-60'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details & Selectors */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-700 font-bold">
                {product.brand?.name || 'ANGEL PRIVÉ'}
              </span>
              <h2 className="font-serif text-2xl font-bold text-neutral-900 mt-1">{product.title}</h2>

              {/* Rating */}
              <div className="flex items-center space-x-2 mt-2">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-xs font-bold text-neutral-800">{product.rating}</span>
                <span className="text-xs text-neutral-400">({product.reviewCount} customer reviews)</span>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline space-x-3 mt-4">
                <span className="text-2xl font-bold text-neutral-900">{formatPrice(product.price)}</span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-sm text-neutral-400 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>

              <p className="text-xs text-neutral-600 leading-relaxed mt-4 line-clamp-3">
                {product.description}
              </p>
            </div>

            {/* Color Swatches */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 block mb-2">
                Select Shade / Color: <span className="font-semibold text-amber-700">{selectedColor || colors[0]}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition ${
                      (selectedColor || colors[0]) === c
                        ? 'bg-neutral-900 text-amber-300 border-neutral-900'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Buttons */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 block mb-2">
                Select Size: <span className="font-semibold text-amber-700">{selectedSize || sizes[0]}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`w-11 h-11 rounded-xl text-xs font-bold border transition ${
                      (selectedSize || sizes[0]) === s
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-neutral-50 text-neutral-800 border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-4 bg-neutral-950 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-amber-700 transition flex items-center justify-center gap-2 shadow-xl"
                >
                  {added ? <Check className="w-4 h-4 text-emerald-400" /> : <ShoppingBag className="w-4 h-4 text-amber-300" />}
                  <span>{added ? 'ADDED TO BAG' : 'ADD TO CART'}</span>
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-4 rounded-2xl border transition ${
                    inWishlist
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-neutral-100 text-neutral-700 border-neutral-200 hover:bg-neutral-200'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                </button>
              </div>

              <Link
                href={`/product/${product.slug}`}
                onClick={onClose}
                className="block text-center text-xs font-bold tracking-wider text-amber-800 hover:underline uppercase pt-1"
              >
                View Full Product Details →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
