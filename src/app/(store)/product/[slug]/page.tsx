'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Star,
  ShoppingBag,
  Heart,
  Share2,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Ruler,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { INITIAL_PRODUCTS, INITIAL_REVIEWS } from '@/lib/mock-data';
import { ProductCard } from '@/components/store/ProductCard';
import { SizeGuideDrawer } from '@/components/store/SizeGuideDrawer';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatPrice, calculateDiscountPercentage } from '@/lib/utils';
import { getProductBySlugAction } from '@/actions/product-store';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('S');
  const [selectedColor, setSelectedColor] = useState<string>('Black');
  const [copied, setCopied] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');

  // Fetch product dynamically based ONLY on the slug parameter
  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        // 1. Try fetching from live PostgreSQL database
        const dbProduct = await getProductBySlugAction(slug);
        if (dbProduct) {
          setProduct(dbProduct);
          setSelectedSize(dbProduct.sizes?.[0] || 'S');
          setSelectedColor(dbProduct.colors?.[0] || 'Black');
          setLoading(false);
          return;
        }

        // 2. Fallback to mock data matching EXACT slug
        const mockMatch = INITIAL_PRODUCTS.find((p) => p.slug === slug);
        if (mockMatch) {
          setProduct(mockMatch);
          setSelectedSize(mockMatch.sizes?.[0] || 'S');
          setSelectedColor(mockMatch.colors?.[0] || 'Black');
          setLoading(false);
          return;
        }

        // 3. If slug does not exist, trigger 404
        setNotFoundState(true);
      } catch (err) {
        console.error('Error loading product by slug:', err);
        setNotFoundState(true);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [slug]);

  if (notFoundState) {
    return notFound();
  }

  if (loading || !product) {
    return (
      <div className="py-32 text-center text-xs text-neutral-400 flex items-center justify-center gap-2 font-sans">
        <Loader2 className="w-5 h-5 animate-spin text-amber-700" />
        <span>Fetching luxury product details...</span>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const discount = calculateDiscountPercentage(product.price, product.compareAtPrice);
  const relatedProducts = INITIAL_PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 font-sans">
      {/* Breadcrumb */}
      <nav className="text-xs text-neutral-500 flex items-center space-x-2">
        <Link href="/" className="hover:text-black">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-black">Shop</Link>
        <span>/</span>
        <span className="text-neutral-900 font-semibold">{product.category?.name || 'Haute Couture'}</span>
      </nav>

      {/* Product Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Gallery Preview */}
        <div className="space-y-4 sticky top-28">
          <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-neutral-100 border border-neutral-200 shadow-lg">
            <img
              src={product.images[activeImgIndex]?.url || product.images[0]?.url}
              alt={product.title}
              className="w-full h-full object-cover transition-all duration-500"
            />
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase shadow-md">
                SAVE {discount}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          <div className="flex gap-4 overflow-x-auto pb-2">
            {product.images.map((img: any, idx: number) => (
              <button
                key={img.id || idx}
                onClick={() => setActiveImgIndex(idx)}
                className={`w-20 h-24 rounded-2xl overflow-hidden border-2 transition-all ${
                  idx === activeImgIndex ? 'border-amber-700 scale-105 shadow-md' : 'border-neutral-200 opacity-60'
                }`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Details Column */}
        <div className="space-y-8">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-amber-700 font-bold">
              {product.brand?.name || 'ANGEL PRIVÉ'}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 mt-1">
              {product.title}
            </h1>

            {/* Ratings & Stock */}
            <div className="flex items-center space-x-4 mt-3">
              <div className="flex items-center space-x-1.5 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 text-amber-800">
                <Star className="w-3.5 h-3.5 fill-current text-amber-600" />
                <span className="text-xs font-bold">{product.rating || 4.9}</span>
                <span className="text-[11px] text-amber-700">({product.reviewCount || 12} reviews)</span>
              </div>

              {product.stock <= (product.lowStockThreshold || 5) ? (
                <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold animate-pulse">
                  Urgency: Only {product.stock} items remaining in stock!
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  In Stock & Ready To Ship
                </span>
              )}
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-6 bg-white rounded-3xl border border-neutral-100 shadow-sm space-y-2">
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl font-bold font-serif text-neutral-900">{formatPrice(product.price)}</span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-base text-neutral-400 line-through">
                  MRP {formatPrice(product.compareAtPrice)}
                </span>
              )}
              {discount > 0 && (
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md">
                  ({discount}% Savings)
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-500">Includes all taxes (18% GST). Complimentary Worldwide Express Delivery.</p>
          </div>

          {/* Color Selector Swatches */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-900 block mb-3">
                Selected Shade: <span className="text-amber-800 font-semibold">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((color: string) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                      selectedColor === color
                        ? 'bg-neutral-950 text-amber-300 border-neutral-950 shadow-md'
                        : 'bg-white text-neutral-800 border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  Select Size: <span className="text-amber-800 font-semibold">{selectedSize}</span>
                </label>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Guide</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-xl text-xs font-bold border transition ${
                      selectedSize === size
                        ? 'bg-neutral-950 text-white border-neutral-950 shadow-md'
                        : 'bg-white text-neutral-800 border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-4 bg-neutral-950 text-white rounded-2xl text-xs font-bold uppercase tracking-[0.15em] hover:bg-amber-700 transition flex items-center justify-center gap-2 shadow-xl cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-amber-300" />
                <span>ADD TO BAG</span>
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`p-4 rounded-2xl border transition cursor-pointer ${
                  inWishlist
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-100'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={handleShare}
                className="p-4 rounded-2xl bg-white text-neutral-800 border border-neutral-200 hover:bg-neutral-100 transition relative cursor-pointer"
                aria-label="Share product"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Share2 className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-neutral-200 text-center text-xs text-neutral-600">
            <div className="flex flex-col items-center space-y-1">
              <ShieldCheck className="w-5 h-5 text-amber-700" />
              <span className="font-semibold text-neutral-900">Certified Authentic</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <Truck className="w-5 h-5 text-amber-700" />
              <span className="font-semibold text-neutral-900">Express Delivery</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <RotateCcw className="w-5 h-5 text-amber-700" />
              <span className="font-semibold text-neutral-900">30-Day Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion Tabs (Description, Specs, Reviews) */}
      <section className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-8 space-y-6">
        <div className="flex border-b border-neutral-200 space-x-8 text-sm font-serif">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-3 font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'desc' ? 'border-amber-700 text-neutral-950' : 'border-transparent text-neutral-400'
            }`}
          >
            Full Description
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'specs' ? 'border-amber-700 text-neutral-950' : 'border-transparent text-neutral-400'
            }`}
          >
            Specifications & Care
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'reviews' ? 'border-amber-700 text-neutral-950' : 'border-transparent text-neutral-400'
            }`}
          >
            Customer Reviews ({INITIAL_REVIEWS.length})
          </button>
        </div>

        <div className="text-xs text-neutral-700 leading-relaxed font-light">
          {activeTab === 'desc' && <p className="whitespace-pre-line">{product.description}</p>}
          {activeTab === 'specs' && (
            <ul className="space-y-2 list-disc list-inside">
              <li>Material Composition: 100% Fine Mulberry Silk / Organza</li>
              <li>Care Instructions: Professional dry clean only. Preserve in cloth bag.</li>
              <li>Origin: Handcrafted in Biella, Italy & Paris, France</li>
              <li>Style SKU: {product.sku}</li>
            </ul>
          )}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {INITIAL_REVIEWS.map((rev) => (
                <div key={rev.id} className="p-4 bg-neutral-50 rounded-2xl space-y-2 border border-neutral-100">
                  <div className="flex items-center space-x-1 text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <h4 className="font-bold text-neutral-900">{rev.title}</h4>
                  <p className="text-neutral-600">{rev.comment}</p>
                  <p className="text-[10px] text-neutral-400">— {rev.userName} (Verified Client)</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Related Products Slider */}
      <section className="space-y-6">
        <h2 className="font-serif text-2xl font-bold text-neutral-900">You May Also Covet</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Size Guide Drawer */}
      <SizeGuideDrawer isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </div>
  );
}
