'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FilterSidebar } from '@/components/store/FilterSidebar';
import { ProductCard } from '@/components/store/ProductCard';
import { ProductSkeleton } from '@/components/store/ProductSkeleton';
import { FilterBottomSheet } from '@/components/store/FilterBottomSheet';
import { SortBottomSheet } from '@/components/store/SortBottomSheet';
import { QuickViewModal } from '@/components/store/QuickViewModal';
import { SearchBar } from '@/components/navbar/SearchBar';
import { INITIAL_PRODUCTS } from '@/lib/mock-data';
import { Product, FilterState } from '@/types';
import { SlidersHorizontal, ArrowUpDown, Sparkles, X, ChevronDown } from 'lucide-react';
import { getStorefrontProductsAction } from '@/actions/product-store';

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams?.get('category') || '';
  const initialType = searchParams?.get('type') || searchParams?.get('subcategory') || '';
  const initialSale = searchParams?.get('onSale') === 'true';

  const [productsList, setProductsList] = useState<Product[]>(() => {
    return (INITIAL_PRODUCTS as any[]).filter((p) => {
      if (initialCat && p.category?.slug !== initialCat && p.category?.name?.toLowerCase() !== initialCat.toLowerCase()) {
        return false;
      }
      return true;
    });
  });
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    category: initialCat,
    subcategory: initialType,
    brand: '',
    minPrice: 0,
    maxPrice: 60000,
    colors: [],
    sizes: [],
    rating: 0,
    inStockOnly: false,
    onSaleOnly: initialSale,
    sortBy: 'newest',
    searchQuery: '',
  });

  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Sync state when URL searchParams change
  useEffect(() => {
    const catFromUrl = searchParams?.get('category') || '';
    const typeFromUrl = searchParams?.get('type') || searchParams?.get('subcategory') || '';
    setFilters((prev) => ({
      ...prev,
      category: catFromUrl,
      subcategory: typeFromUrl,
    }));
  }, [searchParams]);

  // Fetch live published products from database or fallback to mock
  useEffect(() => {
    async function loadLiveProducts() {
      const startTime = Date.now();
      try {
        const dbProducts = await getStorefrontProductsAction({
          category: filters.category || undefined,
          type: filters.subcategory || undefined,
          subcategory: filters.subcategory || undefined,
          search: filters.searchQuery || undefined,
        });

        const duration = Date.now() - startTime;
        console.log(`⏱️ [SHOP PAGE] Product catalog load duration: ${duration}ms`);

        if (dbProducts && dbProducts.length > 0) {
          setProductsList(dbProducts as any);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }

    loadLiveProducts();
  }, [filters.category, filters.subcategory, filters.searchQuery]);

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
      searchQuery: '',
    });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.subcategory) count++;
    if (filters.brand) count++;
    if (filters.maxPrice < 60000) count++;
    if (filters.colors.length > 0) count += filters.colors.length;
    if (filters.sizes.length > 0) count += filters.sizes.length;
    if (filters.rating > 0) count++;
    if (filters.onSaleOnly) count++;
    return count;
  }, [filters]);

  const filteredProducts = useMemo(() => {
    return productsList
      .filter((prod) => {
        if (filters.category && prod.category?.slug !== filters.category && prod.category?.name?.toLowerCase() !== filters.category.toLowerCase()) {
          return false;
        }
        if (filters.subcategory) {
          const typeTerm = filters.subcategory.toLowerCase().trim();
          const singularTerm = typeTerm.endsWith('s') ? typeTerm.slice(0, -1) : typeTerm;
          const subcatSlug = prod.subcategory?.slug?.toLowerCase();
          const subcatName = prod.subcategory?.name?.toLowerCase();
          const titleLower = prod.title.toLowerCase();
          const tagLower = prod.tags?.toLowerCase() || '';

          const isMatch =
            subcatSlug === typeTerm ||
            subcatSlug === singularTerm ||
            subcatName?.includes(typeTerm) ||
            subcatName?.includes(singularTerm) ||
            titleLower.includes(typeTerm) ||
            titleLower.includes(singularTerm) ||
            tagLower.includes(typeTerm) ||
            tagLower.includes(singularTerm);

          if (!isMatch) return false;
        }
        if (filters.brand && prod.brand?.slug !== filters.brand) return false;
        if (prod.price > filters.maxPrice) return false;
        if (filters.onSaleOnly && (!prod.compareAtPrice || prod.compareAtPrice <= prod.price)) return false;
        if (filters.inStockOnly && prod.stock <= 0) return false;
        if (filters.colors.length > 0 && !prod.colors?.some((c) => filters.colors.includes(c))) return false;
        if (filters.sizes.length > 0 && !prod.sizes?.some((s) => filters.sizes.includes(s))) return false;
        if (
          filters.searchQuery &&
          !prod.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
          !prod.tags?.toLowerCase().includes(filters.searchQuery.toLowerCase())
        )
          return false;

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'price-low') return a.price - b.price;
        if (filters.sortBy === 'price-high') return b.price - a.price;
        if (filters.sortBy === 'popularity') return (b.reviewCount || 0) - (a.reviewCount || 0);
        if (filters.sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [productsList, filters]);

  const categoriesPills = [
    { name: 'All', value: '' },
    { name: 'Women', value: 'women' },
    { name: 'Men', value: 'men' },
    { name: 'Kids', value: 'kids' },
    { name: 'Bags', value: 'bags' },
    { name: 'Jewellery', value: 'jewellery' },
    { name: 'Beauty', value: 'beauty' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 font-sans pb-24">
      {/* 1. TOP STICKY SEARCH BAR & CATEGORIES FOR MOBILE PLP */}
      <div className="space-y-3 mb-4">
        <div className="block lg:hidden">
          <SearchBar />
        </div>

        {/* Horizontal Category Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
          {categoriesPills.map((cat) => {
            const isSelected = filters.category === cat.value;
            return (
              <button
                key={cat.name}
                onClick={() => setFilters((prev) => ({ ...prev, category: cat.value, subcategory: '' }))}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shrink-0 transition min-h-[36px] cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-950 text-white shadow-md'
                    : 'bg-white text-neutral-700 border border-neutral-200/80 hover:bg-neutral-100'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. HORIZONTAL FILTER CHIPS ROW */}
      <div className="sticky top-[64px] lg:top-[85px] z-30 bg-white/95 backdrop-blur-md py-3 border-y border-neutral-200/80 -mx-3 px-3 sm:mx-0 sm:px-0 mb-6">
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
          {/* Main Filter Bottom Sheet Trigger */}
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
                : filters.sortBy === 'rating'
                ? 'Top Rated'
                : 'Popular'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
          </button>

          {/* Quick Filter Pill: On Sale Only */}
          <button
            onClick={() => setFilters((prev) => ({ ...prev, onSaleOnly: !prev.onSaleOnly }))}
            className={`px-3.5 py-2 rounded-full text-xs font-semibold border transition shrink-0 min-h-[38px] cursor-pointer ${
              filters.onSaleOnly
                ? 'bg-rose-50 text-rose-700 border-rose-300 font-bold'
                : 'bg-white text-neutral-700 border-neutral-200/80 hover:bg-neutral-50'
            }`}
          >
            On Sale
          </button>

          {/* Quick Filter Pill: Price <= 30000 */}
          <button
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                maxPrice: prev.maxPrice === 30000 ? 60000 : 30000,
              }))
            }
            className={`px-3.5 py-2 rounded-full text-xs font-semibold border transition shrink-0 min-h-[38px] cursor-pointer ${
              filters.maxPrice === 30000
                ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold'
                : 'bg-white text-neutral-700 border-neutral-200/80 hover:bg-neutral-50'
            }`}
          >
            Under ₹30,000
          </button>

          {/* Quick Filter Pill: Rating 4.0+ */}
          <button
            onClick={() => setFilters((prev) => ({ ...prev, rating: prev.rating === 4 ? 0 : 4 }))}
            className={`px-3.5 py-2 rounded-full text-xs font-semibold border transition shrink-0 min-h-[38px] cursor-pointer ${
              filters.rating === 4
                ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold'
                : 'bg-white text-neutral-700 border-neutral-200/80 hover:bg-neutral-50'
            }`}
          >
            ★ 4.0 & Above
          </button>

          {/* Clear Active Filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-xs text-rose-600 hover:underline font-bold px-2 shrink-0 flex items-center gap-1 cursor-pointer min-h-[38px]"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Main PLP Header Title */}
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] font-extrabold text-amber-800">
            ANGEL HAUTE COUTURE
          </span>
          <h1 className="font-serif text-xl sm:text-3xl font-bold tracking-tight text-neutral-950 capitalize mt-0.5">
            {filters.category ? `${filters.category} ${filters.subcategory ? '› ' + filters.subcategory : 'Collection'}` : 'All Luxury Items'}
          </h1>
        </div>
        <p className="text-xs text-neutral-500 font-medium">{filteredProducts.length} items</p>
      </div>

      {/* Grid Layout: Desktop Sidebar + 2-Column Mobile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block">
          <FilterSidebar filters={filters} setFilters={setFilters} resetFilters={resetFilters} />
        </div>

        {/* Product Listing Grid (2 Columns on Mobile <640px) */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-white rounded-3xl border border-neutral-100 p-8 space-y-4 shadow-xs">
              <Sparkles className="w-12 h-12 text-amber-500 mx-auto" />
              <h3 className="font-serif text-xl font-bold text-neutral-900">No luxury items match your criteria</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Try loosening your filters or price limit to discover more items from our collection.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-3 bg-neutral-950 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-amber-700 transition cursor-pointer shadow-md min-h-[44px]"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />

      {/* Mobile Filter Bottom Sheet */}
      <FilterBottomSheet
        isOpen={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        filters={filters}
        setFilters={setFilters}
        resetFilters={resetFilters}
        activeCount={activeFilterCount}
      />

      {/* Mobile Sort Bottom Sheet */}
      <SortBottomSheet
        isOpen={sortSheetOpen}
        onClose={() => setSortSheetOpen(false)}
        sortBy={filters.sortBy}
        setSortBy={(val) => setFilters((prev) => ({ ...prev, sortBy: val }))}
      />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-neutral-400">Loading catalogue...</div>}>
      <ShopContent />
    </Suspense>
  );
}
