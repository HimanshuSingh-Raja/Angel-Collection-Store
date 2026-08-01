'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter, notFound } from 'next/navigation';
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
  ChevronDown,
  ChevronUp,
  MapPin,
  Maximize2,
  X,
  Zap,
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
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  const { addToCart, setIsOpen: setIsCartOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('S');
  const [selectedColor, setSelectedColor] = useState<string>('Black');
  const [copied, setCopied] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);

  // Delivery check state
  const [pincode, setPincode] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState<string | null>(null);
  const [checkingPincode, setCheckingPincode] = useState(false);

  // Accordion state
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    details: true,
    highlights: true,
    shipping: false,
    returns: false,
    reviews: true,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Fetch product dynamically based on slug
  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const dbProduct = await getProductBySlugAction(slug);
        if (dbProduct) {
          setProduct(dbProduct);
          setSelectedSize(dbProduct.sizes?.[0] || 'S');
          setSelectedColor(dbProduct.colors?.[0] || 'Black');
          setLoading(false);
          return;
        }

        const mockMatch = INITIAL_PRODUCTS.find((p) => p.slug === slug);
        if (mockMatch) {
          setProduct(mockMatch);
          setSelectedSize(mockMatch.sizes?.[0] || 'S');
          setSelectedColor(mockMatch.colors?.[0] || 'Black');
          setLoading(false);
          return;
        }

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
        <span>Loading luxury product...</span>
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

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedColor, 1);
    setIsCartOpen(false);
    router.push('/checkout');
  };

  const checkPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode || pincode.length < 6) {
      setDeliveryStatus('Please enter a valid 6-digit PIN code');
      return;
    }
    setCheckingPincode(true);
    setTimeout(() => {
      setCheckingPincode(false);
      setDeliveryStatus(`Express delivery available to ${pincode} by tomorrow!`);
    }, 500);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-10 space-y-10 font-sans pb-32">
      {/* Breadcrumb */}
      <nav className="text-xs text-neutral-500 flex items-center space-x-2">
        <Link href="/" className="hover:text-black">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-black">Shop</Link>
        <span>/</span>
        <span className="text-neutral-900 font-semibold truncate">{product.title}</span>
      </nav>

      {/* Main Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* STICKY / SWIPE GALLERY */}
        <div className="space-y-4 lg:sticky lg:top-28">
          <div className="relative aspect-[4/5] rounded-[24px] overflow-hidden bg-neutral-100 border border-neutral-200/80 shadow-md group">
            <img
              src={product.images?.[activeImgIndex]?.url || product.images?.[0]?.url}
              alt={product.title}
              className="w-full h-full object-cover object-center transition-all duration-500 cursor-zoom-in"
              onClick={() => setZoomModalOpen(true)}
            />

            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-extrabold px-3 py-1.5 rounded-lg uppercase shadow-sm">
                SAVE {discount}% OFF
              </span>
            )}

            {/* Pinch / Zoom Button */}
            <button
              onClick={() => setZoomModalOpen(true)}
              className="absolute bottom-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur-md text-neutral-900 hover:bg-white shadow-md transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Zoom image"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Gallery Thumbnails */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {product.images?.map((img: any, idx: number) => (
              <button
                key={img.id || idx}
                onClick={() => setActiveImgIndex(idx)}
                className={`w-20 h-24 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                  idx === activeImgIndex ? 'border-amber-700 scale-105 shadow-md' : 'border-neutral-200 opacity-60'
                }`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* PRODUCT DETAILS COLUMN */}
        <div className="space-y-6">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-amber-800 font-extrabold block">
              {product.brand?.name || 'ANGEL SOVEREIGN'}
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-neutral-950 mt-1 leading-snug">
              {product.title}
            </h1>

            {/* Ratings & Stock Badge */}
            <div className="flex items-center space-x-3 mt-3">
              <div className="flex items-center space-x-1 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 text-amber-900 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-current text-amber-600" />
                <span>{(product.rating || 4.9).toFixed(1)}</span>
                <span className="text-neutral-500 font-normal">({product.reviewCount || 128} reviews)</span>
              </div>

              {product.stock <= 5 ? (
                <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                  Only {product.stock} items left!
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                  In Stock & Ready To Ship
                </span>
              )}
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200/60 space-y-1">
            <div className="flex items-baseline space-x-3">
              <span className="text-2xl sm:text-3xl font-bold font-serif text-neutral-950">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-sm text-neutral-400 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
              {discount > 0 && (
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                  ({discount}% OFF)
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-500">Includes all taxes (18% GST). Free Insured Express Shipping.</p>
          </div>

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-900 block mb-2.5">
                Shade / Color: <span className="text-amber-800 font-semibold">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color: string) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer min-h-[44px] ${
                      selectedColor === color
                        ? 'bg-neutral-950 text-amber-300 border-neutral-950 shadow-sm'
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
              <div className="flex justify-between items-center mb-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  Select Size: <span className="text-amber-800 font-semibold">{selectedSize}</span>
                </label>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1 min-h-[44px] px-2 cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Guide</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-xl text-xs font-bold border transition cursor-pointer ${
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

          {/* DESKTOP ACTIONS ROW */}
          <div className="hidden sm:flex items-center gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              className="flex-1 py-4 bg-white border-2 border-neutral-950 text-neutral-950 hover:bg-neutral-950 hover:text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-sm min-h-[48px] cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-amber-700" />
              <span>ADD TO BAG</span>
            </button>

            <button
              onClick={handleBuyNow}
              className="flex-1 py-4 bg-neutral-950 hover:bg-neutral-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-xl min-h-[48px] cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>BUY NOW</span>
            </button>

            <button
              onClick={() => toggleWishlist(product)}
              className={`p-4 rounded-2xl border transition cursor-pointer min-h-[48px] min-w-[48px] flex items-center justify-center ${
                inWishlist
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-50'
              }`}
              aria-label="Wishlist"
            >
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-4 rounded-2xl bg-white text-neutral-800 border border-neutral-200 hover:bg-neutral-50 transition cursor-pointer min-h-[48px] min-w-[48px] flex items-center justify-center"
              aria-label="Share"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Share2 className="w-5 h-5" />}
            </button>
          </div>

          {/* DELIVERY PINCODE CHECKER */}
          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-700" />
              <span>Delivery & Pincode Check</span>
            </label>

            <form onSubmit={checkPincode} className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit PIN Code"
                className="flex-1 px-3 py-2 bg-white rounded-xl border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:border-amber-700"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-neutral-950 text-white rounded-xl text-xs font-bold uppercase hover:bg-neutral-800 transition cursor-pointer min-h-[44px]"
              >
                {checkingPincode ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check'}
              </button>
            </form>

            {deliveryStatus && (
              <p className="text-xs font-semibold text-emerald-700 pt-1">{deliveryStatus}</p>
            )}
          </div>

          {/* ACCORDION SECTIONS */}
          <div className="border-t border-neutral-200 pt-4 space-y-4">
            {/* Details Accordion */}
            <div className="border-b border-neutral-200 pb-4">
              <button
                onClick={() => toggleAccordion('details')}
                className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider text-neutral-900 cursor-pointer min-h-[44px]"
              >
                <span>Product Details & Features</span>
                {openAccordions.details ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
              </button>
              {openAccordions.details && (
                <div className="text-xs text-neutral-700 leading-relaxed space-y-2 pt-2">
                  <p className="whitespace-pre-line">{product.description}</p>
                  <ul className="list-disc list-inside space-y-1 text-neutral-600 pt-2">
                    <li>100% Certified Mulberry Silk / Fine Artisan Weave</li>
                    <li>Dry Clean Only</li>
                    <li>Handcrafted by Master Weavers</li>
                    <li>Style SKU: {product.sku || 'ANG-8921'}</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Shipping & Delivery Accordion */}
            <div className="border-b border-neutral-200 pb-4">
              <button
                onClick={() => toggleAccordion('shipping')}
                className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider text-neutral-900 cursor-pointer min-h-[44px]"
              >
                <span>Shipping & Delivery Policy</span>
                {openAccordions.shipping ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
              </button>
              {openAccordions.shipping && (
                <div className="text-xs text-neutral-600 leading-relaxed pt-2 space-y-1">
                  <p>• Complimentary Insured Express Shipping across India & International destinations.</p>
                  <p>• Dispatch within 24-48 business hours with live tracking details.</p>
                </div>
              )}
            </div>

            {/* Returns & Exchange Accordion */}
            <div className="border-b border-neutral-200 pb-4">
              <button
                onClick={() => toggleAccordion('returns')}
                className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider text-neutral-900 cursor-pointer min-h-[44px]"
              >
                <span>30-Day Hassle Free Returns</span>
                {openAccordions.returns ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
              </button>
              {openAccordions.returns && (
                <div className="text-xs text-neutral-600 leading-relaxed pt-2">
                  <p>Return or exchange eligible items within 30 days of delivery. Free doorstep pick-up available.</p>
                </div>
              )}
            </div>

            {/* Customer Reviews Accordion */}
            <div className="border-b border-neutral-200 pb-4">
              <button
                onClick={() => toggleAccordion('reviews')}
                className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider text-neutral-900 cursor-pointer min-h-[44px]"
              >
                <span>Customer Reviews ({INITIAL_REVIEWS.length})</span>
                {openAccordions.reviews ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
              </button>
              {openAccordions.reviews && (
                <div className="space-y-3 pt-3">
                  {INITIAL_REVIEWS.map((rev) => (
                    <div key={rev.id} className="p-3.5 bg-neutral-50 rounded-xl space-y-1.5 border border-neutral-100">
                      <div className="flex items-center space-x-1 text-amber-500">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                      <h4 className="font-bold text-xs text-neutral-900">{rev.title}</h4>
                      <p className="text-xs text-neutral-600 leading-relaxed">{rev.comment}</p>
                      <p className="text-[10px] text-neutral-400 font-mono">— {rev.userName} (Verified Client)</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SIMILAR PRODUCTS SECTION */}
      <section className="space-y-4 pt-6 border-t border-neutral-200">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-neutral-950">You May Also Covet</h2>
          <Link href="/shop" className="text-xs font-bold text-amber-800 hover:underline">
            View All
          </Link>
        </div>

        {/* 2-Column Mobile Grid / 4-Column Desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {relatedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* MOBILE STICKY BOTTOM CTA BAR (ADD TO BAG & BUY NOW) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md p-3 border-t border-neutral-200 shadow-[0_-4px_25px_rgba(0,0,0,0.1)] flex items-center gap-2 pb-safe">
        <button
          onClick={handleAddToCart}
          className="flex-1 h-12 bg-white border-2 border-neutral-950 text-neutral-950 rounded-xl text-xs font-extrabold uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer min-h-[44px]"
        >
          <ShoppingBag className="w-4 h-4 text-amber-700" />
          <span>ADD TO BAG</span>
        </button>

        <button
          onClick={handleBuyNow}
          className="flex-1 h-12 bg-neutral-950 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
        >
          <Zap className="w-4 h-4 text-amber-300" />
          <span>BUY NOW</span>
        </button>
      </div>

      {/* Size Guide Drawer */}
      <SizeGuideDrawer isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />

      {/* Fullscreen Pinch / Zoom Image Modal */}
      {zoomModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setZoomModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={product.images?.[activeImgIndex]?.url || product.images?.[0]?.url}
            alt={product.title}
            className="max-w-full max-h-[90vh] object-contain rounded-2xl"
          />
        </div>
      )}
    </div>
  );
}
