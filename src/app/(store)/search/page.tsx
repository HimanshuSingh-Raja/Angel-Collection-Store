'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
  PackageX,
  SlidersHorizontal,
} from 'lucide-react';
import { ProductCard } from '@/components/store/ProductCard';
import { QuickViewModal } from '@/components/store/QuickViewModal';
import { searchProductsAction } from '@/actions/search-actions';
import { detectCategoryFromQuery } from '@/lib/search/utils';
import { Product } from '@/types';
import { INITIAL_PRODUCTS } from '@/lib/mock-data';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const rawQuery = searchParams.get('q') || 'Sarees';

  const [query, setQuery] = useState(rawQuery);
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest'>('relevance');
  const [priceRange, setPriceRange] = useState<number>(50000);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [detectedCategoryName, setDetectedCategoryName] = useState('Sarees');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Accordion Expand/Collapse States
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    categories: true,
    price: true,
    color: false,
    fabric: false,
    occasion: false,
    discount: false,
    brand: false,
    rating: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Sync state if URL query changes
  useEffect(() => {
    const qParam = searchParams.get('q') || 'Sarees';
    setQuery(qParam);
    const detected = detectCategoryFromQuery(qParam);
    setDetectedCategoryName(detected.displayName || qParam.charAt(0).toUpperCase() + qParam.slice(1));
  }, [searchParams]);

  // Execute Search Action
  useEffect(() => {
    async function executeSearch() {
      setLoading(true);
      const res = await searchProductsAction({
        query,
        category,
        maxPrice: priceRange,
        sortBy,
      });

      if (res.success) {
        setProducts(res.products as any);
        if (res.detectedCategory && res.detectedCategory !== 'All Collections') {
          setDetectedCategoryName(res.detectedCategory);
        }
      } else {
        setProducts(INITIAL_PRODUCTS as any);
      }
      setLoading(false);
    }

    executeSearch();
  }, [query, category, priceRange, sortBy]);

  // Handle Subcategory Checkbox Toggle
  const toggleSubcategory = (sub: string) => {
    setSelectedSubcategories((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const handleResetFilters = () => {
    setCategory('all');
    setPriceRange(50000);
    setSelectedSubcategories([]);
    setSelectedColors([]);
    setSortBy('relevance');
  };

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900 pb-24 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-6">
        {/* BREADCRUMBS (Home > Women > Sarees) */}
        <nav className="flex items-center space-x-2 text-xs text-neutral-500 font-medium">
          <Link href="/" className="hover:text-neutral-900 transition">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-neutral-400" />
          <Link href="/shop?category=women" className="hover:text-neutral-900 transition">
            Women
          </Link>
          <ChevronRight className="w-3 h-3 text-neutral-400" />
          <span className="text-neutral-900 font-semibold">{detectedCategoryName}</span>
        </nav>

        {/* TITLE & SORT HEADER ROW */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-2 border-b border-neutral-100">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 flex items-baseline gap-2">
              <span>{detectedCategoryName}</span>
              <span className="text-xs sm:text-sm font-normal text-neutral-400 font-sans">
                ({products.length} {products.length === 1 ? 'result' : 'results'})
              </span>
            </h1>
            <p className="text-xs text-neutral-500 mt-1 font-light">
              Explore our exclusive collection of luxury {detectedCategoryName.toLowerCase()} for every occasion.
            </p>
          </div>

          {/* TOP RIGHT SORT DROPDOWN */}
          <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
            <span className="text-xs text-neutral-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 bg-white text-xs font-semibold text-neutral-900 rounded-xl border border-neutral-200 focus:outline-none focus:border-amber-700 cursor-pointer shadow-sm"
            >
              <option value="relevance">Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">New Arrivals</option>
            </select>
          </div>
        </div>

        {/* ACTIVE FILTER CHIPS ROW */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-neutral-100 text-neutral-800 text-xs font-medium border border-neutral-200/60">
            {detectedCategoryName}
            <button onClick={() => setDetectedCategoryName('Products')} className="hover:text-rose-600">
              <X className="w-3 h-3" />
            </button>
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-neutral-100 text-neutral-800 text-xs font-medium border border-neutral-200/60">
            Women
            <button onClick={() => setCategory('all')} className="hover:text-rose-600">
              <X className="w-3 h-3" />
            </button>
          </span>

          <button
            onClick={handleResetFilters}
            className="text-xs font-bold text-amber-800 hover:underline ml-2 cursor-pointer"
          >
            Clear All
          </button>
        </div>

        {/* MAIN BODY: SIDEBAR + 4-COLUMN PRODUCT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
          {/* LEFT ACCORDION FILTERS SIDEBAR (3 COLS = 25%) */}
          <div className="lg:col-span-3 space-y-5 pr-2">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">FILTERS</span>
              <button
                onClick={handleResetFilters}
                className="text-[10px] font-bold uppercase text-amber-800 hover:underline cursor-pointer"
              >
                RESET ALL
              </button>
            </div>

            {/* Accordion 1: Categories */}
            <div className="border-b border-neutral-200 pb-4 space-y-3">
              <button
                onClick={() => toggleSection('categories')}
                className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider text-neutral-900 cursor-pointer"
              >
                <span>CATEGORIES</span>
                {openSections.categories ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
              </button>

              {openSections.categories && (
                <div className="space-y-2.5 pt-1 text-xs text-neutral-700 font-sans">
                  {[
                    { name: 'Silk Sarees', count: 96 },
                    { name: 'Banarasi Sarees', count: 48 },
                    { name: 'Georgette Sarees', count: 42 },
                    { name: 'Organza Sarees', count: 30 },
                    { name: 'Kanjivaram Sarees', count: 30 },
                  ].map((sub) => (
                    <label key={sub.name} className="flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center space-x-2.5">
                        <input
                          type="checkbox"
                          checked={selectedSubcategories.includes(sub.name)}
                          onChange={() => toggleSubcategory(sub.name)}
                          className="w-4 h-4 rounded border-neutral-300 text-amber-800 focus:ring-0 cursor-pointer"
                        />
                        <span className="group-hover:text-neutral-900 transition">{sub.name}</span>
                      </div>
                      <span className="text-[11px] text-neutral-400 font-mono">({sub.count})</span>
                    </label>
                  ))}
                  <button className="text-xs font-bold text-neutral-500 hover:text-amber-800 pt-1 block cursor-pointer">
                    + 8 more
                  </button>
                </div>
              )}
            </div>

            {/* Accordion 2: Price Range */}
            <div className="border-b border-neutral-200 pb-4 space-y-3">
              <button
                onClick={() => toggleSection('price')}
                className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider text-neutral-900 cursor-pointer"
              >
                <span>PRICE</span>
                {openSections.price ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
              </button>

              {openSections.price && (
                <div className="space-y-3 pt-1 text-xs text-neutral-700">
                  <div className="flex justify-between font-semibold text-neutral-900">
                    <span>₹1,000</span>
                    <span>₹{priceRange.toLocaleString()}+</span>
                  </div>
                  <input
                    type="range"
                    min={1000}
                    max={100000}
                    step={2000}
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full accent-amber-800 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Accordion 3: Color */}
            <div className="border-b border-neutral-200 pb-4 space-y-3">
              <button
                onClick={() => toggleSection('color')}
                className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider text-neutral-900 cursor-pointer"
              >
                <span>COLOR</span>
                {openSections.color ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
              </button>
              {openSections.color && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {['Rose Gold', 'Mint Green', 'Deep Red', 'Beige', 'Royal Blue', 'Emerald'].map((col) => (
                    <button
                      key={col}
                      onClick={() =>
                        setSelectedColors((prev) =>
                          prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
                        )
                      }
                      className={`px-3 py-1 rounded-full text-[11px] font-medium border transition cursor-pointer ${
                        selectedColors.includes(col)
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Accordion 4: Fabric */}
            <div className="border-b border-neutral-200 pb-4 space-y-3">
              <button
                onClick={() => toggleSection('fabric')}
                className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider text-neutral-900 cursor-pointer"
              >
                <span>FABRIC</span>
                {openSections.fabric ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
              </button>
            </div>

            {/* Accordion 5: Occasion */}
            <div className="border-b border-neutral-200 pb-4 space-y-3">
              <button
                onClick={() => toggleSection('occasion')}
                className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider text-neutral-900 cursor-pointer"
              >
                <span>OCCASION</span>
                {openSections.occasion ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
              </button>
            </div>

            {/* Accordion 6: Discount */}
            <div className="border-b border-neutral-200 pb-4 space-y-3">
              <button
                onClick={() => toggleSection('discount')}
                className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider text-neutral-900 cursor-pointer"
              >
                <span>DISCOUNT</span>
                {openSections.discount ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
              </button>
            </div>

            {/* Accordion 7: Brand */}
            <div className="border-b border-neutral-200 pb-4 space-y-3">
              <button
                onClick={() => toggleSection('brand')}
                className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider text-neutral-900 cursor-pointer"
              >
                <span>BRAND</span>
                {openSections.brand ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
              </button>
            </div>

            {/* Accordion 8: Rating */}
            <div className="border-b border-neutral-200 pb-4 space-y-3">
              <button
                onClick={() => toggleSection('rating')}
                className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider text-neutral-900 cursor-pointer"
              >
                <span>RATING</span>
                {openSections.rating ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
              </button>
            </div>
          </div>

          {/* RIGHT 4-COLUMN PRODUCT GRID (9 COLS = 75%) */}
          <div className="lg:col-span-9 w-full">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="animate-pulse space-y-3">
                    <div className="aspect-[3/4] bg-neutral-200 rounded-2xl" />
                    <div className="h-4 bg-neutral-200 rounded w-3/4" />
                    <div className="h-3 bg-neutral-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                ))}
              </div>
            ) : (
              /* EMPTY STATE */
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
                  <PackageX className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-xl font-bold text-neutral-900">No Matching Sarees Found</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Try adjusting your filter criteria or searching for another luxury category.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-neutral-900 text-white font-bold text-xs rounded-xl hover:bg-black transition cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}
