'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ChevronRight,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  PackageX,
} from 'lucide-react';
import { ProductCard } from '@/components/store/ProductCard';
import { ProductSkeleton } from '@/components/store/ProductSkeleton';
import { FilterBottomSheet } from '@/components/store/FilterBottomSheet';
import { SortBottomSheet } from '@/components/store/SortBottomSheet';
import { QuickViewModal } from '@/components/store/QuickViewModal';
import { SearchBar } from '@/components/navbar/SearchBar';
import { searchProductsAction } from '@/actions/search-actions';
import { detectCategoryFromQuery } from '@/lib/search/utils';
import { Product, FilterState } from '@/types';
import { INITIAL_PRODUCTS } from '@/lib/mock-data';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const rawQuery = searchParams.get('q') || 'Sarees';

  const [query, setQuery] = useState(rawQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [detectedCategoryName, setDetectedCategoryName] = useState('Sarees');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    category: searchParams.get('category') || '',
    subcategory: '',
    brand: '',
    minPrice: 0,
    maxPrice: 60000,
    colors: [],
    sizes: [],
    rating: 0,
    inStockOnly: false,
    onSaleOnly: false,
    sortBy: 'newest',
    searchQuery: rawQuery,
  });

  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [sortSheetOpen, setSortSheetOpen] = useState(false);

  // Sync state if URL query changes
  useEffect(() => {
    const qParam = searchParams.get('q') || 'Sarees';
    setQuery(qParam);
    setFilters((prev) => ({ ...prev, searchQuery: qParam }));
    const detected = detectCategoryFromQuery(qParam);
    setDetectedCategoryName(detected.displayName || qParam.charAt(0).toUpperCase() + qParam.slice(1));
  }, [searchParams]);

  // Execute Search Action
  useEffect(() => {
    async function executeSearch() {
      setLoading(true);
      try {
        const mappedSort =
          filters.sortBy === 'price-low'
            ? 'price_asc'
            : filters.sortBy === 'price-high'
            ? 'price_desc'
            : filters.sortBy === 'rating'
            ? 'rating'
            : filters.sortBy === 'newest'
            ? 'newest'
            : 'relevance';

        const res = await searchProductsAction({
          query,
          category: filters.category || undefined,
          maxPrice: filters.maxPrice,
          sortBy: mappedSort,
        });

        if (res?.success && Array.isArray(res.products)) {
          setProducts(res.products as any);
          if (res.detectedCategory && res.detectedCategory !== 'All Collections') {
            setDetectedCategoryName(res.detectedCategory);
          }
        } else {
          setProducts([]);
        }
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    executeSearch();
  }, [query, filters.category, filters.maxPrice, filters.sortBy]);

  const resetFilters = () => {
    setFilters({
      category: '',
      subcategory: '',
      brand: '',
      minPrice: 0,
      maxPrice: 60000,
      colors: [],
      sizes: [],
      rating: 0,
      inStockOnly: false,
      onSaleOnly: false,
      sortBy: 'newest',
      searchQuery: query,
    });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.maxPrice < 60000) count++;
    if (filters.colors.length > 0) count += filters.colors.length;
    if (filters.rating > 0) count++;
    return count;
  }, [filters]);

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900 pb-24 pt-4 sm:pt-6">
      <div className="max-w-7xl mx-auto px-3 sm:px-8 space-y-4 sm:space-y-6">
        {/* Top Sticky Search Bar for Mobile Search Results */}
        <div className="block lg:hidden">
          <SearchBar />
        </div>

        {/* BREADCRUMBS */}
        <nav className="flex items-center space-x-2 text-xs text-neutral-500 font-medium">
          <Link href="/" className="hover:text-neutral-900 transition">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-neutral-400" />
          <Link href="/shop" className="hover:text-neutral-900 transition">
            Shop
          </Link>
          <ChevronRight className="w-3 h-3 text-neutral-400" />
          <span className="text-neutral-900 font-semibold">{query}</span>
        </nav>

        {/* TITLE HEADER */}
        <div className="flex items-baseline justify-between pb-2 border-b border-neutral-100">
          <div>
            <h1 className="font-serif text-xl sm:text-3xl font-bold tracking-tight text-neutral-900 flex items-baseline gap-2">
              <span>Results for &quot;{query}&quot;</span>
              <span className="text-xs sm:text-sm font-normal text-neutral-400 font-sans">
                ({products.length} {products.length === 1 ? 'item' : 'items'})
              </span>
            </h1>
          </div>
        </div>

        {/* HORIZONTAL FILTER CHIPS ROW */}
        <div className="sticky top-[64px] lg:top-[85px] z-30 bg-white/95 backdrop-blur-md py-3 border-y border-neutral-200/80 -mx-3 px-3 sm:mx-0 sm:px-0">
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
            {/* Filter Bottom Sheet Trigger */}
            <button
              onClick={() => setFilterSheetOpen(true)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition shrink-0 min-h-[38px] cursor-pointer border ${
                activeFilterCount > 0
                  ? 'bg-amber-100 text-amber-950 border-amber-300 shadow-xs'
                  : 'bg-neutral-950 text-white border-neutral-950 shadow-sm'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-700 text-white text-[10px] flex items-center justify-center font-extrabold ml-1">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort Bottom Sheet Trigger */}
            <button
              onClick={() => setSortSheetOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-neutral-800 border border-neutral-200 hover:border-neutral-400 text-xs font-semibold transition shrink-0 min-h-[38px] cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-700" />
              <span>
                Sort:{' '}
                {filters.sortBy === 'newest'
                  ? 'Newest'
                  : filters.sortBy === 'price-low'
                  ? 'Price: Low-High'
                  : filters.sortBy === 'price-high'
                  ? 'Price: High-Low'
                  : 'Rating'}
              </span>
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-xs text-rose-600 font-bold px-2 shrink-0 flex items-center gap-1 cursor-pointer min-h-[38px]"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* 2-COLUMN MOBILE PRODUCT GRID */}
        <div className="w-full pt-2">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-4 bg-neutral-50 rounded-3xl p-8 border border-neutral-100">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
                <PackageX className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-neutral-900">No Matching Items Found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Try searching for another luxury keyword like &quot;Saree&quot;, &quot;Lehenga&quot; or &quot;Bag&quot;.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-3 bg-neutral-950 text-white font-bold text-xs rounded-xl hover:bg-neutral-800 transition cursor-pointer shadow-md min-h-[44px]"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />

      {/* Mobile Filter & Sort Bottom Sheets */}
      <FilterBottomSheet
        isOpen={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        filters={filters}
        setFilters={setFilters}
        resetFilters={resetFilters}
        activeCount={activeFilterCount}
      />

      <SortBottomSheet
        isOpen={sortSheetOpen}
        onClose={() => setSortSheetOpen(false)}
        sortBy={filters.sortBy}
        setSortBy={(val) => setFilters((prev) => ({ ...prev, sortBy: val }))}
      />
    </div>
  );
}
